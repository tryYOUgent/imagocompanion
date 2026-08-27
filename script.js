tailwind.config = {
  theme: {
    extend: {
      colors: {
        cream: '#FAF6EE', beige: '#F1E7D8', sage: '#8A9683', sagedeep:'#5D6B54',
        brand: '#5B7FA6', brandLight: '#7FA8CC', brandDark: '#3D5A7A',
        blush: '#E9D3C6', charcoal: '#2B2723', ink: '#4A443C'
      },
      fontFamily: { serif: ['Fraunces','serif'], sans: ['Inter','sans-serif'] },
      boxShadow: { soft: '0 20px 60px -25px rgba(43,39,35,0.25)' }
    }
  }
}

const mBtn = document.getElementById('mobileBtn'), mMenu = document.getElementById('mobileMenu');
  mBtn.addEventListener('click', () => mMenu.classList.toggle('hidden'));
  mMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mMenu.classList.add('hidden')));

  const targets = document.querySelectorAll('.anim-target');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('completed-now'), 400 + i * 500);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  targets.forEach(t => io.observe(t));