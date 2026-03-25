/* eslint-disable */
const LOCAL_STORE_KEYS = {
  rsvps: 'invitehub_local_rsvps',
  guestbook: 'invitehub_local_guestbook',
  visits: 'invitehub_local_visits',
};

const appState = {
  supabaseReady: false,
  client: null,
  currentUser: null,
  authSubscription: null,
  latestRsvps: [],
  currentPreviewTemplateId: '',
};

const submitGuards = {
  rsvp: 0,
  guestbook: 0,
};

document.addEventListener('DOMContentLoaded', async () => {
  if (document.getElementById('templatesGrid')) {
    renderTemplates(TEMPLATES);
  }
  bindBaseEvents();
  hydrateConfigModalInputs();
  await refreshSupabaseConnection();
  await refreshAllPanels();
});

function bindBaseEvents() {
  document.querySelectorAll('.mobile-menu a').forEach((a) => {
    a.addEventListener('click', () => {
      document.getElementById('mobileMenu').classList.remove('open');
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach((m) => m.classList.remove('open'));
      document.body.style.overflow = '';
    }
  });

  window.addEventListener('scroll', () => {
    const header = document.querySelector('.site-header');
    if (!header) return;
    header.style.boxShadow = window.scrollY > 60 ? '0 4px 24px rgba(0,0,0,0.12)' : '0 2px 12px rgba(0,0,0,0.06)';
  });

  document.getElementById('authActionBtn')?.addEventListener('click', async (event) => {
    event.preventDefault();
    if (appState.currentUser && appState.supabaseReady) {
      await signOut();
      return;
    }
    showModal('loginModal');
  });

  document.getElementById('authSignInBtn')?.addEventListener('click', async (event) => {
    event.preventDefault();
    await handleEmailAuth('signin');
  });

  document.getElementById('authSignUpBtn')?.addEventListener('click', async (event) => {
    event.preventDefault();
    await handleEmailAuth('signup');
  });

  document.getElementById('saveSupabaseConfigBtn')?.addEventListener('click', async (event) => {
    event.preventDefault();
    await saveSupabaseConfig();
  });

  document.getElementById('clearSupabaseConfigBtn')?.addEventListener('click', async (event) => {
    event.preventDefault();
    clearSupabaseConfig();
    await refreshSupabaseConnection();
    await refreshAllPanels();
    setMessage('supabaseConfigMessage', 'Supabase 설정을 초기화했습니다.', 'success');
  });

  document.getElementById('rsvpForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    await submitRsvp();
  });

  document.getElementById('downloadRsvpCsvBtn')?.addEventListener('click', () => {
    downloadRsvpCsv();
  });

  document.getElementById('guestbookForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    await submitGuestbookEntry();
  });
}

function startInvitationBuilder(templateId) {
  const selectedId = templateId || 'wedding-classic';
  const params = new URLSearchParams({ template: selectedId });
  window.location.href = `builder.html?${params.toString()}`;
}

function usePreviewTemplate() {
  closeModal('previewModal');
  const templateId = appState.currentPreviewTemplateId || 'wedding-classic';
  startInvitationBuilder(templateId);
}

function hydrateConfigModalInputs() {
  const config = window.InviteHubSupabase?.getConfig?.();
  if (!config) return;
  const urlInput = document.getElementById('supabaseUrlInput');
  const anonInput = document.getElementById('supabaseAnonKeyInput');
  if (urlInput) urlInput.value = config.url || '';
  if (anonInput) anonInput.value = config.anonKey || '';
}

async function refreshSupabaseConnection() {
  resetAuthSubscription();
  const result = window.InviteHubSupabase?.initClient?.() || { ok: false, reason: 'missing-sdk' };
  appState.client = window.InviteHubSupabase?.getClient?.() || null;
  appState.supabaseReady = Boolean(appState.client);

  if (appState.supabaseReady) {
    const session = await window.InviteHubSupabase.getSession();
    appState.currentUser = session?.user || null;
    bindAuthSubscription();
    await trackVisit();
  } else {
    appState.currentUser = null;
    trackLocalVisit();
  }

  updateConnectionUI(result);
  updateAuthUI();
}

function bindAuthSubscription() {
  if (!appState.client?.auth) return;
  const { data } = appState.client.auth.onAuthStateChange(async (_event, session) => {
    appState.currentUser = session?.user || null;
    updateAuthUI();
    await refreshRsvpPanel();
  });
  appState.authSubscription = data?.subscription || null;
}

function resetAuthSubscription() {
  if (appState.authSubscription?.unsubscribe) appState.authSubscription.unsubscribe();
  appState.authSubscription = null;
}

function updateConnectionUI(result) {
  const connectionText = document.getElementById('backendConnectionText');
  const note = document.getElementById('visitStatsNote');

  if (!connectionText || !note) return;

  if (result.ok) {
    const config = window.InviteHubSupabase.getConfig();
    connectionText.textContent = `연결됨 (${config.anonMasked})`;
    note.textContent = '서버 저장 모드입니다. 방명록/RSVP/방문 통계가 Supabase DB에 저장됩니다.';
  } else {
    connectionText.textContent = '미연결 (로컬 테스트 모드)';
    note.textContent = '현재 브라우저 임시 저장 모드입니다. Supabase 설정을 입력하면 서버 저장으로 전환됩니다.';
  }
}

function updateAuthUI() {
  const authStatusText = document.getElementById('authStatusText');
  const authActionBtn = document.getElementById('authActionBtn');
  if (!authStatusText || !authActionBtn) return;

  if (appState.currentUser) {
    authStatusText.textContent = `로그인: ${appState.currentUser.email || '사용자'}`;
    authActionBtn.textContent = '로그아웃';
    authActionBtn.classList.remove('btn-outline');
    authActionBtn.classList.add('btn-primary');
    return;
  }

  authStatusText.textContent = appState.supabaseReady ? '게스트 모드 (연결됨)' : '게스트 모드';
  authActionBtn.textContent = '로그인';
  authActionBtn.classList.add('btn-outline');
  authActionBtn.classList.remove('btn-primary');
}

async function saveSupabaseConfig() {
  const urlInput = document.getElementById('supabaseUrlInput');
  const anonInput = document.getElementById('supabaseAnonKeyInput');
  if (!urlInput || !anonInput) return;

  const url = urlInput.value.trim();
  const anonKey = anonInput.value.trim();

  if (!url.startsWith('https://')) {
    setMessage('supabaseConfigMessage', 'Supabase URL은 https://로 시작해야 합니다.', 'error');
    return;
  }
  if (anonKey.length < 20) {
    setMessage('supabaseConfigMessage', 'Anon Key가 너무 짧습니다. 키를 다시 확인하세요.', 'error');
    return;
  }

  window.InviteHubSupabase.setConfig(url, anonKey);
  await refreshSupabaseConnection();
  await refreshAllPanels();
  setMessage('supabaseConfigMessage', '설정 저장 완료. Supabase 연결을 재초기화했습니다.', 'success');
}

function clearSupabaseConfig() {
  window.InviteHubSupabase.clearConfig();
  const urlInput = document.getElementById('supabaseUrlInput');
  const anonInput = document.getElementById('supabaseAnonKeyInput');
  if (urlInput) urlInput.value = '';
  if (anonInput) anonInput.value = '';
}

async function handleEmailAuth(mode) {
  if (!appState.supabaseReady || !appState.client) {
    setMessage('authMessage', '먼저 Supabase URL / Anon Key를 설정해 주세요.', 'error');
    return;
  }

  const email = document.getElementById('authEmailInput')?.value.trim() || '';
  const password = document.getElementById('authPasswordInput')?.value || '';

  if (!email || !password) {
    setMessage('authMessage', '이메일과 비밀번호를 모두 입력하세요.', 'error');
    return;
  }

  if (password.length < 6) {
    setMessage('authMessage', '비밀번호는 최소 6자 이상이어야 합니다.', 'error');
    return;
  }

  if (mode === 'signup') {
    const { error } = await appState.client.auth.signUp({ email, password });
    if (error) {
      setMessage('authMessage', error.message, 'error');
      return;
    }
    setMessage('authMessage', '회원가입 요청 완료. 이메일 인증이 설정된 경우 메일을 확인하세요.', 'success');
    return;
  }

  const { error } = await appState.client.auth.signInWithPassword({ email, password });
  if (error) {
    setMessage('authMessage', error.message, 'error');
    return;
  }
  setMessage('authMessage', '로그인 성공.', 'success');
  closeModal('loginModal');
}

async function signOut() {
  if (!appState.client) return;
  const { error } = await appState.client.auth.signOut();
  if (error) {
    setMessage('authMessage', error.message, 'error');
    return;
  }
  appState.currentUser = null;
  updateAuthUI();
  await refreshRsvpPanel();
}

async function refreshAllPanels() {
  await refreshVisitStats();
  await refreshRsvpPanel();
  await refreshGuestbook();
}

async function submitRsvp() {
  if (isSubmitCoolingDown('rsvp')) {
    setMessage('rsvpMessage', '너무 빠르게 제출 중입니다. 잠시 후 다시 시도해 주세요.', 'error');
    return;
  }

  const name = document.getElementById('rsvpName')?.value.trim() || '';
  const phone = document.getElementById('rsvpPhone')?.value.trim() || '';
  const attending = (document.getElementById('rsvpAttending')?.value || 'yes') === 'yes';
  const guests = Number(document.getElementById('rsvpGuests')?.value || '1');
  const memo = document.getElementById('rsvpMemo')?.value.trim() || '';

  if (!name) {
    setMessage('rsvpMessage', '이름은 필수입니다.', 'error');
    return;
  }
  if (!Number.isFinite(guests) || guests < 0 || guests > 20) {
    setMessage('rsvpMessage', '동행 인원은 0~20 범위로 입력하세요.', 'error');
    return;
  }

  const row = {
    name,
    phone,
    attending,
    guests,
    memo,
    created_at: new Date().toISOString(),
  };

  if (appState.supabaseReady && appState.client) {
    const payload = { ...row, user_id: appState.currentUser?.id || null };
    const { error } = await appState.client.from('rsvps').insert(payload);
    if (error) {
      setMessage('rsvpMessage', `저장 실패: ${error.message}`, 'error');
      return;
    }
    setMessage('rsvpMessage', 'Supabase에 RSVP 저장 완료.', 'success');
  } else {
    const items = readLocalList(LOCAL_STORE_KEYS.rsvps);
    items.unshift(row);
    writeLocalList(LOCAL_STORE_KEYS.rsvps, items.slice(0, 200));
    setMessage('rsvpMessage', '로컬 테스트 모드로 저장되었습니다.', 'success');
  }

  document.getElementById('rsvpForm')?.reset();
  const guestsInput = document.getElementById('rsvpGuests');
  if (guestsInput) guestsInput.value = '1';
  await refreshRsvpPanel();
}

async function refreshRsvpPanel() {
  if (appState.supabaseReady && appState.client && appState.currentUser) {
    const { data, error } = await appState.client
      .from('rsvps')
      .select('name, phone, attending, guests, memo, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!error) {
      appState.latestRsvps = data || [];
      renderRsvpPanel(appState.latestRsvps, 'Supabase 관리자 데이터');
      return;
    }
  }

  const localRows = readLocalList(LOCAL_STORE_KEYS.rsvps);
  appState.latestRsvps = localRows;
  const modeLabel = appState.supabaseReady ? '로그인 전 - 로컬 테스트 데이터' : '로컬 테스트 데이터';
  renderRsvpPanel(localRows, modeLabel);
}

function renderRsvpPanel(rows, note) {
  const total = rows.length;
  const yesCount = rows.filter((r) => Boolean(r.attending)).length;
  const noCount = total - yesCount;

  setText('rsvpTotal', String(total));
  setText('rsvpYes', String(yesCount));
  setText('rsvpNo', String(noCount));
  setText('rsvpPanelNote', note);

  const list = document.getElementById('rsvpRecentList');
  if (!list) return;
  list.innerHTML = '';
  if (rows.length === 0) {
    list.innerHTML = '<li class="meta">아직 RSVP 응답이 없습니다.</li>';
    return;
  }

  rows.slice(0, 10).forEach((row) => {
    const li = document.createElement('li');
    const status = row.attending ? '참석' : '불참';
    const phone = row.phone ? ` / ${row.phone}` : '';
    const memo = row.memo ? `<div class="value">메모: ${escapeHtml(row.memo)}</div>` : '';
    li.innerHTML = `
      <div class="meta">${formatDateTime(row.created_at)} · ${escapeHtml(row.name)}${phone}</div>
      <div class="value">${status}, 동행 ${Number(row.guests || 0)}명</div>
      ${memo}
    `;
    list.appendChild(li);
  });
}

function downloadRsvpCsv() {
  if (!appState.latestRsvps.length) {
    setMessage('rsvpMessage', '다운로드할 RSVP 데이터가 없습니다.', 'error');
    return;
  }
  const header = ['created_at', 'name', 'phone', 'attending', 'guests', 'memo'];
  const lines = [
    header.join(','),
    ...appState.latestRsvps.map((row) => [
      csvEscape(row.created_at || ''),
      csvEscape(row.name || ''),
      csvEscape(row.phone || ''),
      csvEscape(row.attending ? 'yes' : 'no'),
      csvEscape(String(row.guests ?? '')),
      csvEscape(row.memo || ''),
    ].join(',')),
  ];
  const blob = new Blob([`\uFEFF${lines.join('\n')}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `invitehub-rsvps-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function submitGuestbookEntry() {
  if (isSubmitCoolingDown('guestbook')) {
    setMessage('guestbookFormMessage', '너무 빠르게 제출 중입니다. 잠시 후 다시 시도해 주세요.', 'error');
    return;
  }

  const nickname = document.getElementById('guestbookName')?.value.trim() || '';
  const message = document.getElementById('guestbookMessage')?.value.trim() || '';
  if (!nickname || !message) {
    setMessage('guestbookFormMessage', '닉네임과 메시지를 입력하세요.', 'error');
    return;
  }

  const row = {
    nickname,
    message,
    created_at: new Date().toISOString(),
  };

  if (appState.supabaseReady && appState.client) {
    const payload = { ...row, user_id: appState.currentUser?.id || null };
    const { error } = await appState.client.from('guestbook_entries').insert(payload);
    if (error) {
      setMessage('guestbookFormMessage', `저장 실패: ${error.message}`, 'error');
      return;
    }
    setMessage('guestbookFormMessage', '방명록이 저장되었습니다.', 'success');
  } else {
    const entries = readLocalList(LOCAL_STORE_KEYS.guestbook);
    entries.unshift(row);
    writeLocalList(LOCAL_STORE_KEYS.guestbook, entries.slice(0, 200));
    setMessage('guestbookFormMessage', '로컬 테스트 모드로 저장되었습니다.', 'success');
  }

  document.getElementById('guestbookForm')?.reset();
  await refreshGuestbook();
}

async function refreshGuestbook() {
  let rows = [];
  if (appState.supabaseReady && appState.client) {
    const { data, error } = await appState.client
      .from('guestbook_entries')
      .select('nickname, message, created_at')
      .order('created_at', { ascending: false })
      .limit(30);
    if (!error) rows = data || [];
  }

  if (!rows.length) rows = readLocalList(LOCAL_STORE_KEYS.guestbook);

  const list = document.getElementById('guestbookList');
  if (!list) return;
  list.innerHTML = '';
  if (!rows.length) {
    list.innerHTML = '<li class="meta">첫 번째 방명록을 남겨보세요.</li>';
    return;
  }

  rows.slice(0, 20).forEach((row) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="meta">${formatDateTime(row.created_at)} · ${escapeHtml(row.nickname)}</div>
      <div class="value">${escapeHtml(row.message)}</div>
    `;
    list.appendChild(li);
  });
}

async function trackVisit() {
  if (!appState.supabaseReady || !appState.client) {
    trackLocalVisit();
    return;
  }
  await appState.client.from('visits').insert({
    page: window.location.pathname || '/',
    user_agent: navigator.userAgent || 'unknown',
    user_id: appState.currentUser?.id || null,
  });
}

function trackLocalVisit() {
  const visits = readLocalList(LOCAL_STORE_KEYS.visits);
  visits.push({ created_at: new Date().toISOString() });
  writeLocalList(LOCAL_STORE_KEYS.visits, visits.slice(-1000));
}

async function refreshVisitStats() {
  if (appState.supabaseReady && appState.client) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const totalRes = await appState.client.from('visits').select('*', { count: 'exact', head: true });
    const todayRes = await appState.client
      .from('visits')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfDay.toISOString());

    if (!totalRes.error && !todayRes.error) {
      setText('totalVisits', String(totalRes.count || 0));
      setText('todayVisits', String(todayRes.count || 0));
      return;
    }
  }

  const visits = readLocalList(LOCAL_STORE_KEYS.visits);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayCount = visits.filter((v) => new Date(v.created_at) >= todayStart).length;
  setText('totalVisits', String(visits.length));
  setText('todayVisits', String(todayCount));
}

function renderTemplates(list) {
  const grid = document.getElementById('templatesGrid');
  if (!grid) return;
  grid.innerHTML = '';
  if (list.length === 0) {
    grid.innerHTML = '<p style="text-align:center;color:#999;grid-column:1/-1;padding:48px">해당 카테고리의 템플릿이 준비 중입니다.</p>';
    return;
  }
  list.forEach((t) => {
    const card = document.createElement('div');
    card.className = 'template-card';
    card.innerHTML = `
      <div class="template-thumb">
        ${t.html}
        <div class="template-overlay">
          <div class="overlay-btns">
            <button class="overlay-btn" onclick="previewTemplate('${t.id}')">미리보기</button>
            <button class="overlay-btn primary" onclick="startInvitationBuilder('${t.id}')">사용하기</button>
          </div>
        </div>
      </div>
      <div class="template-info">
        <span class="template-badge">${t.badge}</span>
        <div class="template-name">${t.name}</div>
        <div class="template-desc">${t.desc}</div>
        <div class="template-tags">${t.tags.map((tag) => `<span class="tag">${tag}</span>`).join('')}</div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function filterTemplates(cat, el) {
  document.querySelectorAll('.cat-tab').forEach((b) => b.classList.remove('active'));
  if (el) el.classList.add('active');
  const filtered = TEMPLATES.filter((t) => t.category === cat);
  renderTemplates(filtered);
  document.getElementById('templates').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function previewTemplate(id) {
  const t = TEMPLATES.find((item) => item.id === id);
  if (!t) return;
  appState.currentPreviewTemplateId = id;
  const content = document.getElementById('previewContent');
  if (!content) return;
  content.innerHTML = `
    <div style="padding:24px 24px 0">
      <span class="template-badge">${t.badge}</span>
      <h2 style="font-family:'Noto Serif KR',serif;font-size:1.3rem;margin:8px 0 4px">${t.name}</h2>
      <p style="font-size:0.85rem;color:#999;margin-bottom:16px">${t.desc}</p>
    </div>
    <div style="padding:0 24px">${t.html}</div>
    <div style="padding:16px 24px 0;display:flex;gap:8px;flex-wrap:wrap">${t.tags.map((tag) => `<span class="tag">${tag}</span>`).join('')}</div>
  `;
  showModal('previewModal');
}

function showModal(id) {
  const element = document.getElementById(id);
  if (!element) return;
  element.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  const element = document.getElementById(id);
  if (!element) return;
  element.classList.remove('open');
  document.body.style.overflow = '';
}

function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  if (!menu) return;
  menu.classList.toggle('open');
}

function showSection(id) {
  const element = document.getElementById(id);
  if (!element) return;
  element.scrollIntoView({ behavior: 'smooth' });
}

function readLocalList(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

function writeLocalList(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function setMessage(id, text, type = '') {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.classList.remove('error', 'success');
  if (type) el.classList.add(type);
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function setInputValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
}

function getInputValue(id) {
  const el = document.getElementById(id);
  return (el?.value || '').trim();
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

function csvEscape(value) {
  const str = String(value ?? '');
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function isSubmitCoolingDown(type, ms = 3000) {
  const now = Date.now();
  const last = submitGuards[type] || 0;
  if (now - last < ms) return true;
  submitGuards[type] = now;
  return false;
}
