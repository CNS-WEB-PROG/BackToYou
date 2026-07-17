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

// Load recent items on the home page
document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('recent-items-grid');
  if (!grid) return; // only runs on index.html

  const ICONS = {
    'electronics': '<i class="fa-solid fa-mobile-screen-button"></i>',
    'bags':        '<i class="fa-solid fa-bag-shopping"></i>',
    'clothing':    '<i class="fa-solid fa-shirt"></i>',
    'keys & id':   '<i class="fa-solid fa-key"></i>',
    'books':       '<i class="fa-solid fa-book"></i>',
    'sports':      '<i class="fa-solid fa-football"></i>',
    'accessories': '<i class="fa-solid fa-headphones"></i>',
    'wallet':      '<i class="fa-solid fa-wallet"></i>',
    'other':       '<i class="fa-solid fa-box"></i>',
  };

  try {
    const res  = await fetch('/backtoyou/Backend/api/get_items.php?sort=newest', {
      method: 'GET',
      credentials: 'include'
    });
    const data = await res.json();
    if (!data.success || !data.items.length) return;

    const recent = data.items.slice(0, 4);

    grid.innerHTML = recent.map(item => {
      const isLost  = item.type === 'lost';
      const dateStr = item.created_at || '';
      const date    = dateStr
        ? new Date(dateStr.slice(0,10) + 'T00:00:00')
            .toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
        : '';
      const icon = ICONS[(item.category || '').toLowerCase().trim()]
        || '<i class="fa-solid fa-box"></i>';
      const desc = item.description.length > 100
        ? item.description.slice(0, 100) + '…'
        : item.description;

      return `
        <article class="item-card ${isLost ? 'item-card--lost' : 'item-card--found'}">
          <div class="item-card__header">
            <span class="item-card__badge ${isLost ? 'item-card__badge--lost' : 'item-card__badge--found'}">
              ${isLost ? 'Lost' : 'Found'}
            </span>
            <span class="item-card__date">${date}</span>
          </div>
          <div class="item-card__emoji">${icon}</div>
          <div class="item-card__body">
            <h3 class="item-card__title">${item.title}</h3>
            <p class="item-card__location"><i class="fa-solid fa-location-dot" style="color:#e53e3e;margin-right:4px;"></i>${item.location}</p>
            <p class="item-card__desc">${desc}</p>
            <div class="item-card__footer">
              <a href="pages/item-details.html?id=${item.id}" class="btn btn--sm btn--ghost btn--block">
                View &amp; Contact
              </a>
            </div>
          </div>
        </article>
      `;
    }).join('');

  } catch (err) {
    console.error('Could not load recent items:', err);
  }
});