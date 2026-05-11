function legacyDisabled(req, res) {
  res.status(410).json({
    success: false,
    message: "레거시 Express RSVP 컨트롤러는 비활성화되었습니다. Next.js app/api와 Supabase 경로를 사용해 주세요."
  });
}

module.exports = {
  checkIn: legacyDisabled,
  exportExcel: legacyDisabled,
  getList: legacyDisabled,
  remove: legacyDisabled,
  submit: legacyDisabled
};
