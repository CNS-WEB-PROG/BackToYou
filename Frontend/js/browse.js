document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.items-grid');
  if (!grid) return;

  const ITEMS_PER_PAGE = 6;
  let currentPage = 1;

  // DOM Selection Matrix
  const searchInput = document.querySelector('.search-bar__input');
  const searchSelects = document.querySelectorAll('.search-bar .search-bar__select');
  const searchCategorySelect = searchSelects[0] || null;
  const searchDateSelect = searchSelects[1] || null;
  const searchBtn = document.querySelector('.search-bar .btn--primary');
  const sortSelect = document.querySelector('.browse-main_toolbar .search-bar_select');
  const countLabel = document.querySelector('.browse-count strong');
  const filterGroups = document.querySelectorAll('.filter-group');
  const paginationContainer = document.querySelector('.pagination');

  // Centralized Dynamic Icon Mapping Configuration
  const ICONS = {
    'electronics': '<i class="fas fa-laptop" style="color: #3182ce;"></i>',
    'bags & backpacks': '<i class="fas fa-backpack" style="color: #dd6b20;"></i>',
    'bags': '<i class="fas fa-backpack" style="color: #dd6b20;"></i>',
    'clothing': '<i class="fas fa-tshirt" style="color: #38a169;"></i>',
    'keys & id': '<i class="fas fa-key" style="color: #e53e3e;"></i>',
    'books & stationery': '<i class="fas fa-book" style="color: #805ad5;"></i>',
    'books': '<i class="fas fa-book" style="color: #805ad5;"></i>',
    'sports gear': '<i class="fas fa-football-ball" style="color: #d69e2e;"></i>',
    'sports': '<i class="fas fa-football-ball" style="color: #d69e2e;"></i>',
    'accessories': '<i class="fas fa-glasses" style="color: #319795;"></i>',
    'wallet': '<i class="fas fa-wallet" style="color: #b7791f;"></i>',
    'other': '<i class="fas fa-box" style="color: #718096;"></i>'
  };

  // Interactive Chip Selection Listeners
  filterGroups.forEach((group) => {
    const chips = group.querySelectorAll('.filter-chip');
    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        chips.forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        currentPage = 1;
        applyFiltersAndPagination();
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
    if (!raw) return new Date();
   
    const year = new Date().getFullYear();
    const parsed = new Date(${raw} ${year});
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }

  function matchesDateFilter(card, filterValue) {
    if (!filterValue) return true;
    const cardDate = parseCardDate(card);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
   
    const compareDate = new Date(cardDate.getTime());
    compareDate.setHours(0, 0, 0, 0);
    const diffDays = Math.round((today - compareDate) / 86400000);

    if (filterValue === 'Today') return diffDays === 0;
    if (filterValue === 'This week') return diffDays >= 0 && diffDays <= 7;
    if (filterValue === 'This month') return diffDays >= 0 && diffDays <= 31;
    return true;
  }

  // Unified Filtering and In-Memory Client-Side Pagination Pipeline
  function applyFiltersAndPagination() {
    const searchText = (searchInput?.value || '').trim().toLowerCase();
    const status = getActiveChipText(0);
    const locationChip = getActiveChipText(1);
    const categoryChip = getActiveChipText(2);
    const dropdownCategory = searchCategorySelect?.value || '';
    const dropdownDate = searchDateSelect?.value || '';

    const allCards = Array.from(grid.querySelectorAll('.item-card'));
    let matchedCards = [];

    allCards.forEach((card) => {
      const text = card.textContent.toLowerCase();
      const isLost = card.classList.contains('item-card--lost');
      const isFound = card.classList.contains('item-card--found');
      let visible = true;

      if (searchText && !text.includes(searchText)) visible = false;
      if (status === 'Lost only' && !isLost) visible = false;
      if (status === 'Found only' && !isFound) visible = false;
      if (locationChip && locationChip !== 'Anywhere' && !text.includes(locationChip.toLowerCase())) visible = false;
      if (categoryChip && categoryChip !== 'All' && !text.includes(categoryChip.toLowerCase())) visible = false;
      if (dropdownCategory && !text.includes(dropdownCategory.toLowerCase())) visible = false;
      if (!matchesDateFilter(card, dropdownDate)) visible = false;

      if (visible) {
        matchedCards.push(card);
      } else {
        card.style.display = 'none';
      }
    });

    const visibleCount = matchedCards.length;
    if (countLabel) countLabel.textContent = ${visibleCount} item${visibleCount === 1 ? '' : 's'};
    toggleEmptyState(visibleCount === 0);

    const totalPages = Math.ceil(visibleCount / ITEMS_PER_PAGE) || 1;
    if (currentPage > totalPages) currentPage = totalPages;

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    matchedCards.forEach((card, index) => {
      card.style.display = (index >= startIndex && index < endIndex) ? '' : 'none';
    });

    renderPaginationInterface(totalPages);
  }

  function renderPaginationInterface(totalPages) {
    if (!paginationContainer) return;
    paginationContainer.innerHTML = '';
    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.className = page-btn ${i === currentPage ? 'active' : ''};
      btn.textContent = i;
      btn.addEventListener('click', () => {
        currentPage = i;
        applyFiltersAndPagination();
        scrollToToolbarTop();
      });
      paginationContainer.appendChild(btn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.innerHTML = '<i class="fas fa-chevron-right" style="color: #4a5568;"></i>';
    if (currentPage === totalPages) {
      nextBtn.style.opacity = '0.4';
      nextBtn.style.cursor = 'not-allowed';
    } else {
      nextBtn.addEventListener('click', () => {
        currentPage++;
        applyFiltersAndPagination();
        scrollToToolbarTop();
      });
    }
    paginationContainer.appendChild(nextBtn);
  }

  function scrollToToolbarTop() {
    const mainToolbar = document.querySelector('.browse-main__toolbar');
    if (mainToolbar) mainToolbar.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function toggleEmptyState(show) {
    let empty = grid.querySelector('.empty-state');
    if (show && !empty) {
      empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.innerHTML = `
        <div class="empty-state__icon"><i class="fas fa-search" style="color: #a0aec0;"></i></div>
        <p class="empty-state__title">No items match your filters</p>
        <p>Try clearing a filter or searching a different keyword.</p>`;
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
    applyFiltersAndPagination();
  }

  // Hook Search and Select Input Events
  searchInput?.addEventListener('input', () => { currentPage = 1; applyFiltersAndPagination(); });
  searchCategorySelect?.addEventListener('change', () => { currentPage = 1; applyFiltersAndPagination(); });
  searchDateSelect?.addEventListener('change', () => { currentPage = 1; applyFiltersAndPagination(); });
  searchBtn?.addEventListener('click', () => { currentPage = 1; applyFiltersAndPagination(); });
  sortSelect?.addEventListener('change', applySort);

  // Asynchronous Database Feed Ingestion REST Pipeline
  async function loadFromAPI() {
    try {
      // Note: the real file is get_items.php (there is no items.php), and it
      // lives under Backend/api, not Frontend/api.
      const res = await fetch('../../Backend/api/get_items.php', {
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();
     
      if (!data.success || !data.items || !data.items.length) {
        toggleEmptyState(true);
        if (countLabel) countLabel.textContent = "0 items";
        return;
      }

      grid.innerHTML = data.items.map(item => {
        const isLost = item.type === 'lost';
       
        // Standardize dynamic dates explicitly using ISO bounds safely
        const date = new Date(item.date_occurred + 'T00:00:00')
                       .toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
       
        // Match icon dictionary safely
        const icon = ICONS[item.category.toLowerCase().trim()] || '<i class="fas fa-box" style="color: #718096;"></i>';
        const loc = [item.location, item.location_detail].filter(Boolean).join(' — ');
       
        return `
          <article class="item-card ${isLost ? 'item-card--lost' : 'item-card--found'}">
            <div class="item-card__header">
              <span class="item-card_badge ${isLost ? 'item-cardbadge--lost' : 'item-card_badge--found'}">
                ${isLost ? 'Lost' : 'Found'}
              </span>
              <span class="item-card__date">${date}</span>
            </div>
            <div class="item-card__emoji">${icon}</div>
            <div class="item-card__body">
              <h3 class="item-card__title">${item.title}</h3>
              <p class="item-card__location"><i class="fas fa-map-marker-alt" style="color: #e53e3e; margin-right: 4px;"></i>${loc}</p>
              <p class="item-card__desc">${item.description}</p>
              <div class="item-card__footer">
                <a href="item-details.html?id=${item.id}" class="btn btn--sm btn--ghost btn--block">View &amp; Contact</a>
              </div>
            </div>
          </article>`;
      }).join('');

      applySort();
    } catch (err) {
      console.error('Could not fetch items from API backend framework:', err);
      toggleEmptyState(true);
    }
  }

  // Initial Runtime Trigger Execution
  loadFromAPI();
});