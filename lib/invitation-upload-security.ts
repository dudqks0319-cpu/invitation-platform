import sharp from "sharp";
import { maxUploadBytes, storageMimeTypes } from "@/lib/supabase/public-write";

export const MAX_INVITATION_IMAGE_PIXELS = 16_000_000;
export const MAX_USER_STORAGE_OBJECTS = 100;
export const MAX_USER_STORAGE_BYTES = 50 * 1024 * 1024;

const STORAGE_LIST_PAGE_SIZE = 50;
const STORAGE_REMOVE_BATCH_SIZE = 100;
const MAX_STORAGE_LIST_REQUESTS = 200;
const MAX_ACCOUNT_CLEANUP_OBJECTS = 10_000;

type SupportedImageMime = (typeof storageMimeTypes)[number];

interface StorageObject {
  id?: string | null;
  name: string;
  metadata?: Record<string, unknown> | null;
}

interface StorageErrorResult {
  data: unknown;
  error: unknown;
}

export interface StorageBucket {
  list(
    prefix: string,
    options: { limit: number; offset: number }
  ): Promise<{ data: StorageObject[] | null; error: unknown }>;
  remove(paths: string[]): Promise<StorageErrorResult>;
}

interface ListedObject {
  path: string;
  metadata: Record<string, unknown> | null | undefined;
}

export class InvitationImageValidationError extends Error {}
export class UserStorageQuotaError extends Error {}
export class UserStorageCleanupError extends Error {}

function detectImageMime(buffer: Buffer): SupportedImageMime | null {
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return "image/jpeg";
  }

  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return "image/png";
  }

  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }

  return null;
}

function extensionForMime(contentType: SupportedImageMime) {
  if (contentType === "image/jpeg") {
    return "jpg";
  }
  if (contentType === "image/png") {
    return "png";
  }
  return "webp";
}

export async function canonicalizeInvitationImage(
  buffer: Buffer,
  declaredMime: string
): Promise<{ buffer: Buffer; contentType: SupportedImageMime; extension: string }> {
  const detectedMime = detectImageMime(buffer);
  if (!detectedMime) {
    throw new InvitationImageValidationError("지원하지 않는 이미지 형식입니다.");
  }
  if (detectedMime !== declaredMime) {
    throw new InvitationImageValidationError("선택한 파일의 확장자와 실제 파일 형식이 일치하지 않습니다.");
  }

  try {
    const metadata = await sharp(buffer, { failOn: "error", limitInputPixels: false }).metadata();
    const width = metadata.width ?? 0;
    const height = metadata.height ?? 0;
    const pages = metadata.pages ?? 1;

    if (
      width < 1 ||
      height < 1 ||
      !Number.isSafeInteger(width * height) ||
      width * height > MAX_INVITATION_IMAGE_PIXELS
    ) {
      throw new InvitationImageValidationError("이미지 해상도가 너무 큽니다.");
    }
    if (pages !== 1) {
      throw new InvitationImageValidationError("움직이는 이미지는 업로드할 수 없습니다.");
    }

    let pipeline = sharp(buffer, {
      failOn: "error",
      limitInputPixels: MAX_INVITATION_IMAGE_PIXELS
    }).rotate();

    if (detectedMime === "image/jpeg") {
      pipeline = pipeline.jpeg({ quality: 85, progressive: true });
    } else if (detectedMime === "image/png") {
      pipeline = pipeline.png({ compressionLevel: 9 });
    } else {
      pipeline = pipeline.webp({ quality: 85 });
    }

    const canonicalBuffer = await pipeline.toBuffer();
    if (canonicalBuffer.length > maxUploadBytes) {
      throw new InvitationImageValidationError("처리된 이미지 크기는 5MB 이하여야 합니다.");
    }

    return {
      buffer: canonicalBuffer,
      contentType: detectedMime,
      extension: extensionForMime(detectedMime)
    };
  } catch (error) {
    if (error instanceof InvitationImageValidationError) {
      throw error;
    }
    throw new InvitationImageValidationError("이미지를 디코딩하거나 처리할 수 없습니다.");
  }
}

function validStorageName(name: unknown): name is string {
  return (
    typeof name === "string" &&
    name.length > 0 &&
    name !== "." &&
    name !== ".." &&
    !name.includes("/")
  );
}

async function listUserStorageObjects(
  bucket: StorageBucket,
  userId: string,
  maxObjects: number
): Promise<ListedObject[]> {
  const queuedPrefixes = [userId];
  const objects: ListedObject[] = [];
  let listRequests = 0;

  while (queuedPrefixes.length > 0) {
    const prefix = queuedPrefixes.shift();
    if (!prefix) {
      throw new UserStorageCleanupError("사용자 파일 경로를 확인하지 못했습니다.");
    }

    for (let offset = 0; ; offset += STORAGE_LIST_PAGE_SIZE) {
      listRequests += 1;
      if (listRequests > MAX_STORAGE_LIST_REQUESTS) {
        throw new UserStorageCleanupError("사용자 파일 목록이 안전한 처리 한도를 초과했습니다.");
      }

      const { data, error } = await bucket.list(prefix, {
        limit: STORAGE_LIST_PAGE_SIZE,
        offset
      });
      if (error || !Array.isArray(data)) {
        throw new UserStorageCleanupError("사용자 파일 목록을 확인하지 못했습니다.");
      }

      for (const entry of data) {
        if (!validStorageName(entry?.name)) {
          throw new UserStorageCleanupError("사용자 파일 경로를 확인하지 못했습니다.");
        }

        const path = `${prefix}/${entry.name}`;
        if (entry.id == null && entry.metadata == null) {
          queuedPrefixes.push(path);
          continue;
        }

        objects.push({ path, metadata: entry.metadata });
        if (objects.length > maxObjects) {
          throw new UserStorageQuotaError("저장 가능한 이미지 개수를 초과했습니다.");
        }
      }

      if (data.length < STORAGE_LIST_PAGE_SIZE) {
        break;
      }
    }
  }

  return objects;
}

export async function enforceUserStorageQuota(
  bucket: StorageBucket,
  userId: string,
  incomingBytes: number,
  incomingPath?: string
): Promise<{ alreadyExists: boolean; objectCount: number; totalBytes: number }> {
  if (!Number.isSafeInteger(incomingBytes) || incomingBytes < 1 || incomingBytes > maxUploadBytes) {
    throw new UserStorageQuotaError("업로드 이미지 크기를 확인하지 못했습니다.");
  }

  let objects: ListedObject[];
  try {
    objects = await listUserStorageObjects(bucket, userId, MAX_USER_STORAGE_OBJECTS);
  } catch (error) {
    if (error instanceof UserStorageQuotaError) {
      throw error;
    }
    throw new UserStorageQuotaError("저장소 사용량을 확인하지 못했습니다.");
  }

  let totalBytes = 0;
  for (const object of objects) {
    const size = object.metadata?.size;
    if (!Number.isSafeInteger(size) || (size as number) < 0) {
      throw new UserStorageQuotaError("저장소 사용량을 확인하지 못했습니다.");
    }
    totalBytes += size as number;
    if (!Number.isSafeInteger(totalBytes)) {
      throw new UserStorageQuotaError("저장소 사용량을 확인하지 못했습니다.");
    }
  }

  const existingObject = incomingPath
    ? objects.find((object) => object.path === incomingPath)
    : undefined;
  if (existingObject) {
    if (existingObject.metadata?.size !== incomingBytes) {
      throw new UserStorageQuotaError("기존 이미지 크기를 확인하지 못했습니다.");
    }
    return {
      alreadyExists: true,
      objectCount: objects.length,
      totalBytes
    };
  }

  if (objects.length + 1 > MAX_USER_STORAGE_OBJECTS) {
    throw new UserStorageQuotaError("저장 가능한 이미지 개수를 초과했습니다.");
  }

  if (totalBytes + incomingBytes > MAX_USER_STORAGE_BYTES) {
    throw new UserStorageQuotaError("저장 공간 한도를 초과했습니다.");
  }

  return { alreadyExists: false, objectCount: objects.length, totalBytes };
}

export async function removeAllUserStorageObjects(
  bucket: StorageBucket,
  userId: string
): Promise<number> {
  let objects: ListedObject[];
  try {
    objects = await listUserStorageObjects(bucket, userId, MAX_ACCOUNT_CLEANUP_OBJECTS);
  } catch (error) {
    if (error instanceof UserStorageCleanupError) {
      throw error;
    }
    throw new UserStorageCleanupError("사용자 파일 목록을 확인하지 못했습니다.");
  }

  for (let index = 0; index < objects.length; index += STORAGE_REMOVE_BATCH_SIZE) {
    const paths = objects
      .slice(index, index + STORAGE_REMOVE_BATCH_SIZE)
      .map((object) => object.path);
    const { error } = await bucket.remove(paths);
    if (error) {
      throw new UserStorageCleanupError("사용자 파일을 모두 삭제하지 못했습니다.");
    }
  }

  return objects.length;
}
