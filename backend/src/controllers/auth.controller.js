const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { prisma } = require('../config/database');
const { redisClient } = require('../config/redis');
const { sendEmail } = require('../utils/email');
const { AppError } = require('../utils/appError');
const logger = require('../utils/logger');

// ===== JWT 유틸리티 =====
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );
  return { accessToken, refreshToken };
};

const setRefreshTokenCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30일
  });
};

// ===== 이메일 회원가입 =====
exports.register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError('이미 사용 중인 이메일입니다.', 409);

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
       { email, password: hashed, name, provider: 'LOCAL' },
    });

    // 이메일 인증 코드 생성
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await prisma.verificationCode.create({
       {
        target: email,
        code,
        type: 'EMAIL',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10분
      },
    });

    await sendEmail({
      to: email,
      subject: '[InviteHub] 이메일 인증코드',
      html: `<h2>InviteHub 이메일 인증</h2><p>인증코드: <strong>${code}</strong></p><p>10분 내 입력해주세요.</p>`,
    });

    const { accessToken, refreshToken } = generateTokens(user.id);
    await prisma.user.update({ where: { id: user.id },  { refreshToken } });
    setRefreshTokenCookie(res, refreshToken);

    res.status(201).json({
      success: true,
      message: '회원가입이 완료되었습니다. 이메일을 확인해 주세요.',
       {
        accessToken,
        user: { id: user.id, email: user.email, name: user.name, isVerified: user.isVerified },
      },
    });
  } catch (err) { next(err); }
};

// ===== 이메일 로그인 =====
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.provider !== 'LOCAL')
      throw new AppError('이메일 또는 비밀번호가 잘못되었습니다.', 401);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new AppError('이메일 또는 비밀번호가 잘못되었습니다.', 401);

    if (user.deletedAt) throw new AppError('탈퇴한 계정입니다.', 403);

    const { accessToken, refreshToken } = generateTokens(user.id);
    await prisma.user.update({ where: { id: user.id },  { refreshToken } });
    setRefreshTokenCookie(res, refreshToken);

    logger.info(`User logged in: ${user.id}`);

    res.json({
      success: true,
       {
        accessToken,
        user: { id: user.id, email: user.email, name: user.name, profileImage: user.profileImage, role: user.role },
      },
    });
  } catch (err) { next(err); }
};

// ===== 토큰 갱신 =====
exports.refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;
    if (!token) throw new AppError('토큰이 없습니다.', 401);

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      throw new AppError('유효하지 않은 토큰입니다.', 401);
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || user.refreshToken !== token) throw new AppError('유효하지 않은 토큰입니다.', 401);

    const { accessToken, refreshToken: newRefresh } = generateTokens(user.id);
    await prisma.user.update({ where: { id: user.id },  { refreshToken: newRefresh } });
    setRefreshTokenCookie(res, newRefresh);

    res.json({ success: true,  { accessToken } });
  } catch (err) { next(err); }
};

// ===== 로그아웃 =====
exports.logout = async (req, res, next) => {
  try {
    const { userId } = req.user;
    await prisma.user.update({ where: { id: userId },  { refreshToken: null } });
    res.clearCookie('refreshToken');
    res.json({ success: true, message: '로그아웃되었습니다.' });
  } catch (err) { next(err); }
};

// ===== 이메일 인증 =====
exports.verifyEmail = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    const record = await prisma.verificationCode.findFirst({
      where: { target: email, code, type: 'EMAIL', usedAt: null, expiresAt: { gt: new Date() } },
    });
    if (!record) throw new AppError('인증코드가 잘못되었거나 만료되었습니다.', 400);

    await prisma.$transaction([
      prisma.user.update({ where: { email },  { isVerified: true } }),
      prisma.verificationCode.update({ where: { id: record.id },  { usedAt: new Date() } }),
    ]);
    res.json({ success: true, message: '이메일이 인증되었습니다.' });
  } catch (err) { next(err); }
};

// ===== 비밀번호 재설정 요청 =====
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.json({ success: true, message: '이메일이 전송되었습니다.' }); // 보안상 항상 200

    const code = uuidv4();
    await prisma.verificationCode.create({
       { target: email, code, type: 'PASSWORD_RESET', expiresAt: new Date(Date.now() + 30 * 60 * 1000) },
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?code=${code}&email=${email}`;
    await sendEmail({
      to: email,
      subject: '[InviteHub] 비밀번호 재설정',
      html: `<h2>InviteHub 비밀번호 재설정</h2><p><a href="${resetUrl}">클릭하여 비밀번호를 재설정하세요</a></p><p>30분 내 유효합니다.</p>`,
    });

    res.json({ success: true, message: '비밀번호 재설정 링크가 이메일로 전송되었습니다.' });
  } catch (err) { next(err); }
};

// ===== 비밀번호 재설정 =====
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body;
    const record = await prisma.verificationCode.findFirst({
      where: { target: email, code, type: 'PASSWORD_RESET', usedAt: null, expiresAt: { gt: new Date() } },
    });
    if (!record) throw new AppError('유효하지 않거나 만료된 링크입니다.', 400);

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.$transaction([
      prisma.user.update({ where: { email },  { password: hashed, refreshToken: null } }),
      prisma.verificationCode.update({ where: { id: record.id },  { usedAt: new Date() } }),
    ]);
    res.json({ success: true, message: '비밀번호가 성공적으로 변경되었습니다.' });
  } catch (err) { next(err); }
};

// ===== 소셜 로그인 콜백 (Kakao/Naver 공통) =====
exports.oauthCallback = async (req, res) => {
  try {
    const user = req.user;
    const { accessToken, refreshToken } = generateTokens(user.id);
    await prisma.user.update({ where: { id: user.id },  { refreshToken } });
    setRefreshTokenCookie(res, refreshToken);

    // 프론트엔드로 리다이렉트
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${accessToken}`);
  } catch (err) {
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
};

// ===== 내 정보 =====
exports.getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, email: true, name: true, phone: true, profileImage: true, provider: true, isVerified: true, role: true, createdAt: true },
    });
    if (!user) throw new AppError('사용자를 찾을 수 없습니다.', 404);
    res.json({ success: true,  user });
  } catch (err) { next(err); }
};
