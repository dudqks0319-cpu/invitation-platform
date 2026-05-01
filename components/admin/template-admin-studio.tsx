"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import type { SafeTemplate } from "@/lib/safe-templates";

const categoryOptions: Array<{ value: SafeTemplate["category"]; label: string }> = [
  { value: "wedding", label: "결혼식" },
  { value: "firstBirthday", label: "돌잔치" },
  { value: "birthday", label: "생일" },
  { value: "anniversary", label: "기념일" }
];

type TemplateFormState = {
  id: string;
  title: string;
  category: SafeTemplate["category"];
  subtitle: string;
  badge: string;
  backgroundHex: string;
  accentHex: string;
  typography: "serif" | "sans";
  backgroundImageURL: string;
  backgroundImagePath: string;
  textAreaTop: number;
  textAreaBottom: number;
  textAreaHorizontal: number;
  primaryTextHex: string;
  secondaryTextHex: string;
};

type ApiUploadResponse = {
  success?: boolean;
  publicUrl?: string;
  path?: string;
  message?: string;
};

type ApiTemplateResponse = {
  success?: boolean;
  template?: SafeTemplate;
  message?: string;
};

const initialForm: TemplateFormState = {
  id: "",
  title: "",
  category: "wedding",
  subtitle: "",
  badge: "NEW",
  backgroundHex: "#FFF9F4",
  accentHex: "#D8B8AA",
  typography: "serif",
  backgroundImageURL: "",
  backgroundImagePath: "",
  textAreaTop: 0.28,
  textAreaBottom: 0.24,
  textAreaHorizontal: 0.14,
  primaryTextHex: "#2C2A2A",
  secondaryTextHex: "#8B7D73"
};

function clampPercent(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function filePreviewURL(file: File | null) {
  if (!file) {
    return "";
  }

  return URL.createObjectURL(file);
}

export function TemplateAdminStudio({ initialTemplates }: { initialTemplates: SafeTemplate[] }) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [form, setForm] = useState<TemplateFormState>(initialForm);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [pending, setPending] = useState(false);

  const previewImage = localPreviewUrl || form.backgroundImageURL || templates[0]?.backgroundImageURL || "";
  const previewTemplate = useMemo<SafeTemplate>(
    () => ({
      id: form.id || "preview",
      title: form.title || "한국형 이미지 템플릿",
      category: form.category,
      subtitle: form.subtitle || "배경 이미지는 고정하고 글자는 안전영역 안에 배치",
      badge: form.badge || "NEW",
      backgroundHex: form.backgroundHex,
      accentHex: form.accentHex,
      typography: form.typography,
      ornament: "imageBackground",
      backgroundImageURL: previewImage,
      backgroundImagePath: form.backgroundImagePath,
      textAreaTop: clampPercent(form.textAreaTop, 0.08, 0.42),
      textAreaBottom: clampPercent(form.textAreaBottom, 0.08, 0.42),
      textAreaHorizontal: clampPercent(form.textAreaHorizontal, 0.08, 0.24),
      primaryTextHex: form.primaryTextHex,
      secondaryTextHex: form.secondaryTextHex,
      isActive: true
    }),
    [form, previewImage]
  );

  function update<Key extends keyof TemplateFormState>(key: Key, value: TemplateFormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
    }
    setLocalPreviewUrl(filePreviewURL(file));
  }

  async function uploadSelectedFile() {
    if (!selectedFile) {
      return {
        publicUrl: form.backgroundImageURL,
        path: form.backgroundImagePath
      };
    }

    const body = new FormData();
    body.append("file", selectedFile);

    const response = await fetch("/api/admin/templates/upload", {
      method: "POST",
      body
    });
    const json = (await response.json()) as ApiUploadResponse;

    if (!response.ok || !json.success || !json.publicUrl) {
      throw new Error(json.message || "이미지를 업로드하지 못했습니다.");
    }

    return {
      publicUrl: json.publicUrl,
      path: json.path ?? ""
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    setMessageType("");

    try {
      const uploaded = await uploadSelectedFile();
      if (!uploaded.publicUrl) {
        throw new Error("배경 이미지를 먼저 선택해 주세요.");
      }

      const response = await fetch("/api/admin/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          id: form.id || undefined,
          backgroundImageURL: uploaded.publicUrl,
          backgroundImagePath: uploaded.path
        })
      });
      const json = (await response.json()) as ApiTemplateResponse;

      if (!response.ok || !json.success || !json.template) {
        throw new Error(json.message || "템플릿을 저장하지 못했습니다.");
      }

      setTemplates((current) => [json.template as SafeTemplate, ...current.filter((item) => item.id !== json.template?.id)]);
      setForm(initialForm);
      setSelectedFile(null);
      setLocalPreviewUrl("");
      setMessage("템플릿을 저장했습니다. iOS 앱은 /api/templates에서 이 목록을 불러옵니다.");
      setMessageType("success");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "저장 중 오류가 발생했습니다.");
      setMessageType("error");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="admin-template-studio">
      <form className="admin-template-form" onSubmit={handleSubmit}>
        <div className="admin-form-section">
          <h2>이미지 배경 업로드</h2>
          <p>JPG, PNG, WebP 5MB 이하만 허용됩니다. 앱에서는 이 이미지를 배경으로만 쓰고 텍스트는 별도 레이어로 올립니다.</p>
          <label>
            배경 이미지
            <input accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} type="file" />
          </label>
        </div>

        <div className="admin-form-grid">
          <label>
            템플릿 ID
            <input
              onChange={(event) => update("id", event.target.value)}
              placeholder="비우면 자동 생성"
              value={form.id}
            />
          </label>
          <label>
            제목
            <input
              maxLength={60}
              onChange={(event) => update("title", event.target.value)}
              required
              value={form.title}
            />
          </label>
          <label>
            카테고리
            <select
              onChange={(event) => update("category", event.target.value as SafeTemplate["category"])}
              value={form.category}
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            배지
            <input maxLength={20} onChange={(event) => update("badge", event.target.value)} value={form.badge} />
          </label>
          <label className="admin-wide">
            설명
            <input
              maxLength={100}
              onChange={(event) => update("subtitle", event.target.value)}
              value={form.subtitle}
            />
          </label>
        </div>

        <div className="admin-form-grid">
          <label>
            배경색
            <input onChange={(event) => update("backgroundHex", event.target.value)} type="color" value={form.backgroundHex} />
          </label>
          <label>
            포인트색
            <input onChange={(event) => update("accentHex", event.target.value)} type="color" value={form.accentHex} />
          </label>
          <label>
            본문색
            <input onChange={(event) => update("primaryTextHex", event.target.value)} type="color" value={form.primaryTextHex} />
          </label>
          <label>
            보조색
            <input onChange={(event) => update("secondaryTextHex", event.target.value)} type="color" value={form.secondaryTextHex} />
          </label>
          <label>
            글꼴 계열
            <select onChange={(event) => update("typography", event.target.value as "serif" | "sans")} value={form.typography}>
              <option value="serif">명조형</option>
              <option value="sans">고딕형</option>
            </select>
          </label>
        </div>

        <div className="admin-form-section">
          <h2>텍스트 안전영역</h2>
          <p>상단/하단 장식과 겹치지 않도록 텍스트가 들어갈 중앙 영역을 퍼센트로 제한합니다.</p>
          <div className="admin-slider-grid">
            <label>
              위 여백 {formatPercent(form.textAreaTop)}
              <input
                max="0.42"
                min="0.08"
                onChange={(event) => update("textAreaTop", Number(event.target.value))}
                step="0.01"
                type="range"
                value={form.textAreaTop}
              />
            </label>
            <label>
              아래 여백 {formatPercent(form.textAreaBottom)}
              <input
                max="0.42"
                min="0.08"
                onChange={(event) => update("textAreaBottom", Number(event.target.value))}
                step="0.01"
                type="range"
                value={form.textAreaBottom}
              />
            </label>
            <label>
              좌우 여백 {formatPercent(form.textAreaHorizontal)}
              <input
                max="0.24"
                min="0.08"
                onChange={(event) => update("textAreaHorizontal", Number(event.target.value))}
                step="0.01"
                type="range"
                value={form.textAreaHorizontal}
              />
            </label>
          </div>
        </div>

        {message ? <p className={`admin-message ${messageType}`}>{message}</p> : null}

        <button className="admin-save-button" disabled={pending} type="submit">
          {pending ? "저장 중" : "템플릿 저장"}
        </button>
      </form>

      <aside className="admin-preview-panel">
        <h2>세로형 미리보기</h2>
        <TemplatePreview template={previewTemplate} />
        <div className="admin-template-list">
          <h3>등록된 템플릿</h3>
          {templates.map((template) => (
            <div className="admin-template-row" key={template.id}>
              <div
                className="admin-template-row-thumb"
                style={{
                  backgroundColor: template.backgroundHex,
                  backgroundImage: `url(${template.backgroundImageURL})`
                }}
              />
              <div>
                <strong>{template.title}</strong>
                <span>{categoryOptions.find((item) => item.value === template.category)?.label ?? template.category}</span>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

function TemplatePreview({ template }: { template: SafeTemplate }) {
  const safeAreaStyle = {
    inset: `${template.textAreaTop * 100}% ${template.textAreaHorizontal * 100}% ${template.textAreaBottom * 100}%`
  };

  return (
    <div
      className="admin-preview-card"
      style={{
        backgroundColor: template.backgroundHex,
        backgroundImage: template.backgroundImageURL ? `url(${template.backgroundImageURL})` : undefined
      }}
    >
      <div className="admin-preview-safe-area" style={safeAreaStyle}>
        <p style={{ color: template.accentHex }}>We are getting married</p>
        <h3 style={{ color: template.primaryTextHex }}>결혼합니다</h3>
        <div className="admin-preview-divider" style={{ color: template.accentHex }}>
          <span />
          <b>♥</b>
          <span />
        </div>
        <strong style={{ color: template.primaryTextHex }}>이준서 · 김은재</strong>
        <small style={{ color: template.secondaryTextHex }}>2026.06.11 목요일 오전 10:20</small>
        <small style={{ color: template.secondaryTextHex }}>더라움웨딩</small>
        <em style={{ color: template.accentHex }}>소중한 날 함께해 주세요</em>
      </div>
    </div>
  );
}

