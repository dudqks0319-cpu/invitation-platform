import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer-bottom">
      <div className="footer-inner">
        <div className="footer-logo">invite</div>
        <p>소중한 순간을 더욱 특별하게 만들어드립니다</p>
        <div className="footer-links">
          <Link href="/builder">초대장 만들기</Link>
          <Link href="/dashboard">대시보드</Link>
          <Link href="/preview">미리보기</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/support">지원</Link>
          <Link href="/privacy">개인정보처리방침</Link>
          <Link href="/terms">이용약관</Link>
        </div>
        <p className="footer-copy">© 2026 invite. All rights reserved.</p>
      </div>
    </footer>
  );
}
