import Link from "next/link";
import { SiteHeader } from "@/components/shared/site-header";

export default function InvitationNotFound() {
  return (
    <>
      <SiteHeader />
      <div className="app-page-offset" style={{ textAlign: "center", padding: "80px 20px" }}>
        <h1 style={{ fontSize: "4rem", margin: "0 0 16px", color: "#ddd" }}>404</h1>
        <h2 style={{ fontSize: "1.3rem", margin: "0 0 12px" }}>
          초대장을 찾을 수 없습니다
        </h2>
        <p style={{ color: "#888", marginBottom: 24 }}>
          주소가 잘못되었거나, 발행이 취소된 초대장일 수 있습니다.
        </p>
        <Link className="btn-primary" href="/" style={{ display: "inline-block" }}>
          홈으로 돌아가기
        </Link>
      </div>
    </>
  );
}
