import * as ImageManipulator from "expo-image-manipulator";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif"
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_DIMENSION = 1600;

export type ImageValidationResult =
  | { valid: true; uri: string; mimeType: string }
  | { valid: false; error: string };

export function validateMimeType(mimeType: string | undefined): boolean {
  if (!mimeType) return false;
  return ALLOWED_MIME_TYPES.has(mimeType.toLowerCase());
}

export function validateFileSize(size: number | undefined): boolean {
  if (!size) return true;
  return size <= MAX_FILE_SIZE;
}

export async function processImage(
  uri: string,
  mimeType?: string,
  fileSize?: number
): Promise<ImageValidationResult> {
  if (mimeType && !validateMimeType(mimeType)) {
    return {
      valid: false,
      error: `허용되지 않는 이미지 형식입니다. (${mimeType})\nJPEG, PNG, WebP, HEIC 파일만 사용 가능합니다.`
    };
  }

  if (fileSize && !validateFileSize(fileSize)) {
    return {
      valid: false,
      error: `파일 크기가 10MB를 초과합니다. (${(fileSize / 1024 / 1024).toFixed(1)}MB)`
    };
  }

  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: MAX_DIMENSION } }],
      {
        compress: 0.85,
        format: ImageManipulator.SaveFormat.JPEG
      }
    );

    return {
      valid: true,
      uri: result.uri,
      mimeType: "image/jpeg"
    };
  } catch {
    return {
      valid: false,
      error: "이미지 처리 중 오류가 발생했습니다. 다른 이미지를 선택해 주세요."
    };
  }
}
