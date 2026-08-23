"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { authDestination, normalizeNextPath } from "@/lib/auth";
import { createBrowserClient } from "@/lib/supabase/browser";
import {
  LOCAL_DRAFT_KEY,
  createInvitationSlug,
  defaultInvitationDraft,
  normalizeDraft,
  type InvitationStatus,
  type InvitationDraftPayload
} from "@/lib/invitation-payload";
import { buildPublishedTemplateSnapshot, templates } from "@/lib/templates";
import { TemplateMarkup } from "@/components/landing/template-markup";
import { TemplatePhotoSlotLayer } from "@/components/invitations/template-photo-slot-layer";
import { BUILDER_STEPS, clampBuilderStep, getBuilderStep } from "@/components/builder/builder-steps";
import {
  countUploadTargets,
  getAggregateUploadPercent,
  getUploadProgressLabel,
  type UploadProgressState
} from "@/components/builder/upload-progress";

type DraftMeta = {
  id?: string;
  slug?: string;
  status?: InvitationStatus;
};

type StoredDraft = {
  payload: InvitationDraftPayload;
  meta: DraftMeta;
};

const MAX_DEMO_IMAGE_BYTES = 5 * 1024 * 1024;

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
    const matched = initialTemplateId
      ? templates.find((template) => template.id === initialTemplateId)
      : null;

    return matched
      ? normalizeDraft({
          ...defaultInvitationDraft,
          templateId: matched.id,
          category: matched.category
        })
      : defaultInvitationDraft;
  });
  const [meta, setMeta] = useState<DraftMeta>({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success" | "">("");
  const [pending, setPending] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadProgress, setUploadProgress] = useState<UploadProgressState | null>(null);
  const [mainImagePreviewUrl, setMainImagePreviewUrl] = useState<string>(payload.mainImageUrl);
  const [backgroundImagePreviewUrl, setBackgroundImagePreviewUrl] = useState<string>(payload.backgroundImageUrl);
  const [pendingMainImageFile, setPendingMainImageFile] = useState<File | null>(null);
  const [pendingBackgroundImageFile, setPendingBackgroundImageFile] = useState<File | null>(null);
  const [pendingGalleryFiles, setPendingGalleryFiles] = useState<File[]>([]);
  const [pendingGalleryPreviewUrls, setPendingGalleryPreviewUrls] = useState<string[]>([]);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === payload.templateId) ?? templates[0],
    [payload.templateId]
  );
  const builderTemplateSnapshot = useMemo(
    () => buildPublishedTemplateSnapshot(payload.templateId),
    [payload.templateId]
  );
  const builderHasPhotoSlots = Boolean(builderTemplateSnapshot?.photoSlots.length);
  const paidSnapshotRef = useRef<InvitationDraftPayload | null>(meta.status === "published" ? payload : null);

  useEffect(() => {
    if (initialInvitationId) {
      return;
    }

    const stored = readStoredDraft();
    if (!stored) {
      return;
    }

    const matched = initialTemplateId
      ? templates.find((template) => template.id === initialTemplateId)
      : null;
    const nextPayload = matched
      ? normalizeDraft({
          ...stored.payload,
          templateId: matched.id,
          category: matched.category
        })
      : stored.payload;

    setPayload(nextPayload);
    setMeta(stored.meta);
    setMainImagePreviewUrl(nextPayload.mainImageUrl);
    setBackgroundImagePreviewUrl(nextPayload.backgroundImageUrl);
    setPendingGalleryFiles([]);
    setPendingGalleryPreviewUrls([]);
    paidSnapshotRef.current = stored.meta.status === "published" ? nextPayload : null;
  }, [initialInvitationId, initialTemplateId]);

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
        setMessage("초대장 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
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
      setPendingGalleryPreviewUrls([]);
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

  const hasRestrictedPaidChanges = false;

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
    if (file && file.size > MAX_DEMO_IMAGE_BYTES) {
      setMessage("이미지는 5MB 이하 파일만 업로드할 수 있습니다.");
      setMessageType("error");
      return;
    }

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

  function handleGallerySelection(fileList: FileList | null) {
    const files = fileList ? Array.from(fileList) : [];

    if (files.some((file) => file.size > MAX_DEMO_IMAGE_BYTES)) {
      setMessage("갤러리 이미지는 5MB 이하 파일만 업로드할 수 있습니다.");
      setMessageType("error");
      return;
    }

    setPendingGalleryFiles(files);
    setPendingGalleryPreviewUrls(files.map((file) => createPreviewUrl(file)));
  }

  async function uploadImage(
    file: File,
    kind: "main" | "background" | "gallery",
    onProgress?: (percent: number) => void
  ) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", kind);

    return new Promise<{ publicUrl: string; path: string }>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/uploads");
      xhr.responseType = "json";

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) {
          return;
        }

        onProgress?.((event.loaded / event.total) * 100);
      };

      xhr.onload = () => {
        const result = (xhr.response ??
          JSON.parse(xhr.responseText || "{}")) as { error?: string; message?: string; publicUrl?: string; path?: string };

        if (xhr.status < 200 || xhr.status >= 300 || !result.publicUrl || !result.path) {
          reject(new Error(result.error || result.message || "이미지 업로드에 실패했습니다."));
          return;
        }

        onProgress?.(100);
        resolve({
          publicUrl: result.publicUrl,
          path: result.path
        });
      };

      xhr.onerror = () => {
        reject(new Error("이미지 업로드에 실패했습니다."));
      };

      xhr.send(formData);
    });
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
    setUploadProgress(null);

    const previousMainImagePath = payload.mainImagePath;
    const previousBackgroundImagePath = payload.backgroundImagePath;
    const previousGalleryImagePaths = payload.galleryImagePaths;
    const rollbackPaths: string[] = [];

    try {
      let nextPayload = payload;
      const shouldUploadMain = Boolean(
        supabase &&
        userId &&
        (
          pendingMainImageFile ||
          (!pendingMainImageFile && nextPayload.mainImageUrl.startsWith("data:") && !nextPayload.mainImagePath)
        )
      );
      const shouldUploadBackground = Boolean(
        supabase &&
        userId &&
        (
          pendingBackgroundImageFile ||
          (!pendingBackgroundImageFile && nextPayload.backgroundImageUrl.startsWith("data:") && !nextPayload.backgroundImagePath)
        )
      );
      const galleryDataIndexes = nextPayload.galleryImages.reduce<number[]>((indexes, imageUrl, index) => {
        if (imageUrl.startsWith("data:") && !nextPayload.galleryImagePaths[index]) {
          indexes.push(index);
        }
        return indexes;
      }, []);
      const totalUploads = countUploadTargets({
        hasMain: shouldUploadMain,
        hasBackground: shouldUploadBackground,
        galleryCount: pendingGalleryFiles.length + galleryDataIndexes.length
      });

      if ((pendingMainImageFile || pendingBackgroundImageFile || pendingGalleryFiles.length) && (!supabase || !userId)) {
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

      if (pendingGalleryFiles.length && (!supabase || !userId)) {
        const dataUrls = await Promise.all(pendingGalleryFiles.map((file) => fileToDataUrl(file)));
        nextPayload = normalizeDraft({
          ...nextPayload,
          galleryImages: [...nextPayload.galleryImages, ...dataUrls]
        });
      }

      if (pendingMainImageFile && supabase && userId) {
        setUploadProgress({
          completedFiles: 0,
          totalFiles: totalUploads,
          currentFilePercent: 0,
          currentFileLabel: "메인 사진"
        });
        const uploaded = await uploadImage(pendingMainImageFile, "main", (percent) => {
          setUploadProgress((current) => ({
            completedFiles: 0,
            totalFiles: current?.totalFiles ?? totalUploads,
            currentFilePercent: percent,
            currentFileLabel: "메인 사진"
          }));
        });
        rollbackPaths.push(uploaded.path);
        nextPayload = normalizeDraft({
          ...nextPayload,
          mainImageUrl: uploaded.publicUrl,
          mainImagePath: uploaded.path
        });
      }

      if (pendingBackgroundImageFile && supabase && userId) {
        const completedFiles = pendingMainImageFile ? 1 : 0;
        setUploadProgress({
          completedFiles,
          totalFiles: totalUploads,
          currentFilePercent: 0,
          currentFileLabel: "배경 사진"
        });
        const uploaded = await uploadImage(pendingBackgroundImageFile, "background", (percent) => {
          setUploadProgress((current) => ({
            completedFiles,
            totalFiles: current?.totalFiles ?? totalUploads,
            currentFilePercent: percent,
            currentFileLabel: "배경 사진"
          }));
        });
        rollbackPaths.push(uploaded.path);
        nextPayload = normalizeDraft({
          ...nextPayload,
          backgroundImageUrl: uploaded.publicUrl,
          backgroundImagePath: uploaded.path
        });
      }

      if (pendingGalleryFiles.length && supabase && userId) {
        const completedFiles = [pendingMainImageFile, pendingBackgroundImageFile].filter(Boolean).length;
        const uploadedGallery = [];

        for (const [index, file] of pendingGalleryFiles.entries()) {
          setUploadProgress({
            completedFiles: completedFiles + index,
            totalFiles: totalUploads,
            currentFilePercent: 0,
            currentFileLabel: `갤러리 사진 ${index + 1}`
          });

          const uploaded = await uploadImage(file, "gallery", (percent) => {
            setUploadProgress((current) => ({
              completedFiles: completedFiles + index,
              totalFiles: current?.totalFiles ?? totalUploads,
              currentFilePercent: percent,
              currentFileLabel: `갤러리 사진 ${index + 1}`
            }));
          });

          uploadedGallery.push(uploaded);
        }

        rollbackPaths.push(...uploadedGallery.map((item) => item.path));
        nextPayload = normalizeDraft({
          ...nextPayload,
          galleryImages: [...nextPayload.galleryImages, ...uploadedGallery.map((item) => item.publicUrl)],
          galleryImagePaths: [...nextPayload.galleryImagePaths, ...uploadedGallery.map((item) => item.path)]
        });
      }

      if (
        !pendingMainImageFile &&
        supabase &&
        userId &&
        nextPayload.mainImageUrl.startsWith("data:") &&
        !nextPayload.mainImagePath
      ) {
        setUploadProgress({
          completedFiles: 0,
          totalFiles: totalUploads,
          currentFilePercent: 0,
          currentFileLabel: "메인 사진"
        });
        const uploaded = await uploadImage(
          await dataUrlToFile(nextPayload.mainImageUrl, "main-image.png"),
          "main",
          (percent) => {
            setUploadProgress((current) => ({
              completedFiles: 0,
              totalFiles: current?.totalFiles ?? totalUploads,
              currentFilePercent: percent,
              currentFileLabel: "메인 사진"
            }));
          }
        );
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
        const completedFiles = shouldUploadMain ? 1 : 0;
        setUploadProgress({
          completedFiles,
          totalFiles: totalUploads,
          currentFilePercent: 0,
          currentFileLabel: "배경 사진"
        });
        const uploaded = await uploadImage(
          await dataUrlToFile(nextPayload.backgroundImageUrl, "background-image.png"),
          "background",
          (percent) => {
            setUploadProgress((current) => ({
              completedFiles,
              totalFiles: current?.totalFiles ?? totalUploads,
              currentFilePercent: percent,
              currentFileLabel: "배경 사진"
            }));
          }
        );
        rollbackPaths.push(uploaded.path);
        nextPayload = normalizeDraft({
          ...nextPayload,
          backgroundImageUrl: uploaded.publicUrl,
          backgroundImagePath: uploaded.path
        });
      }

      if (!pendingGalleryFiles.length && supabase && userId && galleryDataIndexes.length) {
        const completedFiles = countUploadTargets({
          hasMain: shouldUploadMain,
          hasBackground: shouldUploadBackground,
          galleryCount: 0
        });
        const nextGalleryImages = [...nextPayload.galleryImages];
        const nextGalleryPaths = [...nextPayload.galleryImagePaths];

        for (const [offset, index] of galleryDataIndexes.entries()) {
          setUploadProgress({
            completedFiles: completedFiles + offset,
            totalFiles: totalUploads,
            currentFilePercent: 0,
            currentFileLabel: `갤러리 사진 ${index + 1}`
          });

          const uploaded = await uploadImage(
            await dataUrlToFile(nextPayload.galleryImages[index], `gallery-${index + 1}.png`),
            "gallery",
            (percent) => {
              setUploadProgress((current) => ({
                completedFiles: completedFiles + offset,
                totalFiles: current?.totalFiles ?? totalUploads,
                currentFilePercent: percent,
                currentFileLabel: `갤러리 사진 ${index + 1}`
              }));
            }
          );

          rollbackPaths.push(uploaded.path);
          nextGalleryImages[index] = uploaded.publicUrl;
          nextGalleryPaths[index] = uploaded.path;
        }

        nextPayload = normalizeDraft({
          ...nextPayload,
          galleryImages: nextGalleryImages,
          galleryImagePaths: nextGalleryPaths
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
        if (pendingGalleryFiles.length) {
          setPendingGalleryFiles([]);
          setPendingGalleryPreviewUrls([]);
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
        throw new Error("초대장을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
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
      if (pendingGalleryFiles.length) {
        setPendingGalleryFiles([]);
        setPendingGalleryPreviewUrls([]);
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

      if (supabase && userId && previousGalleryImagePaths.length) {
        const removedGalleryPaths = previousGalleryImagePaths.filter(
          (path) => !nextPayload.galleryImagePaths.includes(path)
        );

        if (removedGalleryPaths.length) {
          await Promise.allSettled(removedGalleryPaths.map((path) => deleteImage(path)));
        }
      }

      setPending(false);
      setUploadProgress(null);
      setMessage(status === "published" ? "초대장을 발행했습니다." : "초안을 저장했습니다.");
      setMessageType("success");

      return savedMeta;
    } catch (error) {
      if (rollbackPaths.length > 0) {
        await Promise.allSettled(rollbackPaths.map((path) => deleteImage(path)));
      }
      setUploadProgress(null);
      setPending(false);
      setMessage(error instanceof Error ? error.message : "초안 저장에 실패했습니다.");
      setMessageType("error");
      return null;
    }
  }

  const inputClassName = "modal-input";
  const currentStepMeta = getBuilderStep(currentStep);
  const lastStepIndex = BUILDER_STEPS.length - 1;

  function moveStep(delta: number) {
    setCurrentStep((step) => clampBuilderStep(step + delta));
  }

  return (
    <div className="builder-grid builder-grid-extended">
      <form
        className="data-form builder-form"
        onSubmit={async (event) => {
          event.preventDefault();
          await persistDraft("draft");
        }}
      >
        <div className="builder-step-header" role="group" aria-label="빌더 단계">
          <div className="builder-step-copy">
            <p className="builder-step-kicker">빌더 진행</p>
            <h3>{`STEP ${currentStepMeta.index + 1}. ${currentStepMeta.title}`}</h3>
            <p className="builder-help">모바일 앱과 같은 5단계 흐름으로 나눠서 작성할 수 있습니다.</p>
          </div>
          <div className="builder-step-progress" aria-hidden="true">
            <div className="builder-step-progress-bar">
              <span
                className="builder-step-progress-fill"
                style={{ width: `${((currentStepMeta.index + 1) / BUILDER_STEPS.length) * 100}%` }}
              />
            </div>
            <div className="builder-step-pills">
              {BUILDER_STEPS.map((step) => (
                <button
                  key={step.id}
                  className={`builder-step-pill ${step.index === currentStepMeta.index ? "is-active" : ""}`}
                  disabled={pending}
                  onClick={() => setCurrentStep(step.index)}
                  type="button"
                >
                  {step.shortLabel}
                </button>
              ))}
            </div>
          </div>
        </div>
        {uploadProgress ? (
          <div className="builder-upload-progress" role="status" aria-live="polite">
            <div className="builder-upload-progress-head">
              <strong>{getUploadProgressLabel(uploadProgress)}</strong>
              <span>{getAggregateUploadPercent(uploadProgress)}%</span>
            </div>
            <div className="builder-upload-progress-bar">
              <span
                className="builder-upload-progress-fill"
                style={{ width: `${getAggregateUploadPercent(uploadProgress)}%` }}
              />
            </div>
            <p className="builder-help">이미지를 저장하는 동안 잠시만 기다려 주세요.</p>
          </div>
        ) : null}

        <div className="builder-form-section" hidden={currentStep !== 0}>
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
                  normalizeDraft({
                    ...current,
                    templateId: template.id,
                    category: template.category
                  })
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
          <p className="builder-help">발행 후에도 템플릿, 문구, 연락처를 수정하고 무료로 다시 저장할 수 있습니다.</p>
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

        <div className="builder-form-section" hidden={currentStep !== 1}>
          <h3>2. 신랑 · 신부 / 혼주 정보</h3>
          <div className="form-two-col">
            <label>
              신랑 성함
              <input className={inputClassName} value={payload.groomName} onChange={(event) => updateField("groomName", event.target.value)} />
            </label>
            <label>
              신부 성함
              <input className={inputClassName} value={payload.brideName} onChange={(event) => updateField("brideName", event.target.value)} />
            </label>
            <label>
              신랑 연락처
              <input className={inputClassName} value={payload.groomPhone} onChange={(event) => updateField("groomPhone", event.target.value)} />
            </label>
            <label>
              신부 연락처
              <input className={inputClassName} value={payload.bridePhone} onChange={(event) => updateField("bridePhone", event.target.value)} />
            </label>
            <label>
              신랑 아버지
              <input className={inputClassName} value={payload.groomFatherName} onChange={(event) => updateField("groomFatherName", event.target.value)} />
            </label>
            <label>
              신랑 어머니
              <input className={inputClassName} value={payload.groomMotherName} onChange={(event) => updateField("groomMotherName", event.target.value)} />
            </label>
            <label>
              신부 아버지
              <input className={inputClassName} value={payload.brideFatherName} onChange={(event) => updateField("brideFatherName", event.target.value)} />
            </label>
            <label>
              신부 어머니
              <input className={inputClassName} value={payload.brideMotherName} onChange={(event) => updateField("brideMotherName", event.target.value)} />
            </label>
          </div>
        </div>

        <div className="builder-form-section" hidden={currentStep !== 2}>
          <h3>3. 사진 설정</h3>
          <p className="builder-help">메인 사진, 배경 사진, 갤러리 이미지는 무료로 업로드하고 발행 후에도 다시 교체할 수 있습니다.</p>
            <label>
              메인 사진 업로드
              <div className="builder-upload-control">
                <span className="builder-upload-filename">
                  {pendingMainImageFile?.name || (payload.mainImageUrl ? "현재 메인 사진이 연결되어 있습니다." : "선택된 파일 없음")}
                </span>
                <span className="builder-upload-button">메인 사진 선택</span>
                <input className="builder-hidden-file" accept="image/*" onChange={(event) => handleImageSelection("main", event.target.files?.[0] ?? null)} type="file" />
              </div>
            </label>
            <label>
              배경 사진 업로드
              <div className="builder-upload-control">
                <span className="builder-upload-filename">
                  {pendingBackgroundImageFile?.name || (payload.backgroundImageUrl ? "현재 배경 사진이 연결되어 있습니다." : "선택된 파일 없음")}
                </span>
                <span className="builder-upload-button">배경 사진 선택</span>
                <input className="builder-hidden-file" accept="image/*" onChange={(event) => handleImageSelection("background", event.target.files?.[0] ?? null)} type="file" />
              </div>
            </label>
            <label>
              갤러리 사진 업로드
              <div className="builder-upload-control">
                <span className="builder-upload-filename">
                  {pendingGalleryFiles.length
                    ? `${pendingGalleryFiles.length}장 선택됨`
                    : payload.galleryImages.length
                      ? `현재 ${payload.galleryImages.length}장 연결됨`
                      : "선택된 파일 없음"}
                </span>
                <span className="builder-upload-button">갤러리 사진 선택</span>
                <input
                  className="builder-hidden-file"
                  accept="image/*"
                  multiple
                  onChange={(event) => handleGallerySelection(event.target.files)}
                  type="file"
                />
              </div>
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
            <button
              className="btn-outline"
              onClick={() => {
                setPendingGalleryFiles([]);
                setPendingGalleryPreviewUrls([]);
                updateField("galleryImages", []);
                updateField("galleryImagePaths", []);
              }}
              type="button"
            >
              갤러리 비우기
            </button>
          </div>
          <p className="builder-help">
            이미지 {payload.galleryImages.length}장
            {pendingGalleryFiles.length ? ` · 저장 대기 ${pendingGalleryFiles.length}장` : ""}
          </p>
          {payload.galleryImages.length || pendingGalleryPreviewUrls.length ? (
            <div className="builder-gallery-grid">
              {[...payload.galleryImages, ...pendingGalleryPreviewUrls].map((imageUrl, index) => (
                <div className="builder-gallery-thumb" key={`${imageUrl}-${index}`}>
                  <img alt={`갤러리 미리보기 ${index + 1}`} src={imageUrl} />
                </div>
              ))}
            </div>
          ) : null}
          <p className="builder-help">이미지는 저장 시 Storage로 업로드되고, payload에는 URL만 기록됩니다.</p>
        </div>

        <div className="builder-form-section" hidden={currentStep !== 3}>
          <h3>4. 계좌 · 카카오페이</h3>
          <div className="form-two-col">
            <label>
              신랑측 은행
              <input className={inputClassName} value={payload.groomBank} onChange={(event) => updateField("groomBank", event.target.value)} />
            </label>
            <label>
              신랑측 예금주
              <input className={inputClassName} value={payload.groomBankHolder} onChange={(event) => updateField("groomBankHolder", event.target.value)} />
            </label>
            <label className="full-col">
              신랑측 계좌번호
              <input className={inputClassName} value={payload.groomBankAccount} onChange={(event) => updateField("groomBankAccount", event.target.value)} />
            </label>
            <label>
              신부측 은행
              <input className={inputClassName} value={payload.brideBank} onChange={(event) => updateField("brideBank", event.target.value)} />
            </label>
            <label>
              신부측 예금주
              <input className={inputClassName} value={payload.brideBankHolder} onChange={(event) => updateField("brideBankHolder", event.target.value)} />
            </label>
            <label className="full-col">
              신부측 계좌번호
              <input className={inputClassName} value={payload.brideBankAccount} onChange={(event) => updateField("brideBankAccount", event.target.value)} />
            </label>
          </div>
          <label>
            카카오페이 링크
            <input className={inputClassName} value={payload.kakaoPayLink} onChange={(event) => updateField("kakaoPayLink", event.target.value)} />
          </label>
        </div>

        <div className="builder-form-section" hidden={currentStep !== 4}>
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
            카카오 지도 링크
            <input className={inputClassName} value={payload.kakaoMapLink} onChange={(event) => updateField("kakaoMapLink", event.target.value)} />
          </label>
          <label>
            교통 안내 메모
            <textarea className={inputClassName} rows={3} value={payload.transportNote} onChange={(event) => updateField("transportNote", event.target.value)} />
          </label>
        </div>

        <div className="builder-step-actions">
          <button
            className="btn-outline"
            disabled={pending || currentStep === 0}
            onClick={() => moveStep(-1)}
            type="button"
          >
            이전 단계
          </button>
          <button
            className="btn-primary"
            disabled={pending || currentStep === lastStepIndex}
            onClick={() => moveStep(1)}
            type="button"
          >
            다음 단계
          </button>
        </div>

        <button className="btn-primary form-submit" disabled={pending} type="submit">
          {pending ? "저장 중..." : "초안 저장"}
        </button>
        {currentStep === lastStepIndex ? (
          <>
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
              {meta.status === "published" ? "공개 상태 다시 저장" : "무료 발행 페이지로 이동"}
            </button>
          </>
        ) : (
          <p className="builder-help">마지막 단계에서 실제 화면 보기와 무료 발행을 진행할 수 있습니다.</p>
        )}
        {meta.status && meta.status !== "draft" && meta.status !== "published" ? (
          <p className="form-message error">
            현재 처리 상태: {meta.status}. 발행이 완료되기 전까지 공개 링크는 활성화되지 않습니다.
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
            <TemplatePhotoSlotLayer
              altPrefix="미리보기"
              fallbackImageUrl={mainImagePreviewUrl}
              placements={payload.photoPlacements}
              showEmptySlots
              snapshot={builderTemplateSnapshot}
            />
            <div className="builder-preview-content">
              {!builderHasPhotoSlots ? (
                <div className="builder-preview-main-photo-wrap">
                  {mainImagePreviewUrl ? <img alt="메인 사진 미리보기" className="builder-preview-main-photo has-image" src={mainImagePreviewUrl} /> : <div className="builder-preview-main-photo" />}
                </div>
              ) : null}
              <div className="builder-preview-copy-card">
                <p className="builder-preview-label">{selectedTemplate.badge.toUpperCase()} INVITATION</p>
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
                <p className="builder-preview-message">{payload.message || "소중한 자리에 함께해 주세요"}</p>
                <p className="builder-preview-note">
                  실제 화면 보기에서 전체 초대장 레이아웃을 확인할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
