/**
 * HD MOVIEZ CLUB - Main Application Logic
 */

// Payment endpoints live on this same site (Vercel functions).
const API_BASE_URL = '/api';

// Firebase and the account store are set up in lib/firebase.js and lib/store.js.

// ============================================
// GLOBAL STATE - DECLARE ALL VARIABLES HERE
// ============================================

let currentUser = null;
let userPoints = 0;
const PLAN_RULES = {
    free: { name: 'Bure', price: 0, canWatch: true, canDownload: false, dailyLimit: 5 },
    weekly: { name: 'Wiki', price: 2000, canWatch: true, canDownload: true, dailyLimit: Infinity },
    monthly: { name: 'Mwezi', price: 5000, canWatch: true, canDownload: true, dailyLimit: Infinity }
};
let currentCategory = 'Zote';
let currentSoftwareCategory = 'Zote';
let searchQuery = '';
let selectedPackage = null;
// Account-scoped values are owned by HDStore (Firestore); these mirror them for rendering.
let currentPlan = 'free';
let freeDownloadsRemaining = 0;
let paymentHistory = [];
let appRendered = false;



let selectedPaymentMethod = null;
let purchasedContent = [];
let cartItems = [];

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 App initializing...');
    
    try {
        restoreAppState();
        await HDStore.init();          // restores the signed-in session + account data
        await renderInitialContent();
        setupEventListeners();
        console.log('✅ App ready');
    } catch (error) {
        console.error('❌ Init error:', error);
        showToast('Hitilafu katika kuanzisha programu', 'error');
    }
});

function restoreAppState() {
    // Account data now lives on the account (Firestore) — see lib/store.js.
    // HDStore.onChange() mirrors it into the globals below and re-renders.
    const guest = HDStore.guestData();
    purchasedContent = guest.purchased || [];
    cartItems = guest.cart || [];
    console.log('✅ State ready');
}

async function renderInitialContent() {
    try {
        renderFeaturedContent();
        renderCategoryCards();
        renderCategories();
        renderAllContent();
        renderSoftwareCategories();
        renderSoftware();
  updatePlanDisplay();
        updateCartDisplay();
        
        appRendered = true;
        const hash = window.location.hash.slice(1);
        if (hash) navigateTo(hash);
        else navigateTo('home');

        // Auto-open movie if shared via ?movie=ID link
        const urlParams = new URLSearchParams(window.location.search);
        const sharedMovieId = urlParams.get('movie');
        if (sharedMovieId) {
            setTimeout(() => {
                navigateTo('content');
                setTimeout(() => showContentDetail(sharedMovieId), 300);
            }, 400);
        }
    } catch (error) {
        console.error('Render error:', error);
    }
}

function setupEventListeners() {
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.user-profile-dropdown')) {
            closeProfileMenu();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Check if video player is open first
            const playerModal = document.getElementById('playerModal');
            if (playerModal) {
                // Video player handles its own escape
                return;
            }
            closeAuthModal();
            closePlansModal();
            closePaymentModal();
            closeDownloadModal();
            closeCartModal();
        }
    });
}

// ============================================
// NAVIGATION
// ============================================

function navigateTo(page) {
    try {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        const pageEl = document.getElementById(page + 'Page');
        if (pageEl) {
            pageEl.classList.add('active');
        }
        history.pushState({ page }, '', `#${page}`);
        window.scrollTo(0, 0);
        
        if (page === 'content') renderAllContent();
        else if (page === 'softwares') renderSoftware();
        else if (page === 'myContent') renderMyContent();
        else if (page === 'profile') renderProfile();
    } catch (error) {
        console.error('Navigation error:', error);
    }
}

window.addEventListener('popstate', (e) => {
    if (e.state && e.state.page) {
        navigateTo(e.state.page);
    }
});

// ============================================
// UI HELPERS
// ============================================

function toggleMobileMenu() {
    const drawer = document.getElementById('mobileMenuDrawer');
    const toggle = document.getElementById('mobileMenuToggle');
    if (drawer) {
        const isOpen = drawer.classList.toggle('active');
        document.body.style.overflow = isOpen ? 'hidden' : '';
        toggle?.setAttribute('aria-expanded', String(isOpen));
    }
}

function toggleProfileMenu() {
    const menu = document.getElementById('profileMenu');
    if (menu) menu.classList.toggle('active');
}

function closeProfileMenu() {
    const menu = document.getElementById('profileMenu');
    if (menu) menu.classList.remove('active');
}

// ============================================
// SEARCH
// ============================================

function handleHeroSearch(event) {
    if (event.key === 'Enter') {
        executeHeroSearch();
    }
}

function executeHeroSearch() {
    const input = document.getElementById('heroSearchInput');
    if (input && input.value.trim()) {
        searchQuery = input.value.toLowerCase();
        navigateTo('content');
    }
}

function handleSearch(query) {
    searchQuery = query.toLowerCase();
    renderAllContent();
}

// ============================================
// CATEGORIES
// ============================================

function renderCategories() {
    const container = document.getElementById('categoriesFilter');
    if (!container || !CATEGORIES) return;
    
    container.innerHTML = CATEGORIES.map(cat => `
        <button class="category-btn ${cat === currentCategory ? 'active' : ''}" 
                onclick="filterByCategory('${cat}')">
            ${cat}
        </button>
    `).join('');
}

function filterByCategory(category) {
    currentCategory = category;
    renderCategories();
    renderAllContent();
}

function renderSoftwareCategories() {
    const container = document.getElementById('softwareCategories');
    if (!container || !SOFTWARE_CATEGORIES) return;
    
    container.innerHTML = SOFTWARE_CATEGORIES.map(cat => `
        <button class="software-cat-btn ${cat === currentSoftwareCategory ? 'active' : ''}" 
                onclick="filterSoftwareByCategory('${cat}')">
            ${cat}
        </button>
    `).join('');
}

function filterSoftwareByCategory(category) {
    currentSoftwareCategory = category;
    renderSoftwareCategories();
    renderSoftware();
}

// ============================================
// CONTENT RENDERING
// ============================================

function renderFeaturedContent() {
    const container = document.getElementById('featuredContent');
    if (!container || !CONTENT || !CONTENT.length) return;
    
    const featured = CONTENT.slice(0, 6);
    container.innerHTML = featured.map(item => createContentCard(item)).join('');
}

function renderCategoryCards() {
    const container = document.getElementById('categoryCards');
    if (!container || !CATEGORIES) return;
    
    const categoryImages = {
        'Warembo': 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?q=80&w=600',
        'Bila huruma': 'https://images.unsplash.com/photo-1509248961725-aec71f8a27f3?q=80&w=600',
        'Tomba kabisa': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=600',
        'Baikoko': 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600',
        'Lazimishwa': 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=600'
    };
    
    container.innerHTML = CATEGORIES.filter(c => c !== 'Zote').map(cat => `
        <div class="category-card" onclick="filterByCategory('${cat}'); navigateTo('content');">
            <img src="${categoryImages[cat] || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600'}" 
                 alt="${cat}" loading="lazy">
            <div class="category-card-overlay">
                <span class="category-card-title">${cat}</span>
            </div>
        </div>
    `).join('');
}

function renderAllContent() {
    const container = document.getElementById('allContent');
    const noResults = document.getElementById('noResults');
    if (!container || !CONTENT) return;
    
    let filtered = [...CONTENT];
    
    if (currentCategory !== 'Zote') {
        filtered = filtered.filter(item => item.category === currentCategory);
    }
    
    if (searchQuery) {
        filtered = filtered.filter(item => 
            item.title.toLowerCase().includes(searchQuery) ||
            item.category.toLowerCase().includes(searchQuery) ||
            item.description.toLowerCase().includes(searchQuery)
        );
    }
    
    if (filtered.length === 0) {
        container.innerHTML = '';
        if (noResults) noResults.style.display = 'block';
    } else {
        if (noResults) noResults.style.display = 'none';
        container.innerHTML = filtered.map(item => createContentCard(item)).join('');
    }
}

function isLockedTrailer(item) {
  if (currentPlan === 'monthly') return false;
  const categoryItems = CONTENT.filter(content => content.category === item.category);
  return categoryItems.slice(4, 8).some(content => content.id === item.id);
}

function requestMonthlyAccess() {
  showToast('Trailer hii imefungwa. Chagua kifurushi cha Mwezi kufungua trailers zote.', 'info');
  openPlansMenu();
}

function createContentCard(item) {
  const isPurchased = purchasedContent.includes(item.id);
  const isInCart = cartItems.includes(item.id);
  const cardAction = `showContentDetail('${item.id}')`;
  const trailerLocked = isLockedTrailer(item);
  const description = item.description || 'Maelezo hayapo kwa sasa.';

  return `
 <div class="content-card" data-content-id="${item.id}" onclick="${cardAction}" role="button" tabindex="0" aria-label="Fungua ${item.title}" onkeydown="if(event.key === 'Enter' || event.key === ' '){event.preventDefault();${cardAction}}" onmouseenter="scheduleCardPreview('${item.id}', this)" onmouseleave="closeCardPreview(this)" onfocusin="scheduleCardPreview('${item.id}', this, true)" onfocusout="closeCardPreview(this)">
 <div class="content-card-image" onclick="event.stopPropagation();${cardAction}">
  <img src="${item.image}" alt="${item.title}" loading="lazy">
 <div class="content-card-play">
 <i class="fas fa-play"></i>
  </div>
  </div>
 <div class="content-card-content">
  <span class="content-card-category">${item.category}</span>
  <h3 class="content-card-title">${item.title}</h3>
  <p class="content-card-description">${description}</p>
  <div class="content-card-meta">
 <div class="content-card-rating">
  <i class="fas fa-star"></i> <span>${item.rating}</span>
  </div>
  <span>${item.year}</span>
  </div>
 <div class="content-card-actions">
 <button class="content-card-cart-btn ${isInCart ? 'in-cart' : ''}"
 onclick="event.stopPropagation(); ${isInCart ? `openCartModal()` : `addToCart('${item.id}')`}">
 <i class="fas ${isInCart ? 'fa-check' : 'fa-shopping-basket'}"></i>
 ${isInCart ? 'Kwenye Orodha' : 'Weka'}
  </button>
 <button class="content-card-preview-btn" onclick="event.stopPropagation(); toggleCardPreview('${item.id}', this)" aria-label="Onyesha trailer ya ${item.title}">
 <i class="fas fa-video"></i> Trailer
  </button>
  </div>
  </div>
 <div class="content-card-preview" id="cardPreview-${item.id}" aria-label="Muhtasari wa ${item.title}">
  <div class="card-preview-media" data-preview-slot>
 ${trailerLocked ? `
  <div class="card-preview-locked">
  <img src="${item.image}" alt="${item.title}">
  <div class="card-preview-lock-panel">
  <i class="fas fa-lock"></i>
  <span>Trailer imefungwa</span>
  <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); requestMonthlyAccess()">Angalia Vifurushi</button>
  </div>
  </div>
 ` : item.trailerUrl ? `
  <img class="card-preview-poster" src="${item.image}" alt="${item.title}" data-preview-poster>
 ` : `
  <img class="card-preview-poster" src="${item.image}" alt="${item.title}">
 `}
  </div>
  <div class="card-preview-body">
  <h4 class="card-preview-title">${item.title}</h4>
  <div class="card-preview-meta">
  <span class="card-preview-rating"><i class="fas fa-star"></i> ${item.rating}</span>
  <span>${item.year}</span>
  ${item.duration ? `<span>${item.duration}</span>` : ''}
  <span class="card-preview-cat">${item.category}</span>
  </div>
  <p class="card-preview-desc">${description}</p>
  <div class="card-preview-actions">
  <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); ${cardAction}"><i class="fas fa-play"></i> Tazama</button>
  <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); ${isInCart ? `openCartModal()` : `addToCart('${item.id}')`}"><i class="fas ${isInCart ? 'fa-check' : 'fa-bookmark'}"></i> ${isInCart ? 'Kwenye Orodha' : 'Weka'}</button>
  </div>
  </div>
  </div>
  </div>
  `;
}

// ============================================
// CARD HOVER PREVIEW — trailer + description
// ============================================

let cardPreviewTimer = null;

function prefersReducedMotion() {
  return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}

function isCoarsePointer() {
  return !!(window.matchMedia && window.matchMedia('(hover: none)').matches);
}

// Silent, autoplaying trailer for the hover panel.
function hoverTrailerSrc(url) {
  if (!url) return '';
  const clean = String(url).trim();
  if (clean.indexOf('youtube.com/embed') !== -1 || clean.indexOf('youtu.be') !== -1) {
    const idMatch = clean.match(/embed\/([^?&/]+)/) || clean.match(/youtu\.be\/([^?&/]+)/);
    const videoId = idMatch ? idMatch[1] : '';
    return clean + (clean.indexOf('?') === -1 ? '?' : '&')
      + 'autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&playsinline=1&loop=1'
      + (videoId ? '&playlist=' + videoId : '');
  }
  if (clean.indexOf('player.mux.com') !== -1) {
    return clean + (clean.indexOf('?') === -1 ? '?' : '&') + 'autoplay=true&muted=true&controls=false&loop=true';
  }
  return clean + (clean.indexOf('?') === -1 ? '?' : '&') + 'autoplay=1&mute=1';
}

function cardFrom(el) {
  if (!el || !el.classList) return null;
  return el.classList.contains('content-card') ? el : el.closest('.content-card');
}

function scheduleCardPreview(id, el, immediate) {
  const card = cardFrom(el);
  if (!card) return;
  if (cardPreviewTimer) clearTimeout(cardPreviewTimer);
  const delay = (immediate || isCoarsePointer() || prefersReducedMotion()) ? 0 : 520;
  cardPreviewTimer = setTimeout(() => openCardPreview(id, card), delay);
}

function openCardPreview(id, card) {
  const item = CONTENT.find(c => c.id === id);
  if (!item || !card) return;

  const panel = card.querySelector('.content-card-preview');
  if (!panel) return;

  const slot = panel.querySelector('[data-preview-slot]');
  const canPlay = item.trailerUrl && !isLockedTrailer(item) && !prefersReducedMotion();

  if (slot && canPlay && !slot.querySelector('iframe')) {
    const poster = slot.querySelector('[data-preview-poster]');
    const frame = document.createElement('iframe');
    frame.className = 'card-preview-iframe';
    frame.src = hoverTrailerSrc(item.trailerUrl);
    frame.title = `${item.title} trailer`;
    frame.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture; fullscreen');
    frame.setAttribute('allowfullscreen', '');
    frame.addEventListener('load', () => { if (poster) poster.classList.add('is-hidden'); });
    slot.appendChild(frame);
  }

  card.classList.add('preview-open');
}

function closeCardPreview(el) {
  if (cardPreviewTimer) { clearTimeout(cardPreviewTimer); cardPreviewTimer = null; }
  const card = cardFrom(el);
  if (!card) return;
  card.classList.remove('preview-open');
  // Removing the frame stops playback and frees the connection.
  const frame = card.querySelector('.card-preview-iframe');
  if (frame) frame.remove();
}

// Touch devices have no hover, so the card carries a Trailer button.
function toggleCardPreview(id, btn) {
  const card = cardFrom(btn);
  if (!card) return;
  if (card.classList.contains('preview-open')) closeCardPreview(card);
  else openCardPreview(id, card);
}

function showContentDetail(id, seasonIdx = 0, episodeIdx = 0) {
    const item = CONTENT.find(c => c.id === id);
    if (!item) {
        showToast('Filamu haipatikani', 'error');
        return;
    }
    
    const isPurchased = purchasedContent.includes(item.id);
    const isInCart = cartItems.includes(item.id);
    const activeRules = PLAN_RULES[currentPlan] || PLAN_RULES.free;
    const canDownload = hasDownloadAccess();
    const trailerLocked = isLockedTrailer(item);
    
    // Handle series content
    const isSeries = item.isSeries && item.seasons && item.seasons.length > 0;
    let currentEpisode = null;
    let hasEmbed = false;
    let hasSubtitles = item.subtitles && item.subtitles.length > 0;
    
    if (isSeries) {
        currentSeriesState = { seriesId: id, seasonIndex: seasonIdx, episodeIndex: episodeIdx };
        const currentSeason = item.seasons[seasonIdx];
        if (currentSeason && currentSeason.episodes[episodeIdx]) {
            currentEpisode = currentSeason.episodes[episodeIdx];
            hasEmbed = currentEpisode.embedUrl && currentEpisode.embedUrl.length > 0;
        }
    } else {
        hasEmbed = item.embedUrl && item.embedUrl.length > 0;
    }
    
    // Build subtitles HTML
    const subtitlesHtml = hasSubtitles ? `
        <div class="content-subtitles">
            <span class="subtitles-label"><i class="fas fa-closed-captioning"></i> Subtitles:</span>
            ${item.subtitles.map(sub => `<span class="subtitle-badge">${sub.label}</span>`).join('')}
        </div>
    ` : '';
    
    // Build season/episode selector for series
    const seasonEpisodeHtml = isSeries ? `
        <div class="series-selector">
            <div class="season-selector">
                <button class="season-dropdown-btn" onclick="toggleSeasonDropdown()">
                    <span class="season-label">
                        <i class="fas fa-layer-group"></i>
                        S${String(seasonIdx + 1).padStart(2, '0')}E${String(episodeIdx + 1).padStart(2, '0')} - ${currentEpisode ? currentEpisode.title : 'Episode'}
                    </span>
                    <i class="fas fa-chevron-down season-arrow"></i>
                </button>
                <div class="season-dropdown" id="seasonDropdown">
                    ${item.seasons.map((season, sIdx) => `
                        <div class="season-group ${sIdx === seasonIdx ? 'active' : ''}">
                            <div class="season-header" onclick="toggleSeasonEpisodes(${sIdx})">
                                <span><i class="fas fa-folder"></i> ${season.title}</span>
                                <span class="episode-count">${season.episodes.length} eps</span>
                            </div>
                            <div class="episode-list ${sIdx === seasonIdx ? 'expanded' : ''}" id="episodeList-${sIdx}">
                                ${season.episodes.map((ep, eIdx) => `
                                    <button class="episode-item ${sIdx === seasonIdx && eIdx === episodeIdx ? 'active' : ''}" 
                                            onclick="selectEpisode('${id}', ${sIdx}, ${eIdx})">
                                        <span class="ep-number">E${String(eIdx + 1).padStart(2, '0')}</span>
                                        <span class="ep-title">${ep.title}</span>
                                        <span class="ep-size">${ep.fileSize || '---'}</span>
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    ` : '';
    
    // Episode description for series
    const descriptionText = isSeries && currentEpisode ? currentEpisode.description : item.description;
    const durationText = isSeries && currentEpisode ? currentEpisode.duration : item.duration;
    

    
    const container = document.getElementById('contentDetailContent');
    container.innerHTML = `
        <div class="content-detail">
            <div class="content-detail-header">
                <div class="content-detail-bg">
                    <img src="${item.image}" alt="${item.title}" loading="lazy">
                </div>
                <div class="content-detail-container">
                    <div class="content-detail-media ${trailerLocked ? 'content-detail-media-locked' : ''}" id="cdMedia">
                        ${trailerLocked ? `
                            <div class="trailer-16x9-wrapper detail-trailer-frame trailer-locked-state">
                                <img class="trailer-poster-fill" src="${item.image}" alt="${item.title} trailer imefungwa">
                                <div class="trailer-lock-panel">
                                    <span class="trailer-lock-icon" aria-hidden="true">
                                        <svg width="50" height="50" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false">
                                            <path fill-rule="evenodd" clip-rule="evenodd" d="M11 3.5V6H12.5C13.3284 6 14 6.67157 14 7.5V13.5C14 14.3284 13.3284 15 12.5 15H2.5C1.67157 15 1 14.3284 1 13.5V7.5C1 6.67157 1.67157 6 2.5 6H4V3.5C4 1.567 5.567 0 7.5 0C9.433 0 11 1.567 11 3.5ZM5 3.5C5 2.11929 6.11929 1 7.5 1C8.88071 1 10 2.11929 10 3.5V6H5V3.5Z" fill="#ffffff"/>
                                        </svg>
                                    </span>
                                    <span>Fungua kwa kifurushi cha Mwezi</span>
                                    <button class="btn btn-primary" onclick="requestMonthlyAccess()"><i class="fas fa-box-open"></i> Angalia Vifurushi</button>
                                </div>
                            </div>
                        ` : item.trailerUrl ? `
                            <div class="trailer-16x9-wrapper detail-trailer-frame">
                                <iframe class="trailer-16x9-iframe" src="${item.trailerUrl}" title="${item.title} trailer" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                            </div>
                        ` : `
                            <div class="trailer-16x9-wrapper detail-trailer-frame">
                                <img class="trailer-poster-fill" src="${item.image}" alt="${item.title}">
                            </div>
                        `}
                    </div>
                    <div class="content-detail-info">
                        <h1>${item.title}</h1>
                        <div class="content-detail-meta">
                            <span class="content-meta-item">
                                <i class="fas fa-calendar"></i> ${item.year}
                            </span>
                            <span class="content-meta-item">
                                <i class="fas fa-clock"></i> ${durationText}
                            </span>
                            <span class="content-meta-item">
                                <i class="fas fa-film"></i> ${item.category}
                            </span>
                            ${isSeries ? '<span class="content-meta-item series-badge"><i class="fas fa-tv"></i> Series</span>' : ''}
                        </div>
                        <div class="content-detail-rating">
                            <i class="fas fa-star"></i>
                            <span>${item.rating}</span>
                            <span style="color: #8c8c8c; margin-left: 8px;">(${item.reviews})</span>
                        </div>
                        <div class="content-share-row">
                            <span class="share-label"><i class="fas fa-share-alt"></i> Shiriki:</span>
                            <button class="share-btn share-wa" onclick="shareMovie('${item.id}', 'whatsapp')" title="Shiriki WhatsApp">
                                <i class="fab fa-whatsapp"></i> WhatsApp
                            </button>
                            <button class="share-btn share-copy" onclick="shareMovie('${item.id}', 'copy')" title="Nakili link">
                                <i class="fas fa-link"></i> Nakili Link
                            </button>
                        </div>
                        ${subtitlesHtml}
                        <p class="content-detail-description">${descriptionText}</p>
                        ${seasonEpisodeHtml}
                        ${item.isAdult ? '<p class="adult-warning"><i class="fas fa-exclamation-triangle"></i> Maudhui ya watu wazima - 18+ tu</p>' : ''}
                        <div class="content-detail-actions">
  <button class="btn btn-success btn-lg ${canDownload ? '' : 'download-disabled'}" aria-disabled="${canDownload ? 'false' : 'true'}" onclick="${canDownload ? `downloadContent('${item.id}')` : `showDownloadLocked('${item.id}')`}" title="${canDownload ? 'Pakua' : 'Jisajili kwanza upate Bonus ya download'}">
  ${downloadIconSvg()} <span>Pakua</span>
  </button>
  ${!canDownload ? `<button class="btn btn-buy-package btn-lg" onclick="${currentUser ? `openPlansMenuForContent('${item.id}')` : `openAuthModal('register')`}">
  <i class="fas fa-box-open"></i> ${currentUser ? 'Nunua Kifurushi' : 'Jisajili kwanza'}
  </button>` : ''}
  
<button class="btn btn-secondary btn-lg ${isInCart ? 'in-cart' : ''}" onclick="${isInCart ? `openCartModal()` : `addToCart('${item.id}'); openCartModal()`}">
  <i class="fas ${isInCart ? 'fa-check' : 'fa-bookmark'}"></i> ${isInCart ? 'Tazama Orodha' : 'Weka kwenye Orodha'}
  </button>
                            <button class="btn btn-outline btn-lg" onclick="navigateTo('content')">
                                <i class="fas fa-arrow-left"></i> Rudi
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    navigateTo('contentDetail');
}

// ── Share movie link ──────────────────────────────────────────────────────
function shareMovie(id, platform) {
    const item = CONTENT.find(c => c.id === id);
    if (!item) return;

    const siteUrl = window.location.origin + window.location.pathname;
    const shareUrl = siteUrl + '?movie=' + encodeURIComponent(id);
    const text = '"' + item.title + '" - Tazama au Pakua kwenye HD MOVIEZ CLUB!\n' + shareUrl;

    if (platform === 'whatsapp') {
        window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener');
    } else if (platform === 'copy') {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(shareUrl)
                .then(() => showToast('Link imenakiliwa!', 'success'))
                .catch(() => fallbackCopy(shareUrl));
        } else {
            fallbackCopy(shareUrl);
        }
    }
}

function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus(); ta.select();
    try { document.execCommand('copy'); showToast('Link imenakiliwa!', 'success'); }
    catch (e) { showToast('Nakili link hii: ' + text, 'info'); }
    document.body.removeChild(ta);
}

// ============================================
// SERIES SEASON/EPISODE FUNCTIONS
// ============================================

function toggleSeasonDropdown() {
    const dropdown = document.getElementById('seasonDropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
    }
}

function toggleSeasonEpisodes(seasonIndex) {
    const allLists = document.querySelectorAll('.episode-list');
    const allGroups = document.querySelectorAll('.season-group');
    
    allLists.forEach((list, idx) => {
        if (idx === seasonIndex) {
            list.classList.toggle('expanded');
        }
    });
    
    allGroups.forEach((group, idx) => {
        if (idx === seasonIndex) {
            group.classList.toggle('active');
        }
    });
}

function selectEpisode(seriesId, seasonIdx, episodeIdx) {
    // Close dropdown
    const dropdown = document.getElementById('seasonDropdown');
    if (dropdown) {
        dropdown.classList.remove('active');
    }
    
    // Reload content detail with selected episode
    showContentDetail(seriesId, seasonIdx, episodeIdx);
}

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    const dropdown = document.getElementById('seasonDropdown');
    const btn = e.target.closest('.season-dropdown-btn');
    
    if (dropdown && !btn && !e.target.closest('.season-dropdown')) {
        dropdown.classList.remove('active');
    }
});


// ============================================
// STREAMTAPE VIDEO PLAYER
// ============================================

// Resolve one consistent player source per content type.
function getStreamingSource(item, episode) {
    const source = episode || item;
    if (source.streamtapeUrl) {
        return { url: source.streamtapeUrl, provider: 'Streamtape' };
    }
    if (source.embedUrl) {
        return { url: source.embedUrl, provider: 'Streamtape' };
    }

    if (source.muxPlaybackId) {
        return { url: `https://stream.mux.com/${source.muxPlaybackId}.m3u8`, provider: 'Mux', mux: true };
    }
    if (source.trailerUrl) return { url: source.trailerUrl, provider: 'Trailer' };
    return null;
}

// Watch Online - opens the same premium player shell for every provider.
function watchOnline(id, seasonIdx = 0, episodeIdx = 0) {
    const item = CONTENT.find(c => c.id === id);
    if (!item) {
        showToast('Video haipatikani', 'error');
        return;
    }
    
    // Handle series content and resolve the provider without stale embed routes.
    let episode = null;
    let title = item.title;
    let duration = item.duration;
    let description = item.description;
    if (item.isSeries && item.seasons && item.seasons[seasonIdx]) {
        episode = item.seasons[seasonIdx].episodes[episodeIdx];
        if (episode) {
            title = `${item.title} - S${String(seasonIdx + 1).padStart(2, '0')}E${String(episodeIdx + 1).padStart(2, '0')}: ${episode.title}`;
            duration = episode.duration;
            description = episode.description;
        }
    }
    const streaming = getStreamingSource(item, episode);
    if (!streaming) {
        showToast('Video haipatikani', 'error');
        return;
    }
    
// Check plan rules before opening the player.
  if (!canStreamToday()) {
  showToast('Umefikia kikomo cha Mpango Bure', 'warning');
  showWatchLocked(id);
  return;
  }
  recordDailyWatch(item.id);
  
  // Create fullscreen player modal
    const playerModal = document.createElement('div');
    playerModal.id = 'playerModal';
    playerModal.className = 'player-modal-fullscreen';
    
    playerModal.innerHTML = `
        <div class="watch-online-player" id="videoPlayer">
            <div class="player-topbar">
                <div class="player-heading"><span class="player-kicker">Tazama Online</span><h2>${title}</h2></div>
                <div class="player-provider"><i class="fas fa-satellite-dish"></i> ${streaming.provider}</div>
                <button class="player-close-btn" onclick="closeVideoPlayer()" title="Funga" aria-label="Funga">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                </button>
            </div>
            <div class="player-video-area" id="videoArea"></div>
            <div class="player-link-meta">
  <span><i class="fas fa-circle"></i> ${streaming.provider} stream</span>
  <span>${item.year} · ${item.category}</span>
  <button class="player-download-action" type="button" onclick="handlePlayerDownloadClick('${item.id}', ${seasonIdx}, ${episodeIdx})" title="${currentUser ? `Pakua ${title}` : 'Jisajili kwanza upate Bonus ya download'}" aria-label="${currentUser ? `Pakua ${title}` : 'Jisajili kwanza upate Bonus ya download'}">
    <svg fill="currentColor" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M19 22H5a2 2 0 0 1-2-2v-3a1 1 0 0 1 2 0v3h14v-3a1 1 0 0 1 2 0v3a2 2 0 0 1-2 2ZM12 18a2 2 0 0 1-1.3-.48l-5.59-4.79a3 3 0 0 1-.33-4.23l1.3-1.52a3 3 0 0 1 2.05-1.04c.3-.02.59 0 .87.08V3a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3.02c.28-.08.57-.1.87-.08.8.07 1.53.44 2.05 1.04l1.3 1.52a3 3 0 0 1-.33 4.23l-5.59 4.79A2 2 0 0 1 12 18Zm-4.4-9.98-1.3 1.52a1 1 0 0 0 .11 1.41L12 15.74l5.59-4.79a1 1 0 0 0 .11-1.41l-1.3-1.52a1 1 0 0 0-1.4-.11l-1.35 1.16A1 1 0 0 1 12 8.31V3h-2v5.31a1 1 0 0 1-1.65.76L7.6 8.02Z"/></svg>
    <span>Pakua</span>
  </button>
</div>
  ${getWatchUsageHtml()}
            <section class="player-related-section" aria-labelledby="player-related-title">
                <div class="player-related-heading"><h3 id="player-related-title">Inayohusiana</h3><span>Swipe kuona zaidi</span></div>
                <div class="player-related-rail">
                    ${CONTENT.filter(related => related.id !== item.id && related.category === item.category).map(related => `
                        <button class="player-related-card" onclick="closeVideoPlayer(); showContentDetail('${related.id}')">
                            <span class="player-related-poster"><img src="${related.image}" alt="${related.title}" loading="lazy"></span>
                            <strong>${related.title}</strong>
                            <small>${related.year} · ${related.rating || '—'}</small>
                        </button>
                    `).join('')}
                </div>
            </section>
        </div>
    `;
    
    document.body.appendChild(playerModal);
    const videoArea = playerModal.querySelector('#videoArea');
    // Providers own the playback UI. We only provide the URL in a responsive embed surface.
    videoArea.innerHTML = `<iframe class="stream-embed-player" src="${streaming.url}" title="${title}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
    document.body.style.overflow = 'hidden';
    
    // Handle escape key to close player
    document.addEventListener('keydown', handlePlayerKeydown);
}

// Close video player
function closeVideoPlayer() {
    const modal = document.getElementById('playerModal');
    if (modal) {
        // Exit fullscreen if active
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
        modal.remove();
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handlePlayerKeydown);
    }
}

// ============================================
// VIDEO PROTECTION - Anti-Download/Screen Record
// ============================================

let touchStartTime = 0;
let longPressTimer = null;

// Handle touch start (detect long press attempts)
function handleVideoTouch(event) {
    touchStartTime = Date.now();
    
    // Cancel any existing long press timer
    if (longPressTimer) {
        clearTimeout(longPressTimer);
    }
    
    // If user holds for more than 400ms, show warning
    longPressTimer = setTimeout(() => {
        event.preventDefault();
        showToast('Video download imezuiwa', 'warning');
    }, 400);
}

// Handle touch end
function handleVideoTouchEnd(event) {
    if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
    }
}

// Initialize video protection
function initVideoProtection() {
    // Disable right-click globally on player
    document.addEventListener('contextmenu', function(e) {
        if (e.target.closest('#playerModal') || e.target.closest('.watch-online-player')) {
            e.preventDefault();
            showToast('Huwezi kupakua video hii', 'warning');
            return false;
        }
    });
    
    // Disable keyboard shortcuts for saving
    document.addEventListener('keydown', function(e) {
        if (document.getElementById('playerModal')) {
            // Block Ctrl+S, Ctrl+Shift+S, Ctrl+U, F12
            if ((e.ctrlKey && (e.key === 's' || e.key === 'S' || e.key === 'u' || e.key === 'U')) ||
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && (e.key === 'i' || e.key === 'I' || e.key === 'j' || e.key === 'J'))) {
                e.preventDefault();
                showToast('Kitendo kimezuiwa', 'warning');
                return false;
            }
        }
    });
    
    // Detect screen recording/sharing (basic detection)
    if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        // Monitor for display capture API usage
        const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;
        navigator.mediaDevices.getDisplayMedia = function() {
            showToast('Screen recording imegunduliwa', 'error');
            return Promise.reject(new Error('Screen recording blocked'));
        };
    }
    
    // Detect visibility changes (possible screen recording)
    document.addEventListener('visibilitychange', function() {
        const playerModal = document.getElementById('playerModal');
        if (playerModal && document.hidden) {
            // User switched away - could be screen recording
            // Just log, don't block as this could be false positive
        }
    });
}

// Call on page load
document.addEventListener('DOMContentLoaded', initVideoProtection);

// Handle keyboard shortcuts
function handlePlayerKeydown(e) {
    if (e.key === 'Escape') {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            closeVideoPlayer();
        }
    } else if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        togglePlay();
    } else if (e.key === 'f') {
        toggleFullscreen();
    } else if (e.key === 'm') {
        toggleMute();
    } else if (e.key === 'ArrowLeft') {
        skipBack();
    } else if (e.key === 'ArrowRight') {
        skipForward();
    }
}

function hasDownloadAccess() {
    return Boolean(currentUser && (PLAN_RULES[currentPlan]?.canDownload || freeDownloadsRemaining > 0));
}

function downloadIconSvg() {
    return `<svg class="download-flat-icon" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M19 22H5a2 2 0 0 1-2-2v-3a1 1 0 0 1 2 0v3h14v-3a1 1 0 0 1 2 0v3a2 2 0 0 1-2 2Z" fill="#2ca9bc"/><path d="m19.11 9.91-1.3-1.52a2 2 0 0 0-1.37-.69A2 2 0 0 0 15 8.16V3a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5.16a2 2 0 0 0-1.44-.46 2 2 0 0 0-1.37.69l-1.3 1.52a2 2 0 0 0 .22 2.82l5.59 4.79a2 2 0 0 0 2.6 0l5.59-4.79a2 2 0 0 0 .22-2.82Z" fill="#000"/></svg>`;
}

function handlePlayerDownloadClick(id, seasonIdx = 0, episodeIdx = 0) {
    if (!currentUser) {
        closeVideoPlayer();
        setTimeout(() => openAuthModal('register'), 0);
        return;
    }
    startDownload(id, seasonIdx, episodeIdx);
}

function showDownloadLocked(id) {
    if (!currentUser) {
        closeVideoPlayer();
        showToast('Jisajili kwanza ili upate Bonus ya download', 'warning');
        setTimeout(() => openAuthModal('register'), 0);
        return;
    }
    showToast('Chagua kifurushi ili upate download zaidi', 'warning');
    openPlansMenuForContent(id);
}

// Show locked watch modal
function showWatchLocked(id) {
    const item = CONTENT.find(c => c.id === id);
    if (!item) return;
    
    const modal = document.getElementById('downloadModal');
    const content = document.getElementById('downloadContent');
    
    content.innerHTML = `
        <div class="download-modal-content">
            <button class="modal-close-btn" onclick="closeDownloadModal()">
                <i class="fas fa-times"></i>
            </button>
            <div class="watch-locked">
                <div class="locked-icon">
                    <i class="fas fa-lock"></i>
                </div>
                <h2>Maudhui Yamefungwa</h2>
  <p>${currentPlan === 'free' ? 'Umefikia kikomo cha video 5 za Mpango Bure kwa siku.' : `Unahitaji mpango wa kulipia kutazama "${item.title}" online.`}</p>
  <p class="current-points">Mpango wako: <strong>${PLAN_RULES[currentPlan]?.name || 'Bure'}</strong></p>
  ${PLAN_RULES[currentPlan]?.canWatch ? `
  <button class="btn btn-success btn-lg" onclick="unlockAndWatch('${item.id}')">
                        <i class="fas fa-unlock"></i> Fungua na Utazame
                    </button>
                ` : `
                    <button class="btn btn-primary btn-lg" onclick="closeDownloadModal(); openPlansMenuForContent('${item.id}')">
                        <i class="fas fa-coins"></i> Nunua Kifurushi
                    </button>
                `}
                <button class="btn btn-outline" onclick="closeDownloadModal()">Funga</button>
            </div>
        </div>
    `;
    
    modal?.classList.add('active');
}

// Unlock content and watch
function unlockAndWatch(id) {
    const item = CONTENT.find(c => c.id === id);
    if (!item) return;
    
    if (userPoints < item.points) {
        showToast('Umefikia kikomo cha Mpango Bure', 'error');
        return;
    }
    
    // Deduct points and grant access
    deductPoints(item.points);
    
    closeDownloadModal();
    showToast(`Umefungua ${item.title}!`, 'success');
    
    // Now watch
    setTimeout(() => watchOnline(id), 300);
}

function playTrailer(url) {
    const modal = document.getElementById('downloadModal');
    const content = document.getElementById('downloadContent');
    
    content.innerHTML = `
        <div class="download-modal-content" style="padding: 0; max-width: 800px;">
            <button class="modal-close-btn" onclick="closeDownloadModal()" style="top: 8px; right: 8px; z-index: 10;">
                <i class="fas fa-times"></i>
            </button>
            <div style="width: 100%; aspect-ratio: 16/9; background: #000; border-radius: 12px; overflow: hidden;">
                <iframe width="100%" height="100%" src="${url}?autoplay=1" 
                        frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>
            </div>
        </div>
    `;
    
    modal?.classList.add('active');
}

// ============================================
// SOFTWARE
// ============================================

function renderSoftware() {
    const container = document.getElementById('softwareGrid');
    if (!container || !SOFTWARE) return;
    
    let filtered = [...SOFTWARE];
    
    if (currentSoftwareCategory !== 'Zote') {
        filtered = filtered.filter(item => item.category === currentSoftwareCategory);
    }
    
    container.innerHTML = filtered.map(item => createSoftwareCard(item)).join('');
}

function createSoftwareCard(item) {
    return `
        <div class="software-card" onclick="showSoftwareDetail('${item.id}')">
            <div class="software-card-header">
                <div class="software-icon" style="font-size: 24px;">
                    <i class="fas ${item.icon}"></i>
                </div>
                <div class="software-info">
                    <h3>${item.title}</h3>
                    <span>v${item.version}</span>
                </div>
                <div class="software-points-badge">
                    <i class="fas fa-coins"></i> ${item.points === 0 ? 'Bure' : item.points}
                </div>
            </div>
            <p>${item.description}</p>
            <div class="software-meta">
                <span><i class="fas fa-hdd"></i> ${item.size}</span>
                <span><i class="fas fa-laptop"></i> ${item.platform}</span>
            </div>
        </div>
    `;
}

function showSoftwareDetail(id) {
    const item = SOFTWARE.find(s => s.id === id);
    if (!item) return;
    
  const isPurchased = purchasedContent.includes(item.id);
  const canDownload = Boolean(PLAN_RULES[currentPlan]?.canDownload || isPurchased);
    
    const container = document.getElementById('softwareDetailContent');
    container.innerHTML = `
        <section class="software-detail-section">
            <div class="section-container">
                <div class="software-detail-card">
                    <div class="software-detail-header">
                        <div class="software-icon" style="width: 80px; height: 80px; font-size: 36px;">
                            <i class="fas ${item.icon}"></i>
                        </div>
                        <div class="software-detail-info">
                            <h1>${item.title}</h1>
                            <span>v${item.version}</span>
                        </div>
                    </div>
                    <p class="software-detail-description">${item.description}</p>
                    <div class="software-detail-meta">
                        <div class="meta-item"><span class="meta-label">Ukubwa</span> <span>${item.size}</span></div>
                        <div class="meta-item"><span class="meta-label">Platform</span> <span>${item.platform}</span></div>
                        <div class="meta-item"><span class="meta-label">Aina</span> <span>${item.category}</span></div>
                    </div>
                    ${item.points > 0 && !isPurchased ? `
                        <div class="content-detail-points" style="margin: 24px 0;">
                            <i class="fas fa-box-open"></i> Kifurushi
                        </div>
                    ` : ''}
                    <div class="content-detail-actions">
                        ${isPurchased ? `
                            <button class="btn btn-success btn-lg" onclick="startSoftwareDownload('${item.id}')">
                                <i class="fas fa-download"></i> Pakua
                            </button>
                        ` : canDownload ? `
                            <button class="btn btn-success btn-lg" onclick="downloadSoftware('${item.id}')">
                                <i class="fas fa-download"></i> Pakua
                            </button>
  ` : `
  <button class="btn btn-outline btn-lg" disabled aria-disabled="true" title="Pakua inapatikana kwa mpango wa Wiki au Mwezi">
  <i class="fas fa-download"></i> Pakua
  </button>
  <button class="btn btn-primary btn-lg" onclick="openPlansMenuForSoftware('${item.id}')">
  <i class="fas fa-box-open"></i> Chagua mpango
  </button>
  `}

                    </div>
                </div>
            </div>
        </section>
    `;
    
    navigateTo('softwareDetail');
}

// ============================================
// SUBSCRIPTION PLAN SYSTEM
// ============================================

function updatePointsDisplay() {
    updatePlanDisplay();
}

function openPlansMenu() {
    if (!currentUser) {
        showToast('Jisajili kwanza', 'warning');
        openAuthModal('login');
        return;
    }
    const modal = document.getElementById('plansModal');
    if (modal) {
        updatePlanDisplay();
        modal.classList.add('active');
    }
}

function closePlansModal() {
    const modal = document.getElementById('plansModal');
    if (modal) modal.classList.remove('active');
}

function selectPlan(planId) {
    if (planId === 'free') {
        currentPlan = 'free';
        saveAccount({ plan: 'free', planExpiresAt: null });
        closePlansModal();
        updatePlanDisplay();
        showToast('Umebadilisha kwenda Mpango wa Bure!', 'success');
        return;
    }
    const rules = PLAN_RULES[planId];
    const plan = { id: `plan-${planId}`, planId, planName: rules.name, name: rules.name, price: rules.price, rules };
    selectedPackage = plan;
    closePlansModal();
    openPaymentModal();
}

function updatePlanDisplay() {
    const label = currentPlan === 'weekly' ? 'Wiki' : currentPlan === 'monthly' ? 'Mwezi' : 'Bure';
    const pointsEl = document.getElementById('userPoints');
    if (pointsEl) pointsEl.textContent = label;
    const menuPlan = document.getElementById('menuUserPlan');
    if (menuPlan) menuPlan.textContent = label;
}

// ============================================
// PAYMENT
// ============================================

// Track selected currency data — TZS is the default
let currentCurrency = { value: 'TZS', flag: 'tz', prefix: '+255' };

function openPaymentModal() {
    if (!selectedPackage) return;
    
    const modal = document.getElementById('paymentModal');
    if (modal) {
        // Set amount from selected package
        const paymentAmountEl = document.getElementById('paymentAmount');
        if (paymentAmountEl) {
            paymentAmountEl.value = selectedPackage.price;
        }

        // Reset currency to TZS (Tanzania default)
        currentCurrency = { value: 'TZS', flag: 'tz', prefix: '+255' };
        applyCurrencyUI();

        // Update summary card
        updatePaymentSummary();

        // Show steps 1 & 2, hide phone + card steps
        document.getElementById('paymentStep1').style.display = 'block';
        document.getElementById('paymentStep2').style.display = 'block';
        document.getElementById('paymentStep3').style.display = 'none';
        
        // Reset selected method
        selectedPaymentMethod = null;
        document.querySelectorAll('.pm-method-card').forEach(el => {
            el.classList.remove('selected');
            el.setAttribute('aria-checked', 'false');
        });


        // Close currency dropdown if open
        closeCurrencyDropdown();

        modal.classList.add('active');
    }
}

function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function updatePaymentSummary() {
    if (!selectedPackage) return;

    const pointsEl     = document.getElementById('pmSummaryPoints');
    const amountDispEl = document.getElementById('pmSummaryAmount');
    const amountInput  = document.getElementById('paymentAmount');

    // Keep the readonly amount input in sync with the selected package price
    if (amountInput) {
        amountInput.value = selectedPackage.price.toLocaleString();
    }

    if (pointsEl) {
        pointsEl.textContent = selectedPackage.name;
    }
    if (amountDispEl) {
        amountDispEl.textContent = `${currentCurrency.value} ${selectedPackage.price.toLocaleString()}`;
    }
}

function toggleAccordion(stepId) {
    const content = document.getElementById(stepId + 'Content');
    if (content) {
        content.classList.toggle('active');
    }
}

function selectPaymentMethod(method, evt) {
    selectedPaymentMethod = method;
    document.querySelectorAll('.pm-method-card').forEach(el => {
        el.classList.remove('selected');
        el.setAttribute('aria-checked', 'false');
    });
    const card = document.getElementById('method-' + method);
    if (card) {
        card.classList.add('selected');
        card.setAttribute('aria-checked', 'true');
    }

    // Hide both input steps first
    document.getElementById('paymentStep3').style.display = 'none';
    goToPaymentPhoneInput(method);
}

function goToPaymentPhoneInput(method) {
    const titles = {
        vodacom:  'Enter Vodacom M-Pesa Number',
        tigo:     'Enter Tigo Pesa Number',
        airtel:   'Enter Airtel Money Number',
        mpesa:    'Enter M-Pesa Number',
        mtn:      'Enter MTN MoMo Number',
        halopesa: 'Enter Halopesa Number'
    };

    const titleEl  = document.getElementById('phoneInputTitle');
    const prefixEl = document.getElementById('phonePrefix');
    const hintEl   = document.getElementById('pmPhoneHint');
    const phoneEl  = document.getElementById('paymentPhone');

    if (titleEl)   titleEl.textContent  = titles[method] || 'Enter Phone Number';
    if (prefixEl)  prefixEl.textContent = currentCurrency.prefix;
    if (phoneEl)   phoneEl.placeholder  = '7XX XXX XXX';
    if (hintEl)    hintEl.textContent   = `Ingiza namba bila (0) ${currentCurrency.prefix} prefix`;

    document.getElementById('paymentStep3').style.display = 'block';
    document.getElementById('paymentPhone').value = '';
    document.getElementById('paymentPhone').focus();
}

let paymentRequestInFlight = false;

async function processPayment() {
    if (paymentRequestInFlight) return;
    if (!selectedPackage || !selectedPaymentMethod) {
        showToast('Chagua malipo', 'error');
        return;
    }
    if (!currentUser) {
        closePaymentModal();
        openAuthModal('login');
        return;
    }

    const btn = document.getElementById('makePaymentBtn');
    if (!btn) return;

    const phoneInput = document.getElementById('paymentPhone');
    const phoneValidation = validatePhoneNumber(phoneInput?.value || '');
    if (!phoneValidation.valid) {
        showToast(phoneValidation.error, 'error');
        phoneInput?.focus();
        return;
    }

    try {
        paymentRequestInFlight = true;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Inatuma...';

        const response = await fetch(`${API_BASE_URL}/payments/initiate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                packageId: selectedPackage.planId,
                phoneNumber: phoneInput.value,
                paymentMethod: selectedPaymentMethod,
                userId: currentUser.uid,
                buyerName: currentUser.name || '',
                buyerEmail: currentUser.email || ''
            })
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Malipo hayakuanzishwa. Jaribu tena.');
        }

        showToast(data.instructions || 'Angalia simu yako na uthibitishe malipo.', 'success');
        btn.innerHTML = '<i class="fas fa-hourglass-half"></i> Subiri uthibitisho...';
        closePaymentModal();
        pollPaymentStatus(data.paymentId);
        return;
    } catch (error) {
        console.error('Payment error:', error);
        showToast(error.message || 'Hitilafu ya malipo. Jaribu tena.', 'error');
    } finally {
        paymentRequestInFlight = false;
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-lock"></i> SEND';
    }
}

async function pollPaymentStatus(paymentId) {
    const maxAttempts = 24;   // 5s each => 2 minutes
    let attempts = 0;

    const poll = async () => {
        attempts++;
        try {
            const response = await fetch(`${API_BASE_URL}/payments/status?id=${encodeURIComponent(paymentId)}`);
            const data = await response.json().catch(() => ({}));

            if (data.status === 'completed') {
                // The package was switched on by the server; read the account back.
                await HDStore.refresh();
                updatePlanDisplay();
                updatePointsDisplay();
                if (document.getElementById('profilePage')?.classList.contains('active')) renderProfile();
                renderAllContent();
                const planName = PLAN_RULES[currentPlan]?.name || currentPlan;
                showToast(`Malipo yamekubaliwa! Kifurushi cha ${planName} kimewashwa.`, 'success');
                return;
            }

            if (data.status === 'failed') {
                showToast('Malipo yameshindwa. Jaribu tena.', 'error');
                return;
            }

            if (attempts < maxAttempts) {
                setTimeout(poll, 5000);
            } else {
                showToast('Bado tunasubiri uthibitisho. Angalia SMS yako.', 'warning');
            }
        } catch (error) {
            console.error('Payment status check failed:', error);
            if (attempts < maxAttempts) setTimeout(poll, 5000);
        }
    };

    poll();
}

function applyCurrencyUI() {
    const flagImg   = document.getElementById('pmCurrencyFlag');
    const codeEl    = document.getElementById('pmCurrencyCode');
    const prefixEl  = document.getElementById('phonePrefix');
    const hintEl    = document.getElementById('pmPhoneHint');

    if (flagImg)  { flagImg.src = `https://flagcdn.com/w40/${currentCurrency.flag}.png`; flagImg.alt = currentCurrency.value; }
    if (codeEl)     codeEl.textContent  = currentCurrency.value;
    if (prefixEl)   prefixEl.textContent = currentCurrency.prefix;
    if (hintEl)     hintEl.textContent   = `Enter number without ${currentCurrency.prefix} prefix`;

    // Sync options checked state
    document.querySelectorAll('.pm-currency-option').forEach(opt => {
        const isSelected = opt.dataset.value === currentCurrency.value;
        opt.classList.toggle('selected', isSelected);
        opt.setAttribute('aria-selected', isSelected ? 'true' : 'false');
    });

    updatePaymentSummary();
}

function toggleCurrencyDropdown() {
    // Mobile money is TZS only, so this dropdown is no longer in the page.
    const list    = document.getElementById('pmCurrencyList');
    const chevron = document.getElementById('pmCurrencyChevron');
    const trigger = document.getElementById('pmCurrencyTrigger');
    if (!list || !chevron || !trigger) return;
    const isOpen = list.classList.toggle('open');
    chevron.classList.toggle('rotated', isOpen);
    trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
}

function closeCurrencyDropdown() {
    const list    = document.getElementById('pmCurrencyList');
    const chevron = document.getElementById('pmCurrencyChevron');
    const trigger = document.getElementById('pmCurrencyTrigger');
    if (list)    list.classList.remove('open');
    if (chevron) chevron.classList.remove('rotated');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
}

function setCurrency(optionEl) {
    currentCurrency = {
        value:  optionEl.dataset.value,
        flag:   optionEl.dataset.flag,
        prefix: optionEl.dataset.prefix
    };
    applyCurrencyUI();
    closeCurrencyDropdown();
}

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    const dropdown = document.getElementById('pmCurrencyDropdown');
    if (dropdown && !dropdown.contains(e.target)) {
        closeCurrencyDropdown();
    }
});

function formatCardNumber(input) {
    let val = input.value.replace(/\D/g, '').substring(0, 16);
    input.value = val.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(input) {
    let val = input.value.replace(/\D/g, '').substring(0, 4);
    if (val.length >= 3) {
        val = val.substring(0, 2) + ' / ' + val.substring(2);
    }
    input.value = val;
}

// ============================================
// INPUT VALIDATION (Phone & Card)
// ============================================

// Phone validation — universal Tanzania mobile
// Provider selector is a UI indicator only. Mongike auto-detects carrier.
// Accepts: 0741234567 / 0775283354 / 775283354 / +255741234567

function validatePhoneNumber(phone, method) {
    const clean = phone.replace(/[\s\-()]/g, '');
    if (!clean) {
        return { valid: false, error: 'Ingiza nambari ya simu' };
    }
    let digits = clean;
    if (digits.startsWith('+255')) digits = digits.slice(4);
    else if (digits.startsWith('255') && digits.length >= 11) digits = digits.slice(3);
    else if (digits.startsWith('0')) digits = digits.slice(1);
    if (!/^[67]\d{8}$/.test(digits)) {
        return { valid: false, error: 'Ingiza nambari sahihi ya Tanzania, mfano: 0741234567' };
    }
    return { valid: true };
}

function validateCardNumber(number) {
    const digits = number.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(digits)) {
        return { valid: false, error: 'Nambari ya kadi si sahihi' };
    }
    
    // Luhn algorithm
    let sum = 0;
    let isEven = false;
    for (let i = digits.length - 1; i >= 0; i--) {
        let digit = parseInt(digits[i], 10);
        if (isEven) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        isEven = !isEven;
    }
    
    if (sum % 10 !== 0) {
        return { valid: false, error: 'Nambari ya kadi si sahihi' };
    }
    return { valid: true };
}

function validateExpiry(expiry) {
    const match = expiry.match(/(\d{2})\s*\/\s*(\d{2})/);
    if (!match) {
        return { valid: false, error: 'Format: MM / YY' };
    }
    
    const month = parseInt(match[1], 10);
    const year = parseInt('20' + match[2], 10);
    
    if (month < 1 || month > 12) {
        return { valid: false, error: 'Mwezi si sahihi (01-12)' };
    }
    
    const now = new Date();
    const expDate = new Date(year, month);
    
    if (expDate <= now) {
        return { valid: false, error: 'Kadi imeisha muda' };
    }
    return { valid: true };
}

function validateCVV(cvv) {
    if (!/^\d{3,4}$/.test(cvv)) {
        return { valid: false, error: 'CVV lazima iwe tarakimu 3-4' };
    }
    return { valid: true };
}

function updateCurrency() {
    // Legacy stub — kept for any old references
    applyCurrencyUI();
}

function openPlansMenuForContent(id) {
    sessionStorage.setItem('pendingContentDownload', id);
    openPlansMenu();
}

function openPlansMenuForSoftware(id) {
    sessionStorage.setItem('pendingSoftwareDownload', id);
    openPlansMenu();
}

// ============================================
// CART
// ============================================

function updateCartDisplay() {
    const badge = document.getElementById('cartBadge');
    const count = document.getElementById('cartItemCount');
    
    if (badge) {
        badge.textContent = cartItems.length;
        badge.style.display = cartItems.length > 0 ? 'flex' : 'none';
    }
    if (count) {
        count.textContent = cartItems.length;
    }
}

function addToCart(id) {
    const item = CONTENT.find(c => c.id === id);
    if (!item) return;
    
    if (cartItems.includes(id)) {
        showToast('Tayari kwenye Orodha ya Kutazama', 'warning');
        return;
    }
    
    if (purchasedContent.includes(id)) {
        showToast('Tayari umepakua', 'warning');
        return;
    }
    
    cartItems.push(id);
    saveAccount({ cart: cartItems });
  updateCartDisplay();
  renderAllContent();
  if (document.getElementById('contentDetailPage')?.classList.contains('active')) showContentDetail(id);
  showToast(`${item.title} imeongezwa kwenye Orodha ya Kutazama`, 'success');
  }
  
  function removeFromCart(id) {
  cartItems = cartItems.filter(itemId => itemId !== id);
  saveAccount({ cart: cartItems });
  updateCartDisplay();
  renderAllContent();
  renderCartItems();
  showToast('Imeondolewa kwenye Orodha ya Kutazama', 'success');
}

function openCartModal() {
    renderCartItems();
    document.getElementById('cartDrawer')?.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCartModal() {
    document.getElementById('cartDrawer')?.classList.remove('active');
    document.body.style.overflow = '';
}

function renderCartItems() {
    const container = document.getElementById('cartItems');
    const empty = document.getElementById('cartEmpty');
    const footer = document.getElementById('cartFooter');
    const total = document.getElementById('cartTotalPoints');
    
    if (!container) return;
    
    const items = cartItems.map(id => CONTENT.find(c => c.id === id)).filter(Boolean);
    
    if (items.length === 0) {
        container.innerHTML = '';
        if (empty) empty.style.display = 'flex';
        if (footer) footer.style.display = 'none';
    } else {
        if (empty) empty.style.display = 'none';
        if (footer) footer.style.display = 'block';
        

        container.innerHTML = items.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.title}" loading="lazy">
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.title}</div>
                                      <button class="cart-item-download ${hasDownloadAccess() ? '' : 'download-disabled'}" onclick="${hasDownloadAccess() ? `downloadContent('${item.id}')` : `showDownloadLocked('${item.id}')`}" aria-label="Pakua ${item.title}">
                        ${downloadIconSvg()} <span>Pakua</span>
                    </button>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart('${item.id}')" aria-label="Ondoa ${item.title}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    }
    
    updateCartDisplay();
}

function checkoutCart() {
    if (cartItems.length === 0) {
        showToast('Orodha ya kutazama ni tupu', 'warning');
        return;
    }
    
    const items = cartItems.map(id => CONTENT.find(c => c.id === id)).filter(Boolean);
    const totalPoints = items.reduce((sum, item) => sum + item.points, 0);
    
    if (userPoints < totalPoints) {
        showToast('Umefikia kikomo cha Mpango Bure', 'warning');
        closeCartModal();
        openPlansMenu();
        return;
    }
    
    deductPoints(totalPoints);
    items.forEach(item => {
        if (!purchasedContent.includes(item.id)) {
            purchasedContent.push(item.id);
        }
    });
    saveAccount({ purchased: purchasedContent });
    
    cartItems = [];
    saveAccount({ cart: cartItems });
    
    closeCartModal();
    updateCartDisplay();
    showToast(`Umepakua filamu ${items.length}!`, 'success');
    renderMyContent();
}

function renderMyContent() {
    const container = document.getElementById('myContentGrid');
    const empty = document.getElementById('emptyMyContent');
    if (!container) return;
    
    const myContent = CONTENT.filter(item => purchasedContent.includes(item.id));
    
    if (myContent.length === 0) {
        container.innerHTML = '';
        if (empty) empty.style.display = 'block';
    } else {
        if (empty) empty.style.display = 'none';
        container.innerHTML = myContent.map(item => createContentCard(item)).join('');
    }
}

// ============================================
// DOWNLOAD
// ============================================

function downloadContent(id) {
    const item = CONTENT.find(c => c.id === id);
    if (!item) return;

    if (!currentUser) {
        showToast('Jisajili kwanza ili upate Bonus ya download', 'warning');
        openAuthModal('register');
        return;
    }

    if (freeDownloadsRemaining > 0 && currentPlan === 'free') {
        freeDownloadsRemaining -= 1;
        if (currentUser) currentUser.freeDownloadsRemaining = freeDownloadsRemaining;
        saveAccount({
            freeDownloadsRemaining: freeDownloadsRemaining,
            purchased: purchasedContent
        });
        showDownloadModal(item);
        showToast(`Umepakua ${item.title} kwa Bonus ya kujisajili!`, 'success');
        renderProfile();
        return;
    }
    
    if (userPoints >= item.points) {
        deductPoints(item.points);
        showDownloadModal(item);
        showToast(`Umepakua ${item.title}!`, 'success');
    } else {
        openPlansMenuForContent(id);
    }
}

function downloadSoftware(id) {
    const item = SOFTWARE.find(s => s.id === id);
    if (!item) return;
    
    if (item.points === 0 || userPoints >= item.points) {
        if (item.points > 0) deductPoints(item.points);
        showSoftwareDownloadModal(item);
        showToast(`Umepakua ${item.title}!`, 'success');
    } else {
        openPlansMenuForSoftware(id);
    }
}

 function startDownload(id, seasonIdx = 0, episodeIdx = 0) {
  const item = CONTENT.find(c => c.id === id);
  if (!item) return;
  
  // Handle series with episodes
  if (item.isSeries && item.seasons && item.seasons[seasonIdx]) {
    const episode = item.seasons[seasonIdx].episodes[episodeIdx];
    if (episode) {
      // Create episode item with series info
      const episodeItem = {
        ...item,
        title: `${item.title} - S${String(seasonIdx + 1).padStart(2, '0')}E${String(episodeIdx + 1).padStart(2, '0')}: ${episode.title}`,
        description: episode.description,
        duration: episode.duration,
        downloadLinks: episode.downloadLinks || [],
        embedUrl: episode.embedUrl
      };
      showDownloadModal(episodeItem);
      return;
    }
  }
  
  showDownloadModal(item);
  }

function startSoftwareDownload(id) {
    const item = SOFTWARE.find(s => s.id === id);
    if (item) showSoftwareDownloadModal(item);
}

function showDownloadModal(item) {
    const modal = document.getElementById('downloadModal');
    const content = document.getElementById('downloadContent');
    
    // Build download links HTML
    const hasDownloadLinks = item.downloadLinks && item.downloadLinks.length > 0;
    const downloadLinksHtml = hasDownloadLinks ? `
        <div class="download-links-section">
            <h3><i class="fas fa-cloud-download-alt"></i> Chagua Ubora</h3>
            <div class="download-links-list">
                ${item.downloadLinks.map(link => `
                    <a href="${link.url}" target="_blank" rel="noopener" class="download-link-card" onclick="trackDownload('${item.id}', '${link.quality}')">
                        <div class="dl-quality">
                            <span class="quality-badge ${link.quality === '1080p' ? 'hd' : link.quality === '720p' ? 'sd' : 'low'}">${link.quality}</span>
                        </div>
                        <div class="dl-info">
                            <span class="dl-size">${link.size}</span>
                            <span class="dl-host">${link.host || 'Download'}</span>
                        </div>
                        <div class="dl-action">
                            <i class="fas fa-external-link-alt"></i>
                        </div>
                    </a>
                `).join('')}
            </div>
        </div>
    ` : `
        <div class="no-downloads">
            <i class="fas fa-exclamation-circle"></i>
            <p>Viungo vya kupakua havipo kwa sasa</p>
        </div>
    `;
    
    // Build subtitles HTML
    const hasSubtitles = item.subtitles && item.subtitles.length > 0 && item.subtitles.some(s => s.url);
    const subtitlesHtml = hasSubtitles ? `
        <div class="subtitles-section">
            <h4><i class="fas fa-closed-captioning"></i> Subtitles</h4>
            <div class="subtitles-list">
                ${item.subtitles.filter(s => s.url).map(sub => `
                    <a href="${sub.url}" target="_blank" rel="noopener" class="subtitle-download">
                        <span>${sub.label}</span>
                        <i class="fas fa-download"></i>
                    </a>
                `).join('')}
            </div>
        </div>
    ` : '';
    
    content.innerHTML = `
        <div class="download-modal-content">
            <button class="modal-close-btn" onclick="closeDownloadModal()">
                <i class="fas fa-times"></i>
            </button>
            <div class="download-header">
                <div class="download-icon"><i class="fas fa-film"></i></div>
                <h2>${item.title}</h2>
                <p class="download-meta">${item.category} | ${item.duration} | ${item.year}</p>
            </div>
            ${downloadLinksHtml}
            ${subtitlesHtml}
            <div class="download-tips">
                <p><i class="fas fa-info-circle"></i> Bonyeza kiungo kupakua. Utaelekezwa kwa tovuti ya nje.</p>
            </div>
        </div>
    `;
    
    modal?.classList.add('active');
}

// Track downloads for analytics
function trackDownload(contentId, quality) {
    console.log('Download started:', contentId, quality);
    showToast('Upakuaji unaanza...', 'success');
}

function showSoftwareDownloadModal(item) {
    const modal = document.getElementById('downloadModal');
    const content = document.getElementById('downloadContent');
    
    content.innerHTML = `
        <div class="download-modal-content">
            <button class="modal-close-btn" onclick="closeDownloadModal()">
                <i class="fas fa-times"></i>
            </button>
            <div class="download-header">
                <div class="download-icon"><i class="fas fa-box-open"></i></div>
                <h2>${item.title}</h2>
                <p class="download-meta">v${item.version} | ${item.size} | ${item.platform}</p>
            </div>
            <div class="download-info">
                <div class="download-info-row">
                    <span>Jina</span> <span>${item.title}</span>
                </div>
                <div class="download-info-row">
                    <span>Version</span> <span>${item.version}</span>
                </div>
                <div class="download-info-row">
                    <span>Ukubwa</span> <span>${item.size}</span>
                </div>
                <div class="download-info-row">
                    <span>Platform</span> <span>${item.platform}</span>
                </div>
            </div>
            <button class="btn btn-success btn-block btn-lg" onclick="confirmSoftwareDownload('${item.id}')">
                <i class="fas fa-download"></i> Pakua Sasa
            </button>
            <div class="download-tips">
                <p><i class="fas fa-info-circle"></i> Programu itaanza kupakua moja kwa moja.</p>
            </div>
        </div>
    `;
    
    modal?.classList.add('active');
}

function confirmDownload(id) {
    showToast('Upakuaji umeanza!', 'success');
    closeDownloadModal();
}

function confirmSoftwareDownload(id) {
    showToast('Upakuaji umeanza!', 'success');
    closeDownloadModal();
}

function closeDownloadModal() {
    document.getElementById('downloadModal')?.classList.remove('active');
}

// ============================================
// AUTHENTICATION
// ============================================

function openAuthModal(tab = 'login') {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.add('active');
        switchAuthTab(tab);
    }
}

function closeAuthModal() {
    document.getElementById('authModal')?.classList.remove('active');
}

function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.tab === tab);
    });
    document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
    document.getElementById('registerForm').style.display = tab === 'register' ? 'block' : 'none';
}

async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail')?.value.trim();
    const password = document.getElementById('loginPassword')?.value;
    if (!email || !password) return showToast('Jaza sehemu zote', 'error');
    if (!HD.fb.auth) return showToast('Weka Firebase config.js kwanza', 'error');
    try {
        const credential = await HD.fb.auth.signInWithEmailAndPassword(email, password);
        // Loads the account and merges anything saved while signed out.
        await HDStore.signInReady();
        updateAuthUI(); closeAuthModal(); navigateTo('profile');
        showToast('Karibu!', 'success');
    } catch (error) { showToast(firebaseAuthError(error), 'error'); }
}

async function handleRegister(event) {
    event.preventDefault();
    const form = document.getElementById('registerForm');
    const submitButton = form?.querySelector('button[type="submit"]');
    if (submitButton?.disabled) return;
    const originalButtonText = submitButton?.innerHTML;
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.setAttribute('aria-busy', 'true');
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Inaunda akaunti...';
    }
  const name = document.getElementById('registerName')?.value.trim();
  const email = document.getElementById('registerEmail')?.value.trim();
  const password = document.getElementById('registerPassword')?.value;
  if (!name || !email || !password) {
    showToast('Jaza sehemu zote', 'error');
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.removeAttribute('aria-busy');
      submitButton.innerHTML = originalButtonText || 'Jisajili Sasa';
    }
    return;
  }
  if (!HD.fb || !HD.fb.auth) {
    showToast('Firebase haijaunganishwa. Hakikisha config.js imepakiwa.', 'error');
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.removeAttribute('aria-busy');
      submitButton.innerHTML = originalButtonText || 'Jisajili Sasa';
    }
    return;
  }
  try {
        const credential = await HD.fb.auth.createUserWithEmailAndPassword(email, password);
  await credential.user.updateProfile({ displayName: name });
  // A verification-email failure must not undo a successful Firebase account.
  // The account and Firestore profile are still created; the user can resend later.
  try {
  await credential.user.sendEmailVerification();
  } catch (verificationError) {
  console.warn('Verification email could not be sent:', verificationError && verificationError.code);
  }
  await HDStore.signInReady();     // the account document now exists
        userPoints = 50;                 // welcome credit
        saveAccount({ name: name, email: email, freeDownloadsRemaining: 1, points: userPoints });
        updateAuthUI(); closeAuthModal(); navigateTo('profile');
        showToast('Akaunti imeundwa. Thibitisha email yako.', 'success');
    } catch (error) {
        showToast(firebaseAuthError(error), 'error');
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.removeAttribute('aria-busy');
            submitButton.innerHTML = originalButtonText || 'Jisajili Sasa';
        }
    }
}

function firebaseAuthError(error) {
    const messages = { 'auth/email-already-in-use': 'Email hii tayari imesajiliwa.', 'auth/invalid-credential': 'Email au neno la siri si sahihi.', 'auth/weak-password': 'Neno la siri liwe na angalau herufi 6.', 'auth/invalid-email': 'Email si sahihi.', 'auth/operation-not-allowed': 'Usajili wa Email/Password haujawashwa kwenye Firebase Authentication.', 'auth/network-request-failed': 'Mtandao umekatika. Angalia connection ujaribu tena.', 'auth/too-many-requests': 'Majaribio yamezidi. Subiri kidogo ujaribu tena.' };
    return messages[error.code] || 'Imeshindikana. Jaribu tena.';
}

function renderProfile() {
    if (!currentUser) return openAuthModal('login');
    const name = document.getElementById('profileName');
    const email = document.getElementById('profileEmail');
    const plan = document.getElementById('profilePlan');
    const points = document.getElementById('profilePoints');
    if (name) name.textContent = currentUser.name;
    if (email) email.textContent = currentUser.email;
    if (plan) plan.textContent = currentPlan === 'weekly' ? 'Wiki' : currentPlan === 'monthly' ? 'Mwezi' : 'Bure';
    if (points) points.textContent = userPoints;

    const expiry = document.getElementById('profilePlanExpiry');
    if (expiry) {
        const until = HDStore.snapshot().data.planExpiresAt;
        expiry.textContent = (currentPlan !== 'free' && until) ? `Hadi ${new Date(until).toLocaleDateString('sw-TZ')}` : '';
    }
}

function openResetModal() {
    document.getElementById('resetModal')?.classList.add('active');
}
function closeResetModal() {
    document.getElementById('resetModal')?.classList.remove('active');
}
async function requestPasswordReset(event) {
    event.preventDefault();
    const email = document.getElementById('resetEmail')?.value.trim();
    if (!email) return showToast('Ingiza email yako', 'error');
    if (!HD.fb.auth) return showToast('Weka Firebase config.js kwanza', 'error');
    try {
        await HD.fb.auth.sendPasswordResetEmail(email);
        closeResetModal();
        showToast('Link ya kuthibitisha imetumwa kwenye email yako.', 'success');
    } catch (error) { showToast(firebaseAuthError(error), 'error'); }
}

function handleLogout() {
    if (confirm('Hakika ungependa kuondoka?')) {
        HDStore.signOut();   // saves the account first, then ends the session
        updateAuthUI();
        showToast('Umeondoka', 'success');
        navigateTo('home');
    }
}

// ============================================
// ACCOUNT STATE (Firestore-backed, single source of truth)
// ============================================

function saveAccount(patch) {
    return HDStore.update(patch);
}

// Points can go down (spending) but only the server can raise them — the rules enforce this.
function addPoints(amount) {
    userPoints = Math.max(0, Number(userPoints || 0) + Number(amount || 0));
    saveAccount({ points: userPoints });
    updatePointsDisplay();
}

function deductPoints(amount) {
    userPoints = Math.max(0, Number(userPoints || 0) - Number(amount || 0));
    saveAccount({ points: userPoints });
    updatePointsDisplay();
}

function applyAccountState(snapshot) {
    const user = snapshot.user;
    const data = snapshot.data || {};

    currentUser = user ? {
        uid: user.uid,
        id: user.uid,
        email: user.email,
        name: user.displayName || data.name || (user.email || '').split('@')[0],
        verified: !!user.emailVerified
    } : null;

    currentPlan = data.plan || 'free';
    userPoints = Number(data.points || 0);
    purchasedContent = data.purchased || [];
    cartItems = data.cart || [];
    freeDownloadsRemaining = Number(data.freeDownloadsRemaining || 0);
    paymentHistory = data.payments || [];

    updateAuthUI();
    updatePlanDisplay();

    if (!appRendered) return;   // the first render happens after init

    updateCartDisplay();
    renderAllContent();
    if (document.getElementById('myContentPage')?.classList.contains('active')) renderMyContent();
    if (document.getElementById('profilePage')?.classList.contains('active')) renderProfile();
}

HDStore.onChange(applyAccountState);

function updateAuthUI() {
    const authButtons = document.getElementById('authButtons');
    const userDropdown = document.getElementById('userProfileDropdown');
    const userName = document.getElementById('userName');
    const mobileAuthActions = document.getElementById('mobileAuthActions');
    const mobileMyContentBtn = document.getElementById('mobileMyContentBtn');
    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
    
    if (currentUser) {
        if (authButtons) authButtons.style.display = 'none';
        if (userDropdown) userDropdown.style.display = 'flex';
        if (userName) userName.textContent = currentUser.name;
        if (mobileAuthActions) mobileAuthActions.style.display = 'none';
        if (mobileMyContentBtn) mobileMyContentBtn.style.display = 'block';
        if (mobileLogoutBtn) mobileLogoutBtn.style.display = 'block';
    } else {
        if (authButtons) authButtons.style.display = 'flex';
        if (userDropdown) userDropdown.style.display = 'none';
        if (mobileAuthActions) mobileAuthActions.style.display = 'grid';
        if (mobileMyContentBtn) mobileMyContentBtn.style.display = 'none';
        if (mobileLogoutBtn) mobileLogoutBtn.style.display = 'none';
    }
}

// ============================================
// TOAST
// ============================================

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const icons = {
        success: 'fa-check',
        error: 'fa-times',
        warning: 'fa-exclamation'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-icon"><i class="fas ${icons[type]}"></i></div>
        <span class="toast-message">${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
