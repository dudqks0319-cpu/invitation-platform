function legacyDisabled(req, res) {
  res.status(410).json({
    success: false,
    message: "레거시 Express 인증 컨트롤러는 비활성화되었습니다. Supabase Auth 경로를 사용해 주세요."
  });
}

module.exports = {
  forgotPassword: legacyDisabled,
  getMe: legacyDisabled,
  login: legacyDisabled,
  logout: legacyDisabled,
  oauthCallback: legacyDisabled,
  refreshToken: legacyDisabled,
  register: legacyDisabled,
  resetPassword: legacyDisabled,
  verifyEmail: legacyDisabled
};
