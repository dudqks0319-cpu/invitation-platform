import { validateGuestJpeg } from "@/lib/guest-image-validation";

function makeJpeg(width: number, height: number, paddingBytes = 0) {
  const bytes = new Uint8Array(23 + paddingBytes);
  bytes.set([
    0xff, 0xd8,
    0xff, 0xe0, 0x00, 0x04, 0x00, 0x00,
    0xff, 0xc0, 0x00, 0x0b, 0x08,
    (height >> 8) & 0xff, height & 0xff,
    (width >> 8) & 0xff, width & 0xff,
    0x01, 0x01, 0x11, 0x00,
    0xff, 0xd9
  ]);
  return bytes;
}

describe("guest JPEG validation", () => {
  it("accepts a bounded JPEG and returns its dimensions", () => {
    expect(validateGuestJpeg(makeJpeg(1600, 1067), "image/jpeg")).toEqual({
      ok: true,
      width: 1600,
      height: 1067
    });
  });

  it("rejects MIME spoofing, oversized files, and decompression-bomb dimensions", () => {
    expect(validateGuestJpeg(makeJpeg(1600, 1067), "image/png")).toMatchObject({ ok: false });
    expect(validateGuestJpeg(makeJpeg(1600, 1067, 2 * 1024 * 1024), "image/jpeg")).toMatchObject({ ok: false });
    expect(validateGuestJpeg(makeJpeg(5000, 5000), "image/jpeg")).toMatchObject({ ok: false });
  });

  it("rejects malformed bytes that are not a parseable JPEG", () => {
    expect(validateGuestJpeg(new Uint8Array([0xff, 0xd8, 0xff, 0xd9]), "image/jpeg")).toMatchObject({ ok: false });
  });
});
