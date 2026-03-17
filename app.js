/* ════════════════════════════════════════════════════
   app.js — Personal Website Interactions & Animations
   Background: pure CSS (global-grid + global-glow)
════════════════════════════════════════════════════ */

'use strict';


// ─── NAVBAR ──────────────────────────────────────────────
(() => {
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
})();

// ─── MOBILE MENU ─────────────────────────────────────────
(() => {
    const toggle = document.getElementById('menuToggle');
    const menu = document.getElementById('mobileMenu');
    const links = document.querySelectorAll('.mobile-link');

    function openMenu() {
        toggle.classList.add('active');
        menu.classList.add('open');
        document.body.style.overflow = 'hidden';
        // Stagger animate links in
        links.forEach((l, i) => {
            l.style.transitionDelay = `${0.05 + i * 0.06}s`;
            l.classList.add('visible');
        });
    }

    function closeMenu() {
        toggle.classList.remove('active');
        links.forEach(l => {
            l.style.transitionDelay = '0s';
            l.classList.remove('visible');
        });
        menu.classList.remove('open');
        document.body.style.overflow = '';
    }

    toggle.addEventListener('click', () => {
        menu.classList.contains('open') ? closeMenu() : openMenu();
    });

    links.forEach(l => l.addEventListener('click', closeMenu));

    // Close on backdrop tap
    menu.addEventListener('click', (e) => {
        if (e.target === menu) closeMenu();
    });
})();

// ─── REVEAL ON SCROLL ────────────────────────────────────
(() => {
    const els = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const siblings = entry.target.parentElement.querySelectorAll(
                '.reveal-up, .reveal-left, .reveal-right'
            );
            siblings.forEach((el, i) => {
                if (!el.classList.contains('visible'))
                    el.style.transitionDelay = `${i * 0.05}s`;
            });
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
        });
    }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });
    els.forEach(el => obs.observe(el));
})();

// ─── PROGRESSIVE SCROLL BLUR ─────────────────────────────
(() => {
    const sections = Array.from(document.querySelectorAll('.section-blur'));
    if (!sections.length) return;

    const visibleSections = new Set();
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                visibleSections.add(entry.target);
            } else {
                visibleSections.delete(entry.target);
                // Reset styles when out of view
                entry.target.style.filter = 'none';
                entry.target.style.opacity = '1';
            }
        });
    }, { threshold: Array.from({ length: 21 }, (_, i) => i / 20), rootMargin: '100px 0px' });

    sections.forEach(sec => observer.observe(sec));

    let ticking = false;
    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

    function update() {
        if (visibleSections.size === 0) {
            ticking = false;
            return;
        }

        const vH = window.innerHeight;
        visibleSections.forEach(sec => {
            const r = sec.getBoundingClientRect();
            // Enter progress (0 to 1) as section comes from bottom
            const enterProgress = clamp((vH - r.top) / (vH * 0.5), 0, 1);
            // Exit progress (0 to 1) as section goes to top
            const exitProgress = r.bottom < vH * 0.4 ? clamp(1 - r.bottom / (vH * 0.4), 0, 1) : 0;

            let opacity;
            let scale;
            let translateY;

            const isMobile = window.innerWidth <= 768;
            const mobileFactor = isMobile ? 0.3 : 1.0; // Reduce movement on mobile

            if (exitProgress > 0) {
                opacity = 1 - exitProgress * 0.4;
                scale = 1 - (exitProgress * 0.05 * mobileFactor);
                translateY = isMobile ? 0 : -exitProgress * (40 * mobileFactor);
            } else {
                opacity = 0.6 + enterProgress * 0.4;
                scale = (1 - (0.08 * mobileFactor)) + (enterProgress * 0.08 * mobileFactor);
                translateY = isMobile ? 0 : (60 * mobileFactor) * (1 - enterProgress);
            }

            sec.style.opacity = opacity.toFixed(2);
            sec.style.transform = `scale(${scale.toFixed(3)}) translateY(${translateY.toFixed(1)}px)`;
        });
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking && visibleSections.size > 0) {
            requestAnimationFrame(update);
            ticking = true;
        }
    }, { passive: true });

    // Initial run
    requestAnimationFrame(update);
})();


// ─── TESTIMONIALS SLIDER ─────────────────────────────────
(() => {
    const track = document.getElementById('testiTrack');
    const bg = document.getElementById('testiSliderBg');
    const dots = document.querySelectorAll('.testi-dot');
    const slides = document.querySelectorAll('.testi-slide');
    const prevBtn = document.getElementById('testiPrev');
    const nextBtn = document.getElementById('testiNext');
    if (!track || !slides.length) return;

    let current = 0;
    let autoTimer = null;

    function goTo(idx) {
        if (idx < 0) idx = slides.length - 1;
        if (idx >= slides.length) idx = 0;
        current = idx;

        // Move track
        track.style.transform = `translateX(-${100 * current}%)`;

        // Update dots
        dots.forEach((d, i) => d.classList.toggle('active', i === current));

        // Color change: accent from data attributes
        const slide = slides[current];
        const color = slide.dataset.color || '#b026ff';
        const color2 = slide.dataset.color2 || '#ff26b0';

        // CSS custom properties → slider background + dots + quote mark button tints
        document.documentElement.style.setProperty('--testi-color', color);
        document.documentElement.style.setProperty('--testi-color2', color2);

        // Background radial glow per-slide
        if (bg) {
            bg.style.background = `radial-gradient(ellipse 70% 70% at 50% 50%,
        ${color}26 0%, transparent 70%)`;
        }

        // Animate quote marks color
        document.querySelectorAll('.slide-quote-mark').forEach(q => {
            q.style.color = color;
        });
    }

    // Init
    goTo(0);

    // Arrow buttons
    prevBtn && prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
    nextBtn && nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

    // Dots
    dots.forEach(dot => {
        dot.addEventListener('click', () => { goTo(+dot.dataset.index); resetAuto(); });
    });

    // Touch / swipe support
    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 50) { goTo(dx < 0 ? current + 1 : current - 1); resetAuto(); }
    }, { passive: true });

    // Auto-advance every 5s
    function startAuto() {
        autoTimer = setInterval(() => goTo(current + 1), 5000);
    }
    function resetAuto() {
        clearInterval(autoTimer);
        startAuto();
    }
    startAuto();
})();

// ─── HERO MOUSE PARALLAX ─────────────────────────────────
(() => {
    const hero = document.querySelector('.hero');
    const content = document.querySelector('.hero-content');
    if (!hero || !content) return;
    hero.addEventListener('mousemove', (e) => {
        const dx = (e.clientX - window.innerWidth / 2) / window.innerWidth;
        const dy = (e.clientY - window.innerHeight / 2) / window.innerHeight;
        content.style.transform = `translate(${dx * 6}px, ${dy * 4}px)`;
        document.querySelectorAll('.cube').forEach((c, i) => {
            const d = 1 + i * 0.5;
            c.style.transform = `translate(${dx * 14 * d}px, ${dy * 10 * d}px)`;
        });
        document.querySelectorAll('.shape').forEach((s, i) => {
            const d = 0.5 + i * 0.3;
            s.style.marginLeft = `${dx * 20 * d}px`;
            s.style.marginTop = `${dy * 12 * d}px`;
        });
    });
    hero.addEventListener('mouseleave', () => {
        content.style.transform = '';
        document.querySelectorAll('.cube').forEach(c => c.style.transform = '');
        document.querySelectorAll('.shape').forEach(s => {
            s.style.marginLeft = ''; s.style.marginTop = '';
        });
    });
})();

// ─── WORK ITEMS MAGNETIC TILT ────────────────────────────
(() => {
    document.querySelectorAll('.work-item').forEach(item => {
        item.addEventListener('mousemove', (e) => {
            const r = item.getBoundingClientRect();
            const x = ((e.clientX - r.left) / r.width - 0.5) * 10;
            const y = ((e.clientY - r.top) / r.height - 0.5) * 10;
            item.style.transform = `perspective(600px) rotateX(${-y}deg) rotateY(${x}deg) translateY(-6px)`;
        });
        item.addEventListener('mouseleave', () => { item.style.transform = ''; });
    });
})();

// ─── COUNTER ANIMATION ON STATS ─────────────────────────
(() => {
    const stats = document.querySelectorAll('.stat-num');
    const targets = [50, 3, 100];
    const suffix = ['+', 'x', '%'];
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const idx = Array.from(stats).indexOf(el);
            const end = targets[idx] || 0;
            const suf = suffix[idx] || '';
            let cur = 0;
            const step = Math.ceil(end / 40);
            const t = setInterval(() => {
                cur += step;
                if (cur >= end) { cur = end; clearInterval(t); }
                el.textContent = cur + suf;
            }, 35);
            obs.unobserve(el);
        });
    }, { threshold: 0.8 });
    stats.forEach(s => obs.observe(s));
})();

// ─── SMOOTH ANCHOR SCROLL ────────────────────────────────
(() => {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', (e) => {
            const target = document.querySelector(a.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            const navH = 72;
            window.scrollTo({
                top: target.getBoundingClientRect().top + window.scrollY - navH,
                behavior: 'smooth'
            });
        });
    });
})();

// ─── SERVICE CARDS STAGGER ───────────────────────────────
(() => {
    document.querySelectorAll('.service-card').forEach((c, i) => {
        c.style.transitionDelay = `${i * 0.03}s`;
    });
})();

// ─── NEWSLETTER FORM ─────────────────────────────────────
(() => {
    const form = document.getElementById('newsletterForm');
    if (!form) return;
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = document.getElementById('subscribeBtn');
        btn.textContent = '✓ ISCRITTO!';
        btn.style.background = '#22c55e';
        setTimeout(() => { btn.textContent = 'ISCRIVITI'; btn.style.background = ''; form.reset(); }, 3000);
    });
})();

// ─── CURSOR GLOW (desktop only) ──────────────────────────
(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const glow = document.createElement('div');
    glow.style.cssText = `
    position: fixed;
    width: 360px; height: 360px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(176,38,255,0.07) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
    transform: translate(-50%, -50%);
    transition: opacity 0.3s;
    mix-blend-mode: screen;
  `;
    document.body.appendChild(glow);
    document.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });
})();

// ─── CONTACT FORM (AJAX) ─────────────────────────────────
(() => {
    const form = document.getElementById('contactForm');
    const successMsg = document.getElementById('contactSuccess');
    if (!form || !successMsg) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        // UI Feedback
        submitBtn.disabled = true;
        submitBtn.textContent = 'Invio in corso...';

        const formData = new FormData(form);

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // Successo: Nascondi il form e mostra il ringraziamento
                form.style.display = 'none';
                successMsg.style.display = 'flex';
                // Trigger reflow for animation
                void successMsg.offsetWidth;
                successMsg.style.opacity = '1';
                successMsg.style.transform = 'translateY(0)';
            } else {
                throw new Error('Errore durante l\'invio');
            }
        } catch (error) {
            console.error('Form Error:', error);
            alert('Ops! Si è verificato un errore. Prova a ricaricare la pagina o scrivi direttamente a Belpietrodigital@gmail.com');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
})();

// ─── INIT: hero reveal ───────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.hero .reveal-up').forEach((el, i) => {
        setTimeout(() => el.classList.add('visible'), 200 + i * 120);
    });
});
