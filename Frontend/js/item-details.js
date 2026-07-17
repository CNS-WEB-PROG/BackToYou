document.addEventListener('DOMContentLoaded', () => {
  const card = document.getElementById('details-card');
  if (!card) return;

  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'), 10);

  if (!id) {
    card.innerHTML = '<p>No item specified.</p>';
    return;
  }

  async function loadItem() {
    try {
      // There's no single-item endpoint, so we fetch the full list and find
      // the one we want - fine at this project's scale (a school's lost &
      // found), and keeps the backend surface small.
    /*  const res = await fetch('../../Backend/api/get_items.php', {
        method: 'GET',
        credentials: 'include'
      });
      const data = await res.json();

      if (!data.success || !data.items) {
        card.innerHTML = '<p>Could not load this item right now. Please try again later.</p>';
        return;
      }

      const item = data.items.find((i) => i.id === id);

      if (!item) {
        card.innerHTML = '<p>This item could not be found — it may have been resolved or removed.</p>';
        return;
      }
*/
      const res = await fetch(`/backtoyou/Backend/api/get_item.php?id=${id}`, {
        method: 'GET',
        credentials: 'include'
      });
      const data = await res.json();
      if (!data.success || !data.item) {
        card.innerHTML = '<p>Could not load this item right now. Please try again later.</p>';
        return;
      }
      const item = data.item;

      const isLost  = item.type === 'lost';
      const dateStr = item.created_at || '';
      const date    = dateStr
        ? new Date(dateStr.slice(0,10) + 'T00:00:00')
            .toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
        : 'Date unknown';

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
      const emoji  = ICONS[(item.category || '').toLowerCase()] || '📦';
      const status = item.status || 'open';

      card.innerHTML = `
        <!-- Banner -->
        <div class="details-banner">
          <div class="details-banner__emoji">${emoji}</div>
          <div class="details-banner__info">
            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
              <span class="item-card__badge ${isLost ? 'item-card__badge--lost' : 'item-card__badge--found'}">
                ${isLost ? 'Lost' : 'Found'}
              </span>
              <span class="status-badge status-badge--${status}">${status}</span>
            </div>
            <h2 class="details-banner__title">${item.title}</h2>
            <div class="details-banner__meta">
              <span><i class="fa-solid fa-location-dot" style="color:#e53e3e;"></i> ${item.location}</span>
              <span><i class="fa-solid fa-calendar" style="color:#718096;"></i> ${date}</span>
              <span><i class="fa-solid fa-user" style="color:#718096;"></i> ${item.poster_name}</span>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="details-section">
          <div class="details-section__label">Description</div>
          <div class="details-section__text">${item.description}</div>
        </div>

        ${item.photo_path ? `
        <!-- Photo -->
        <div class="details-section">
          <div class="details-section__label">Photo</div>
          <img src="${item.photo_path}" alt="${item.title}"
              style="max-width:100%; border-radius:var(--radius-sm); margin-top:4px;" />
        </div>` : ''}

        <!-- Contact -->
        <div class="details-section">
          <div class="details-section__label">Contact the ${isLost ? 'owner' : 'finder'}</div>
          ${item.poster_email ? `
          <div class="details-contact">
            <div>
              <div class="details-contact__name">${item.poster_name}</div>
              <div class="details-contact__sub">${item.poster_email}</div>
            </div>
            <a href="mailto:${item.poster_email}?subject=${encodeURIComponent('BackToYou: ' + item.title)}"
              class="btn btn--primary">
              <i class="fa-solid fa-envelope"></i>&nbsp; Send Email
            </a>
          </div>` : `
          <div class="details-contact">
            <div>
              <div class="details-contact__name">${item.poster_name}</div>
              <div class="details-contact__sub">Log in to see contact details</div>
              </div>
              <a href="login.html" class="btn btn--ghost">Log in</a>
            </div>`}
          </div>
        `;
    } catch (err) {
      console.error('Could not load item:', err);
      card.innerHTML = '<p>Network error — please try again.</p>';
    }
  }

  loadItem();
});