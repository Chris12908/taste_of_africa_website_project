/* ==========================================================
   Tastes of Africa - script.js
   Features: dark mode, mobile menu, recipe filter, favorites
   (localStorage), ingredient scaler, contact form validation,
   newsletter signup.
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMenu();
  initFavorites();
  initFilter();
  initScaler();
  initContactForm();
  initNewsletter();
  initVideos();
});

/* ---------- helpers: safe localStorage ---------- */
function load(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value === null ? fallback : value;
  } catch (e) {
    return fallback;
  }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage blocked */ }
}

/* ---------- 1. Dark / light mode ---------- */
function initTheme() {
  const btn = document.getElementById('theme-toggle');
  if (load('theme', 'light') === 'dark') document.body.classList.add('dark');
  if (!btn) return;

  const sync = () => {
    const dark = document.body.classList.contains('dark');
    btn.textContent = dark ? 'Light mode' : 'Dark mode';
    btn.setAttribute('aria-pressed', String(dark));
  };
  sync();

  btn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    save('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
    sync();
  });
}

/* ---------- 2. Mobile menu ---------- */
function initMenu() {
  const toggle = document.getElementById('menu-toggle');
  const list = document.getElementById('nav-list');
  if (!toggle || !list) return;
  toggle.addEventListener('click', () => {
    const open = list.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
}

/* ---------- 3. Favorites (saved in localStorage) ---------- */
function initFavorites() {
  const buttons = document.querySelectorAll('.fav-btn');
  let favorites = load('favorites', []);

  function paint() {
    buttons.forEach(btn => {
      const saved = favorites.includes(btn.dataset.id);
      btn.classList.toggle('saved', saved);
      btn.setAttribute('aria-pressed', String(saved));
      btn.lastChild.textContent = saved ? ' Saved' : ' Favorite';
    });
    document.querySelectorAll('.fav-count').forEach(el => { el.textContent = favorites.length; });
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      favorites = favorites.includes(id)
        ? favorites.filter(item => item !== id)
        : [...favorites, id];
      save('favorites', favorites);
      paint();
    });
  });

  paint(); // restore saved state on page load
}

/* ---------- 4. Recipe filter by region ---------- */
function initFilter() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.recipe-card');
  if (!filterButtons.length) return;

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const region = btn.dataset.filter;

      filterButtons.forEach(b => {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-pressed', String(b === btn));
      });

      for (const card of cards) {
        const show = region === 'all' || card.dataset.region === region;
        card.classList.toggle('hidden', !show);
      }
    });
  });
}

/* ---------- 5. Ingredient scaler ---------- */
function initScaler() {
  const scaler = document.querySelector('.scaler');
  if (!scaler) return;

  const base = Number(scaler.dataset.base);
  const out = scaler.querySelector('output');
  let servings = base;

  const format = n => String(Math.round(n * 100) / 100);

  function update() {
    out.textContent = servings;
    document.querySelectorAll('.qty').forEach(el => {
      el.textContent = format(Number(el.dataset.base) * servings / base);
    });
  }

  scaler.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      servings = Math.min(20, Math.max(1, servings + Number(btn.dataset.step)));
      update();
    });
  });
}

/* ---------- 6. Contact form validation ---------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const message = document.getElementById('message');
  const error = document.getElementById('message-error');
  const success = document.getElementById('success');

  form.addEventListener('submit', event => {
    event.preventDefault(); // stop the page from reloading

    const name = document.getElementById('name').value.trim();
    const text = message.value.trim();

    if (text.length <= 20) {
      error.textContent = 'Your message has ' + text.length + ' characters. Please write more than 20.';
      message.classList.add('invalid');
      message.focus();
      return;
    }

    error.textContent = '';
    message.classList.remove('invalid');
    form.classList.add('hidden');
    success.querySelector('h2').textContent = 'Thank you, ' + name + '! We\u2019ve received your message.';
    success.classList.remove('hidden');
    success.focus();
  });

  // clear the error as soon as the user fixes it
  message.addEventListener('input', () => {
    if (message.value.trim().length > 20) {
      error.textContent = '';
      message.classList.remove('invalid');
    }
  });
}

/* ---------- 7. Newsletter (footer) ---------- */
function initNewsletter() {
  const form = document.getElementById('news-form');
  if (!form) return;
  form.addEventListener('submit', event => {
    event.preventDefault();
    const email = form.querySelector('input').value.trim();
    document.getElementById('news-msg').textContent = 'You are on the list: ' + email;
    form.reset();
  });
}

/* ---------- 8. Video thumbnails (click to play) ---------- */
/* Swaps each YouTube iframe for its thumbnail. The real player
   loads only when the visitor clicks. Accepts embed links, youtu.be
   links, watch?v= links, or a bare 11-character video ID. */
function getYouTubeId(text) {
  const m = text.match(/(?:embed\/|youtu\.be\/|[?&]v=)([\w-]{11})/) || text.match(/([\w-]{11})\s*$/);
  return m ? m[1] : null;
}

function initVideos() {
  document.querySelectorAll('.video').forEach(box => {
    const frame = box.querySelector('iframe');
    if (!frame) return;
    const id = getYouTubeId(frame.getAttribute('src') || '');
    if (!id || id === 'REPLACE_ID') return; // placeholder: leave as is

    const title = frame.title || 'video';
    frame.remove();

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'video-play';
    btn.setAttribute('aria-label', 'Play video: ' + title);

    const img = document.createElement('img');
    img.alt = '';
    img.src = 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg';
    img.addEventListener('error', () => {
      img.src = 'https://img.youtube.com/vi/' + id + '/0.jpg'; // backup address
    }, { once: true });
    btn.appendChild(img);
    box.appendChild(btn);

    btn.addEventListener('click', () => {
      const player = document.createElement('iframe');
      player.src = 'https://www.youtube.com/embed/' + id + '?autoplay=1&rel=0';
      player.title = title;
      player.allow = 'autoplay; encrypted-media; picture-in-picture';
      player.referrerPolicy = 'strict-origin-when-cross-origin';
      player.allowFullscreen = true;
      box.appendChild(player);
      btn.remove();
    });
  });
}