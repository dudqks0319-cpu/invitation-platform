import Link from "next/link";

type CreateMode = "image" | "template";

type CreateModeTabsProps = {
  activeMode: CreateMode;
};

const createModes: Array<{
  description: string;
  href: string;
  label: string;
  value: CreateMode;
}> = [
  {
    description: "바로 고르고 정보만 채우는 기본 제작",
    href: "/builder",
    label: "템플릿 초대장",
    value: "template"
  },
  {
    description: "내 이미지 위에 필요한 문구만 더해 완성",
    href: "/image-text",
    label: "이미지 초대장",
    value: "image"
  }
];

export function CreateModeTabs({ activeMode }: CreateModeTabsProps) {
  return (
    <nav aria-label="초대장 제작 방식" className="create-mode-tabs" role="tablist">
      {createModes.map((mode) => {
        const isActive = mode.value === activeMode;

        return (
          <Link
            aria-selected={isActive}
            className={isActive ? "create-mode-tab is-active" : "create-mode-tab"}
            href={mode.href}
            key={mode.value}
            role="tab"
          >
            <span className="create-mode-tab-eyebrow">{mode.value === "template" ? "추천" : "직접"}</span>
            <strong>{mode.label}</strong>
            <span>{mode.description}</span>
          </Link>
        );
      })}
    </nav>
  );
}
