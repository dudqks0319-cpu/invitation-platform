import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer-bottom">
      <div className="footer-inner">
        <div className="footer-brand-row">
          <div className="footer-logo">
            <span aria-hidden="true" className="brand-mark">
              53
            </span>
            <span>오삼오삼</span>
          </div>
          <p>마음을 전하는 초대장을 더 쉽고 빠르게.</p>
        </div>
        <div className="footer-links">
          <Link href="/#templates">템플릿</Link>
          <Link href="/builder">초대장 만들기</Link>
          <Link href="/dashboard">내 초대장</Link>
          <Link href="/faq">자주 묻는 질문</Link>
          <Link href="/support">문의하기</Link>
          <Link href="/privacy">개인정보처리방침</Link>
          <Link href="/terms">이용약관</Link>
        </div>
        <p className="footer-copy">© 2026 오삼오삼. All rights reserved.</p>
      </div>
    </footer>
  );
}
