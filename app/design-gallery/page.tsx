import Link from "next/link";
import styles from "./page.module.css";

const references = [
  {
    id: "korean-mobile",
    title: "한국형 모바일 청첩장",
    source: "heejin-hwang / juhonamnam",
    href: "https://github.com/heejin-hwang/mobile-wedding-invitation",
    mood: "플로럴, 카카오 공유, 네이버 지도, 방명록",
    cta: "한국형 상세 화면",
    type: "wedding",
    notes: ["카카오톡 공유", "네이버 지도", "방명록", "계좌 복사"]
  },
  {
    id: "weddingly",
    title: "초대장 제작 스튜디오",
    source: "dannycahyo/weddingly-builder",
    href: "https://github.com/dannycahyo/weddingly-builder",
    mood: "제작 흐름, 사진/음악 업로드, 하객 응답 관리",
    cta: "스튜디오형 빌더",
    type: "studio",
    notes: ["단계별 제작", "라이브 미리보기", "사진 업로드", "공개 링크"]
  },
  {
    id: "rsvp-manager",
    title: "하객 응답 운영",
    source: "alistairjoelquinn/wedding-invites",
    href: "https://github.com/alistairjoelquinn/wedding-invites",
    mood: "응답 집계, 관리자 필터, 메시지 확인",
    cta: "운영 대시보드",
    type: "dashboard",
    notes: ["참석 확인", "동행 인원", "식사 여부", "메시지 검토"]
  },
  {
    id: "undangan",
    title: "감성 오프닝 초대장",
    source: "dewanakl/undangan",
    href: "https://github.com/dewanakl/undangan",
    mood: "봉투 오프닝, 음악, 축하 댓글, 애니메이션",
    cta: "오프닝형 상세",
    type: "opening",
    notes: ["봉투 열기", "배경음악", "댓글", "축하 효과"]
  },
  {
    id: "classic-pages",
    title: "클래식 무료 템플릿",
    source: "rampatra/wedding-website",
    href: "https://github.com/rampatra/wedding-website",
    mood: "GitHub Pages, 지도, 일정, 가벼운 참석 확인",
    cta: "가벼운 웹 초대장",
    type: "classic",
    notes: ["무료 배포", "일정 안내", "지도", "간단한 응답"]
  }
];

function PhoneMock({ type }: { type: string }) {
  if (type === "studio") {
    return (
      <div className={styles.phoneScreen}>
        <div className={styles.phoneTop}>
          <span>9:41</span>
          <b>invite</b>
          <span>●●●</span>
        </div>
        <div className={styles.studioHero}>
          <p>초대장 만들기</p>
          <strong>사진과 초대문을 차근차근</strong>
        </div>
        <div className={styles.stepTabs}>
          <span>일정</span>
          <span>초대</span>
          <span>사진</span>
          <span>공유</span>
        </div>
        <div className={styles.editorBlock}>
          <i />
          <i />
          <i />
        </div>
        <div className={styles.livePreview}>
          <em>LIVE</em>
          <strong>이준서 & 김은재</strong>
          <span>2026. 06. 21</span>
        </div>
      </div>
    );
  }

  if (type === "dashboard") {
    return (
      <div className={styles.phoneScreen}>
        <div className={styles.phoneTop}>
          <span>9:41</span>
          <b>내 초대장</b>
          <span>⋯</span>
        </div>
        <div className={styles.metricGrid}>
          <div><b>48</b><span>참석</span></div>
          <div><b>12</b><span>방명록</span></div>
          <div><b>308</b><span>조회</span></div>
        </div>
        <div className={styles.guestList}>
          {["민지 · 참석 2명", "정우 · 식사 예정", "수빈 · 축하 메시지"].map((item) => (
            <p key={item}>{item}<span>확인</span></p>
          ))}
        </div>
        <button className={styles.darkButton}>공유 링크 복사</button>
      </div>
    );
  }

  if (type === "opening") {
    return (
      <div className={`${styles.phoneScreen} ${styles.openingScreen}`}>
        <div className={styles.envelope}>
          <span>OPEN</span>
          <strong>초대합니다</strong>
        </div>
        <p className={styles.script}>We are getting married</p>
        <h3>이준서<br />&<br />김은재</h3>
        <button className={styles.darkButton}>초대장 열기</button>
      </div>
    );
  }

  if (type === "classic") {
    return (
      <div className={styles.phoneScreen}>
        <div className={styles.heroImage} />
        <div className={styles.classicCopy}>
          <span>SAVE THE DATE</span>
          <h3>우리 결혼합니다</h3>
          <p>2026.06.21 토요일 오후 2시</p>
        </div>
        <div className={styles.infoRows}>
          <p>예식장 안내</p>
          <p>오시는 길</p>
          <p>참석 확인</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.phoneScreen}>
      <div className={styles.phoneTop}>
        <span>9:41</span>
        <b>invite</b>
        <span>♡</span>
      </div>
      <div className={styles.floralCard}>
        <p>We are getting married</p>
        <h3>이준서<br />&<br />김은재</h3>
      </div>
      <div className={styles.actionRow}>
        <span>전화</span>
        <span>길찾기</span>
        <span>달력</span>
      </div>
      <button className={styles.darkButton}>마음 전하기</button>
      <div className={styles.shareLine}>공유 링크 · invitehub.kr/i/junseo</div>
    </div>
  );
}

export default function DesignGalleryPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>InviteHub</Link>
        <Link href="/builder" className={styles.headerAction}>초대장 만들기</Link>
      </header>

      <section className={styles.hero}>
        <p>GitHub 디자인 레퍼런스</p>
        <h1>다른 초대장들은 이렇게 구성되어 있습니다</h1>
        <span>
          오픈소스 저장소의 장점은 기능 구조로 참고하고, 화면은 한국형 모바일 초대장 플랫폼에 맞게 다시 해석했습니다.
        </span>
      </section>

      <section className={styles.grid} aria-label="GitHub 초대장 디자인 레퍼런스">
        {references.map((reference) => (
          <article className={styles.card} id={reference.id} key={reference.id}>
            <div className={styles.visual}>
              <PhoneMock type={reference.type} />
            </div>
            <div className={styles.copy}>
              <span>{reference.source}</span>
              <h2>{reference.title}</h2>
              <p>{reference.mood}</p>
              <ul>
                {reference.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
              <div className={styles.actions}>
                <Link href={`/builder?template=wedding-classic`}>{reference.cta}</Link>
                <a href={reference.href} rel="noreferrer noopener" target="_blank">GitHub 보기</a>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
