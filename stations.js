const DATA_URL =
  'https://raw.githubusercontent.com/gagikh/xbmc.plugin.audio.radiohy/refs/heads/master/resources/lib/stations.json';

const audio        = document.getElementById('player');
const npBar        = document.getElementById('now-playing');
const npName       = document.getElementById('np-name');
const npPause      = document.getElementById('np-pause');
const npStop       = document.getElementById('np-stop');
const npPauseIcon  = npPause?.querySelector('.np-icon-pause');
const npPlayIcon   = npPause?.querySelector('.np-icon-play');
const volumeSlider = document.getElementById('volume');
const searchInput  = document.getElementById('search');
const countrySelect = document.getElementById('country-filter');
const list           = document.getElementById('station-list');
const contactView    = document.getElementById('contact-view');
const headerControls = document.querySelector('.header-controls');
const navContact     = document.getElementById('nav-contact');
const navHome        = document.getElementById('nav-home');

let allStations    = [];
let activeCard     = null;
let connectTimeout = null;

const CONNECT_TIMEOUT_MS = 12000;
const ICON_PLAY  = '&#9654;';
const ICON_PAUSE = '&#9646;&#9646;';
const ICON_STOP  = '&#9632;';
const ICON_LOADING =
  '<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>';

function setPlayButtonIcon(btn, state) {
  if (state === 'loading') btn.innerHTML = ICON_LOADING;
  else if (state === 'playing') btn.innerHTML = ICON_PAUSE;
  else btn.innerHTML = ICON_PLAY;
}

function updateNpControls() {
  if (!npPause) return;
  const loading = activeCard && activeCard.classList.contains('loading');
  if (loading) {
    npPause.disabled = true;
    if (npPauseIcon) npPauseIcon.hidden = false;
    if (npPlayIcon) npPlayIcon.hidden = true;
    npPause.setAttribute('aria-label', 'Pause');
    return;
  }
  npPause.disabled = false;
  const paused = audio.paused;
  if (npPauseIcon) npPauseIcon.hidden = paused;
  if (npPlayIcon) npPlayIcon.hidden = !paused;
  npPause.setAttribute('aria-label', paused ? 'Resume' : 'Pause');
}

function buildUrl(s) {
  // hostname may embed a path (e.g. "host.com/proxy/path/"), so only append
  // port when hostname is a bare host with no slash.
  const host = s.hostname.replace(/\/$/, '');
  let base = s.protocol + '://' + host;
  if (s.port && !host.includes('/')) base += ':' + s.port;
  const path = s.path
    ? (s.path.startsWith('/') ? s.path : '/' + s.path)
    : '';
  return base + path;
}

function renderStations(data) {
  list.innerHTML = '';
  if (!data.length) {
    list.innerHTML = '<p class="empty">No stations found.</p>';
    return;
  }

  const fragment = document.createDocumentFragment();

  data.forEach(s => {
    const card = document.createElement('div');
    card.className = 'station-card';
    card.dataset.url = buildUrl(s);

    // Logo
    const logoWrap = document.createElement('div');
    logoWrap.className = 'station-logo';
    if (s.icon) {
      const img = document.createElement('img');
      img.src = s.icon;
      img.alt = '';
      img.loading = 'lazy';
      img.onerror = () => { logoWrap.textContent = '📻'; };
      logoWrap.appendChild(img);
    } else {
      logoWrap.textContent = '📻';
    }

    // Info
    const info = document.createElement('div');
    info.className = 'station-info';

    const nameLink = document.createElement('a');
    nameLink.className = 'station-name';
    nameLink.href = /^https?:\/\//i.test(s.webpage) ? s.webpage : '#';
    nameLink.target = '_blank';
    nameLink.rel = 'noopener noreferrer';
    nameLink.textContent = s.nickname;
    nameLink.addEventListener('click', e => e.stopPropagation());
    info.appendChild(nameLink);

    if (s.country) {
      const country = document.createElement('span');
      country.className = 'station-country';
      country.textContent = s.country;
      info.appendChild(country);
    }

    // Play button
    const btn = document.createElement('button');
    btn.className = 'play-btn';
    btn.setAttribute('aria-label', 'Play ' + s.nickname);
    btn.innerHTML = '&#9654;';
    btn.addEventListener('click', e => { e.stopPropagation(); togglePlay(card, btn, s); });

    card.appendChild(logoWrap);
    card.appendChild(info);
    card.appendChild(btn);
    card.addEventListener('click', () => togglePlay(card, btn, s));

    fragment.appendChild(card);
  });

  list.appendChild(fragment);

  // Re-highlight the active card if it's still in the filtered list.
  // Capture state before the old DOM node is orphaned.
  if (activeCard) {
    const prevUrl     = activeCard.dataset.url;
    const wasLoading  = activeCard.classList.contains('loading');
    for (const card of list.children) {
      if (card.dataset.url === prevUrl) {
        card.classList.add('playing');
        if (wasLoading) {
          card.classList.add('loading');
          setPlayButtonIcon(card.querySelector('.play-btn'), 'loading');
        } else {
          setPlayButtonIcon(
            card.querySelector('.play-btn'),
            audio.paused ? 'paused' : 'playing'
          );
        }
        activeCard = card;
        break;
      }
    }
  }
}

function togglePlay(card, btn, s) {
  if (activeCard === card) {
    if (card.classList.contains('loading')) {
      stopPlayback();
    } else if (audio.paused) {
      resumePlayback(card, btn);
    } else {
      pausePlayback();
    }
    return;
  }

  // Stop previous
  if (activeCard) {
    clearTimeout(connectTimeout);
    activeCard.classList.remove('playing', 'loading');
    setPlayButtonIcon(activeCard.querySelector('.play-btn'), 'idle');
  }

  activeCard = card;
  audio.src = buildUrl(s);
  audio.volume = parseFloat(volumeSlider.value);

  card.classList.add('playing', 'loading');
  setPlayButtonIcon(btn, 'loading');
  btn.setAttribute('aria-label', 'Stop ' + s.nickname);

  npName.textContent = s.nickname;
  npBar.hidden = false;
  document.body.classList.add('has-player');
  updateNpControls();

  audio.play().catch(() => showStreamError(card, btn));

  connectTimeout = setTimeout(() => {
    if (activeCard === card) showStreamError(card, btn);
  }, CONNECT_TIMEOUT_MS);
}

function pausePlayback() {
  if (!activeCard || audio.paused) return;
  clearTimeout(connectTimeout);
  audio.pause();
  activeCard.classList.remove('loading');
  setPlayButtonIcon(activeCard.querySelector('.play-btn'), 'paused');
  updateNpControls();
}

function resumePlayback(card, btn) {
  if (!activeCard) return;
  audio.play().catch(() => showStreamError(card, btn));
  setPlayButtonIcon(btn, 'playing');
  updateNpControls();
}

function showStreamError(card, btn) {
  if (card.classList.contains('stream-error')) return;
  clearTimeout(connectTimeout);
  activeCard = null;        // clear first so the error event from src='' is ignored
  audio.pause();
  audio.src = '';
  card.classList.remove('playing', 'loading');
  card.classList.add('stream-error');
  setPlayButtonIcon(btn, 'idle');
  npBar.hidden = true;
  document.body.classList.remove('has-player');
  setTimeout(() => card.classList.remove('stream-error'), 2500);
}

function stopPlayback() {
  if (!activeCard) return;
  clearTimeout(connectTimeout);
  activeCard.classList.remove('playing', 'loading');
  setPlayButtonIcon(activeCard.querySelector('.play-btn'), 'idle');
  activeCard = null;
  audio.pause();
  audio.src = '';
  npBar.hidden = true;
  document.body.classList.remove('has-player');
}

audio.addEventListener('playing', () => {
  clearTimeout(connectTimeout);
  if (activeCard) {
    activeCard.classList.remove('loading');
    setPlayButtonIcon(activeCard.querySelector('.play-btn'), 'playing');
    updateNpControls();
  }
});
audio.addEventListener('ended', stopPlayback);
audio.addEventListener('error', () => {
  if (activeCard) showStreamError(activeCard, activeCard.querySelector('.play-btn'));
});

volumeSlider.addEventListener('input', () => {
  audio.volume = parseFloat(volumeSlider.value);
});

if (npPause) {
  npPause.addEventListener('click', () => {
    if (!activeCard) return;
    if (audio.paused) {
      resumePlayback(activeCard, activeCard.querySelector('.play-btn'));
    } else {
      pausePlayback();
    }
  });
}

if (npStop) {
  npStop.addEventListener('click', stopPlayback);
}

function applyFilters() {
  const query   = searchInput.value.trim().toLowerCase();
  const country = countrySelect.value;

  const filtered = allStations.filter(s => {
    const matchQuery = !query ||
      s.nickname.toLowerCase().includes(query) ||
      (s.country && s.country.toLowerCase().includes(query));
    const matchCountry = !country || s.country === country;
    return matchQuery && matchCountry;
  });

  renderStations(filtered);
}

searchInput.addEventListener('input', applyFilters);
countrySelect.addEventListener('change', applyFilters);

// ── Hash routing ─────────────────────────────────────────

function route() {
  const isContact = location.hash === '#contact';
  list.hidden            = isContact;
  contactView.hidden     = !isContact;
  headerControls.hidden  = isContact;
  navContact.classList.toggle('active', isContact);
}

navHome.addEventListener('click', e => {
  if (location.hash) {
    e.preventDefault();
    history.pushState(null, '', location.pathname);
    route();
  }
});

window.addEventListener('hashchange', route);
route();

// Load data from GitHub
fetch(DATA_URL)
  .then(r => {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.text();
  })
  .then(text => {
    // File is a JS assignment: var stations = { ... }
    // Strip the wrapper to get pure JSON.
    const json = text.replace(/^\s*var\s+\w+\s*=\s*/, '').replace(/;\s*$/, '');
    return JSON.parse(json);
  })
  .then(data => {
    allStations = data.backup.uri;

    const countries = [...new Set(allStations.map(s => s.country).filter(Boolean))].sort();
    countries.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      countrySelect.appendChild(opt);
    });

    renderStations(allStations);
  })
  .catch(() => {
    list.innerHTML = '<p class="error">Failed to load stations. Check your connection and refresh.</p>';
  });
