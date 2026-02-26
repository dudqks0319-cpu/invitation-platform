const { prisma } = require('../config/database');
const { AppError } = require('../utils/appError');
const XLSX = require('xlsx');
const logger = require('../utils/logger');

// ===== RSVP 등록 (공개 - 토큰 불필요) =====
exports.submit = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { guestName, guestPhone, guestCount, attendance, mealChoice, message, side, vehicleCount } = req.body;

    const invitation = await prisma.invitation.findFirst({
      where: { slug, isPublished: true, deletedAt: null },
    });
    if (!invitation) throw new AppError('유효하지 않은 초대장입니다.', 404);
    if (invitation.rsvpDeadline && new Date() > invitation.rsvpDeadline) {
      throw new AppError('RSVP 응답 기한이 지났습니다.', 400);
    }

    // 동일 번호 중복 체크
    if (guestPhone) {
      const existing = await prisma.rsvp.findFirst({ where: { invitationId: invitation.id, guestPhone } });
      if (existing) {
        // 중복이면 업데이트
        const updated = await prisma.rsvp.update({
          where: { id: existing.id },
           { guestName, guestCount: parseInt(guestCount) || 1, attendance, mealChoice, message, side, vehicleCount: parseInt(vehicleCount) || 0 },
        });
        return res.json({ success: true, message: 'RSVP가 업데이트되었습니다.',  updated });
      }
    }

    const rsvp = await prisma.rsvp.create({
       {
        invitationId: invitation.id,
        guestName, guestPhone,
        guestCount: parseInt(guestCount) || 1,
        attendance: attendance || 'ATTENDING',
        mealChoice, message, side,
        vehicleCount: parseInt(vehicleCount) || 0,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    // 실시간 Socket 알림 (주최자에게)
    const io = req.app.get('io');
    if (io) {
      io.to(`invitation:${invitation.id}`).emit('rsvp:new', {
        rsvp,
        invitationId: invitation.id,
        message: `${guestName}님이 RSVP를 등록했습니다.`,
      });
    }

    // 카카오톡 알림
    await notifyOwnerKakao(invitation, rsvp);

    logger.info(`New RSVP: ${rsvp.id} for invitation: ${invitation.id}`);
    res.status(201).json({ success: true, message: 'RSVP가 등록되었습니다.',  rsvp });
  } catch (err) { next(err); }
};

// ===== RSVP 목록 조회 (주인용) =====
exports.getList = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { page = 1, limit = 50, attendance, side } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const invitation = await prisma.invitation.findFirst({ where: { id, userId, deletedAt: null } });
    if (!invitation) throw new AppError('초대장을 찾을 수 없습니다.', 404);

    const where = { invitationId: id };
    if (attendance) where.attendance = attendance;
    if (side) where.side = side;

    const [total, rsvps] = await prisma.$transaction([
      prisma.rsvp.count({ where }),
      prisma.rsvp.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' } }),
    ]);

    const summary = await prisma.rsvp.groupBy({
      by: ['attendance'],
      where: { invitationId: id },
      _count: true,
      _sum: { guestCount: true },
    });

    res.json({
      success: true,
       rsvps,
      summary,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) { next(err); }
};

// ===== 체크인 =====
exports.checkIn = async (req, res, next) => {
  try {
    const { rsvpId } = req.params;
    const userId = req.user.userId;
    const rsvp = await prisma.rsvp.findUnique({
      where: { id: rsvpId },
      include: { invitation: true },
    });
    if (!rsvp || rsvp.invitation.userId !== userId) throw new AppError('권한이 없습니다.', 403);
    const updated = await prisma.rsvp.update({
      where: { id: rsvpId },
       { isCheckedIn: !rsvp.isCheckedIn, checkedInAt: !rsvp.isCheckedIn ? new Date() : null },
    });
    res.json({ success: true,  updated });
  } catch (err) { next(err); }
};

// ===== 엑셀 내보내기 =====
exports.exportExcel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const invitation = await prisma.invitation.findFirst({ where: { id, userId, deletedAt: null } });
    if (!invitation) throw new AppError('초대장을 찾을 수 없습니다.', 404);

    const rsvps = await prisma.rsvp.findMany({
      where: { invitationId: id },
      orderBy: { createdAt: 'asc' },
    });

    const rows = rsvps.map((r, i) => ({
      '번호': i + 1,
      '이름': r.guestName,
      '연락체': r.guestPhone || '-',
      '참석 여부': r.attendance === 'ATTENDING' ? '참석' : r.attendance === 'NOT_ATTENDING' ? '불참' : '미정',
      '동반인원': r.guestCount,
      '측': r.side || '-',
      '식사선택': r.mealChoice || '-',
      '주차대수': r.vehicleCount,
      '개인메시지': r.message || '-',
      '체크인': r.isCheckedIn ? 'Y' : 'N',
      '등록일시': r.createdAt.toLocaleString('ko-KR'),
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [
      { width: 6 }, { width: 12 }, { width: 14 }, { width: 10 },
      { width: 10 }, { width: 8 }, { width: 12 }, { width: 10 },
      { width: 30 }, { width: 8 }, { width: 18 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'RSVP 명단');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(invitation.title)}_RSVP.xlsx`);
    res.send(buffer);
  } catch (err) { next(err); }
};

// ===== 삭제 =====
exports.remove = async (req, res, next) => {
  try {
    const { rsvpId } = req.params;
    const userId = req.user.userId;
    const rsvp = await prisma.rsvp.findUnique({ where: { id: rsvpId }, include: { invitation: true } });
    if (!rsvp || rsvp.invitation.userId !== userId) throw new AppError('권한이 없습니다.', 403);
    await prisma.rsvp.delete({ where: { id: rsvpId } });
    res.json({ success: true, message: 'RSVP가 삭제되었습니다.' });
  } catch (err) { next(err); }
};

// 카카오톡 알림 (내부)
async function notifyOwnerKakao(invitation, rsvp) {
  try {
    // 카카오 메시지 API 연동 (API키 설정 시)
    if (!process.env.KAKAO_MESSAGE_ADMIN_KEY) return;
    // TODO: 카카오톡 메시지 API 콜
    logger.info(`Kakao notify for RSVP: ${rsvp.id}`);
  } catch (err) {
    logger.warn('Kakao notify failed:', err.message);
  }
}
