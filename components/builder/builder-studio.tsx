"use client";

/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
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
import {
  getTemplateDefaultTextPlacement,
  templateCategories,
  templates,
  type TemplatePreset
} from "@/lib/templates";
import {
  INVITATION_TEXT_PLACEMENTS,
  getInvitationTextPlacementFrame,
  getInvitationTextPlacementTransform
} from "@/lib/invitation-text-placement";
import { TemplateMarkup } from "@/components/landing/template-markup";
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
const DAUM_POSTCODE_SCRIPT_ID = "daum-postcode-sdk";
const DAUM_POSTCODE_SCRIPT_SRC = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
const DAUM_POSTCODE_LOAD_TIMEOUT_MS = 10000;

type DaumPostcodeData = {
  address?: string;
  roadAddress?: string;
  jibunAddress?: string;
  autoRoadAddress?: string;
  autoJibunAddress?: string;
  zonecode?: string;
  userSelectedType?: "R" | "J";
};

type DaumPostcodeSdk = {
  Postcode: new (options: { oncomplete(data: DaumPostcodeData): void }) => {
    embed(element: HTMLElement, options?: { autoClose?: boolean; q?: string }): void;
    open(options?: { popupName?: string }): void;
  };
};

let daumPostcodeScriptPromise: Promise<DaumPostcodeSdk | null> | null = null;

function readDaumPostcode() {
  return (window as unknown as { daum?: DaumPostcodeSdk }).daum ?? null;
}

function loadDaumPostcode() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return Promise.resolve(null);
  }

  const existingSdk = readDaumPostcode();
  if (existingSdk?.Postcode) {
    return Promise.resolve(existingSdk);
  }

  if (!daumPostcodeScriptPromise) {
    daumPostcodeScriptPromise = new Promise((resolve, reject) => {
      const staleScript = document.getElementById(DAUM_POSTCODE_SCRIPT_ID) as HTMLScriptElement | null;
      const script = staleScript?.dataset.osamPostcodeStatus === "loading" ? staleScript : document.createElement("script");

      if (staleScript && staleScript !== script) {
        staleScript.remove();
      }

      let timeoutId: number | null = null;

      const settle = (nextSdk: DaumPostcodeSdk | null) => {
        if (timeoutId) {
          window.clearTimeout(timeoutId);
        }

        script.dataset.osamPostcodeStatus = nextSdk?.Postcode ? "loaded" : "error";

        if (nextSdk?.Postcode) {
          resolve(nextSdk);
          return;
        }

        daumPostcodeScriptPromise = null;
        reject(new Error("주소 검색 서비스를 불러오지 못했습니다."));
      };

      script.id = DAUM_POSTCODE_SCRIPT_ID;
      script.src = DAUM_POSTCODE_SCRIPT_SRC;
      script.async = true;
      script.dataset.osamPostcodeStatus = "loading";
      script.onload = () => settle(readDaumPostcode());
      script.onerror = () => settle(null);

      timeoutId = window.setTimeout(() => settle(null), DAUM_POSTCODE_LOAD_TIMEOUT_MS);

      if (!script.isConnected) {
        document.head.appendChild(script);
      }
    });
  }

  return daumPostcodeScriptPromise;
}

function buildNaverMapLink(query: string) {
  const trimmed = query.trim();
  return trimmed ? `https://map.naver.com/p/search/${encodeURIComponent(trimmed)}` : "";
}

function buildKakaoMapLink(query: string) {
  const trimmed = query.trim();
  return trimmed ? `https://map.kakao.com/link/search/${encodeURIComponent(trimmed)}` : "";
}

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

function buildInitialPayload(initialTemplateId?: string) {
  const matched = initialTemplateId
    ? templates.find((template) => template.id === initialTemplateId)
    : null;

  return matched
    ? normalizeDraft({
        ...defaultInvitationDraft,
        templateId: matched.id,
        category: matched.category,
        templateTextPlacement: getTemplateDefaultTextPlacement(matched)
      })
    : normalizeDraft(defaultInvitationDraft);
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
  const eventDateInputRef = useRef<HTMLInputElement | null>(null);
  const checkoutIntentHandledRef = useRef(false);
  const loadedInvitationIdRef = useRef<string | null>(null);
  const addressSearchOpenedAtRef = useRef(0);
  const addressSearchLayerRef = useRef<HTMLDivElement | null>(null);
  const autoPlacedTemplateRef = useRef<string | null>(null);
  const [payload, setPayload] = useState<InvitationDraftPayload>(() => buildInitialPayload(initialTemplateId));
  const [meta, setMeta] = useState<DraftMeta>({});
  const [draftReady, setDraftReady] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success" | "">("");
  const [addressSearchMessage, setAddressSearchMessage] = useState("");
  const [addressSearchPending, setAddressSearchPending] = useState(false);
  const [addressSearchVisible, setAddressSearchVisible] = useState(false);
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
  const [showTemplateGallery, setShowTemplateGallery] = useState(!initialTemplateId);
  const [eventDateConfirmed, setEventDateConfirmed] = useState(false);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === payload.templateId) ?? templates[0],
    [payload.templateId]
  );
  const isStandaloneArtworkTemplate = selectedTemplate.html.includes("tmpl-standalone-art");
  const textPlacementFrame = getInvitationTextPlacementFrame(payload.templateTextPlacement);
  const templateCopyStyle: CSSProperties = {
    left: `${textPlacementFrame.x}%`,
    textAlign: textPlacementFrame.align,
    top: `${textPlacementFrame.y}%`,
    transform: getInvitationTextPlacementTransform(textPlacementFrame.align),
    width: `${textPlacementFrame.width}%`
  };
  const [activeTemplateCategory, setActiveTemplateCategory] = useState(selectedTemplate.category);
  const categoryCounts = useMemo(
    () =>
      templateCategories.map((category) => ({
        ...category,
        count: templates.filter((template) => template.category === category.key).length
      })),
    []
  );
  const filteredTemplates = useMemo(
    () => templates.filter((template) => template.category === activeTemplateCategory),
    [activeTemplateCategory]
  );
  const visibleTemplates = showTemplateGallery ? filteredTemplates : [selectedTemplate];
  const paidSnapshotRef = useRef<InvitationDraftPayload | null>(meta.status === "published" ? payload : null);

  useEffect(() => {
    if (!isStandaloneArtworkTemplate || payload.templateTextPlacement !== "top") {
      return;
    }

    if (autoPlacedTemplateRef.current === selectedTemplate.id) {
      return;
    }

    autoPlacedTemplateRef.current = selectedTemplate.id;
    const defaultPlacement = getTemplateDefaultTextPlacement(selectedTemplate);

    setPayload((current) =>
      current.templateId === selectedTemplate.id && current.templateTextPlacement === "top"
        ? normalizeDraft({
            ...current,
            templateTextPlacement: defaultPlacement
          })
        : current
    );
  }, [isStandaloneArtworkTemplate, payload.templateTextPlacement, selectedTemplate]);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) {
        return;
      }

      if (initialInvitationId) {
        setDraftReady(true);
        return;
      }

      const stored = readStoredDraft();
      if (!stored) {
        setDraftReady(true);
        return;
      }

      const matched = initialTemplateId
        ? templates.find((template) => template.id === initialTemplateId)
        : null;
      const nextPayload = matched
        ? normalizeDraft({
            ...stored.payload,
            templateId: matched.id,
            category: matched.category,
            templateTextPlacement: getTemplateDefaultTextPlacement(matched)
          })
        : stored.payload;

      setPayload(nextPayload);
      setMeta(stored.meta);
      setMainImagePreviewUrl(nextPayload.mainImageUrl);
      setBackgroundImagePreviewUrl(nextPayload.backgroundImageUrl);
      setActiveTemplateCategory((templates.find((template) => template.id === nextPayload.templateId) ?? templates[0]).category);
      paidSnapshotRef.current = stored.meta.status === "published" ? nextPayload : null;
      setDraftReady(true);
    });

    return () => {
      cancelled = true;
    };
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
    void loadDaumPostcode().catch(() => undefined);
  }, []);

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
      setActiveTemplateCategory((templates.find((template) => template.id === nextPayload.templateId) ?? templates[0]).category);
      setPendingGalleryPreviewUrls([]);
      paidSnapshotRef.current = data.paid_payload_snapshot ? normalizeDraft(data.paid_payload_snapshot) : null;
    })();
  }, [initialInvitationId, supabase, userId]);

  useEffect(() => {
    if (!draftReady || typeof window === "undefined") {
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
  }, [payload, meta, draftReady]);

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

  function updateVenueAddress(value: string) {
    setPayload((current) =>
      normalizeDraft({
        ...current,
        venueAddress: value,
        roadAddress: value,
        jibunAddress: "",
        zonecode: "",
        mapAddress: value,
        naverMapLink: buildNaverMapLink(value),
        kakaoMapLink: buildKakaoMapLink(value)
      })
    );
  }

  const applyAddressSelection = useCallback((data: DaumPostcodeData) => {
    const roadAddress = data.roadAddress || data.autoRoadAddress || "";
    const jibunAddress = data.jibunAddress || data.autoJibunAddress || "";
    const selectedAddress =
      data.userSelectedType === "J"
        ? jibunAddress || data.address || roadAddress
        : roadAddress || data.address || jibunAddress;
    const mapAddress = roadAddress || selectedAddress || jibunAddress;

    setPayload((current) =>
      normalizeDraft({
        ...current,
        venueAddress: mapAddress,
        mapAddress,
        roadAddress,
        jibunAddress,
        zonecode: data.zonecode || "",
        naverMapLink: buildNaverMapLink(mapAddress),
        kakaoMapLink: buildKakaoMapLink(mapAddress)
      })
    );
    setAddressSearchVisible(false);
    setAddressSearchMessage("도로명주소, 지번주소, 지도 링크를 자동으로 채웠습니다.");
  }, []);

  useEffect(() => {
    if (!addressSearchVisible) {
      return;
    }

    let cancelled = false;
    const container = addressSearchLayerRef.current;

    if (!container) {
      return;
    }

    container.textContent = "주소 검색을 불러오는 중입니다.";
    setAddressSearchPending(true);

    void (async () => {
      try {
        const daum = await loadDaumPostcode();

        if (cancelled) {
          return;
        }

        if (!daum?.Postcode) {
          throw new Error("주소 검색 서비스를 불러오지 못했습니다.");
        }

        container.textContent = "";
        new daum.Postcode({
          oncomplete(data) {
            applyAddressSelection(data);
          }
        }).embed(container, { autoClose: false, q: payload.venueAddress || payload.mapAddress || "" });
        setAddressSearchPending(false);
        setAddressSearchMessage("주소를 검색한 뒤 결과를 선택하세요.");
      } catch (error) {
        if (cancelled) {
          return;
        }

        setAddressSearchPending(false);
        setAddressSearchVisible(false);
        setAddressSearchMessage(error instanceof Error ? error.message : "주소 검색을 열지 못했습니다.");
      }
    })();

    return () => {
      cancelled = true;
      container.textContent = "";
    };
  }, [addressSearchVisible, applyAddressSelection, payload.mapAddress, payload.venueAddress]);

  async function openAddressSearch() {
    if (addressSearchPending) {
      return;
    }

    setAddressSearchMessage("");
    setAddressSearchVisible(true);
  }

  function requestAddressSearch() {
    const now = Date.now();

    if (addressSearchPending || now - addressSearchOpenedAtRef.current < 800) {
      return;
    }

    addressSearchOpenedAtRef.current = now;
    void openAddressSearch();
  }

  function selectTemplate(template: TemplatePreset) {
    setActiveTemplateCategory(template.category);
    setPayload((current) =>
      normalizeDraft({
        ...current,
        templateId: template.id,
        category: template.category,
        templateTextPlacement: getTemplateDefaultTextPlacement(template)
      })
    );
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
  const builderPreviewNames = (payload.groomName || "신랑") + " ♡ " + (payload.brideName || "신부");
  const builderPreviewDate = payload.eventDateTime
    ? new Date(payload.eventDateTime).toLocaleString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
      })
    : "날짜와 시간을 선택하세요";
  const builderPreviewVenue =
    payload.venueName || payload.venueAddress
      ? [payload.venueName, payload.venueAddress].filter(Boolean).join(" · ")
      : "예식장과 주소를 입력해 주세요";
  const useSplitArtworkCopy = isStandaloneArtworkTemplate && payload.templateTextPlacement === "bottom";

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
            <p className="builder-help">모바일 앱과 같은 4단계 흐름으로 나눠서 작성할 수 있습니다.</p>
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
          <div className="builder-template-picker" aria-label="초대장 템플릿 선택">
            <div className="builder-template-picker-head">
              <div>
                <strong>{showTemplateGallery ? "다른 디자인 고르기" : "선택한 디자인"}</strong>
                <p>
                  {showTemplateGallery
                    ? "행사별 디자인을 둘러보고 바꿀 수 있습니다."
                    : `${selectedTemplate.name} 디자인으로 바로 시작합니다.`}
                </p>
              </div>
              <button
                className="builder-template-gallery-toggle"
                onClick={() => setShowTemplateGallery((current) => !current)}
                type="button"
              >
                {showTemplateGallery ? "선택한 디자인만 보기" : "다른 디자인 보기"}
              </button>
            </div>
            {showTemplateGallery ? (
              <div className="builder-template-category-row" role="tablist" aria-label="템플릿 카테고리">
                {categoryCounts.map((category) => (
                  <button
                    aria-selected={category.key === activeTemplateCategory}
                    className={`builder-template-category ${category.key === activeTemplateCategory ? "is-active" : ""}`}
                    key={category.key}
                    onClick={() => setActiveTemplateCategory(category.key)}
                    role="tab"
                    type="button"
                  >
                    <span>{category.label}</span>
                    <small>{category.count}</small>
                  </button>
                ))}
              </div>
            ) : null}
            <div className={showTemplateGallery ? "builder-template-card-grid" : "builder-template-card-grid is-collapsed"}>
              {visibleTemplates.map((template) => {
                const isSelected = template.id === payload.templateId;

                return (
                  <button
                    aria-pressed={isSelected}
                    className={`builder-template-card ${isSelected ? "is-selected" : ""}`}
                    key={template.id}
                    onClick={() => selectTemplate(template)}
                    type="button"
                  >
                    <span className="builder-template-card-thumb">
                      <TemplateMarkup template={template} variant="browser" />
                    </span>
                    <span className="builder-template-card-copy">
                      <span className="template-badge">{template.badge}</span>
                      <strong>{template.name}</strong>
                      <span>{template.desc}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          {showTemplateGallery ? (
            <>
              <label>
                디자인 빠른 선택
                <select
                  className={inputClassName}
                  value={payload.templateId}
                  onChange={(event) => {
                    const template = templates.find((item) => item.id === event.target.value);
                    if (!template) return;
                    selectTemplate(template);
                  }}
                >
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.badge} · {template.name}
                    </option>
                  ))}
                </select>
              </label>
              <p className="builder-help">카드를 누르거나 목록에서 디자인을 바꿀 수 있습니다.</p>
            </>
          ) : null}
          <div className="builder-template-placement">
            <div className="builder-template-placement-head">
              <strong>글씨 넣을 공간</strong>
              <p>선택한 템플릿 이미지의 빈 여백에 초대 문구를 얹습니다.</p>
            </div>
            <div className="builder-template-placement-grid" role="group" aria-label="템플릿 글씨 위치">
              {INVITATION_TEXT_PLACEMENTS.map((placement) => (
                <button
                  aria-pressed={payload.templateTextPlacement === placement.value}
                  className={
                    payload.templateTextPlacement === placement.value
                      ? "builder-template-placement-button is-active"
                      : "builder-template-placement-button"
                  }
                  key={placement.value}
                  onClick={() => updateField("templateTextPlacement", placement.value)}
                  type="button"
                >
                  {placement.label}
                </button>
              ))}
            </div>
          </div>
          <label>
            행사 카테고리
            <input className={inputClassName} readOnly value={payload.category} />
          </label>
          <label>
            행사 제목
            <input className={inputClassName} value={payload.title} onChange={(event) => updateField("title", event.target.value)} />
          </label>
          <div className="builder-date-field">
            <label htmlFor="builder-event-date">행사 일시</label>
            <div className="builder-date-row">
              <input
                className={inputClassName}
                id="builder-event-date"
                ref={eventDateInputRef}
                type="datetime-local"
                value={payload.eventDateTime}
                onChange={(event) => {
                  updateField("eventDateTime", event.target.value);
                  setEventDateConfirmed(false);
                }}
                onInput={(event) => {
                  updateField("eventDateTime", event.currentTarget.value);
                  setEventDateConfirmed(false);
                }}
              />
              <button
                className="builder-date-confirm"
                disabled={!payload.eventDateTime}
                onClick={() => {
                  eventDateInputRef.current?.blur();
                  setEventDateConfirmed(true);
                }}
                type="button"
              >
                확인
              </button>
            </div>
            <p aria-live="polite" className={eventDateConfirmed ? "builder-date-status is-confirmed" : "builder-date-status"}>
              {eventDateConfirmed ? "선택한 일정을 확인했습니다." : "날짜와 시간을 고른 뒤 확인을 눌러주세요."}
            </p>
          </div>
          <label>
            행사장 이름
            <input className={inputClassName} value={payload.venueName} onChange={(event) => updateField("venueName", event.target.value)} />
          </label>
          <div className="builder-address-field">
            <label className="builder-address-label" htmlFor="builder-venue-address">
              행사장 주소 / 지도 주소
            </label>
            <div className="inline-input-row builder-address-search-row">
              <input
                id="builder-venue-address"
                className={inputClassName}
                placeholder={addressSearchPending ? "주소 검색을 불러오는 중입니다" : "주소를 직접 입력하거나 주소 검색을 누르세요"}
                value={payload.venueAddress}
                onChange={(event) => updateVenueAddress(event.target.value)}
              />
              <button className="inline-input-btn builder-address-search-button" disabled={addressSearchPending} type="button" onClick={requestAddressSearch}>
                {addressSearchPending ? "불러오는 중" : "주소 검색"}
              </button>
            </div>
          </div>
          <p className="builder-help">주소 검색 버튼을 누르면 Daum 우편번호 서비스가 열리고, 직접 입력해도 지도 검색 링크가 함께 채워집니다.</p>
          {addressSearchMessage ? <p className="builder-help">{addressSearchMessage}</p> : null}
          {addressSearchVisible ? (
            <div className="builder-address-search-panel">
              <div className="builder-address-search-panel-header">
                <strong>도로명주소 검색</strong>
                <button type="button" onClick={() => setAddressSearchVisible(false)}>
                  닫기
                </button>
              </div>
              <div ref={addressSearchLayerRef} className="builder-address-search-layer" />
            </div>
          ) : null}
          <div className="form-two-col">
            <label>
              지번주소
              <input className={inputClassName} value={payload.jibunAddress} onChange={(event) => updateField("jibunAddress", event.target.value)} />
            </label>
            <label>
              우편번호
              <input className={inputClassName} value={payload.zonecode} onChange={(event) => updateField("zonecode", event.target.value)} />
            </label>
          </div>
          <details className="builder-map-fields">
            <summary>지도 링크와 교통 안내 직접 수정</summary>
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
          </details>
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
          <p className="builder-help">메인 사진과 배경 이미지는 공개 화면의 첫인상을 결정합니다. 발행 전 최종 이미지를 먼저 골라 두세요.</p>
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
              {meta.status === "published" ? "공개 상태 다시 저장" : !supabase || !userId ? "로그인 후 무료 공개 링크 만들기" : "무료 공개 링크 만들기"}
            </button>
          </>
        ) : (
          <p className="builder-help">마지막 단계에서 실제 화면을 확인한 뒤 무료 공개 링크를 만들 수 있습니다.</p>
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
          <div className={isStandaloneArtworkTemplate ? "phone-screen builder-screen is-standalone-artwork" : "phone-screen builder-screen"}>
            <div className="builder-template-preview">
              <TemplateMarkup template={selectedTemplate} />
            </div>
            {backgroundImagePreviewUrl ? (
              <div className="builder-background-layer has-image" style={{ backgroundImage: `url(${backgroundImagePreviewUrl})` }} />
            ) : (
              <div className="builder-background-layer" />
            )}
            <div
              className={
                isStandaloneArtworkTemplate
                  ? "builder-preview-content builder-preview-content-template-copy"
                  : "builder-preview-content"
              }
            >
              {useSplitArtworkCopy ? (
                <div className="builder-template-split-copy" data-placement={payload.templateTextPlacement}>
                  <div className="builder-template-split-top">
                    <p className="builder-preview-label">{selectedTemplate.badge.toUpperCase()} INVITATION</p>
                    <h2 className="builder-preview-names">{builderPreviewNames}</h2>
                  </div>
                  <div className="builder-template-split-bottom">
                    <p className="builder-preview-date">{builderPreviewDate}</p>
                    <p className="builder-preview-venue">{builderPreviewVenue}</p>
                  </div>
                </div>
              ) : isStandaloneArtworkTemplate ? (
                <div
                  className="builder-template-text-overlay"
                  data-placement={payload.templateTextPlacement}
                  style={templateCopyStyle}
                >
                  <p className="builder-preview-label">{selectedTemplate.badge.toUpperCase()} INVITATION</p>
                  <h2 className="builder-preview-names">{builderPreviewNames}</h2>
                  <p className="builder-preview-date">{builderPreviewDate}</p>
                  <p className="builder-preview-venue">{builderPreviewVenue}</p>
                </div>
              ) : (
                <>
                  <div className="builder-preview-main-photo-wrap">
                    {mainImagePreviewUrl ? <img alt="메인 사진 미리보기" className="builder-preview-main-photo has-image" src={mainImagePreviewUrl} /> : <div className="builder-preview-main-photo" />}
                  </div>
                  <div className="builder-preview-copy-card">
                    <p className="builder-preview-label">{selectedTemplate.badge.toUpperCase()} INVITATION</p>
                    <h2 className="builder-preview-names">{builderPreviewNames}</h2>
                    <p className="builder-preview-date">{builderPreviewDate}</p>
                    <p className="builder-preview-venue">{builderPreviewVenue}</p>
                    <p className="builder-preview-message">{payload.message || "소중한 자리에 함께해 주세요"}</p>
                    <p className="builder-preview-note">
                      실제 화면 보기에서 전체 초대장 레이아웃을 확인할 수 있습니다.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
