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
      const res = await fetch('/backtoyou/Backend/api/get_items.php', {
        method: 'POST',
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

      const isLost = item.type === 'lost';
      const date = new Date(item.date_occurred + 'T00:00:00')
        .toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      const loc = [item.location, item.location_detail].filter(Boolean).join(' — ');

      card.innerHTML = `
        <div class="details-card__header">
          <span class="item-card_badge ${isLost ? 'item-cardbadge--lost' : 'item-card_badge--found'}">
            ${isLost ? 'Lost' : 'Found'}
          </span>
          <span class="item-card__date">${date}</span>
        </div>
        <h2 class="details-card__title">${item.title}</h2>
        <p class="details-card__meta"><i class="fa-solid fa-location-dot"></i> ${loc || 'Location not specified'}</p>
        <p class="details-card__meta"><i class="fa-solid fa-tag"></i> ${item.category}</p>
        <p class="details-card__desc">${item.description}</p>
        <div class="details-card__contact">
          <p style="margin-bottom:8px;"><strong>Posted by:</strong> ${item.poster_name}</p>
          ${item.poster_email
            ? `<a class="btn btn--primary" href="mailto:${item.poster_email}?subject=${encodeURIComponent('BackToYou: ' + item.title)}">
                <i class="fa-solid fa-envelope"></i>&nbsp; Contact ${item.poster_name.split(' ')[0]}
               </a>`
            : '<p style="color:var(--text-secondary);">Contact info unavailable for this listing.</p>'
          }
        </div>
      `;
    } catch (err) {
      console.error('Could not load item:', err);
      card.innerHTML = '<p>Network error — please try again.</p>';
    }
  }

  loadItem();
});