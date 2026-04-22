/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import styles from "./page.module.css";

const gallery = [
  "/images/generated/wedding/wedding-peony-arch.png",
  "/images/generated/wedding/wedding-white-botanical.png",
  "/images/generated/wedding/wedding-green-wreath.png",
  "/images/generated/wedding/wedding-gold-formal.png",
  "/images/generated/wedding/wedding-premium-romantic-arch.png",
  "/images/generated/wedding/wedding-chapel-sketch.png"
];

function SectionTitle({ en, ko }: { en: string; ko: string }) {
  return (
    <div className={styles.sectionTitle}>
      <span>{en}</span>
      <h2>{ko}</h2>
      <i />
    </div>
  );
}

function Calendar() {
  const days = Array.from({ length: 31 }, (_, index) => index + 1);
  return (
    <div className={styles.calendarGrid}>
      {["일", "월", "화", "수", "목", "금", "토"].map((day, index) => (
        <b className={index === 0 ? styles.sunday : ""} key={day}>
          {day}
        </b>
      ))}
      {Array.from({ length: 4 }).map((_, index) => (
        <span aria-hidden="true" key={`empty-${index}`} />
      ))}
      {days.map((day) => (
        <span className={day === 24 ? styles.eventDay : ""} key={day}>
          {day}
        </span>
      ))}
    </div>
  );
}

export default function GeminiReferencePage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/design-gallery">디자인 갤러리</Link>
        <Link href="/builder">초대장 만들기</Link>
      </header>

      <section className={styles.phone}>
        <section className={styles.cover}>
          <img alt="웨딩 플라워 커버" src="/images/generated/wedding/wedding-white-botanical.png" />
          <div className={styles.coverCopy}>
            <p>WEDDING INVITATION</p>
            <h1>
              김철수 <span>&amp;</span> 이영희
            </h1>
            <small>
              2026. 10. 24 SAT
              <br />
              오후 1시 00분
              <br />
              더 그레이스 웨딩홀 2층 그랜드볼룸
            </small>
          </div>
        </section>

        <section className={styles.inviteText}>
          <SectionTitle en="INVITATION" ko="모시는 글" />
          <p>
            서로가 마주보며 다져온 사랑을
            <br />
            이제 함께 한 곳을 바라보며 걸어갈 수 있는
            <br />
            큰 사랑으로 키우고자 합니다.
            <br />
            <br />
            저희 두 사람이 사랑의 이름으로
            <br />
            지켜나갈 수 있게 앞날을
            <br />
            축복해 주시면 감사하겠습니다.
          </p>
          <div className={styles.parents}>
            <p><b>김아버지 · 이은희</b><span>의 아들</span><strong>김철수</strong></p>
            <p><b>이아빠 · 최엄마</b><span>의 딸</span><strong>이영희</strong></p>
          </div>
          <div className={styles.contactRow}>
            <button>신랑측 전화</button>
            <button>신부측 문자</button>
          </div>
        </section>

        <section className={styles.gallery}>
          <SectionTitle en="GALLERY" ko="우리의 순간" />
          <div>
            {gallery.map((image, index) => (
              <img alt={`갤러리 이미지 ${index + 1}`} key={image} src={image} />
            ))}
          </div>
        </section>

        <section className={styles.calendar}>
          <SectionTitle en="CALENDAR" ko="예식일" />
          <h3>2026. 10</h3>
          <Calendar />
          <p>
            김철수, 이영희의 결혼식이
            <br />
            <strong>184일</strong> 남았습니다.
          </p>
        </section>

        <section className={styles.location}>
          <SectionTitle en="LOCATION" ko="오시는 길" />
          <h3>더 그레이스 웨딩홀 2층 그랜드볼룸</h3>
          <p>서울시 강남구 테헤란로 123</p>
          <div className={styles.map}>
            <span>네이버/카카오 지도 연동</span>
          </div>
          <div className={styles.actionRow}>
            <button>주소 복사</button>
            <button>카카오맵</button>
          </div>
          <dl>
            <dt>지하철</dt>
            <dd>2호선 강남역 12번 출구 도보 5분</dd>
            <dt>버스</dt>
            <dd>간선버스 145, 146, 341</dd>
            <dt>자가용 / 주차</dt>
            <dd>웨딩홀 전용 주차장, 하객 2시간 무료</dd>
          </dl>
        </section>

        <section className={styles.gift}>
          <SectionTitle en="GIFT" ko="마음 전하실 곳" />
          <p>
            참석이 어려우신 분들을 위해
            <br />
            계좌번호를 기재하였습니다.
          </p>
          <details>
            <summary>신랑측 계좌번호</summary>
            <div><span>국민은행 123-456-789012</span><button>복사</button></div>
          </details>
          <details>
            <summary>신부측 계좌번호</summary>
            <div><span>신한은행 110-123-456789</span><button>복사</button></div>
          </details>
        </section>

        <footer className={styles.footer}>
          <p>김철수 ♥ 이영희</p>
          <button>카카오톡으로 공유하기</button>
          <small>공유 링크 · invitehub.kr/i/chulsu-younghee</small>
        </footer>
      </section>
    </main>
  );
}
