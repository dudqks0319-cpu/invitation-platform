// ===== MAIN JS =====
document.addEventListener('DOMContentLoaded', () => {
  renderTemplates(TEMPLATES);
});

function renderTemplates(list) {
  const grid = document.getElementById('templatesGrid');
  if (!grid) return;
  grid.innerHTML = '';
  if (list.length === 0) {
    grid.innerHTML = '<p style="text-align:center;color:#999;grid-column:1/-1;padding:48px">해당 카테고리의 템플릿이 준비 중입니다.</p>';
    return;
  }
  list.forEach(t => {
    const card = document.createElement('div');
    card.className = 'template-card';
    card.innerHTML = `
      <div class="template-thumb">
        ${t.html}
        <div class="template-overlay">
          <div class="overlay-btns">
            <button class="overlay-btn" onclick="previewTemplate('${t.id}')">미리보기</button>
            <button class="overlay-btn primary" onclick="showModal('loginModal')">사용하기</button>
          </div>
        </div>
      </div>
      <div class="template-info">
        <span class="template-badge">${t.badge}</span>
        <div class="template-name">${t.name}</div>
        <div class="template-desc">${t.desc}</div>
        <div class="template-tags">${t.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function filterTemplates(cat, el) {
  document.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  const filtered = TEMPLATES.filter(t => t.category === cat);
  renderTemplates(filtered);
  document.getElementById('templates').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function previewTemplate(id) {
  const t = TEMPLATES.find(t => t.id === id);
  if (!t) return;
  const content = document.getElementById('previewContent');
  content.innerHTML = `
    <div style="padding:24px 24px 0">
      <span class="template-badge">${t.badge}</span>
      <h2 style="font-family:'Noto Serif KR',serif;font-size:1.3rem;margin:8px 0 4px">${t.name}</h2>
      <p style="font-size:0.85rem;color:#999;margin-bottom:16px">${t.desc}</p>
    </div>
    <div style="padding:0 24px">${t.html}</div>
    <div style="padding:16px 24px 0;display:flex;gap:8px;flex-wrap:wrap">${t.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>
  `;
  showModal('previewModal');
}

function showModal(id) {
  document.getElementById(id).classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  document.body.style.overflow = '';
}

function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  menu.classList.toggle('open');
}

function showSection(id) {
  document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

// Close mobile menu on nav link click
document.querySelectorAll('.mobile-menu a').forEach(a => {
  a.addEventListener('click', () => {
    document.getElementById('mobileMenu').classList.remove('open');
  });
});

// Keyboard ESC closes modal
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => {
      m.classList.remove('open');
    });
    document.body.style.overflow = '';
  }
});

// Header scroll effect
window.addEventListener('scroll', () => {
  const header = document.querySelector('.site-header');
  if (window.scrollY > 60) {
    header.style.boxShadow = '0 4px 24px rgba(0,0,0,0.12)';
  } else {
    header.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)';
  }
});
