(function () {
  const STORAGE_KEYS = {
    url: 'invitehub_supabase_url',
    anon: 'invitehub_supabase_anon_key',
  };

  const state = {
    client: null,
    config: { url: '', anonKey: '' },
    lastError: '',
  };

  function readConfig() {
    const url = localStorage.getItem(STORAGE_KEYS.url) || '';
    const anonKey = localStorage.getItem(STORAGE_KEYS.anon) || '';
    return { url: url.trim(), anonKey: anonKey.trim() };
  }

  function hasConfig(config) {
    return Boolean(config.url && config.anonKey);
  }

  function maskKey(value) {
    if (!value) return '';
    if (value.length < 12) return '********';
    return `${value.slice(0, 6)}...${value.slice(-4)}`;
  }

  function setConfig(url, anonKey) {
    localStorage.setItem(STORAGE_KEYS.url, url.trim());
    localStorage.setItem(STORAGE_KEYS.anon, anonKey.trim());
  }

  function clearConfig() {
    localStorage.removeItem(STORAGE_KEYS.url);
    localStorage.removeItem(STORAGE_KEYS.anon);
    state.client = null;
    state.config = { url: '', anonKey: '' };
    state.lastError = '';
  }

  function initClient() {
    state.lastError = '';
    state.config = readConfig();
    state.client = null;

    if (!hasConfig(state.config)) {
      return { ok: false, reason: 'missing-config', config: state.config };
    }

    if (!window.supabase || !window.supabase.createClient) {
      state.lastError = 'supabase-js 라이브러리를 불러오지 못했습니다.';
      return { ok: false, reason: 'missing-library', config: state.config };
    }

    try {
      state.client = window.supabase.createClient(state.config.url, state.config.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
      return { ok: true, reason: 'ready', config: state.config };
    } catch (error) {
      state.lastError = error.message || 'Supabase 클라이언트 생성에 실패했습니다.';
      return { ok: false, reason: 'init-failed', config: state.config, error };
    }
  }

  async function getSession() {
    if (!state.client) return null;
    const { data, error } = await state.client.auth.getSession();
    if (error) {
      state.lastError = error.message || '세션 조회 중 오류가 발생했습니다.';
      return null;
    }
    return data.session || null;
  }

  window.InviteHubSupabase = {
    STORAGE_KEYS,
    initClient,
    setConfig,
    clearConfig,
    getSession,
    getClient: () => state.client,
    getConfig: () => ({ ...state.config, anonMasked: maskKey(state.config.anonKey) }),
    hasConfig: () => hasConfig(readConfig()),
    getLastError: () => state.lastError,
  };
})();
