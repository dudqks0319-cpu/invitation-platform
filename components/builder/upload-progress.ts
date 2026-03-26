export type UploadProgressState = {
  completedFiles: number;
  totalFiles: number;
  currentFilePercent: number;
  currentFileLabel: string;
};

export function countUploadTargets({
  hasMain,
  hasBackground,
  galleryCount
}: {
  hasMain: boolean;
  hasBackground: boolean;
  galleryCount: number;
}) {
  return (hasMain ? 1 : 0) + (hasBackground ? 1 : 0) + Math.max(galleryCount, 0);
}

export function clampUploadPercent(value: number) {
  return Math.min(Math.max(Math.round(value), 0), 100);
}

export function getAggregateUploadPercent({
  completedFiles,
  totalFiles,
  currentFilePercent
}: Pick<UploadProgressState, "completedFiles" | "totalFiles" | "currentFilePercent">) {
  if (totalFiles <= 0) {
    return 0;
  }

  const completedWeight = completedFiles / totalFiles;
  const currentWeight = (clampUploadPercent(currentFilePercent) / 100) / totalFiles;
  return clampUploadPercent((completedWeight + currentWeight) * 100);
}

export function getUploadProgressLabel({
  completedFiles,
  totalFiles,
  currentFileLabel
}: Pick<UploadProgressState, "completedFiles" | "totalFiles" | "currentFileLabel">) {
  if (completedFiles >= totalFiles) {
    return "이미지 업로드를 마무리하고 있습니다";
  }

  return `${currentFileLabel} 업로드 중`;
}
