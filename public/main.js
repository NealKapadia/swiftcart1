(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  $('#y').textContent = new Date().getFullYear();

  // Toast helper
  const toast = $('#toast');
  let toastTimer;
  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  };

  // Reveal on scroll + count-up numbers
  const countUp = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    if (reduce) { el.textContent = target.toFixed(decimals); return; }
    const start = performance.now(), dur = 1400;
    const tick = (now) => {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      $$('[data-count]', e.target).forEach(countUp);
      io.unobserve(e.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach((el) => io.observe(el));

  // Active nav link
  const links = $$('.links a');
  const sectionIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('section[id]').forEach((s) => sectionIO.observe(s));

  // Scroll-driven effects
  const progress = $('#progress');
  const nav = $('#nav');
  const blobs = $$('.blob');
  const cart = $('#cart');
  const track = $('.cart-track');
  const trail = $('.trail', cart);
  const wheels = $$('.wheel', cart);
  const timeline = $('#timeline');
  const fill = $('#timeline-fill');
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    nav.classList.toggle('scrolled', y > 20);

    if (!reduce) {
      blobs.forEach((b) => { b.style.transform = `translateY(${y * parseFloat(b.dataset.speed)}px)`; });

      // Cart rolls across as you scroll through the first screen
      const w = track.clientWidth - 64;
      const p = Math.min(y / (innerHeight * 0.6), 1);
      cart.style.transform = `translateX(${p * w}px)`;
      trail.style.width = `${Math.min(p * 160, 120)}px`;
      wheels.forEach((wh) => { wh.style.transform = `rotate(${y * 2}deg)`; });

      // Timeline fills as it scrolls through the viewport
      const r = timeline.getBoundingClientRect();
      const tp = Math.min(Math.max((innerHeight * 0.75 - r.top) / r.height, 0), 1);
      fill.style.transform = `scaleY(${tp})`;
    }
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();
  if (reduce) fill.style.transform = 'scaleY(1)';

  // Rotating hero word
  const words = ['speed of now.', 'speed of light.', 'click of a button.', 'speed of now.'];
  const rot = $('#rotator');
  let wi = 0;
  if (!reduce) {
    setInterval(() => {
      rot.classList.add('out');
      setTimeout(() => {
        wi = (wi + 1) % words.length;
        rot.textContent = words[wi];
        rot.classList.remove('out');
      }, 350);
    }, 2800);
  }

  // 3D tilt + spotlight on cards (pointer devices only)
  if (!reduce && matchMedia('(hover: hover)').matches) {
    $$('.tilt').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, yy = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', `${x * 100}%`);
        card.style.setProperty('--my', `${yy * 100}%`);
        card.style.transform = `perspective(800px) rotateX(${(0.5 - yy) * 10}deg) rotateY(${(x - 0.5) * 12}deg) translateY(-4px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });

    // Magnetic button
    $$('.magnetic').forEach((btn) => {
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
      });
      btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
    });
  }

  // Waitlist (front-end only for now)
  const wl = $('#waitlist-form');
  wl.addEventListener('submit', (e) => {
    e.preventDefault();
    wl.innerHTML = '<p class="thanks">Thanks! You\'re on the list. 🎉</p>';
  });

  // Copy email
  $('#copy-email').addEventListener('click', async (e) => {
    const email = e.currentTarget.dataset.email;
    try { await navigator.clipboard.writeText(email); showToast('Email copied to clipboard ✨'); }
    catch { showToast(email); }
  });

  // Contact form → opens the visitor's email app
  $('#contact-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const subject = encodeURIComponent(`SwiftCart inquiry from ${f.get('name')}`);
    const body = encodeURIComponent(`${f.get('message')}\n\nFrom: ${f.get('name')} <${f.get('email')}>`);
    window.location.href = `mailto:bankimbhavsar@yahoo.com?subject=${subject}&body=${body}`;
    showToast('Opening your email app…');
  });
})();
