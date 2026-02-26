const BUILDER_DRAFT_KEY = 'invitehub_builder_draft';
const INVITATION_GUESTBOOK_KEY = 'invitehub_invitation_guestbook';

const invitationState = {
  draft: null,
  fields: {},
  template: null,
  shareUrl: '',
};

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('invitationPage')) return;
  initializeInvitationPage();
});

function initializeInvitationPage() {
  const draft = readBuilderDraft();
  if (!draft) {
    alert('저장된 초안이 없습니다. 먼저 초대장 만들기에서 내용을 입력해 주세요.');
    window.location.href = 'builder.html';
    return;
  }

  invitationState.draft = draft;
  invitationState.fields = draft.fields || {};
  invitationState.template = TEMPLATES.find((item) => item.id === draft.templateId) || TEMPLATES[0] || null;
  invitationState.shareUrl = resolveShareUrl();

  renderInvitation();
  bindInvitationEvents();
  renderGuestbook();
}

function bindInvitationEvents() {
  document.getElementById('copyGroomAccountBtn')?.addEventListener('click', async () => {
    const value = buildAccountCopyText('groom');
    if (!value) {
      setFormMessage('invitationGuestbookMessage', '신랑측 계좌 정보가 비어 있습니다.', 'error');
      return;
    }
    await copyToClipboard(value);
    setFormMessage('invitationGuestbookMessage', '신랑측 계좌를 복사했습니다.', 'success');
  });

  document.getElementById('copyBrideAccountBtn')?.addEventListener('click', async () => {
    const value = buildAccountCopyText('bride');
    if (!value) {
      setFormMessage('invitationGuestbookMessage', '신부측 계좌 정보가 비어 있습니다.', 'error');
      return;
    }
    await copyToClipboard(value);
    setFormMessage('invitationGuestbookMessage', '신부측 계좌를 복사했습니다.', 'success');
  });

  document.getElementById('kakaoShareHeaderBtn')?.addEventListener('click', async () => {
    await shareViaKakao();
  });

  document.getElementById('kakaoShareContentBtn')?.addEventListener('click', async () => {
    await shareViaKakao();
  });

  document.getElementById('copyInviteLinkBtn')?.addEventListener('click', async () => {
    await copyToClipboard(invitationState.shareUrl);
    setFormMessage('invitationGuestbookMessage', '초대장 링크를 복사했습니다.', 'success');
  });

  document.getElementById('invitationGuestbookForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    addGuestbookEntry();
  });
}

function renderInvitation() {
  const f = invitationState.fields;
  const templateBadge = invitationState.template?.badge || '초대장';
  const groomName = getField('builderGroomName') || '신랑';
  const brideName = getField('builderBrideName') || '신부';

  setText('invitationCategory', `${templateBadge} INVITATION`);
  setText('invitationNames', `${groomName} ♡ ${brideName}`);
  setText('invitationDate', formatEventDateTime(getField('builderEventDateTime')));
  setText('invitationVenue', formatVenue());
  setText('invitationMessage', getField('builderMessageInput') || '소중한 자리에 함께해 주세요.');

  setText('invitationParents', formatParentsText());
  setText('invitationContacts', formatContactsText());
  setText('invitationAccounts', formatAccountsText());

  const mapAddress = getField('builderMapAddress') || getField('builderVenueAddress') || getField('builderVenueName');
  setText('invitationMapAddress', mapAddress || '위치 정보를 입력해 주세요.');
  setText('invitationTransport', getField('builderTransportNote'));

  const mapLink = resolveMapLink();
  setActionLink('invitationMapLink', mapLink, '지도 링크가 없습니다.');

  const kakaoPayLink = normalizeUrl(getField('builderKakaoPayLink'));
  setActionLink('invitationKakaoPayLink', kakaoPayLink, '카카오페이 송금 링크가 없습니다.');

  applyHeroImages(f);
}

function applyHeroImages(fields) {
  const hero = document.getElementById('invitationHero');
  const mainImage = document.getElementById('invitationMainImage');

  const background = (invitationState.draft?.images?.background || '').trim();
  if (hero && background) {
    hero.style.backgroundImage = `url(${background})`;
  }

  const mainPhoto = (invitationState.draft?.images?.main || '').trim();
  if (mainImage && mainPhoto) {
    mainImage.src = mainPhoto;
    mainImage.style.display = 'block';
  } else if (mainImage) {
    mainImage.style.display = 'none';
  }
}

function setActionLink(id, href, fallbackText) {
  const node = document.getElementById(id);
  if (!node) return;

  if (!href) {
    node.href = '#';
    node.classList.add('is-disabled');
    node.setAttribute('aria-disabled', 'true');
    node.textContent = fallbackText;
    return;
  }

  node.href = href;
  node.classList.remove('is-disabled');
  node.setAttribute('aria-disabled', 'false');
}

async function shareViaKakao() {
  const title = `${getField('builderEventTitle') || '모바일 초대장'} - ${getField('builderGroomName') || '신랑'} ♡ ${getField('builderBrideName') || '신부'}`;
  const description = getField('builderMessageInput') || '소중한 자리에 함께해 주세요.';
  const jsKey = getField('builderKakaoJsKey');
  const shareUrl = invitationState.shareUrl;

  if (window.Kakao && jsKey) {
    try {
      if (!window.Kakao.isInitialized()) {
        window.Kakao.init(jsKey);
      }

      window.Kakao.Share.sendDefault({
        objectType: 'text',
        text: `${title}\n${description}`,
        link: {
          mobileWebUrl: shareUrl,
          webUrl: shareUrl,
        },
        buttonTitle: '초대장 보기',
      });
      return;
    } catch (_error) {
      // fallback below
    }
  }

  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text: description,
        url: shareUrl,
      });
      return;
    } catch (_error) {
      // canceled by user
    }
  }

  await copyToClipboard(shareUrl);
  alert('카카오톡 공유 SDK 설정이 없어 링크를 복사했습니다. 카카오톡 대화창에 붙여넣어 공유해 주세요.');
}

function resolveShareUrl() {
  const custom = normalizeUrl(getField('builderShareUrl'));
  if (custom) return custom;

  const current = new URL(window.location.href);
  current.search = '';
  return current.toString();
}

function resolveMapLink() {
  const direct = normalizeUrl(getField('builderNaverMapLink'));
  if (direct) return direct;

  const address = getField('builderMapAddress') || getField('builderVenueAddress') || getField('builderVenueName');
  if (!address) return '';
  return `https://map.naver.com/p/search/${encodeURIComponent(address)}`;
}

function addGuestbookEntry() {
  const name = (document.getElementById('invitationGuestName')?.value || '').trim();
  const message = (document.getElementById('invitationGuestMessage')?.value || '').trim();

  if (!name || !message) {
    setFormMessage('invitationGuestbookMessage', '이름과 메시지를 입력해 주세요.', 'error');
    return;
  }

  const entries = readGuestbook();
  entries.unshift({
    name,
    message,
    createdAt: new Date().toISOString(),
  });
  localStorage.setItem(INVITATION_GUESTBOOK_KEY, JSON.stringify(entries.slice(0, 100)));

  document.getElementById('invitationGuestbookForm')?.reset();
  setFormMessage('invitationGuestbookMessage', '방명록을 남겼습니다.', 'success');
  renderGuestbook();
}

function renderGuestbook() {
  const list = document.getElementById('invitationGuestbookList');
  if (!list) return;

  const entries = readGuestbook();
  list.innerHTML = '';

  if (!entries.length) {
    const item = document.createElement('li');
    item.className = 'meta';
    item.textContent = '첫 번째 축하 메시지를 남겨 주세요.';
    list.appendChild(item);
    return;
  }

  entries.forEach((entry) => {
    const li = document.createElement('li');
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = `${formatDateTime(entry.createdAt)} · ${entry.name}`;

    const value = document.createElement('div');
    value.className = 'value';
    value.textContent = entry.message;

    li.appendChild(meta);
    li.appendChild(value);
    list.appendChild(li);
  });
}

function readGuestbook() {
  try {
    const raw = localStorage.getItem(INVITATION_GUESTBOOK_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

function buildAccountCopyText(side) {
  if (side === 'groom') {
    const bank = getField('builderGroomBank');
    const holder = getField('builderGroomBankHolder');
    const account = getField('builderGroomBankAccount');
    if (!bank && !holder && !account) return '';
    return ['신랑측', bank, holder, account].filter(Boolean).join(' / ');
  }

  const bank = getField('builderBrideBank');
  const holder = getField('builderBrideBankHolder');
  const account = getField('builderBrideBankAccount');
  if (!bank && !holder && !account) return '';
  return ['신부측', bank, holder, account].filter(Boolean).join(' / ');
}

function formatParentsText() {
  const groomFather = withPhone(getField('builderGroomFatherName'), getField('builderGroomFatherPhone'));
  const groomMother = withPhone(getField('builderGroomMotherName'), getField('builderGroomMotherPhone'));
  const brideFather = withPhone(getField('builderBrideFatherName'), getField('builderBrideFatherPhone'));
  const brideMother = withPhone(getField('builderBrideMotherName'), getField('builderBrideMotherPhone'));

  const lines = [];
  if (groomFather || groomMother) lines.push(`신랑측 · 부 ${groomFather || '-'} / 모 ${groomMother || '-'}`);
  if (brideFather || brideMother) lines.push(`신부측 · 부 ${brideFather || '-'} / 모 ${brideMother || '-'}`);

  return lines.length ? lines.join('\n') : '양가 부모님 정보를 입력해 주세요.';
}

function formatContactsText() {
  const groom = getField('builderGroomPhone');
  const bride = getField('builderBridePhone');

  const lines = [];
  if (groom) lines.push(`신랑 ${groom}`);
  if (bride) lines.push(`신부 ${bride}`);

  return lines.length ? lines.join(' · ') : '신랑/신부 연락처를 입력해 주세요.';
}

function formatAccountsText() {
  const lines = [];

  const groom = buildAccountCopyText('groom');
  const bride = buildAccountCopyText('bride');

  if (groom) lines.push(groom);
  if (bride) lines.push(bride);

  return lines.length ? lines.join('\n') : '계좌 정보를 입력해 주세요.';
}

function formatVenue() {
  const venue = getField('builderVenueName');
  const address = getField('builderVenueAddress');
  if (venue && address) return `${venue} · ${address}`;
  if (venue) return venue;
  if (address) return address;
  return '예식장 및 주소를 입력해 주세요.';
}

function formatEventDateTime(value) {
  if (!value) return '날짜와 시간을 입력해 주세요.';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '날짜 형식을 확인해 주세요.';

  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function withPhone(name, phone) {
  if (!name && !phone) return '';
  if (!phone) return name;
  if (!name) return phone;
  return `${name} (${phone})`;
}

function setText(id, text) {
  const node = document.getElementById(id);
  if (!node) return;
  node.textContent = text;
}

function setFormMessage(id, text, type = '') {
  const node = document.getElementById(id);
  if (!node) return;
  node.textContent = text;
  node.classList.remove('error', 'success');
  if (type) node.classList.add(type);
}

function getField(id) {
  return String(invitationState.fields?.[id] || '').trim();
}

function normalizeUrl(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';
  if (!/^https?:\/\//i.test(trimmed)) return '';
  return trimmed;
}

function readBuilderDraft() {
  try {
    const raw = localStorage.getItem(BUILDER_DRAFT_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (_error) {
    return null;
  }
}

async function copyToClipboard(text) {
  if (!text) return;

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch (_error) {
      // fallback below
    }
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.top = '-1000px';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  textarea.remove();
}
