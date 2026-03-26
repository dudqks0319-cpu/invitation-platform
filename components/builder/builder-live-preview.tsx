/* eslint-disable @next/next/no-img-element */

type BuilderLivePreviewProps = {
  backgroundImagePreviewUrl: string;
  mainImagePreviewUrl: string;
  badgeText: string;
  templateLabel: string;
  title: string;
  subtitle?: string;
  dateText: string;
  venueText: string;
  message: string;
};

export function BuilderLivePreview({
  backgroundImagePreviewUrl,
  mainImagePreviewUrl,
  badgeText,
  templateLabel,
  title,
  subtitle,
  dateText,
  venueText,
  message
}: BuilderLivePreviewProps) {
  return (
    <>
      {backgroundImagePreviewUrl ? (
        <div className="builder-background-layer has-image" style={{ backgroundImage: `url(${backgroundImagePreviewUrl})` }} />
      ) : (
        <div className="builder-background-layer" />
      )}
      <div className="builder-preview-content">
        <div className="builder-preview-main-photo-wrap">
          {mainImagePreviewUrl ? <img alt="메인 사진 미리보기" className="builder-preview-main-photo has-image" src={mainImagePreviewUrl} /> : <div className="builder-preview-main-photo" />}
        </div>
        <p className="builder-preview-template-name">{templateLabel}</p>
        <p className="builder-preview-label">{badgeText}</p>
        <h2 className="builder-preview-names">{title}</h2>
        {subtitle ? <p className="builder-preview-venue">{subtitle}</p> : null}
        <p className="builder-preview-date">{dateText}</p>
        <p className="builder-preview-venue">{venueText}</p>
        <p className="builder-preview-message" style={{ whiteSpace: "pre-line" }}>
          {message}
        </p>
        <p className="builder-preview-note">하단 정보와 상세 구성은 실제 화면 보기에서 확인하실 수 있습니다.</p>
      </div>
    </>
  );
}
