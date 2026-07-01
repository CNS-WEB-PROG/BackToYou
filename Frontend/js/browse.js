document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.items-grid');
  if (!grid) return;

  // Configuration Constants
  const ITEMS_PER_PAGE = 6; // Set how many items you want displayed on a single page
  let currentPage = 1;

  const searchInput = document.querySelector('.search-bar__input');
  const searchSelects = document.querySelectorAll('.search-bar .search-bar__select');
  const searchCategorySelect = searchSelects[0] || null;
  const searchDateSelect = searchSelects[1] || null;
  const searchBtn = document.querySelector('.search-bar .btn--primary');
  const sortSelect = document.querySelector('.browse-main__toolbar .search-bar__select');
  const countLabel = document.querySelector('.browse-count strong');
  const filterGroups = document.querySelectorAll('.filter-group');
  const paginationContainer = document.querySelector('.pagination');

  // Multi-filter click setups
  filterGroups.forEach((group) => {
    const chips = group.querySelectorAll('.filter-chip');
    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        chips.forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        currentPage = 1; // Reset window matrix index back to page 1 on filter alteration
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

  /**
   * Pipeline core that manages matching filter subsets and updates the pagination window frame
   */
  function applyFiltersAndPagination() {
    const searchText = (searchInput?.value || '').trim().toLowerCase();
    const status = getActiveChipText(0);
    const locationChip = getActiveChipText(1);
    const categoryChip = getActiveChipText(2);
    const dropdownCategory = searchCategorySelect?.value || '';
    const dropdownDate = searchDateSelect?.value || '';

    // Step 1: Filter evaluation mapping
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

      if (visible) {
        matchedCards.push(card);
      } else {
        card.style.display = 'none'; // Instantly shield failures from rendering context
      }
    });

    // Step 2: Render label calculations
    const visibleCount = matchedCards.length;
    if (countLabel) countLabel.textContent = `${visibleCount} item${visibleCount === 1 ? '' : 's'}`;
    toggleEmptyState(visibleCount === 0);

    // Step 3: Layout slice assignments mapping to standard active page arrays
    const totalPages = Math.ceil(visibleCount / ITEMS_PER_PAGE) || 1;
    if (currentPage > totalPages) currentPage = totalPages;

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    matchedCards.forEach((card, index) => {
      if (index >= startIndex && index < endIndex) {
        card.style.display = ''; // Fallback container grid rendering execution
      } else {
        card.style.display = 'none';
      }
    });

    // Step 4: Redraw active functional pagination DOM links
    renderPaginationInterface(totalPages);
  }

  /**
   * Recreates dynamic responsive pagination component anchors dynamically
   */
  function renderPaginationInterface(totalPages) {
    if (!paginationContainer) return;
    paginationContainer.innerHTML = '';

    // Don't render structural footer indicators if everything maps inside 1 page frame
    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
      btn.textContent = i;
      
      btn.addEventListener('click', () => {
        currentPage = i;
        applyFiltersAndPagination();
        scrollToToolbarTop();
      });
      paginationContainer.appendChild(btn);
    }

    // Append standard programmatic dynamic rsaquo next chevron pointer link
    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.innerHTML = '&rsaquo;';
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
    if (mainToolbar) {
      mainToolbar.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
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
    applyFiltersAndPagination(); // Run formatting metrics cleanly across re-sorted elements
  }

  // Intercept element search/input events cleanly
  searchInput?.addEventListener('input', () => { currentPage = 1; applyFiltersAndPagination(); });
  searchCategorySelect?.addEventListener('change', () => { currentPage = 1; applyFiltersAndPagination(); });
  searchDateSelect?.addEventListener('change', () => { currentPage = 1; applyFiltersAndPagination(); });
  searchBtn?.addEventListener('click', () => { currentPage = 1; applyFiltersAndPagination(); });
  sortSelect?.addEventListener('change', applySort);

  // Load backend elements from API endpoint context matrix mapping
  async function loadFromAPI() {
    try {
      const res  = await fetch('/backtoyou/Backend/api/get_items.php', { credentials: 'include' });
      const data = await res.json();
      if (!data.success || !data.items.length) {
        toggleEmptyState(true);
        return;
      }

      const EMOJI = {
        'electronics':'📱','bags':'🎒','clothing':'👕','keys & id':'🔑',
        'books':'📚','sports':'⚽','accessories':'🎧','wallet':'💳','other':'📦',
      };

      // Wipe layout frame structure clean for active injection pipeline
      grid.innerHTML = data.items.map(item => {
        const isLost = item.type === 'lost';
        const date   = new Date(item.date_occurred + 'T00:00:00')
                       .toLocaleDateString('en-GB', { day:'numeric', month:'short' });
        const emoji  = EMOJI[item.category.toLowerCase()] || '📦';
        const loc    = [item.location, item.location_detail].filter(Boolean).join(' — ');
        return `
          <article class="item-card ${isLost ? 'item-card--lost' : 'item-card--found'}">
            <div class="item-card__header">
              <span class="item-card__badge ${isLost ? 'item-card__badge--lost' : 'item-card__badge--found'}">
                ${isLost ? 'Lost' : 'Found'}
              </span>
              <span class="item-card__date">${date}</span>
            </div>
            <div class="item-card__emoji">${emoji}</div>
            <div class="item-card__body">
              <h3 class="item-card__title">${item.title}</h3>
              <p class="item-card__location">📍 ${loc}</p>
              <p class="item-card__desc">${item.description}</p>
              <div class="item-card__footer">
                <a href="#" class="btn btn--sm btn--ghost btn--block">View &amp; Contact</a>
              </div>
            </div>
          </article>
        `;
      }).join('');

      // Run unified baseline calculations cleanly across newly fetched API assets
      applySort(); 
    } catch (err) {
      console.error('Could not load items from API:', err);
      toggleEmptyState(true);
    }
  }

  loadFromAPI(); 
});