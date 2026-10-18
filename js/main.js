/* =========================================================
   Sabores de la Yayáya — interacciones
   ========================================================= */

/* ---------- CONFIGURACIÓN: editá estos datos ---------- */
const CONFIG = {
  // Número de WhatsApp con código de país, sin "+" ni espacios. Ej: '59899123456'
  // Mientras esté vacío, los botones de pedido llevan a Instagram.
  whatsapp: '59892749455',
  // Usuario de Instagram, sin "@"
  instagram: 'yayaya.uy',
};

(() => {
  'use strict';

  const root = document.documentElement;
  root.classList.remove('no-js');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const igUrl = `https://www.instagram.com/${CONFIG.instagram}/`;

  /* ---------- Links de WhatsApp e Instagram ---------- */
  document.querySelectorAll('[data-wa]').forEach((el) => {
    const msg = el.dataset.wa || '¡Hola Yayáya! Quiero hacer un pedido.';
    el.href = CONFIG.whatsapp
      ? `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`
      : igUrl;
    el.target = '_blank';
    el.rel = 'noopener';
    if (!CONFIG.whatsapp) {
      el.querySelectorAll('use[href="#i-whatsapp"]').forEach((u) => u.setAttribute('href', '#i-instagram'));
    }
  });

  if (!CONFIG.whatsapp) {
    document.querySelectorAll('.wa-float, [data-wa-only]').forEach((el) => el.remove());
  }

  document.querySelectorAll('[data-ig]').forEach((el) => {
    el.href = igUrl;
    el.target = '_blank';
    el.rel = 'noopener';
  });
  document.querySelectorAll('[data-ig-handle]').forEach((el) => {
    el.textContent = `@${CONFIG.instagram}`;
  });

  /* ---------- Header y botón flotante al hacer scroll ---------- */
  const header = document.getElementById('header');
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 24);
    document.body.classList.toggle('show-float', y > window.innerHeight * 0.6);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Menú mobile ---------- */
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('nav');
  const setMenu = (open) => {
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  };
  toggle.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));

  /* ---------- Animaciones de entrada ---------- */
  document.querySelectorAll('[data-stagger]').forEach((group) => {
    [...group.children].forEach((child, i) => child.style.setProperty('--d', `${Math.min(i, 8) * 0.08}s`));
  });

  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Link activo del menú ---------- */
  const navLinks = [...document.querySelectorAll('.nav ul a')];
  const sections = navLinks
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);
  if ('IntersectionObserver' in window) {
    const navIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === `#${entry.target.id}`));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => navIO.observe(s));
  }

  /* ---------- Parallax suave del hero (solo con mouse) ---------- */
  const hero = document.querySelector('.hero');
  const visual = document.querySelector('.hero__visual');
  if (hero && visual && !reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const layers = visual.querySelectorAll('[data-depth]');
    let frame;
    hero.addEventListener('pointermove', (e) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = visual.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) / r.width;
        const y = (e.clientY - (r.top + r.height / 2)) / r.height;
        layers.forEach((layer) => {
          const depth = Number(layer.dataset.depth);
          layer.style.setProperty('--px', `${(-x * depth).toFixed(1)}px`);
          layer.style.setProperty('--py', `${(-y * depth).toFixed(1)}px`);
        });
      });
    });
    hero.addEventListener('pointerleave', () => {
      layers.forEach((layer) => {
        layer.style.setProperty('--px', '0px');
        layer.style.setProperty('--py', '0px');
      });
    });
  }

  /* ---------- Carrusel de alfajores ---------- */
  const track = document.getElementById('alfajoresTrack');
  if (track) {
    const prev = document.querySelector('[data-carousel-prev]');
    const next = document.querySelector('[data-carousel-next]');
    const bar = document.getElementById('alfajoresProgress');

    const step = () => {
      const card = track.querySelector('.alfa-card');
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return card ? card.offsetWidth + gap : 300;
    };
    const go = (dir) => track.scrollBy({ left: dir * step(), behavior: reduceMotion ? 'auto' : 'smooth' });
    prev.addEventListener('click', () => go(-1));
    next.addEventListener('click', () => go(1));

    const update = () => {
      const max = track.scrollWidth - track.clientWidth;
      const ratio = Math.min(1, track.clientWidth / track.scrollWidth);
      const progress = max > 0 ? track.scrollLeft / max : 0;
      bar.style.width = `${ratio * 100}%`;
      bar.style.transform = `translateX(${progress * (1 / ratio - 1) * 100}%)`;
      prev.disabled = track.scrollLeft <= 4;
      next.disabled = track.scrollLeft >= max - 4;
    };
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();

    // Arrastrar con el mouse
    let dragging = false;
    let moved = false;
    let startX = 0;
    let startLeft = 0;
    track.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      dragging = true;
      moved = false;
      startX = e.clientX;
      startLeft = track.scrollLeft;
    });
    window.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 5) {
        moved = true;
        track.classList.add('is-dragging');
      }
      if (moved) track.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', () => {
      if (!dragging) return;
      dragging = false;
      if (!moved) return;
      // Soltar: encaja en la tarjeta más cercana
      const s = step();
      track.classList.remove('is-dragging');
      track.scrollTo({ left: Math.round(track.scrollLeft / s) * s, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
    // Evita abrir links cuando en realidad se estaba arrastrando
    track.addEventListener('click', (e) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    }, true);
  }

  /* ---------- Visor de fotos (galería) ---------- */
  const items = [...document.querySelectorAll('.masonry__item')];
  const lb = document.getElementById('lightbox');
  if (items.length && lb) {
    const lbImg = document.getElementById('lightboxImg');
    const lbCap = document.getElementById('lightboxCap');
    let index = 0;
    let lastFocus = null;

    const show = (i) => {
      index = (i + items.length) % items.length;
      const img = items[index].querySelector('img');
      lbImg.classList.add('is-swapping');
      const src = img.currentSrc || img.src;
      const done = () => lbImg.classList.remove('is-swapping');
      lbImg.onload = done;
      lbImg.src = src;
      lbImg.alt = img.alt;
      lbCap.textContent = img.alt;
      if (lbImg.complete) requestAnimationFrame(done);
    };
    const open = (i) => {
      lastFocus = document.activeElement;
      show(i);
      lb.classList.add('is-open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lb-open');
      lb.querySelector('.lightbox__close').focus();
    };
    const close = () => {
      lb.classList.remove('is-open');
      lb.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('lb-open');
      lastFocus?.focus();
    };

    items.forEach((item, i) => item.addEventListener('click', () => open(i)));
    lb.querySelector('.lightbox__close').addEventListener('click', close);
    lb.querySelector('.lightbox__prev').addEventListener('click', () => show(index - 1));
    lb.querySelector('.lightbox__next').addEventListener('click', () => show(index + 1));
    lb.addEventListener('click', (e) => { if (e.target === lb) close(); });

    document.addEventListener('keydown', (e) => {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
      if (e.key === 'Tab') {
        // Mantiene el foco dentro del visor
        const focusables = [...lb.querySelectorAll('button')];
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    let touchX = null;
    lb.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', (e) => {
      if (touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
      touchX = null;
    });
  }

  /* ---------- Escape cierra el menú ---------- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('menu-open')) setMenu(false);
  });

  /* ---------- Año del footer ---------- */
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
