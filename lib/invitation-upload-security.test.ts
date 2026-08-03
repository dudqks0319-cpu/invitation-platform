import sharp from "sharp";
import { describe, expect, it, vi } from "vitest";
import {
  MAX_USER_STORAGE_BYTES,
  MAX_USER_STORAGE_OBJECTS,
  canonicalizeInvitationImage,
  enforceUserStorageQuota,
  removeAllUserStorageObjects
} from "@/lib/invitation-upload-security";

describe("canonicalizeInvitationImage", () => {
  it("decodes and re-encodes a real image without preserving metadata", async () => {
    const input = await sharp({
      create: {
        width: 4,
        height: 3,
        channels: 3,
        background: "#ff3366"
      }
    })
      .jpeg()
      .withExif({ IFD0: { ImageDescription: "must-not-survive" } })
      .toBuffer();

    const result = await canonicalizeInvitationImage(input, "image/jpeg");
    const metadata = await sharp(result.buffer).metadata();

    expect(result.contentType).toBe("image/jpeg");
    expect(result.extension).toBe("jpg");
    expect(metadata.width).toBe(4);
    expect(metadata.height).toBe(3);
    expect(metadata.exif).toBeUndefined();
    expect(metadata.icc).toBeUndefined();
  });

  it("rejects content whose magic bytes do not match the declared MIME type", async () => {
    await expect(
      canonicalizeInvitationImage(Buffer.from("not an image"), "image/png")
    ).rejects.toThrow("지원하지 않는 이미지 형식");
  });

  it("rejects a valid image when the declared MIME type is spoofed", async () => {
    const jpeg = await sharp({
      create: {
        width: 2,
        height: 2,
        channels: 3,
        background: "#ffffff"
      }
    })
      .jpeg()
      .toBuffer();

    await expect(canonicalizeInvitationImage(jpeg, "image/png")).rejects.toThrow(
      "파일 형식이 일치하지 않습니다"
    );
  });

  it("rejects images above the decoded pixel cap", async () => {
    const oversized = await sharp({
      create: {
        width: 5000,
        height: 4000,
        channels: 3,
        background: "#ffffff"
      }
    })
      .jpeg()
      .toBuffer();

    await expect(canonicalizeInvitationImage(oversized, "image/jpeg")).rejects.toThrow(
      "해상도가 너무 큽니다"
    );
  });
});

describe("user storage lifecycle", () => {
  it("aggregates bounded paginated object sizes and allows a request within quota", async () => {
    const list = vi
      .fn()
      .mockResolvedValueOnce({
        data: Array.from({ length: 50 }, (_, index) => ({
          id: `id-${index}`,
          name: `file-${index}.jpg`,
          metadata: { size: 10 }
        })),
        error: null
      })
      .mockResolvedValueOnce({
        data: Array.from({ length: 49 }, (_, index) => ({
          id: `id-${index + 50}`,
          name: `file-${index + 50}.jpg`,
          metadata: { size: 10 }
        })),
        error: null
      });
    const bucket = { list, remove: vi.fn() };

    await expect(enforceUserStorageQuota(bucket, "user-1", 20)).resolves.toEqual({
      alreadyExists: false,
      objectCount: 99,
      totalBytes: 990
    });
    expect(list).toHaveBeenNthCalledWith(1, "user-1", { limit: 50, offset: 0 });
    expect(list).toHaveBeenNthCalledWith(2, "user-1", { limit: 50, offset: 50 });
  });

  it("allows an exact deterministic retry at the object cap without reserving more space", async () => {
    const incomingPath = "user-1/existing.jpg";
    const objects = Array.from({ length: MAX_USER_STORAGE_OBJECTS }, (_, index) => ({
      id: `id-${index}`,
      name: index === 0 ? "existing.jpg" : `file-${index}.jpg`,
      metadata: { size: index === 0 ? 20 : 1 }
    }));
    const bucket = {
      list: vi
        .fn()
        .mockResolvedValueOnce({ data: objects.slice(0, 50), error: null })
        .mockResolvedValueOnce({ data: objects.slice(50), error: null })
        .mockResolvedValueOnce({ data: [], error: null }),
      remove: vi.fn()
    };

    await expect(
      enforceUserStorageQuota(bucket, "user-1", 20, incomingPath)
    ).resolves.toEqual({
      alreadyExists: true,
      objectCount: MAX_USER_STORAGE_OBJECTS,
      totalBytes: MAX_USER_STORAGE_OBJECTS + 19
    });
  });

  it("fails closed when object metadata cannot prove the byte total", async () => {
    const bucket = {
      list: vi.fn().mockResolvedValue({
        data: [{ id: "id-1", name: "file.jpg", metadata: null }],
        error: null
      }),
      remove: vi.fn()
    };

    await expect(enforceUserStorageQuota(bucket, "user-1", 20)).rejects.toThrow(
      "저장소 사용량을 확인하지 못했습니다"
    );
  });

  it("rejects aggregate object and byte quota overflow", async () => {
    const objectBucket = {
      list: vi.fn().mockResolvedValue({
        data: Array.from({ length: MAX_USER_STORAGE_OBJECTS }, (_, index) => ({
          id: `id-${index}`,
          name: `file-${index}.jpg`,
          metadata: { size: 1 }
        })),
        error: null
      }),
      remove: vi.fn()
    };
    await expect(enforceUserStorageQuota(objectBucket, "user-1", 1)).rejects.toThrow(
      "저장 가능한 이미지 개수를 초과했습니다"
    );

    const byteBucket = {
      list: vi.fn().mockResolvedValue({
        data: [{ id: "id-1", name: "file.jpg", metadata: { size: MAX_USER_STORAGE_BYTES } }],
        error: null
      }),
      remove: vi.fn()
    };
    await expect(enforceUserStorageQuota(byteBucket, "user-1", 1)).rejects.toThrow(
      "저장 공간 한도를 초과했습니다"
    );
  });

  it("lists nested prefixes completely before removing objects in bounded batches", async () => {
    const list = vi.fn(async (prefix: string) => {
      if (prefix === "user-1") {
        return {
          data: [
            { id: "id-1", name: "root.jpg", metadata: { size: 10 } },
            { id: null, name: "nested", metadata: null }
          ],
          error: null
        };
      }
      if (prefix === "user-1/nested") {
        return {
          data: [{ id: "id-2", name: "child.png", metadata: { size: 20 } }],
          error: null
        };
      }
      return { data: [], error: null };
    });
    const remove = vi.fn().mockResolvedValue({ data: [], error: null });

    await expect(removeAllUserStorageObjects({ list, remove }, "user-1")).resolves.toBe(2);
    expect(remove).toHaveBeenCalledWith(["user-1/root.jpg", "user-1/nested/child.png"]);
  });

  it("does not remove anything when bounded listing fails", async () => {
    const remove = vi.fn();
    const bucket = {
      list: vi.fn().mockResolvedValue({ data: null, error: new Error("list failed") }),
      remove
    };

    await expect(removeAllUserStorageObjects(bucket, "user-1")).rejects.toThrow(
      "사용자 파일 목록을 확인하지 못했습니다"
    );
    expect(remove).not.toHaveBeenCalled();
  });

  it("does not retry a partially failed storage batch", async () => {
    const objects = Array.from({ length: 101 }, (_, index) => ({
      id: `id-${index}`,
      name: `file-${index}.jpg`,
      metadata: { size: 1 }
    }));
    const list = vi.fn(async (_prefix: string, options: { offset: number }) => ({
      data: objects.slice(options.offset, options.offset + 50),
      error: null
    }));
    const remove = vi
      .fn()
      .mockResolvedValueOnce({ data: [], error: null })
      .mockResolvedValueOnce({ data: null, error: new Error("partial failure") });

    await expect(removeAllUserStorageObjects({ list, remove }, "user-1")).rejects.toThrow(
      "사용자 파일을 모두 삭제하지 못했습니다"
    );
    expect(remove).toHaveBeenCalledTimes(2);
    expect(remove.mock.calls[0][0]).toHaveLength(100);
    expect(remove.mock.calls[1][0]).toHaveLength(1);
  });
});
