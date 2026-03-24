import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
  "image/webp"
]);

export type ProcessedImage = {
  uri: string;
  width: number;
  height: number;
  mimeType: string;
  fileSize: number;
};

const MAX_WIDTH = 1600;
const MAX_HEIGHT = 1600;
const JPEG_QUALITY = 0.8;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function pickImage(): Promise<ImagePicker.ImagePickerAsset | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error("PHOTO_PERMISSION_DENIED");
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    quality: 1,
    exif: false
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  return result.assets[0];
}

export async function takePhoto(): Promise<ImagePicker.ImagePickerAsset | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    throw new Error("CAMERA_PERMISSION_DENIED");
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    quality: 1,
    exif: false
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  return result.assets[0];
}

export async function processImage(
  asset: ImagePicker.ImagePickerAsset
): Promise<ProcessedImage> {
  const mimeType = asset.mimeType ?? "image/jpeg";
  if (!ALLOWED_MIME.has(mimeType)) {
    throw new Error("PHOTO_INVALID_TYPE");
  }

  if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
    throw new Error("PHOTO_TOO_LARGE");
  }

  const actions: ImageManipulator.Action[] = [];

  if (asset.width > MAX_WIDTH || asset.height > MAX_HEIGHT) {
    const ratio = Math.min(
      MAX_WIDTH / asset.width,
      MAX_HEIGHT / asset.height
    );

    actions.push({
      resize: {
        width: Math.round(asset.width * ratio),
        height: Math.round(asset.height * ratio)
      }
    });
  }

  const result = await ImageManipulator.manipulateAsync(
    asset.uri,
    actions,
    {
      compress: JPEG_QUALITY,
      format: ImageManipulator.SaveFormat.JPEG
    }
  );

  return {
    uri: result.uri,
    width: result.width,
    height: result.height,
    mimeType: "image/jpeg",
    fileSize: 0
  };
}

export function getImageErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    PHOTO_PERMISSION_DENIED: "사진 접근 권한이 필요합니다. 설정에서 허용해 주세요.",
    CAMERA_PERMISSION_DENIED: "카메라 접근 권한이 필요합니다. 설정에서 허용해 주세요.",
    PHOTO_INVALID_TYPE: "지원하지 않는 이미지 형식입니다. JPEG, PNG, HEIC, WebP만 가능합니다.",
    PHOTO_TOO_LARGE: "이미지가 너무 큽니다. 10MB 이하의 파일을 선택해 주세요."
  };
  return messages[code] ?? "이미지 처리 중 오류가 발생했습니다.";
}
