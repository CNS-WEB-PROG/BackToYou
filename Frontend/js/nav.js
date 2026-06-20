document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.nav');
  const hamburger = document.querySelector('.nav__hamburger');
  const navLinks = document.querySelector('.nav__links');
  const navAuth = document.querySelector('.nav__auth');

  if (!nav || !hamburger || !navLinks) return;

  hamburger.setAttribute('aria-expanded', 'false');

  const closeMenu = () => {
    nav.classList.remove('nav--open');
    navLinks.style.display = '';
    navLinks.style.flexDirection = '';
    if (navAuth) {
      navAuth.style.display = '';
      navAuth.style.flexDirection = '';
    }
    hamburger.setAttribute('aria-expanded', 'false');
  };

  const openMenu = () => {
    nav.classList.add('nav--open');
    navLinks.style.display = 'flex';
    navLinks.style.flexDirection = 'column';
    if (navAuth) {
      navAuth.style.display = 'flex';
      navAuth.style.flexDirection = 'column';
    }
    hamburger.setAttribute('aria-expanded', 'true');
  };

  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    nav.classList.contains('nav--open') ? closeMenu() : openMenu();
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', (e) => {
    if (nav.classList.contains('nav--open') && !nav.contains(e.target)) {
      closeMenu();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeMenu();
  });
});