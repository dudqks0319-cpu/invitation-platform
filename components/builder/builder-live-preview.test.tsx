import { renderToStaticMarkup } from "react-dom/server";
import { BuilderLivePreview } from "@/components/builder/builder-live-preview";

describe("BuilderLivePreview", () => {
  it("renders a simplified live preview without the duplicate template layer", () => {
    document.body.innerHTML = renderToStaticMarkup(
      <BuilderLivePreview
        backgroundImagePreviewUrl=""
        mainImagePreviewUrl=""
        badgeText="결혼식"
        templateLabel="선택한 디자인 · 클래식 로즈"
        title="민준 그리고 지수"
        subtitle="Wedding Invitation"
        dateText="2026년 4월 12일 오후 1시"
        venueText="서울 웨딩홀 · 서울시 강남구"
        message={"첫 줄입니다.\n둘째 줄도 보여주세요."}
      />
    );

    expect(document.querySelector(".builder-template-preview")).toBeNull();
    expect(document.body.textContent).toContain("선택한 디자인 · 클래식 로즈");
    expect(document.body.textContent).toContain("하단 정보와 상세 구성은 실제 화면 보기에서 확인하실 수 있습니다.");
    expect(document.body.textContent).not.toContain("owner 대시보드");
    expect(document.body.innerHTML).toContain("white-space:pre-line");
  });
});
