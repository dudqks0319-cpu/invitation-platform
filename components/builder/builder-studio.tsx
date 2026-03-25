"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { authDestination, normalizeNextPath } from "@/lib/auth";
import {
  applyCategoryTemplateDefaults,
  getInvitationCategoryMeta,
  getInvitationHeroSubtitle,
  getInvitationHeroTitle
} from "@/lib/invitation-presentation";
import { createBrowserClient } from "@/lib/supabase/browser";
import {
  LOCAL_DRAFT_KEY,
  createInvitationSlug,
  defaultInvitationDraft,
  formatEventDateTime,
  normalizeDraft,
  type InvitationStatus,
  type InvitationDraftPayload
} from "@/lib/invitation-payload";
import { templates } from "@/lib/templates";
import { TemplateMarkup } from "@/components/landing/template-markup";

type DraftMeta = {
  id?: string;
  slug?: string;
  status?: InvitationStatus;
};

type StoredDraft = {
  payload: InvitationDraftPayload;
  meta: DraftMeta;
};

function readStoredDraft() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_DRAFT_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as { payload?: unknown; meta?: DraftMeta };
    return {
      payload: normalizeDraft(parsed.payload ?? {}),
      meta: parsed.meta ?? {}
    } satisfies StoredDraft;
  } catch {
    return null;
  }
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("이미지를 읽는 중 오류가 발생했습니다."));
    reader.readAsDataURL(file);
  });
}

async function dataUrlToFile(dataUrl: string, filename: string) {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type || "image/png" });
}

export function BuilderStudio({
  initialInvitationId,
  initialTemplateId,
  intentCheckout = false
}: {
  initialInvitationId?: string;
  initialTemplateId?: string;
  intentCheckout?: boolean;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserClient(), []);
  const createdUrlsRef = useRef<string[]>([]);
  const checkoutIntentHandledRef = useRef(false);
  const loadedInvitationIdRef = useRef<string | null>(null);
  const [payload, setPayload] = useState<InvitationDraftPayload>(() => {
    const stored = readStoredDraft();
    const base = stored?.payload ?? defaultInvitationDraft;
    const matched = initialTemplateId
      ? templates.find((template) => template.id === initialTemplateId)
      : null;

    return matched
      ? normalizeDraft(applyCategoryTemplateDefaults(base, matched.category, matched.id))
      : normalizeDraft(base);
  });
  const [meta, setMeta] = useState<DraftMeta>(() => readStoredDraft()?.meta ?? {});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success" | "">("");
  const [pending, setPending] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [mainImagePreviewUrl, setMainImagePreviewUrl] = useState<string>(payload.mainImageUrl);
  const [backgroundImagePreviewUrl, setBackgroundImagePreviewUrl] = useState<string>(payload.backgroundImageUrl);
  const [pendingMainImageFile, setPendingMainImageFile] = useState<File | null>(null);
  const [pendingBackgroundImageFile, setPendingBackgroundImageFile] = useState<File | null>(null);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === payload.templateId) ?? templates[0],
    [payload.templateId]
  );
  const categoryMeta = useMemo(() => getInvitationCategoryMeta(payload), [payload]);
  const previewTitle = useMemo(() => getInvitationHeroTitle(payload), [payload]);
  const previewSubtitle = useMemo(() => getInvitationHeroSubtitle(payload), [payload]);
  const paidSnapshotRef = useRef<InvitationDraftPayload | null>(meta.status === "published" ? payload : null);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, [supabase]);

  useEffect(() => {
    if (!supabase || !userId || !initialInvitationId || loadedInvitationIdRef.current === initialInvitationId) {
      return;
    }

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
        status: data.status
      });
      setMainImagePreviewUrl(nextPayload.mainImageUrl);
      setBackgroundImagePreviewUrl(nextPayload.backgroundImageUrl);
      paidSnapshotRef.current = data.paid_payload_snapshot ? normalizeDraft(data.paid_payload_snapshot) : null;
    })();
  }, [initialInvitationId, supabase, userId]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storablePayload = normalizeDraft({
      ...payload,
      mainImageUrl: payload.mainImageUrl || "",
      backgroundImageUrl: payload.backgroundImageUrl || ""
    });

    window.localStorage.setItem(
      LOCAL_DRAFT_KEY,
      JSON.stringify({
        payload: storablePayload,
        meta
      } satisfies StoredDraft)
    );
  }, [payload, meta]);

  useEffect(() => {
    const createdUrls = createdUrlsRef.current;

    return () => {
      createdUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const hasRestrictedPaidChanges =
    meta.status === "published" &&
    paidSnapshotRef.current !== null &&
    (
      payload.templateId !== paidSnapshotRef.current.templateId ||
      payload.mainImagePath !== paidSnapshotRef.current.mainImagePath ||
      payload.backgroundImagePath !== paidSnapshotRef.current.backgroundImagePath ||
      payload.mainImageUrl !== paidSnapshotRef.current.mainImageUrl ||
      payload.backgroundImageUrl !== paidSnapshotRef.current.backgroundImageUrl
    );

  useEffect(() => {
    if (!intentCheckout || checkoutIntentHandledRef.current || !supabase || !userId) {
      return;
    }

    checkoutIntentHandledRef.current = true;

    void (async () => {
      const saved = meta.id ? meta : await persistDraft("draft");
      if (saved?.id) {
        router.replace(`/checkout?invitationId=${saved.id}`);
      }
    })();
  }, [intentCheckout, supabase, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  function updateField<Key extends keyof InvitationDraftPayload>(key: Key, value: InvitationDraftPayload[Key]) {
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
      return;
    }

    setPendingBackgroundImageFile(file);
    setBackgroundImagePreviewUrl(file ? createPreviewUrl(file) : payload.backgroundImageUrl);
    if (!file) {
      updateField("backgroundImageUrl", "");
      updateField("backgroundImagePath", "");
    }
  }

  async function uploadImage(file: File, kind: "main" | "background") {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", kind);

    const response = await fetch("/api/uploads", {
      method: "POST",
      body: formData
    });

    const result = (await response.json()) as { error?: string; message?: string; publicUrl?: string; path?: string };

    if (!response.ok || !result.publicUrl || !result.path) {
      throw new Error(result.error || result.message || "이미지 업로드에 실패했습니다.");
    }

    return {
      publicUrl: result.publicUrl,
      path: result.path
    };
  }

  async function deleteImage(path: string) {
    const response = await fetch("/api/uploads", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ path })
    });

    if (!response.ok) {
      const result = (await response.json().catch(() => ({ message: "이미지 삭제에 실패했습니다." }))) as {
        message?: string;
      };

      throw new Error(result.message || "이미지 삭제에 실패했습니다.");
    }
  }

  async function persistDraft(status: "draft" | "published") {
    setPending(true);
    setMessage("");
    setMessageType("");

    const previousMainImagePath = payload.mainImagePath;
    const previousBackgroundImagePath = payload.backgroundImagePath;
    const rollbackPaths: string[] = [];

    try {
      let nextPayload = payload;

      if ((pendingMainImageFile || pendingBackgroundImageFile) && (!supabase || !userId)) {
        setMessage("데모 모드에서는 이미지가 현재 세션 미리보기로만 반영됩니다.");
        setMessageType("success");
      }

      if (pendingMainImageFile && (!supabase || !userId)) {
        const dataUrl = await fileToDataUrl(pendingMainImageFile);
        nextPayload = normalizeDraft({
          ...nextPayload,
          mainImageUrl: dataUrl,
          mainImagePath: ""
        });
      }

      if (pendingBackgroundImageFile && (!supabase || !userId)) {
        const dataUrl = await fileToDataUrl(pendingBackgroundImageFile);
        nextPayload = normalizeDraft({
          ...nextPayload,
          backgroundImageUrl: dataUrl,
          backgroundImagePath: ""
        });
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
      const nextMeta = { ...meta, slug: nextSlug, status };

      if (!supabase || !userId) {
        setPayload(nextPayload);
        setMeta(nextMeta);
        if (pendingMainImageFile) {
          setPendingMainImageFile(null);
          setMainImagePreviewUrl(nextPayload.mainImageUrl);
        }
        if (pendingBackgroundImageFile) {
          setPendingBackgroundImageFile(null);
          setBackgroundImagePreviewUrl(nextPayload.backgroundImageUrl);
        }
        setPending(false);
        setMessage(status === "published" ? "데모 모드에서 미리보기용 발행 상태로 저장했습니다." : "데모 모드로 초안을 저장했습니다.");
        setMessageType("success");
        return nextMeta;
      }

      const invitationInput = {
        user_id: userId,
        slug: nextSlug,
        title: nextPayload.title,
        category: nextPayload.category,
        template_id: nextPayload.templateId,
        status,
        payload: nextPayload,
        repurchase_required: hasRestrictedPaidChanges,
        paid_payload_snapshot: paidSnapshotRef.current,
        published_at: status === "published" ? new Date().toISOString() : null
      };

      const query = meta.id
        ? supabase.from("invitations").update(invitationInput).eq("id", meta.id).select().single()
        : supabase.from("invitations").insert(invitationInput).select().single();

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      const savedMeta = {
        id: data.id,
        slug: data.slug,
        status: data.status as InvitationStatus
      } satisfies DraftMeta;

      setPayload(nextPayload);
      setMeta(savedMeta);
      if (savedMeta.status === "published") {
        paidSnapshotRef.current = nextPayload;
      }
      if (pendingMainImageFile) {
        setPendingMainImageFile(null);
        setMainImagePreviewUrl(nextPayload.mainImageUrl);
      }
      if (pendingBackgroundImageFile) {
        setPendingBackgroundImageFile(null);
        setBackgroundImagePreviewUrl(nextPayload.backgroundImageUrl);
      }

      if (
        supabase &&
        userId &&
        previousMainImagePath &&
        previousMainImagePath !== nextPayload.mainImagePath
      ) {
        await deleteImage(previousMainImagePath).catch(() => {});
      }

      if (
        supabase &&
        userId &&
        previousBackgroundImagePath &&
        previousBackgroundImagePath !== nextPayload.backgroundImagePath
      ) {
        await deleteImage(previousBackgroundImagePath).catch(() => {});
      }

      setPending(false);
      setMessage(status === "published" ? "초대장을 발행했습니다." : "초안을 저장했습니다.");
      setMessageType("success");

      return savedMeta;
    } catch (error) {
      if (rollbackPaths.length > 0) {
        await Promise.allSettled(rollbackPaths.map((path) => deleteImage(path)));
      }
      setPending(false);
      setMessage(error instanceof Error ? error.message : "초안 저장에 실패했습니다.");
      setMessageType("error");
      return null;
    }
  }

  const inputClassName = "modal-input";
  const publishButtonLabel =
    meta.status === "published"
      ? hasRestrictedPaidChanges
        ? "재결제 후 재발행"
        : "무료 수정 저장"
      : "결제 후 발행";

  return (
    <div className="builder-grid builder-grid-extended">
      <form
        className="data-form builder-form"
        onSubmit={async (event) => {
          event.preventDefault();
          await persistDraft("draft");
        }}
      >
        <div className="builder-form-section">
          <h3>1. 기본 정보</h3>
          <label>
            선택 템플릿
            <select
              className={inputClassName}
              value={payload.templateId}
              onChange={(event) => {
                const template = templates.find((item) => item.id === event.target.value);
                if (!template) return;
                setPayload((current) =>
                  normalizeDraft(applyCategoryTemplateDefaults(current, template.category, template.id))
                );
              }}
            >
          {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.badge} · {template.name}
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
            <input className={inputClassName} value={payload.title} onChange={(event) => updateField("title", event.target.value)} />
          </label>
          <label>
            행사 일시
            <input className={inputClassName} type="datetime-local" value={payload.eventDateTime} onChange={(event) => updateField("eventDateTime", event.target.value)} />
          </label>
          <label>
            행사장 이름
            <input className={inputClassName} value={payload.venueName} onChange={(event) => updateField("venueName", event.target.value)} />
          </label>
          <label>
            행사장 주소
            <input className={inputClassName} value={payload.venueAddress} onChange={(event) => updateField("venueAddress", event.target.value)} />
          </label>
          <label>
            초대 메시지
            <textarea className={inputClassName} rows={4} value={payload.message} onChange={(event) => updateField("message", event.target.value)} />
          </label>
        </div>

        <div className="builder-form-section">
          <h3>2. {categoryMeta.personSectionTitle}</h3>
          <div className="form-two-col">
            <label>
              {categoryMeta.primaryNameLabel}
              <input className={inputClassName} value={payload.groomName} onChange={(event) => updateField("groomName", event.target.value)} />
            </label>
            <label>
              {categoryMeta.secondaryNameLabel}
              <input className={inputClassName} value={payload.brideName} onChange={(event) => updateField("brideName", event.target.value)} />
            </label>
            <label>
              {categoryMeta.primaryPhoneLabel}
              <input className={inputClassName} value={payload.groomPhone} onChange={(event) => updateField("groomPhone", event.target.value)} />
            </label>
            <label>
              {categoryMeta.secondaryPhoneLabel}
              <input className={inputClassName} value={payload.bridePhone} onChange={(event) => updateField("bridePhone", event.target.value)} />
            </label>
            <label>
              {categoryMeta.guardianLabels[0]}
              <input className={inputClassName} value={payload.groomFatherName} onChange={(event) => updateField("groomFatherName", event.target.value)} />
            </label>
            <label>
              {categoryMeta.guardianLabels[1]}
              <input className={inputClassName} value={payload.groomMotherName} onChange={(event) => updateField("groomMotherName", event.target.value)} />
            </label>
            <label>
              {categoryMeta.guardianLabels[2]}
              <input className={inputClassName} value={payload.brideFatherName} onChange={(event) => updateField("brideFatherName", event.target.value)} />
            </label>
            <label>
              {categoryMeta.guardianLabels[3]}
              <input className={inputClassName} value={payload.brideMotherName} onChange={(event) => updateField("brideMotherName", event.target.value)} />
            </label>
          </div>
        </div>

        <div className="builder-form-section">
          <h3>3. 사진 설정</h3>
          <label>
            메인 사진 업로드
            <input className={inputClassName} accept="image/*" onChange={(event) => handleImageSelection("main", event.target.files?.[0] ?? null)} type="file" />
          </label>
          <label>
            배경 사진 업로드
            <input className={inputClassName} accept="image/*" onChange={(event) => handleImageSelection("background", event.target.files?.[0] ?? null)} type="file" />
          </label>
          <div className="header-actions" style={{ marginTop: "12px" }}>
            <button
              className="btn-outline"
              onClick={() => {
                setPendingMainImageFile(null);
                setMainImagePreviewUrl("");
                updateField("mainImageUrl", "");
                updateField("mainImagePath", "");
              }}
              type="button"
            >
              메인 사진 제거
            </button>
            <button
              className="btn-outline"
              onClick={() => {
                setPendingBackgroundImageFile(null);
                setBackgroundImagePreviewUrl("");
                updateField("backgroundImageUrl", "");
                updateField("backgroundImagePath", "");
              }}
              type="button"
            >
              배경 사진 제거
            </button>
          </div>
          <p className="builder-help">이미지는 저장 시 Storage로 업로드되고, payload에는 URL만 기록됩니다.</p>
        </div>

        <div className="builder-form-section">
          <h3>4. {categoryMeta.accountTitle} · 카카오페이</h3>
          <div className="form-two-col">
            <label>
              {categoryMeta.primaryAccountPrefix} 은행
              <input className={inputClassName} value={payload.groomBank} onChange={(event) => updateField("groomBank", event.target.value)} />
            </label>
            <label>
              {categoryMeta.primaryAccountPrefix} 예금주
              <input className={inputClassName} value={payload.groomBankHolder} onChange={(event) => updateField("groomBankHolder", event.target.value)} />
            </label>
            <label className="full-col">
              {categoryMeta.primaryAccountPrefix} 계좌번호
              <input className={inputClassName} value={payload.groomBankAccount} onChange={(event) => updateField("groomBankAccount", event.target.value)} />
            </label>
            <label>
              {categoryMeta.secondaryAccountPrefix} 은행
              <input className={inputClassName} value={payload.brideBank} onChange={(event) => updateField("brideBank", event.target.value)} />
            </label>
            <label>
              {categoryMeta.secondaryAccountPrefix} 예금주
              <input className={inputClassName} value={payload.brideBankHolder} onChange={(event) => updateField("brideBankHolder", event.target.value)} />
            </label>
            <label className="full-col">
              {categoryMeta.secondaryAccountPrefix} 계좌번호
              <input className={inputClassName} value={payload.brideBankAccount} onChange={(event) => updateField("brideBankAccount", event.target.value)} />
            </label>
          </div>
          <label>
            카카오페이 링크
            <input className={inputClassName} value={payload.kakaoPayLink} onChange={(event) => updateField("kakaoPayLink", event.target.value)} />
          </label>
        </div>

        <div className="builder-form-section">
          <h3>5. 오시는 길</h3>
          <label>
            지도 주소
            <input className={inputClassName} value={payload.mapAddress} onChange={(event) => updateField("mapAddress", event.target.value)} />
          </label>
          <label>
            네이버 지도 링크
            <input className={inputClassName} value={payload.naverMapLink} onChange={(event) => updateField("naverMapLink", event.target.value)} />
          </label>
          <label>
            교통 안내 메모
            <textarea className={inputClassName} rows={3} value={payload.transportNote} onChange={(event) => updateField("transportNote", event.target.value)} />
          </label>
        </div>

        <button className="btn-primary form-submit" disabled={pending} type="submit">
          {pending ? "저장 중..." : "초안 저장"}
        </button>
        <button
          className="btn-primary form-submit"
          disabled={pending}
          onClick={async () => {
            await persistDraft("draft");
            router.push("/preview");
          }}
          type="button"
        >
          실제 화면 보기
        </button>
        <button
          className="btn-outline form-submit"
          disabled={pending}
          onClick={async () => {
            if (meta.status === "published" && !hasRestrictedPaidChanges) {
              await persistDraft("published");
              return;
            }

            if (!supabase || !userId) {
              await persistDraft("draft");
              router.push(`/sign-in?next=${encodeURIComponent(normalizeNextPath("/builder?intent=checkout", authDestination.checkout))}`);
              return;
            }

            const saved = meta.id ? meta : await persistDraft("draft");
            if (saved?.id) {
              router.push(`/checkout?invitationId=${saved.id}`);
            }
          }}
          type="button"
        >
          {publishButtonLabel}
        </button>
        {meta.status === "published" && hasRestrictedPaidChanges ? (
          <p className="form-message error">
            템플릿 또는 이미지를 변경하면 재결제가 필요합니다. 체크아웃에서 결제 후 다시 발행됩니다.
          </p>
        ) : null}
        {meta.status && meta.status !== "draft" && meta.status !== "published" ? (
          <p className="form-message error">
            현재 결제 상태: {meta.status}. 결제 완료 전까지 공개 링크는 활성화되지 않습니다.
          </p>
        ) : null}
        <p className={`form-message ${messageType}`}>{message}</p>
      </form>

      <div className="builder-preview-wrap">
        <div className="phone-mock builder-phone builder-phone-large">
          <div className="phone-screen builder-screen">
            <div className="builder-template-preview">
              <TemplateMarkup template={selectedTemplate} />
            </div>
            {backgroundImagePreviewUrl ? (
              <div className="builder-background-layer has-image" style={{ backgroundImage: `url(${backgroundImagePreviewUrl})` }} />
            ) : (
              <div className="builder-background-layer" />
            )}
            <div className="builder-preview-content">
              <div className="builder-preview-main-photo-wrap">
                {mainImagePreviewUrl ? <img alt="메인 사진 미리보기" className="builder-preview-main-photo has-image" src={mainImagePreviewUrl} /> : <div className="builder-preview-main-photo" />}
              </div>
              <p className="builder-preview-label">{categoryMeta.badgeText}</p>
              <h2 className="builder-preview-names">{previewTitle}</h2>
              {previewSubtitle ? <p className="builder-preview-venue">{previewSubtitle}</p> : null}
              <p className="builder-preview-date">
                {payload.eventDateTime
                  ? formatEventDateTime(payload.eventDateTime)
                  : "날짜와 시간을 선택하세요"}
              </p>
              <p className="builder-preview-venue">
                {payload.venueName || payload.venueAddress
                  ? [payload.venueName, payload.venueAddress].filter(Boolean).join(" · ")
                  : "예식장과 주소를 입력해 주세요"}
              </p>
              <p className="builder-preview-message">{payload.message || "소중한 자리에 함께해 주세요"}</p>
              <p className="builder-preview-note">
                이미지는 업로드 후 URL로 저장됩니다. 미발행 상태에서도 초안 저장과 owner 대시보드 연결이 유지됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
