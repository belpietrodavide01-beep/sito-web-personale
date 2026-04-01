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
// Only a gentle opacity fade — no translateY/scale that blocks inner-page sections
(() => {
    const sections = Array.from(document.querySelectorAll('.section-blur'));
    if (!sections.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'none';
            } else {
                entry.target.style.opacity = '';
                entry.target.style.transform = '';
            }
        });
    }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

    sections.forEach(sec => {
        sec.style.transition = 'opacity 0.5s ease';
        observer.observe(sec);
    });
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

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let isMouseIn = false;
    let animationFrameId = null;

    const lerp = (start, end, factor) => start + (end - start) * factor;

    const renderParallax = () => {
        currentX = lerp(currentX, targetX, 0.1);
        currentY = lerp(currentY, targetY, 0.1);

        content.style.translate = `${currentX * 6}px ${currentY * 4}px`;
        
        document.querySelectorAll('.cube').forEach((c, i) => {
            const d = 1 + i * 0.5;
            c.style.translate = `${currentX * 14 * d}px ${currentY * 10 * d}px`;
            // Clear any old inline transforms so CSS frame animations work smoothly
            c.style.transform = ''; 
        });
        
        document.querySelectorAll('.shape').forEach((s, i) => {
            const d = 0.5 + i * 0.3;
            // hardware-accelerated translate instead of costly reflow margins!
            s.style.translate = `${currentX * 20 * d}px ${currentY * 12 * d}px`;
            s.style.marginLeft = ''; 
            s.style.marginTop = '';
        });

        // Continue running loop if still moving or not yet back to zero
        if (isMouseIn || Math.abs(targetX - currentX) > 0.001) {
            animationFrameId = requestAnimationFrame(renderParallax);
        } else {
            animationFrameId = null;
        }
    };

    hero.addEventListener('mousemove', (e) => {
        targetX = (e.clientX - window.innerWidth / 2) / window.innerWidth;
        targetY = (e.clientY - window.innerHeight / 2) / window.innerHeight;
        isMouseIn = true;
        if (!animationFrameId) renderParallax();
    });
    
    hero.addEventListener('mouseleave', () => {
        isMouseIn = false;
        targetX = 0; 
        targetY = 0;
        if (!animationFrameId) renderParallax();
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
    const targets = [10, 30, 100];
    const suffix = ['+', '%', '%'];
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
            alert('Ops! Si è verificato un errore. Prova a ricaricare la pagina o scrivi direttamente a info@bdigitalstudio.it');
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

// ─── FAQ ACCORDION ────────────────────────────────────────
(() => {
    const items = document.querySelectorAll('.faq-item');
    if (!items.length) return;

    items.forEach(item => {
        const btn = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        if (!btn || !answer) return;

        btn.addEventListener('click', () => {
            const isOpen = item.classList.contains('open');

            // Close all other items
            items.forEach(other => {
                if (other !== item) {
                    other.classList.remove('open');
                    const otherBtn = other.querySelector('.faq-question');
                    const otherAnswer = other.querySelector('.faq-answer');
                    if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
                    if (otherAnswer) otherAnswer.classList.remove('open');
                }
            });

            // Toggle current
            if (isOpen) {
                item.classList.remove('open');
                btn.setAttribute('aria-expanded', 'false');
                answer.classList.remove('open');
            } else {
                item.classList.add('open');
                btn.setAttribute('aria-expanded', 'true');
                answer.classList.add('open');
            }
        });
    });
})();

// ─── ACTIVE NAV LINK ─────────────────────────────────────
(() => {
    const path = window.location.pathname;
    const file = path.split('/').pop() || 'index.html';
    const currentPage = file === '' ? 'index.html' : file;

    document.querySelectorAll('.nav-links a').forEach(a => {
        const href = a.getAttribute('href');
        if (href === currentPage) {
            a.classList.add('active');
        }
    });
})();

// ─── PORTFOLIO FILTERS (progetti.html) ───────────────────
(() => {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-full-card');
    if (!filterBtns.length || !projectCards.length) return;

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;

            projectCards.forEach(card => {
                const categories = card.dataset.category || '';
                if (filter === 'tutti' || categories.includes(filter)) {
                    card.style.display = '';
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(16px)';
                    requestAnimationFrame(() => {
                        card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    });
                } else {
                    card.style.transition = 'opacity 0.2s ease';
                    card.style.opacity = '0';
                    setTimeout(() => { card.style.display = 'none'; }, 200);
                }
            });
        });
    });
})();

