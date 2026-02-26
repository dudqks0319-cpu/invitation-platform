const BUILDER_DRAFT_KEY = 'invitehub_builder_draft';
const MAX_PERSISTABLE_IMAGE_BYTES = 900 * 1024;

const BUILDER_FIELD_IDS = [
  'builderEventTitle',
  'builderEventDateTime',
  'builderVenueName',
  'builderVenueAddress',
  'builderMessageInput',
  'builderGroomName',
  'builderBrideName',
  'builderGroomPhone',
  'builderBridePhone',
  'builderGroomFatherName',
  'builderGroomMotherName',
  'builderBrideFatherName',
  'builderBrideMotherName',
  'builderGroomFatherPhone',
  'builderGroomMotherPhone',
  'builderBrideFatherPhone',
  'builderBrideMotherPhone',
  'builderGroomBank',
  'builderGroomBankHolder',
  'builderGroomBankAccount',
  'builderBrideBank',
  'builderBrideBankHolder',
  'builderBrideBankAccount',
  'builderKakaoPayLink',
  'builderShareUrl',
  'builderKakaoJsKey',
  'builderMapAddress',
  'builderNaverMapLink',
  'builderTransportNote',
];

const builderState = {
  templateId: 'wedding-classic',
  mainImageData: '',
  backgroundImageData: '',
  mainImageObjectUrl: '',
  backgroundImageObjectUrl: '',
};

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('builderPage')) return;
  initializeBuilderPage();
});

function initializeBuilderPage() {
  populateTemplateSelect();
  bindBuilderEvents();

  const draft = readBuilderDraft();
  const requestedTemplateId = new URLSearchParams(window.location.search).get('template') || '';

  if (draft) {
    hydrateBuilderDraft(draft);
  }

  const nextTemplateId = requestedTemplateId || builderState.templateId || 'wedding-classic';
  applyTemplate(nextTemplateId, !draft);

  if (!draft) {
    applyDefaultValuesIfEmpty();
  }

  updatePreview();
}

function bindBuilderEvents() {
  const mobileMenuBtn = document.getElementById('builderHamburgerBtn');
  mobileMenuBtn?.addEventListener('click', () => {
    document.getElementById('builderMobileMenu')?.classList.toggle('open');
  });

  document.querySelectorAll('#builderMobileMenu a').forEach((anchor) => {
    anchor.addEventListener('click', () => {
      document.getElementById('builderMobileMenu')?.classList.remove('open');
    });
  });

  document.getElementById('builderTemplateSelect')?.addEventListener('change', (event) => {
    const nextId = event.target.value;
    applyTemplate(nextId, false);
    applyDefaultValuesIfEmpty();
    updatePreview();
  });

  BUILDER_FIELD_IDS.forEach((id) => {
    document.getElementById(id)?.addEventListener('input', () => {
      updatePreview();
    });
  });

  document.getElementById('openDateTimePickerBtn')?.addEventListener('click', () => {
    const input = document.getElementById('builderEventDateTime');
    if (!input) return;
    if (typeof input.showPicker === 'function') {
      input.showPicker();
      return;
    }
    input.focus();
  });

  document.getElementById('builderMainPhotoFile')?.addEventListener('change', async (event) => {
    await handlePhotoUpload('main', event.target.files?.[0] || null);
  });

  document.getElementById('builderBackgroundPhotoFile')?.addEventListener('change', async (event) => {
    await handlePhotoUpload('background', event.target.files?.[0] || null);
  });

  document.getElementById('clearMainPhotoBtn')?.addEventListener('click', () => {
    clearPhoto('main');
  });

  document.getElementById('clearBackgroundPhotoBtn')?.addEventListener('click', () => {
    clearPhoto('background');
  });

  document.getElementById('builderForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    saveBuilderDraft();
  });

  document.getElementById('saveBuilderDraftTopBtn')?.addEventListener('click', () => {
    saveBuilderDraft();
  });

  document.getElementById('openInvitationPreviewBtn')?.addEventListener('click', () => {
    saveBuilderDraft(true);
    window.location.href = 'invitation.html?mode=preview';
  });

  document.getElementById('builderResetBtn')?.addEventListener('click', () => {
    const confirmed = window.confirm('저장된 초안을 초기화하고 기본값으로 되돌릴까요?');
    if (!confirmed) return;
    localStorage.removeItem(BUILDER_DRAFT_KEY);
    document.getElementById('builderForm')?.reset();
    clearPhoto('main', true);
    clearPhoto('background', true);
    applyDefaultValuesIfEmpty(true);
    updatePreview();
    setBuilderMessage('초안을 초기화했습니다.', 'success');
  });
}

function populateTemplateSelect() {
  const select = document.getElementById('builderTemplateSelect');
  if (!select) return;
  select.innerHTML = '';

  TEMPLATES.forEach((template) => {
    const option = document.createElement('option');
    option.value = template.id;
    option.textContent = `${template.badge} · ${template.name}`;
    select.appendChild(option);
  });
}

function applyTemplate(templateId, forceSelect = false) {
  const template = TEMPLATES.find((item) => item.id === templateId) || TEMPLATES[0];
  if (!template) return;

  builderState.templateId = template.id;

  const select = document.getElementById('builderTemplateSelect');
  if (select && (forceSelect || select.value !== template.id)) {
    select.value = template.id;
  }

  const categoryInput = document.getElementById('builderCategory');
  if (categoryInput) {
    categoryInput.value = template.badge;
  }

  const templateTarget = document.getElementById('builderTemplatePreview');
  if (templateTarget) {
    templateTarget.innerHTML = template.html;
  }

  const previewLabel = document.querySelector('.builder-preview-label');
  if (previewLabel) {
    previewLabel.textContent = `${template.badge.toUpperCase()} INVITATION`;
  }
}

function applyDefaultValuesIfEmpty(force = false) {
  const defaults = {
    builderEventTitle: '결혼식 초대장',
    builderEventDateTime: '2026-04-12T14:00',
    builderVenueName: '서울 더파인 웨딩홀',
    builderVenueAddress: '서울 강남구 테헤란로 123',
    builderMessageInput: '저희 두 사람이 하나가 되는 자리에 함께해 주세요.',
    builderGroomName: '홍길동',
    builderBrideName: '김부인',
    builderGroomFatherName: '홍아버지',
    builderGroomMotherName: '이어머니',
    builderBrideFatherName: '김아버지',
    builderBrideMotherName: '박어머니',
    builderMapAddress: '서울 강남구 테헤란로 123',
  };

  Object.entries(defaults).forEach(([id, value]) => {
    const input = document.getElementById(id);
    if (!input) return;
    if (force || !String(input.value || '').trim()) {
      input.value = value;
    }
  });
}

async function handlePhotoUpload(kind, file) {
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    setBuilderMessage('이미지 파일만 업로드할 수 있습니다.', 'error');
    return;
  }

  if (kind === 'main') {
    releaseObjectUrl('main');
  } else {
    releaseObjectUrl('background');
  }

  if (file.size <= MAX_PERSISTABLE_IMAGE_BYTES) {
    const dataUrl = await readFileAsDataUrl(file);
    if (kind === 'main') {
      builderState.mainImageData = dataUrl;
      builderState.mainImageObjectUrl = '';
    } else {
      builderState.backgroundImageData = dataUrl;
      builderState.backgroundImageObjectUrl = '';
    }
    setBuilderMessage('이미지를 적용했습니다. 초안 저장 시 함께 보관됩니다.', 'success');
  } else {
    const objectUrl = URL.createObjectURL(file);
    if (kind === 'main') {
      builderState.mainImageData = '';
      builderState.mainImageObjectUrl = objectUrl;
    } else {
      builderState.backgroundImageData = '';
      builderState.backgroundImageObjectUrl = objectUrl;
    }
    setBuilderMessage('이미지 용량이 커서 미리보기에만 적용됩니다. 900KB 이하 이미지는 초안에도 저장됩니다.', 'error');
  }

  updatePreview();
}

function clearPhoto(kind, silent = false) {
  if (kind === 'main') {
    releaseObjectUrl('main');
    builderState.mainImageData = '';
    const input = document.getElementById('builderMainPhotoFile');
    if (input) input.value = '';
  } else {
    releaseObjectUrl('background');
    builderState.backgroundImageData = '';
    const input = document.getElementById('builderBackgroundPhotoFile');
    if (input) input.value = '';
  }

  updatePreview();
  if (!silent) {
    setBuilderMessage(kind === 'main' ? '메인 사진을 초기화했습니다.' : '배경 사진을 초기화했습니다.', 'success');
  }
}

function releaseObjectUrl(kind) {
  if (kind === 'main' && builderState.mainImageObjectUrl) {
    URL.revokeObjectURL(builderState.mainImageObjectUrl);
    builderState.mainImageObjectUrl = '';
  }
  if (kind === 'background' && builderState.backgroundImageObjectUrl) {
    URL.revokeObjectURL(builderState.backgroundImageObjectUrl);
    builderState.backgroundImageObjectUrl = '';
  }
}

function updatePreview() {
  const groomName = getInputValue('builderGroomName') || '신랑';
  const brideName = getInputValue('builderBrideName') || '신부';

  setText('builderPreviewNames', `${groomName} ♡ ${brideName}`);
  setText('builderPreviewDate', formatEventDateTime(getInputValue('builderEventDateTime')));
  setText('builderPreviewVenue', formatVenueText());
  setText('builderPreviewMessage', getInputValue('builderMessageInput') || '소중한 자리에 함께해 주세요');

  applyMainImagePreview();
  applyBackgroundPreview();
}

function formatEventDateTime(value) {
  if (!value) return '날짜와 시간을 선택하세요';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '날짜와 시간을 다시 선택해 주세요';
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatVenueText() {
  const venue = getInputValue('builderVenueName');
  const address = getInputValue('builderVenueAddress');
  if (venue && address) return `${venue} · ${address}`;
  if (venue) return venue;
  if (address) return address;
  return '예식장과 주소를 입력해 주세요';
}

function formatParentsText() {
  const lines = [];

  const groomFather = withPhone(getInputValue('builderGroomFatherName'), getInputValue('builderGroomFatherPhone'));
  const groomMother = withPhone(getInputValue('builderGroomMotherName'), getInputValue('builderGroomMotherPhone'));
  const brideFather = withPhone(getInputValue('builderBrideFatherName'), getInputValue('builderBrideFatherPhone'));
  const brideMother = withPhone(getInputValue('builderBrideMotherName'), getInputValue('builderBrideMotherPhone'));

  if (groomFather || groomMother) {
    lines.push(`신랑측 · 부 ${groomFather || '-'} / 모 ${groomMother || '-'}`);
  }
  if (brideFather || brideMother) {
    lines.push(`신부측 · 부 ${brideFather || '-'} / 모 ${brideMother || '-'}`);
  }

  return lines.length ? lines.join('\n') : '양가 부모님 성함과 연락처를 입력해 주세요.';
}

function formatContactsText() {
  const lines = [];
  const groomPhone = getInputValue('builderGroomPhone');
  const bridePhone = getInputValue('builderBridePhone');

  if (groomPhone) lines.push(`신랑 ${groomPhone}`);
  if (bridePhone) lines.push(`신부 ${bridePhone}`);

  return lines.length ? lines.join(' · ') : '신랑/신부 연락처를 입력해 주세요.';
}

function formatAccountsText() {
  const lines = [];

  const groom = formatAccountLine('신랑측', 'builderGroomBank', 'builderGroomBankHolder', 'builderGroomBankAccount');
  const bride = formatAccountLine('신부측', 'builderBrideBank', 'builderBrideBankHolder', 'builderBrideBankAccount');

  if (groom) lines.push(groom);
  if (bride) lines.push(bride);

  return lines.length ? lines.join('\n') : '계좌 정보를 입력해 주세요.';
}

function formatAccountLine(label, bankId, holderId, accountId) {
  const bank = getInputValue(bankId);
  const holder = getInputValue(holderId);
  const account = getInputValue(accountId);
  if (!bank && !holder && !account) return '';

  const fragments = [label];
  if (bank) fragments.push(bank);
  if (holder) fragments.push(holder);
  if (account) fragments.push(account);
  return fragments.join(' · ');
}

function withPhone(name, phone) {
  if (!name && !phone) return '';
  if (!phone) return name;
  if (!name) return phone;
  return `${name} (${phone})`;
}

function applyMainImagePreview() {
  const image = document.getElementById('builderMainImagePreview');
  if (!image) return;

  const src = builderState.mainImageData || builderState.mainImageObjectUrl;
  if (!src) {
    image.removeAttribute('src');
    image.classList.remove('has-image');
    return;
  }

  image.src = src;
  image.classList.add('has-image');
}

function applyBackgroundPreview() {
  const layer = document.getElementById('builderBackgroundLayer');
  if (!layer) return;

  const src = builderState.backgroundImageData || builderState.backgroundImageObjectUrl;
  if (!src) {
    layer.style.backgroundImage = '';
    layer.classList.remove('has-image');
    return;
  }

  layer.style.backgroundImage = `url(${src})`;
  layer.classList.add('has-image');
}

function saveBuilderDraft(silent = false) {
  const payload = {
    version: 2,
    templateId: builderState.templateId,
    fields: gatherBuilderFields(),
    images: {
      main: builderState.mainImageData,
      background: builderState.backgroundImageData,
    },
    savedAt: new Date().toISOString(),
  };

  localStorage.setItem(BUILDER_DRAFT_KEY, JSON.stringify(payload));
  if (!silent) {
    setBuilderMessage('초안을 저장했습니다. 같은 브라우저에서 이어서 편집할 수 있습니다.', 'success');
  }
}

function gatherBuilderFields() {
  return BUILDER_FIELD_IDS.reduce((acc, id) => {
    const input = document.getElementById(id);
    acc[id] = input ? input.value : '';
    return acc;
  }, {});
}

function readBuilderDraft() {
  try {
    const raw = localStorage.getItem(BUILDER_DRAFT_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch (_error) {
    return null;
  }
}

function hydrateBuilderDraft(draft) {
  if (draft.templateId) {
    builderState.templateId = draft.templateId;
  }

  if (draft.fields && typeof draft.fields === 'object') {
    Object.entries(draft.fields).forEach(([id, value]) => {
      const input = document.getElementById(id);
      if (input && typeof value === 'string') {
        input.value = value;
      }
    });
  } else {
    hydrateLegacyDraft(draft);
  }

  if (draft.images?.main) {
    builderState.mainImageData = String(draft.images.main);
  }
  if (draft.images?.background) {
    builderState.backgroundImageData = String(draft.images.background);
  }
}

function hydrateLegacyDraft(draft) {
  const legacyMap = {
    builderEventTitle: draft.eventTitle || '',
    builderVenueName: draft.venue || '',
    builderMessageInput: draft.message || '',
  };

  Object.entries(legacyMap).forEach(([id, value]) => {
    const input = document.getElementById(id);
    if (input && value) {
      input.value = value;
    }
  });

  if (draft.eventDate && typeof draft.eventDate === 'string' && draft.eventDate.includes('T')) {
    const input = document.getElementById('builderEventDateTime');
    if (input) input.value = draft.eventDate;
  }

  if (draft.hostName && typeof draft.hostName === 'string') {
    const [first, second] = draft.hostName.split('&').map((item) => item.trim()).filter(Boolean);
    const groomInput = document.getElementById('builderGroomName');
    const brideInput = document.getElementById('builderBrideName');
    if (groomInput && first) groomInput.value = first;
    if (brideInput && second) brideInput.value = second;
  }
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다.'));
    reader.readAsDataURL(file);
  });
}

function setBuilderMessage(text, type = '') {
  const node = document.getElementById('builderMessage');
  if (!node) return;

  node.textContent = text;
  node.classList.remove('error', 'success');
  if (type) {
    node.classList.add(type);
  }
}

function setText(id, value) {
  const node = document.getElementById(id);
  if (!node) return;
  node.textContent = value;
}

function getInputValue(id) {
  const node = document.getElementById(id);
  return (node?.value || '').trim();
}
