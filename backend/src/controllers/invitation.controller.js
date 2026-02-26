const { prisma } = require('../config/database');
const { AppError } = require('../utils/appError');
const { generateSlug } = require('../utils/slug');
const { generateQRCode } = require('../utils/qrcode');
const logger = require('../utils/logger');

// ===== 생성 =====
exports.create = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const {
      templateId, title, category,
      eventDate, eventTime, venueName, venueAddress, venueDetailAddress,
      venueLat, venueLng, venueMapType, parkingInfo, transportInfo,
      groomName, groomFatherName, groomMotherName,
      brideName, brideFatherName, brideMotherName,
      hostName, hostPhone, honorName,
      mainMessage, subMessage, bgmUrl, bgmAutoPlay,
      rsvpEnabled, rsvpDeadline, rsvpMessage, maxGuests,
      customConfig,
    } = req.body;

    const slug = await generateSlug(title);
    const invitation = await prisma.invitation.create({
       {
        userId, templateId, title, slug, category: category || 'WEDDING',
        eventDate: eventDate ? new Date(eventDate) : null,
        eventTime, venueName, venueAddress, venueDetailAddress,
        venueLat: venueLat ? parseFloat(venueLat) : null,
        venueLng: venueLng ? parseFloat(venueLng) : null,
        venueMapType: venueMapType || 'KAKAO',
        parkingInfo, transportInfo,
        groomName, groomFatherName, groomMotherName,
        brideName, brideFatherName, brideMotherName,
        hostName, hostPhone, honorName,
        mainMessage, subMessage, bgmUrl,
        bgmAutoPlay: bgmAutoPlay || false,
        rsvpEnabled: rsvpEnabled !== false,
        rsvpDeadline: rsvpDeadline ? new Date(rsvpDeadline) : null,
        rsvpMessage, maxGuests: maxGuests ? parseInt(maxGuests) : null,
        customConfig: customConfig || {},
        status: 'DRAFT',
      },
      include: { photos: true, bankAccounts: true },
    });

    // QR 코드 생성
    const inviteUrl = `${process.env.INVITATION_BASE_URL}/${slug}`;
    const qrCodeUrl = await generateQRCode(inviteUrl);
    await prisma.invitation.update({ where: { id: invitation.id },  { qrCodeUrl } });

    logger.info(`Invitation created: ${invitation.id} by user: ${userId}`);
    res.status(201).json({ success: true,  { ...invitation, qrCodeUrl, inviteUrl } });
  } catch (err) { next(err); }
};

// ===== 목록 조회 =====
exports.getMyInvitations = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, status, category } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = { userId, deletedAt: null };
    if (status) where.status = status;
    if (category) where.category = category;

    const [total, invitations] = await prisma.$transaction([
      prisma.invitation.count({ where }),
      prisma.invitation.findMany({
        where, skip, take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          photos: { where: { isMain: true }, take: 1 },
          _count: { select: { rsvps: true } },
        },
      }),
    ]);

    res.json({
      success: true,
       invitations,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) { next(err); }
};

// ===== 단건 조회 =====
exports.getOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const invitation = await prisma.invitation.findFirst({
      where: { id, userId, deletedAt: null },
      include: {
        photos: { orderBy: { order: 'asc' } },
        bankAccounts: { orderBy: { order: 'asc' } },
        _count: { select: { rsvps: true } },
      },
    });
    if (!invitation) throw new AppError('초대장을 찾을 수 없습니다.', 404);
    res.json({ success: true,  invitation });
  } catch (err) { next(err); }
};

// ===== 수정 =====
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const existing = await prisma.invitation.findFirst({ where: { id, userId, deletedAt: null } });
    if (!existing) throw new AppError('초대장을 찾을 수 없습니다.', 404);

    const updateData = { ...req.body };
    if (updateData.eventDate) updateData.eventDate = new Date(updateData.eventDate);
    if (updateData.rsvpDeadline) updateData.rsvpDeadline = new Date(updateData.rsvpDeadline);
    if (updateData.venueLat) updateData.venueLat = parseFloat(updateData.venueLat);
    if (updateData.venueLng) updateData.venueLng = parseFloat(updateData.venueLng);
    // 수정 불가 필드 제거
    delete updateData.userId; delete updateData.slug; delete updateData.viewCount; delete updateData.shareCount;

    const updated = await prisma.invitation.update({
      where: { id },
       updateData,
      include: { photos: true, bankAccounts: true },
    });
    res.json({ success: true,  updated });
  } catch (err) { next(err); }
};

// ===== 발행/언퍼블리시 =====
exports.publish = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const existing = await prisma.invitation.findFirst({ where: { id, userId, deletedAt: null } });
    if (!existing) throw new AppError('초대장을 찾을 수 없습니다.', 404);

    const isPublish = !existing.isPublished;
    const updated = await prisma.invitation.update({
      where: { id },
       {
        isPublished: isPublish,
        status: isPublish ? 'PUBLISHED' : 'DRAFT',
        publishedAt: isPublish ? new Date() : null,
      },
    });
    res.json({
      success: true,
      message: isPublish ? '지금부터 초대장이 활성화되었습니다.' : '초대장이 비공개로 전환되었습니다.',
       updated,
    });
  } catch (err) { next(err); }
};

// ===== 삭제 (소프트) =====
exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const existing = await prisma.invitation.findFirst({ where: { id, userId, deletedAt: null } });
    if (!existing) throw new AppError('초대장을 찾을 수 없습니다.', 404);
    await prisma.invitation.update({ where: { id },  { deletedAt: new Date(), status: 'DELETED' } });
    res.json({ success: true, message: '초대장이 삭제되었습니다.' });
  } catch (err) { next(err); }
};

// ===== 통계 =====
exports.getStats = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const invitation = await prisma.invitation.findFirst({ where: { id, userId, deletedAt: null } });
    if (!invitation) throw new AppError('초대장을 찾을 수 없습니다.', 404);

    const [totalRsvp, attending, notAttending, dailyViews] = await prisma.$transaction([
      prisma.rsvp.count({ where: { invitationId: id } }),
      prisma.rsvp.count({ where: { invitationId: id, attendance: 'ATTENDING' } }),
      prisma.rsvp.count({ where: { invitationId: id, attendance: 'NOT_ATTENDING' } }),
      prisma.viewLog.groupBy({
        by: ['createdAt'],
        where: { invitationId: id },
        _count: true,
        orderBy: { createdAt: 'desc' },
        take: 7,
      }),
    ]);

    const guestCount = await prisma.rsvp.aggregate({
      where: { invitationId: id, attendance: 'ATTENDING' },
      _sum: { guestCount: true },
    });

    res.json({
      success: true,
       {
        viewCount: invitation.viewCount,
        shareCount: invitation.shareCount,
        totalRsvp,
        attending,
        notAttending,
        totalGuestCount: guestCount._sum.guestCount || 0,
        dailyViews,
      },
    });
  } catch (err) { next(err); }
};

// ===== 계좌 쫐가/수정/삭제 =====
exports.upsertBankAccounts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { accounts } = req.body; // []
    const invitation = await prisma.invitation.findFirst({ where: { id, userId, deletedAt: null } });
    if (!invitation) throw new AppError('초대장을 찾을 수 없습니다.', 404);

    await prisma.bankAccount.deleteMany({ where: { invitationId: id } });
    if (accounts && accounts.length > 0) {
      await prisma.bankAccount.createMany({
         accounts.map((a, i) => ({ ...a, invitationId: id, order: i })),
      });
    }
    const updated = await prisma.bankAccount.findMany({ where: { invitationId: id }, orderBy: { order: 'asc' } });
    res.json({ success: true,  updated });
  } catch (err) { next(err); }
};
