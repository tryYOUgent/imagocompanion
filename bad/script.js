tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: '#7C9EB2',
            brandDeep: '#5A7F96',
            brandSoft: '#E8F0F5',
            warm: '#C4A882',
            warmSoft: '#F5EFE6',
          },
          boxShadow: {
            soft: '0 4px 24px rgba(0,0,0,.06)',
            card: '0 2px 16px rgba(0,0,0,.07), 0 1px 4px rgba(0,0,0,.04)',
            cardHover: '0 12px 40px rgba(0,0,0,.12), 0 4px 12px rgba(0,0,0,.06)',
          },
          fontFamily: {
            sans: ['Inter', 'system-ui', 'sans-serif'],
            serif: ['Georgia', 'Cambria', 'serif'],
          }
        }
      }
    };

// Year
    document.getElementById('year').textContent = new Date().getFullYear();

    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', () => {
      const root = document.documentElement;
      const isDark = root.classList.toggle('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    // Theme init
    (function () {
      const saved = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (saved === 'dark' || (!saved && prefersDark)) {
        document.documentElement.classList.add('dark');
      }
    })();

    // Fade-in on load (hero only)
    window.addEventListener('load', () => {
      const els = document.querySelectorAll('.fade-up');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          els.forEach(el => el.classList.add('visible'));
        });
      });
    });

    // ── Unified IntersectionObserver ──────────────────────
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;

        if (el.classList.contains('section-entry')) {
          el.classList.add('in-view');
          io.unobserve(el);
          return;
        }

        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        io.unobserve(el);
      });
    }, {
      threshold: 0.10,
      rootMargin: '0px 0px -40px 0px'
    });

    // Observe section-entry blocks
    document.querySelectorAll('.section-entry').forEach(el => io.observe(el));

    // Observe tool cards with staggered delay
    document.querySelectorAll('.tool-card').forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(18px)';
      card.style.transition = [
        `opacity 0.55s ease ${i * 0.09}s`,
        `transform 0.55s cubic-bezier(0.22,1,0.36,1) ${i * 0.09}s`,
        'box-shadow 0.28s cubic-bezier(0.22,1,0.36,1)',
        'border-color 0.28s ease'
      ].join(', ');
      io.observe(card);
    });

    // Observe start cards with staggered delay
    document.querySelectorAll('.start-card').forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      card.style.transition = [
        `opacity 0.60s ease ${i * 0.11}s`,
        `transform 0.60s cubic-bezier(0.22,1,0.36,1) ${i * 0.11}s`,
        'box-shadow 0.30s cubic-bezier(0.22,1,0.36,1)',
        'border-color 0.30s ease'
      ].join(', ');
      io.observe(card);
    });

    // ── Smooth scroll for all internal anchor links ───────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href').slice(1);
        if (!targetId) return;
        const target = document.getElementById(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });