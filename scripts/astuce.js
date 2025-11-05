// Reveal on scroll
    const io = new IntersectionObserver((entries)=> {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('show'); });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));

    // Mobile menu
    const btn = document.getElementById('menuBtn');
    const menu = document.getElementById('mobileMenu');
    if (btn && menu) btn.addEventListener('click', () => menu.classList.toggle('hidden'));
