document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.items-grid');
  if (!grid) return;

  const searchInput = document.querySelector('.search-bar__input');
  const searchSelects = document.querySelectorAll('.search-bar .search-bar__select');
  const searchCategorySelect = searchSelects[0] || null;
  const searchDateSelect = searchSelects[1] || null;
  const searchBtn = document.querySelector('.search-bar .btn--primary');
  const sortSelect = document.querySelector('.browse-main__toolbar .search-bar__select');
  const countLabel = document.querySelector('.browse-count strong');
  const filterGroups = document.querySelectorAll('.filter-group');
  const paginationBtns = document.querySelectorAll('.pagination .page-btn');

  filterGroups.forEach((group) => {
    const chips = group.querySelectorAll('.filter-chip');
    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        chips.forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        applyFilters();
      });
    });
  });

  function getActiveChipText(groupIndex) {
    const group = filterGroups[groupIndex];
    if (!group) return null;
    const active = group.querySelector('.filter-chip.active');
    if (!active) return null;
    return active.textContent.trim().replace(/^[^\w]+/, '').trim();
  }

  function parseCardDate(card) {
    const raw = card.querySelector('.item-card__date')?.textContent.trim();
    if (!raw) return null;
    const year = new Date().getFullYear();
    const parsed = new Date(`${raw} ${year}`);
    return isNaN(parsed) ? null : parsed;
  }

  function matchesDateFilter(card, filterValue) {
    if (!filterValue) return true;
    const cardDate = parseCardDate(card);
    if (!cardDate) return true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.round((today - cardDate) / 86400000);

    if (filterValue === 'Today') return diffDays === 0;
    if (filterValue === 'This week') return diffDays >= 0 && diffDays <= 7;
    if (filterValue === 'This month') return diffDays >= 0 && diffDays <= 31;
    return true;
  }

  function applyFilters() {
    const searchText = (searchInput?.value || '').trim().toLowerCase();
    const status = getActiveChipText(0);
    const locationChip = getActiveChipText(1);
    const categoryChip = getActiveChipText(2);
    const dropdownCategory = searchCategorySelect?.value || '';
    const dropdownDate = searchDateSelect?.value || '';

    let visibleCount = 0;

    grid.querySelectorAll('.item-card').forEach((card) => {
      const text = card.textContent.toLowerCase();
      const isLost = card.classList.contains('item-card--lost');
      const isFound = card.classList.contains('item-card--found');

      let visible = true;

      if (searchText && !text.includes(searchText)) visible = false;
      if (status === 'Lost only' && !isLost) visible = false;
      if (status === 'Found only' && !isFound) visible = false;

      if (locationChip && locationChip !== 'Anywhere' && !text.includes(locationChip.toLowerCase())) {
        visible = false;
      }
      if (categoryChip && categoryChip !== 'All' && !text.includes(categoryChip.toLowerCase())) {
        visible = false;
      }
      if (dropdownCategory && !text.includes(dropdownCategory.toLowerCase())) {
        visible = false;
      }
      if (!matchesDateFilter(card, dropdownDate)) visible = false;

      card.style.display = visible ? '' : 'none';
      if (visible) visibleCount += 1;
    });

    if (countLabel) countLabel.textContent = `${visibleCount} item${visibleCount === 1 ? '' : 's'}`;
    toggleEmptyState(visibleCount === 0);
  }

  function toggleEmptyState(show) {
    let empty = grid.querySelector('.empty-state');
    if (show && !empty) {
      empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.innerHTML = `
        <div class="empty-state__icon">🔍</div>
        <p class="empty-state__title">No items match your filters</p>
        <p>Try clearing a filter or searching a different keyword.</p>
      `;
      grid.appendChild(empty);
    } else if (!show && empty) {
      empty.remove();
    }
  }

  function applySort() {
    if (!sortSelect) return;
    const cards = Array.from(grid.querySelectorAll('.item-card'));
    cards.sort((a, b) => {
      const dateA = parseCardDate(a) || new Date(0);
      const dateB = parseCardDate(b) || new Date(0);
      return sortSelect.value === 'Oldest first' ? dateA - dateB : dateB - dateA;
    });
    cards.forEach((card) => grid.appendChild(card));
  }

  paginationBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.textContent.trim() === '›') {
        const active = document.querySelector('.pagination .page-btn.active');
        const next = active?.nextElementSibling;
        if (next?.classList.contains('page-btn') && /^\d+$/.test(next.textContent.trim())) {
          paginationBtns.forEach((b) => b.classList.remove('active'));
          next.classList.add('active');
        }
        return;
      }
      paginationBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  searchInput?.addEventListener('input', applyFilters);
  searchCategorySelect?.addEventListener('change', applyFilters);
  searchDateSelect?.addEventListener('change', applyFilters);
  searchBtn?.addEventListener('click', applyFilters);
  sortSelect?.addEventListener('change', applySort);

  applyFilters();
});