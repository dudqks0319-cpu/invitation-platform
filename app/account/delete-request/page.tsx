"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/shared/site-header";

export default function DeleteRequestPage() {
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!email) return;
    setSubmitted(true);
  }

  return (
    <>
      <SiteHeader />
      <main style={{ maxWidth: 480, margin: "0 auto", padding: "40px 16px" }}>
        <h1 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: 8 }}>
          계정 삭제 요청
        </h1>
        <p style={{ color: "#888", marginBottom: 32, lineHeight: 1.6 }}>
          계정 삭제를 요청하시면 14일 이내에 모든 데이터(초대장, RSVP, 방명록, 업로드된 이미지)가
          영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
        </p>

        {submitted ? (
          <div
            style={{
              background: "#e8f5e9",
              padding: 20,
              borderRadius: 12,
              textAlign: "center"
            }}
          >
            <p style={{ fontWeight: 600, marginBottom: 8 }}>요청이 접수되었습니다.</p>
            <p style={{ color: "#666", fontSize: "0.9rem" }}>
              {email} 주소로 확인 메일을 보내드립니다.
              <br />
              14일 이내에 계정과 모든 데이터가 삭제됩니다.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label style={{ display: "block", marginBottom: 16 }}>
              <span style={{ display: "block", fontWeight: 600, marginBottom: 4 }}>
                가입한 이메일
              </span>
              <input
                className="modal-input"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="example@email.com"
                required
                type="email"
                value={email}
              />
            </label>

            <label style={{ display: "block", marginBottom: 24 }}>
              <span style={{ display: "block", fontWeight: 600, marginBottom: 4 }}>
                삭제 사유 (선택)
              </span>
              <textarea
                className="modal-input"
                onChange={(event) => setReason(event.target.value)}
                placeholder="사유를 입력해 주세요."
                rows={3}
                value={reason}
              />
            </label>

            <button
              className="btn-primary form-submit"
              style={{ width: "100%", background: "#e74c3c" }}
              type="submit"
            >
              계정 삭제 요청
            </button>
          </form>
        )}
      </main>
    </>
  );
}
