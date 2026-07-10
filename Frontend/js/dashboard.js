document.addEventListener('DOMContentLoaded', () => {
  const storedName = sessionStorage.getItem('bty_name') || 'You';
  const firstName = storedName.split(' ')[0];
  const initials = storedName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  document.querySelector('.dash-user__name').textContent = storedName;
  document.querySelector('.dash-user__avatar').textContent = initials;
  document.querySelector('.nav__auth span').textContent = `Hi, ${firstName}`;

  async function loadMyItems() {
    try {
      const res = await fetch('/backtoyou/Backend/api/get_items.php', {
        credentials: 'include',
        method: 'GET'
      });
      const data = await res.json();
      if (!data.success) return;

      const items = data.items || [];
      const myName = storedName.toLowerCase();
      const myItems = items.filter(i => i.poster_name?.toLowerCase() === myName);
      const lostItems = myItems.filter(i => i.type === 'lost');
      const foundItems = myItems.filter(i => i.type === 'found');

      const statNums = document.querySelectorAll('.dash-stat__num');
      if (statNums[0]) statNums[0].textContent = lostItems.length;
      if (statNums[1]) statNums[1].textContent = foundItems.length;

      const lostCard = document.getElementById('my-lost');
      const lostRows = lostCard.querySelectorAll('.item-row');
      lostRows.forEach(r => r.remove());

      if (lostItems.length === 0) {
        lostCard.insertAdjacentHTML('beforeend',
          `<div style="padding:24px;text-align:center;color:var(--text-muted);font-size:0.85rem;">
            No lost items posted yet.
           </div>`
        );
      } else {
        lostItems.forEach(item => {
          let iconClass = 'fa-box';
          const titleLower = item.title.toLowerCase();
          if (titleLower.includes('bag') || titleLower.includes('pack')) iconClass = 'fa-bag-shopping';
          else if (titleLower.includes('phone') || titleLower.includes('laptop') || titleLower.includes('airpods') || titleLower.includes('head')) iconClass = 'fa-headphones';
          else if (titleLower.includes('cap') || titleLower.includes('hat') || titleLower.includes('shirt') || titleLower.includes('cloth')) iconClass = 'fa-shirt';

          lostCard.insertAdjacentHTML('beforeend', `
            <div class="item-row">
              <div class="item-row__emoji"><i class="fa-solid ${iconClass}"></i></div>
              <div class="item-row__info">
                <div class="item-row__title">${item.title}</div>
                <div class="item-row__meta">📍 ${item.location} · Posted ${new Date(item.created_at).toLocaleDateString('en-GB', {day:'numeric',month:'short'})}</div>
              </div>
              <div class="item-row__actions">
                <span class="item-card__badge item-card__badge--lost">Active</span>
              </div>
            </div>
          `);
        });
      }

      const foundCard = document.getElementById('my-found');
      const foundRows = foundCard.querySelectorAll('.item-row');
      foundRows.forEach(r => r.remove());

      if (foundItems.length === 0) {
        foundCard.insertAdjacentHTML('beforeend',
          `<div style="padding:24px;text-align:center;color:var(--text-muted);font-size:0.85rem;">
            No found items posted yet.
           </div>`
        );
      } else {
        foundItems.forEach(item => {
          let iconClass = 'fa-box';
          const titleLower = item.title.toLowerCase();
          if (titleLower.includes('bag') || titleLower.includes('pack')) iconClass = 'fa-bag-shopping';
          else if (titleLower.includes('phone') || titleLower.includes('laptop') || titleLower.includes('airpods') || titleLower.includes('head')) iconClass = 'fa-headphones';
          else if (titleLower.includes('cap') || titleLower.includes('hat') || titleLower.includes('shirt') || titleLower.includes('cloth')) iconClass = 'fa-shirt';

          foundCard.insertAdjacentHTML('beforeend', `
            <div class="item-row">
              <div class="item-row__emoji"><i class="fa-solid ${iconClass}"></i></div>
              <div class="item-row__info">
                <div class="item-row__title">${item.title}</div>
                <div class="item-row__meta">📍 ${item.location} · Posted ${new Date(item.created_at).toLocaleDateString('en-GB', {day:'numeric',month:'short'})}</div>
              </div>
              <div class="item-row__actions">
                <span class="item-card__badge item-card__badge--found">Found</span>
              </div>
            </div>
          `);
        });
      }
    } catch (err) {
      console.error('Could not load items:', err);
    }
  }

  document.querySelectorAll('a[href="login.html"]').forEach(link => {
    if (link.textContent.trim() === 'Log out') {
      link.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          await fetch('/backtoyou/Backend/api/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ _method: 'DELETE' }),
          });
        } catch (err) {
          console.error('Logout failed:', err);
        }
        sessionStorage.removeItem('bty_name');
        window.location.href = 'login.html';
      });
    }
  });

  loadMyItems();

  // ── Load real match alerts ─────────────────────────────────────────────────
  async function loadMatches() {
    try {
      const res  = await fetch('/backtoyou/Backend/api/get_matches.php', {
        method: 'GET',
        credentials: 'include'
      });
      const data = await res.json();

      const matchCard = document.getElementById('matches');
      if (!matchCard) return;

      // Remove hardcoded placeholder alerts
      matchCard.querySelectorAll('.match-alert').forEach(a => a.remove());

      const matchHeader = matchCard.querySelector('.dash-card__header span:last-child');
      const statNums    = document.querySelectorAll('.dash-stat__num');

      if (!data.success || !data.matches || data.matches.length === 0) {
        if (matchHeader) matchHeader.textContent = '0 new';
        if (statNums[2]) statNums[2].textContent = '0';
        matchCard.insertAdjacentHTML('beforeend',
          `<div style="padding:24px;text-align:center;color:var(--text-muted);font-size:0.85rem;">
             No matches yet — post an item to get started.
           </div>`
        );
        return;
      }

      if (matchHeader) matchHeader.textContent = `${data.matches.length} new`;
      if (statNums[2]) statNums[2].textContent = data.matches.length;

      data.matches.forEach(match => {
        const time = new Date(match.created_at)
          .toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        matchCard.insertAdjacentHTML('beforeend', `
          <div class="match-alert">
            <div class="match-alert__icon"><i class="fa-solid fa-link"></i></div>
            <div class="match-alert__body">
              <div class="match-alert__title">
                Possible match: "${match.lost_title}" ↔ "${match.found_title}"
              </div>
              <div class="match-alert__desc">
                Lost at ${match.lost_location} · Found at ${match.found_location}
              </div>
              <div class="match-alert__time">${time}</div>
            </div>
            <div style="display:flex;gap:6px;">
              <a href="item-details.html?id=${match.lost_id}"  class="btn btn--sm btn--ghost">Lost</a>
              <a href="item-details.html?id=${match.found_id}" class="btn btn--sm btn--found">Found</a>
            </div>
          </div>
        `);
      });

    } catch (err) {
      console.error('Could not load matches:', err);
    }
  }

  loadMatches();
});