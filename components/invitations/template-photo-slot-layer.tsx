/* eslint-disable @next/next/no-img-element */

import { buildPublishedAssetUrl } from "@/lib/invitation-assets";
import type {
  PhotoPlacement,
  PublishedTemplateSnapshot,
  TemplatePhotoSlot
} from "@/lib/invitation-payload";

type TemplatePhotoSlotLayerProps = {
  altPrefix: string;
  fallbackImageUrl?: string;
  placements?: PhotoPlacement[];
  showEmptySlots?: boolean;
  slug?: string;
  snapshot?: PublishedTemplateSnapshot | null;
};

function isRenderableImageReference(value: string) {
  return value.startsWith("/") || value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:");
}

function resolvePlacementImageUrl(placement: PhotoPlacement | undefined, slug: string | undefined) {
  const reference = placement?.assetPath || placement?.originalAssetPath || "";
  if (!reference) {
    return "";
  }

  if (isRenderableImageReference(reference)) {
    return reference;
  }

  return slug ? buildPublishedAssetUrl(slug, reference) : "";
}

function getSlotRadius(slot: TemplatePhotoSlot) {
  if (slot.shape === "circle") {
    return "50%";
  }

  if (slot.shape === "polaroid") {
    return "4%";
  }

  return `${(slot.radius ?? 0.02) * 100}%`;
}

export function TemplatePhotoSlotLayer({
  altPrefix,
  fallbackImageUrl = "",
  placements = [],
  showEmptySlots = false,
  slug,
  snapshot
}: TemplatePhotoSlotLayerProps) {
  const slots = snapshot?.photoSlots ?? [];
  if (!slots.length) {
    return null;
  }

  const placementBySlot = new Map(placements.map((placement) => [placement.slotKey, placement]));

  return (
    <div className="template-photo-slot-layer" aria-hidden={!fallbackImageUrl && !placements.length}>
      {slots.map((slot, index) => {
        const placement = placementBySlot.get(slot.key);
        const imageUrl = resolvePlacementImageUrl(placement, slug) || (index === 0 ? fallbackImageUrl : "");
        const crop = placement?.crop;
        const focalPoint = placement?.focalPoint;
        const fit = placement?.fit ?? "cover";

        if (!imageUrl && !showEmptySlots) {
          return null;
        }

        return (
          <div
            className={`template-photo-slot template-photo-slot-${slot.shape}${imageUrl ? " has-image" : " is-empty"}`}
            key={slot.key}
            style={{
              borderRadius: getSlotRadius(slot),
              height: `${slot.h * 100}%`,
              left: `${slot.x * 100}%`,
              top: `${slot.y * 100}%`,
              transform: slot.rotation ? `rotate(${slot.rotation}deg)` : undefined,
              width: `${slot.w * 100}%`,
              zIndex: slot.zIndex
            }}
          >
            {imageUrl ? (
              <img
                alt={`${altPrefix} 사진 슬롯 ${slot.key}`}
                src={imageUrl}
                style={{
                  objectFit: fit,
                  objectPosition: `${((focalPoint?.x ?? crop?.x) ?? 0.5) * 100}% ${((focalPoint?.y ?? crop?.y) ?? 0.5) * 100}%`,
                  transform: `${crop?.scale ? `scale(${crop.scale})` : ""}${crop?.rotate ? ` rotate(${crop.rotate}deg)` : ""}`.trim() || undefined
                }}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
