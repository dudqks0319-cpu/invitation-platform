import {
  clampUploadPercent,
  countUploadTargets,
  getAggregateUploadPercent,
  getUploadProgressLabel
} from "@/components/builder/upload-progress";

describe("upload progress helpers", () => {
  it("clamps progress percentages between 0 and 100", () => {
    expect(clampUploadPercent(-10)).toBe(0);
    expect(clampUploadPercent(42.4)).toBe(42);
    expect(clampUploadPercent(140)).toBe(100);
  });

  it("converts per-file upload progress into an aggregate percentage", () => {
    expect(getAggregateUploadPercent({ completedFiles: 0, totalFiles: 2, currentFilePercent: 50 })).toBe(25);
    expect(getAggregateUploadPercent({ completedFiles: 1, totalFiles: 2, currentFilePercent: 50 })).toBe(75);
    expect(getAggregateUploadPercent({ completedFiles: 2, totalFiles: 2, currentFilePercent: 100 })).toBe(100);
  });

  it("returns user-facing labels for the upload phases", () => {
    expect(getUploadProgressLabel({ completedFiles: 0, totalFiles: 2, currentFileLabel: "메인 사진" })).toBe("메인 사진 업로드 중");
    expect(getUploadProgressLabel({ completedFiles: 2, totalFiles: 2, currentFileLabel: "배경 사진" })).toBe("이미지 업로드를 마무리하고 있습니다");
  });

  it("counts gallery uploads together with main and background uploads", () => {
    expect(countUploadTargets({ hasMain: false, hasBackground: false, galleryCount: 0 })).toBe(0);
    expect(countUploadTargets({ hasMain: true, hasBackground: false, galleryCount: 2 })).toBe(3);
    expect(countUploadTargets({ hasMain: true, hasBackground: true, galleryCount: 3 })).toBe(5);
  });
});
