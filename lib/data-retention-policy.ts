export const freeInvitationUsagePolicy = {
  label: "무료 공개 링크 사용 기간",
  value: "별도 만료일 없이 제공",
  note: "작성자 삭제, 계정 삭제, 신고·운영 제한, 서비스 종료 공지가 있는 경우 공개 링크가 비활성화될 수 있습니다."
} as const;

export const dataRetentionPolicyItems = [
  {
    label: "초대장 본문과 공개 링크",
    retention: "작성자가 초대장을 삭제하거나 계정을 삭제할 때까지 보관",
    deletion: "대시보드 초대장 삭제 또는 계정 삭제 시 함께 삭제"
  },
  {
    label: "업로드 사진과 갤러리 이미지",
    retention: "초대장에 연결된 동안 보관",
    deletion: "사진 삭제, 초대장 삭제, 계정 삭제 시 저장소에서 삭제"
  },
  {
    label: "RSVP 응답",
    retention: "초대장 운영 기간 동안 작성자가 확인할 수 있도록 보관",
    deletion: "초대장 삭제 또는 계정 삭제 시 삭제"
  },
  {
    label: "방명록과 신고 내역",
    retention: "초대장 운영과 신고 처리에 필요한 기간 동안 보관",
    deletion: "초대장 삭제 또는 계정 삭제 시 삭제하되, 처리 이력은 분쟁 대응에 필요한 범위에서 보관 가능"
  },
  {
    label: "접속·보안 로그",
    retention: "오남용 방지와 장애 대응을 위해 최대 90일 보관",
    deletion: "보관 기간이 지나면 순환 삭제"
  },
  {
    label: "고객지원 요청",
    retention: "문의 처리와 분쟁 대응을 위해 처리 완료 후 최대 3년 보관",
    deletion: "지원 페이지를 통한 삭제 요청 접수"
  }
] as const;

export const retentionPolicyNotice =
  "법령상 보관 의무가 있는 정보는 해당 법령에서 정한 기간 동안 최소 범위로 보관될 수 있습니다.";
