function legacyDisabled(req, res) {
  res.status(410).json({
    success: false,
    message: "레거시 Express 초대장 컨트롤러는 비활성화되었습니다. Next.js app/api와 Supabase 경로를 사용해 주세요."
  });
}

module.exports = {
  create: legacyDisabled,
  getMyInvitations: legacyDisabled,
  getOne: legacyDisabled,
  getStats: legacyDisabled,
  publish: legacyDisabled,
  remove: legacyDisabled,
  update: legacyDisabled,
  upsertBankAccounts: legacyDisabled
};
