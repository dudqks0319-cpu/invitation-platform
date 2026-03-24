"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/browser";
import {
  LOCAL_DRAFT_KEY,
  createInvitationSlug,
  defaultInvitationDraft,
  normalizeDraft,
  type InvitationStatus,
  type InvitationDraftPayload
} from "@/lib/invitation-payload";
import { templates } from "@/lib/templates";
import { TemplateMarkup } from "@/components/landing/template-markup";
import {
  callSaveInvitation,
  getErrorMessage
} from "@/lib/supabase/save-invitation";

type DraftMeta = {
  id?: string;
  slug?: string;
  status?: InvitationStatus;
  serverRevision?: number;
};

type StoredDraft = {
  payload: InvitationDraftPayload;
  meta: DraftMeta;
};

function readStoredDraft(): StoredDraft | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(LOCAL_DRAFT_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as { payload?: unknown; meta?: DraftMeta };
    return {
      payload: normalizeDraft(parsed.payload ?? {}),
      meta: parsed.meta ?? {}
    };
  } catch {
    return null;
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("이미지를 읽는 중 오류가 발생했습니다."));
    reader.readAsDataURL(file);
  });
}

async function dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type || "image/png" });
}

function generateId() {
  return crypto.randomUUID();
}

export function BuilderStudio({
  initialInvitationId,
  initialTemplateId
}: {
  initialInvitationId?: string;
  initialTemplateId?: string;
  intentCheckout?: boolean;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserClient(), []);
  const createdUrlsRef = useRef<string[]>([]);
  const loadedInvitationIdRef = useRef<string | null>(null);

  const [payload, setPayload] = useState<InvitationDraftPayload>(() => {
    const stored = readStoredDraft();
    const base = stored?.payload ?? defaultInvitationDraft;
    const matched = initialTemplateId
      ? templates.find((t) => t.id === initialTemplateId)
      : null;

    return matched
      ? normalizeDraft({ ...base, templateId: matched.id, category: matched.category })
      : normalizeDraft(base);
  });

  const [meta, setMeta] = useState<DraftMeta>(() => {
    const stored = readStoredDraft();
    return stored?.meta ?? {};
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success" | "">("");
  const [pending, setPending] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [mainImagePreviewUrl, setMainImagePreviewUrl] = useState<string>(payload.mainImageUrl);
  const [backgroundImagePreviewUrl, setBackgroundImagePreviewUrl] = useState<string>(payload.backgroundImageUrl);
  const [pendingMainImageFile, setPendingMainImageFile] = useState<File | null>(null);
  const [pendingBackgroundImageFile, setPendingBackgroundImageFile] = useState<File | null>(null);

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === payload.templateId) ?? templates[0],
    [payload.templateId]
  );

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, [supabase]);

  useEffect(() => {
    if (!supabase || !userId || !initialInvitationId) return;
    if (loadedInvitationIdRef.current === initialInvitationId) return;
    loadedInvitationIdRef.current = initialInvitationId;

    void (async () => {
      const { data, error } = await supabase
        .from("invitations")
        .select("*")
        .eq("id", initialInvitationId)
        .eq("user_id", userId)
        .maybeSingle();

      if (error || !data) {
        setMessage(error?.message || "초대장을 불러오지 못했습니다.");
        setMessageType("error");
        return;
      }

      const nextPayload = normalizeDraft(data.payload);
      setPayload(nextPayload);
      setMeta({
        id: data.id,
        slug: data.slug,
        status: data.status as InvitationStatus,
        serverRevision: data.revision ?? 1
      });
      setMainImagePreviewUrl(nextPayload.mainImageUrl);
      setBackgroundImagePreviewUrl(nextPayload.backgroundImageUrl);
    })();
  }, [initialInvitationId, supabase, userId]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storablePayload = normalizeDraft({
      ...payload,
      mainImageUrl: payload.mainImageUrl || "",
      backgroundImageUrl: payload.backgroundImageUrl || ""
    });

    window.localStorage.setItem(
      LOCAL_DRAFT_KEY,
      JSON.stringify({ payload: storablePayload, meta } satisfies StoredDraft)
    );
  }, [payload, meta]);

  useEffect(() => {
    const urls = createdUrlsRef.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  function updateField<Key extends keyof InvitationDraftPayload>(
    key: Key,
    value: InvitationDraftPayload[Key]
  ) {
    setPayload((current) => normalizeDraft({ ...current, [key]: value }));
  }

  function createPreviewUrl(file: File) {
    const nextUrl = URL.createObjectURL(file);
    createdUrlsRef.current.push(nextUrl);
    return nextUrl;
  }

  function handleImageSelection(kind: "main" | "background", file: File | null) {
    if (kind === "main") {
      setPendingMainImageFile(file);
      setMainImagePreviewUrl(file ? createPreviewUrl(file) : payload.mainImageUrl);
      if (!file) {
        updateField("mainImageUrl", "");
        updateField("mainImagePath", "");
      }
    } else {
      setPendingBackgroundImageFile(file);
      setBackgroundImagePreviewUrl(file ? createPreviewUrl(file) : payload.backgroundImageUrl);
      if (!file) {
        updateField("backgroundImageUrl", "");
        updateField("backgroundImagePath", "");
      }
    }
  }

  async function uploadImage(file: File, kind: "main" | "background") {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", kind);

    const response = await fetch("/api/uploads", { method: "POST", body: formData });
    const result = (await response.json()) as {
      error?: string;
      message?: string;
      publicUrl?: string;
      path?: string;
    };

    if (!response.ok || !result.publicUrl || !result.path) {
      throw new Error(result.error || result.message || "이미지 업로드에 실패했습니다.");
    }

    return { publicUrl: result.publicUrl, path: result.path };
  }

  async function deleteImage(path: string) {
    const response = await fetch("/api/uploads", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path })
    });

    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new Error((result as { message?: string }).message || "이미지 삭제에 실패했습니다.");
    }
  }

  function clearPendingImages(nextPayload: InvitationDraftPayload) {
    if (pendingMainImageFile) {
      setPendingMainImageFile(null);
      setMainImagePreviewUrl(nextPayload.mainImageUrl);
    }
    if (pendingBackgroundImageFile) {
      setPendingBackgroundImageFile(null);
      setBackgroundImagePreviewUrl(nextPayload.backgroundImageUrl);
    }
  }

  async function persistDraft(status: InvitationStatus) {
    setPending(true);
    setMessage("");
    setMessageType("");

    const previousMainImagePath = payload.mainImagePath;
    const previousBackgroundImagePath = payload.backgroundImagePath;
    const rollbackPaths: string[] = [];

    try {
      let nextPayload = { ...payload };

      if (pendingMainImageFile && (!supabase || !userId)) {
        const dataUrl = await fileToDataUrl(pendingMainImageFile);
        nextPayload = normalizeDraft({ ...nextPayload, mainImageUrl: dataUrl, mainImagePath: "" });
      }
      if (pendingBackgroundImageFile && (!supabase || !userId)) {
        const dataUrl = await fileToDataUrl(pendingBackgroundImageFile);
        nextPayload = normalizeDraft({ ...nextPayload, backgroundImageUrl: dataUrl, backgroundImagePath: "" });
      }
      if (pendingMainImageFile && supabase && userId) {
        const uploaded = await uploadImage(pendingMainImageFile, "main");
        rollbackPaths.push(uploaded.path);
        nextPayload = normalizeDraft({
          ...nextPayload,
          mainImageUrl: uploaded.publicUrl,
          mainImagePath: uploaded.path
        });
      }
      if (pendingBackgroundImageFile && supabase && userId) {
        const uploaded = await uploadImage(pendingBackgroundImageFile, "background");
        rollbackPaths.push(uploaded.path);
        nextPayload = normalizeDraft({
          ...nextPayload,
          backgroundImageUrl: uploaded.publicUrl,
          backgroundImagePath: uploaded.path
        });
      }

      if (
        !pendingMainImageFile &&
        supabase &&
        userId &&
        nextPayload.mainImageUrl.startsWith("data:") &&
        !nextPayload.mainImagePath
      ) {
        const uploaded = await uploadImage(await dataUrlToFile(nextPayload.mainImageUrl, "main-image.png"), "main");
        rollbackPaths.push(uploaded.path);
        nextPayload = normalizeDraft({
          ...nextPayload,
          mainImageUrl: uploaded.publicUrl,
          mainImagePath: uploaded.path
        });
      }
      if (
        !pendingBackgroundImageFile &&
        supabase &&
        userId &&
        nextPayload.backgroundImageUrl.startsWith("data:") &&
        !nextPayload.backgroundImagePath
      ) {
        const uploaded = await uploadImage(await dataUrlToFile(nextPayload.backgroundImageUrl, "background-image.png"), "background");
        rollbackPaths.push(uploaded.path);
        nextPayload = normalizeDraft({
          ...nextPayload,
          backgroundImageUrl: uploaded.publicUrl,
          backgroundImagePath: uploaded.path
        });
      }

      const nextSlug = meta.slug || createInvitationSlug(nextPayload);
      const invitationId = meta.id || generateId();

      if (!supabase || !userId) {
        const nextMeta: DraftMeta = {
          ...meta,
          id: invitationId,
          slug: nextSlug,
          status,
          serverRevision: (meta.serverRevision ?? 0) + 1
        };
        setPayload(normalizeDraft(nextPayload));
        setMeta(nextMeta);
        clearPendingImages(nextPayload);
        setPending(false);
        setMessage(
          status === "published"
            ? "데모 모드에서 미리보기용 발행 상태로 저장했습니다."
            : "데모 모드로 초안을 저장했습니다."
        );
        setMessageType("success");
        return nextMeta;
      }

      const payloadWithSlug = {
        ...nextPayload,
        slug: nextSlug
      };

      const result = await callSaveInvitation(supabase, {
        id: invitationId,
        payload: payloadWithSlug as InvitationDraftPayload,
        expectedRevision: meta.serverRevision ?? 0,
        status
      });

      if (!result.success) {
        if (result.errorCode === "SAVE_REVISION_CONFLICT" && result.serverPayload) {
          const serverData = normalizeDraft(result.serverPayload);
          setPayload(serverData);
          setMeta((prev) => ({ ...prev, serverRevision: result.currentRevision }));
          setMainImagePreviewUrl(serverData.mainImageUrl);
          setBackgroundImagePreviewUrl(serverData.backgroundImageUrl);
        }
        throw new Error(getErrorMessage(result.errorCode));
      }

      const savedMeta: DraftMeta = {
        id: invitationId,
        slug: nextSlug,
        status,
        serverRevision: result.currentRevision
      };

      setPayload(normalizeDraft(nextPayload));
      setMeta(savedMeta);
      clearPendingImages(nextPayload);

      if (previousMainImagePath && previousMainImagePath !== nextPayload.mainImagePath) {
        await deleteImage(previousMainImagePath).catch(() => {});
      }
      if (previousBackgroundImagePath && previousBackgroundImagePath !== nextPayload.backgroundImagePath) {
        await deleteImage(previousBackgroundImagePath).catch(() => {});
      }

      setPending(false);
      setMessage(
        status === "published"
          ? "초대장을 발행했습니다! 공유 링크를 확인하세요."
          : status === "archived"
            ? "초대장을 보관 처리했습니다."
            : "초안을 저장했습니다."
      );
      setMessageType("success");
      return savedMeta;
    } catch (err) {
      if (rollbackPaths.length > 0) {
        await Promise.allSettled(rollbackPaths.map((path) => deleteImage(path)));
      }
      setPending(false);
      setMessage(err instanceof Error ? err.message : "초안 저장에 실패했습니다.");
      setMessageType("error");
      return null;
    }
  }

  const inputClassName = "modal-input";
  const isPublished = meta.status === "published";
  const isArchived = meta.status === "archived";
  const shareUrl = meta.slug ? `/i/${meta.slug}` : "";

  return (
    <div className="builder-grid builder-grid-extended">
      <form
        className="data-form builder-form"
        onSubmit={async (event) => {
          event.preventDefault();
          await persistDraft("draft");
        }}
      >
        {isArchived && (
          <div className="form-message error" style={{ marginBottom: 16 }}>
            이 초대장은 보관 처리되어 수정할 수 없습니다. 새 초대장을 만들어 주세요.
          </div>
        )}

        <div className="builder-form-section">
          <h3>1. 기본 정보</h3>
          <label>
            선택 템플릿
            <select
              className={inputClassName}
              disabled={isArchived}
              value={payload.templateId}
              onChange={(e) => {
                const template = templates.find((t) => t.id === e.target.value);
                if (!template) return;
                setPayload((cur) =>
                  normalizeDraft({ ...cur, templateId: template.id, category: template.category })
                );
              }}
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.badge} · {t.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            행사 카테고리
            <input className={inputClassName} readOnly value={payload.category} />
          </label>
          <label>
            행사 제목
            <input
              className={inputClassName}
              disabled={isArchived}
              value={payload.title}
              onChange={(e) => updateField("title", e.target.value)}
            />
          </label>
          <label>
            행사 일시
            <input
              className={inputClassName}
              disabled={isArchived}
              type="datetime-local"
              value={payload.eventDateTime}
              onChange={(e) => updateField("eventDateTime", e.target.value)}
            />
          </label>
          <label>
            행사장 이름
            <input
              className={inputClassName}
              disabled={isArchived}
              value={payload.venueName}
              onChange={(e) => updateField("venueName", e.target.value)}
            />
          </label>
          <label>
            행사장 주소 (지도 주소 겸용)
            <input
              className={inputClassName}
              disabled={isArchived}
              value={payload.venueAddress}
              onChange={(e) => updateField("venueAddress", e.target.value)}
            />
          </label>
          <label>
            초대 메시지
            <textarea
              className={inputClassName}
              disabled={isArchived}
              rows={4}
              value={payload.message}
              onChange={(e) => updateField("message", e.target.value)}
            />
          </label>
        </div>

        <div className="builder-form-section">
          <h3>2. 신랑 · 신부 / 혼주 정보</h3>
          <div className="form-two-col">
            <label>
              신랑 성함
              <input
                className={inputClassName}
                disabled={isArchived}
                value={payload.groomName}
                onChange={(e) => updateField("groomName", e.target.value)}
              />
            </label>
            <label>
              신부 성함
              <input
                className={inputClassName}
                disabled={isArchived}
                value={payload.brideName}
                onChange={(e) => updateField("brideName", e.target.value)}
              />
            </label>
            <label>
              신랑 연락처
              <input
                className={inputClassName}
                disabled={isArchived}
                value={payload.groomPhone}
                onChange={(e) => updateField("groomPhone", e.target.value)}
              />
            </label>
            <label>
              신부 연락처
              <input
                className={inputClassName}
                disabled={isArchived}
                value={payload.bridePhone}
                onChange={(e) => updateField("bridePhone", e.target.value)}
              />
            </label>
            <label>
              신랑 아버지
              <input
                className={inputClassName}
                disabled={isArchived}
                value={payload.groomFatherName}
                onChange={(e) => updateField("groomFatherName", e.target.value)}
              />
            </label>
            <label>
              신랑 어머니
              <input
                className={inputClassName}
                disabled={isArchived}
                value={payload.groomMotherName}
                onChange={(e) => updateField("groomMotherName", e.target.value)}
              />
            </label>
            <label>
              신부 아버지
              <input
                className={inputClassName}
                disabled={isArchived}
                value={payload.brideFatherName}
                onChange={(e) => updateField("brideFatherName", e.target.value)}
              />
            </label>
            <label>
              신부 어머니
              <input
                className={inputClassName}
                disabled={isArchived}
                value={payload.brideMotherName}
                onChange={(e) => updateField("brideMotherName", e.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="builder-form-section">
          <h3>3. 사진 설정</h3>
          <label>
            메인 사진 업로드
            <input
              className={inputClassName}
              disabled={isArchived}
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              onChange={(e) => handleImageSelection("main", e.target.files?.[0] ?? null)}
              type="file"
            />
          </label>
          <label>
            배경 사진 업로드
            <input
              className={inputClassName}
              disabled={isArchived}
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              onChange={(e) => handleImageSelection("background", e.target.files?.[0] ?? null)}
              type="file"
            />
          </label>
          <div className="header-actions" style={{ marginTop: "12px" }}>
            <button
              className="btn-outline"
              disabled={isArchived}
              type="button"
              onClick={() => {
                setPendingMainImageFile(null);
                setMainImagePreviewUrl("");
                updateField("mainImageUrl", "");
                updateField("mainImagePath", "");
              }}
            >
              메인 사진 제거
            </button>
            <button
              className="btn-outline"
              disabled={isArchived}
              type="button"
              onClick={() => {
                setPendingBackgroundImageFile(null);
                setBackgroundImagePreviewUrl("");
                updateField("backgroundImageUrl", "");
                updateField("backgroundImagePath", "");
              }}
            >
              배경 사진 제거
            </button>
          </div>
          <p className="builder-help">
            JPEG, PNG, WebP, HEIC 파일을 업로드할 수 있습니다 (최대 10MB).
          </p>
        </div>

        <div className="builder-form-section">
          <h3>4. 계좌 · 카카오페이</h3>
          <div className="form-two-col">
            <label>
              신랑측 은행
              <input
                className={inputClassName}
                disabled={isArchived}
                value={payload.groomBank}
                onChange={(e) => updateField("groomBank", e.target.value)}
              />
            </label>
            <label>
              신랑측 예금주
              <input
                className={inputClassName}
                disabled={isArchived}
                value={payload.groomBankHolder}
                onChange={(e) => updateField("groomBankHolder", e.target.value)}
              />
            </label>
            <label className="full-col">
              신랑측 계좌번호
              <input
                className={inputClassName}
                disabled={isArchived}
                value={payload.groomBankAccount}
                onChange={(e) => updateField("groomBankAccount", e.target.value)}
              />
            </label>
            <label>
              신부측 은행
              <input
                className={inputClassName}
                disabled={isArchived}
                value={payload.brideBank}
                onChange={(e) => updateField("brideBank", e.target.value)}
              />
            </label>
            <label>
              신부측 예금주
              <input
                className={inputClassName}
                disabled={isArchived}
                value={payload.brideBankHolder}
                onChange={(e) => updateField("brideBankHolder", e.target.value)}
              />
            </label>
            <label className="full-col">
              신부측 계좌번호
              <input
                className={inputClassName}
                disabled={isArchived}
                value={payload.brideBankAccount}
                onChange={(e) => updateField("brideBankAccount", e.target.value)}
              />
            </label>
          </div>
          <label>
            카카오페이 송금 링크
            <input
              className={inputClassName}
              disabled={isArchived}
              value={payload.kakaoPayLink}
              onChange={(e) => updateField("kakaoPayLink", e.target.value)}
            />
          </label>
        </div>

        <div className="builder-form-section">
          <h3>5. 오시는 길</h3>
          <p className="builder-help">
            위 &quot;행사장 주소&quot;가 지도 검색 주소로 자동 사용됩니다.
          </p>
          <label>
            네이버 지도 링크
            <input
              className={inputClassName}
              disabled={isArchived}
              value={payload.naverMapLink}
              onChange={(e) => updateField("naverMapLink", e.target.value)}
            />
          </label>
          <label>
            교통 안내 메모
            <textarea
              className={inputClassName}
              disabled={isArchived}
              rows={3}
              value={payload.transportNote}
              onChange={(e) => updateField("transportNote", e.target.value)}
            />
          </label>
        </div>

        <button className="btn-primary form-submit" disabled={pending || isArchived} type="submit">
          {pending ? "저장 중..." : "초안 저장"}
        </button>

        <button
          className="btn-primary form-submit"
          disabled={pending || isArchived}
          type="button"
          onClick={async () => {
            await persistDraft("draft");
            router.push("/preview");
          }}
        >
          실제 화면 보기
        </button>

        {!isArchived && (
          <button
            className="btn-outline form-submit"
            disabled={pending}
            type="button"
            onClick={async () => {
              if (!supabase || !userId) {
                await persistDraft("draft");
                router.push("/sign-in?next=" + encodeURIComponent("/builder"));
                return;
              }
              await persistDraft("published");
            }}
          >
            {isPublished ? "수정 저장 (발행 유지)" : "발행하기"}
          </button>
        )}

        {isPublished && (
          <button
            className="btn-outline form-submit"
            disabled={pending}
            type="button"
            style={{ color: "#888" }}
            onClick={async () => {
              if (confirm("보관 처리하면 공개 링크가 비활성화됩니다. 계속하시겠습니까?")) {
                await persistDraft("archived");
              }
            }}
          >
            보관 처리
          </button>
        )}

        {isPublished && shareUrl && (
          <div className="form-message success" style={{ marginTop: 12 }}>
            공유 링크:{" "}
            <a
              href={shareUrl}
              rel="noopener noreferrer"
              style={{ textDecoration: "underline" }}
              target="_blank"
            >
              {typeof window !== "undefined" ? window.location.origin : ""}
              {shareUrl}
            </a>
            <button
              className="btn-outline"
              style={{ marginLeft: 8, fontSize: "0.8rem" }}
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(
                  (typeof window !== "undefined" ? window.location.origin : "") + shareUrl
                );
                setMessage("링크를 복사했습니다!");
                setMessageType("success");
              }}
            >
              복사
            </button>
          </div>
        )}

        <p className={`form-message ${messageType}`}>{message}</p>
      </form>

      <div className="builder-preview-wrap">
        <div className="phone-mock builder-phone builder-phone-large">
          <div className="phone-screen builder-screen">
            <div className="builder-template-preview">
              <TemplateMarkup template={selectedTemplate} />
            </div>
            {backgroundImagePreviewUrl ? (
              <div
                className="builder-background-layer has-image"
                style={{ backgroundImage: `url(${backgroundImagePreviewUrl})` }}
              />
            ) : (
              <div className="builder-background-layer" />
            )}
            <div className="builder-preview-content">
              <div className="builder-preview-main-photo-wrap">
                {mainImagePreviewUrl ? (
                  <img
                    alt="메인 사진 미리보기"
                    className="builder-preview-main-photo has-image"
                    src={mainImagePreviewUrl}
                  />
                ) : (
                  <div className="builder-preview-main-photo" />
                )}
              </div>
              <p className="builder-preview-label">
                {selectedTemplate.badge.toUpperCase()} INVITATION
              </p>
              <h2 className="builder-preview-names">
                {(payload.groomName || "신랑") + " ♡ " + (payload.brideName || "신부")}
              </h2>
              <p className="builder-preview-date">
                {payload.eventDateTime
                  ? new Date(payload.eventDateTime).toLocaleString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit"
                    })
                  : "날짜와 시간을 선택하세요"}
              </p>
              <p className="builder-preview-venue">
                {payload.venueName || payload.venueAddress
                  ? [payload.venueName, payload.venueAddress].filter(Boolean).join(" · ")
                  : "예식장과 주소를 입력해 주세요"}
              </p>
              <p className="builder-preview-message">
                {payload.message || "소중한 자리에 함께해 주세요"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
