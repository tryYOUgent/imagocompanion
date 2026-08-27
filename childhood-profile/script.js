tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: '#5B7FA6',
            brandLight: '#7FA8CC',
            brandDark: '#3D5A7A',
            accent: '#8B9E6E',
            accentLight: '#A8BB8A',
            warm: '#C4956A',
          },
          boxShadow: {
            soft: '0 4px 20px rgba(0,0,0,.06)',
            card: '0 2px 12px rgba(0,0,0,.08)',
          }
        }
      }
    };

(function () {
      const saved = localStorage.getItem('imago-theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (saved === 'dark' || (!saved && prefersDark)) {
        document.documentElement.classList.add('dark');
      }
    })();