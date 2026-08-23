export const MAX_GUEST_PHOTO_BYTES = 2 * 1024 * 1024;
export const MAX_GUEST_PHOTO_DIMENSION = 4096;
export const MAX_GUEST_PHOTO_PIXELS = 12_000_000;

type GuestJpegValidation =
  | { ok: true; width: number; height: number }
  | { ok: false; message: string };

const JPEG_START_OF_FRAME_MARKERS = new Set([
  0xc0, 0xc1, 0xc2, 0xc3,
  0xc5, 0xc6, 0xc7,
  0xc9, 0xca, 0xcb,
  0xcd, 0xce, 0xcf
]);

function readJpegDimensions(bytes: Uint8Array) {
  let offset = 2;

  while (offset + 8 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = bytes[offset + 1];
    if (marker === 0xd9 || marker === 0xda) break;
    if (marker === 0x00 || marker === 0xff || (marker >= 0xd0 && marker <= 0xd7)) {
      offset += 2;
      continue;
    }

    const segmentLength = (bytes[offset + 2] << 8) | bytes[offset + 3];
    if (segmentLength < 2 || offset + 2 + segmentLength > bytes.length) {
      return null;
    }

    if (JPEG_START_OF_FRAME_MARKERS.has(marker) && segmentLength >= 7) {
      const height = (bytes[offset + 5] << 8) | bytes[offset + 6];
      const width = (bytes[offset + 7] << 8) | bytes[offset + 8];
      return { width, height };
    }

    offset += 2 + segmentLength;
  }

  return null;
}

export function validateGuestJpeg(
  bytes: Uint8Array,
  mimeType: string,
  maxBytes = MAX_GUEST_PHOTO_BYTES
): GuestJpegValidation {
  if (mimeType !== "image/jpeg") {
    return { ok: false, message: "JPEG 사진만 업로드할 수 있습니다." };
  }

  if (bytes.byteLength < 10 || bytes.byteLength > maxBytes) {
    return { ok: false, message: "사진 크기는 2MB 이하여야 합니다." };
  }

  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    return { ok: false, message: "JPEG 파일 형식이 올바르지 않습니다." };
  }

  const dimensions = readJpegDimensions(bytes);
  if (!dimensions || dimensions.width < 1 || dimensions.height < 1) {
    return { ok: false, message: "사진 크기 정보를 확인할 수 없습니다." };
  }

  if (
    dimensions.width > MAX_GUEST_PHOTO_DIMENSION ||
    dimensions.height > MAX_GUEST_PHOTO_DIMENSION ||
    dimensions.width * dimensions.height > MAX_GUEST_PHOTO_PIXELS
  ) {
    return { ok: false, message: "사진 해상도가 너무 큽니다." };
  }

  return { ok: true, ...dimensions };
}
