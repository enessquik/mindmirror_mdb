// API Configuration - IMDb API
const isProduction = window.location.hostname !== 'localhost' && !window.location.protocol.includes('file');
const BASE_URL = isProduction ? '/api/imdb' : 'https://tv-api.com/en/API';
const API_KEY = isProduction ? '' : 'k_12345678'; // Production'da backend'de
// Image config
let IMAGE_BASE = 'https://imdb-api.com/images/'; // IMDb image base
let POSTER_SIZE = 'original';
let BACKDROP_SIZE = 'original';
const IMG_URL = () => `${IMAGE_BASE}`; // IMDb resimler direkt link
const BACKDROP_URL = () => `${IMAGE_BASE}`;

// State
let currentPage = 1;
let currentCategory = 'MostPopularMovies'; // IMDb endpoint
let currentType = 'movie';
let totalPages = 1;

// DOM Elements
const moviesGrid = document.getElementById('moviesGrid');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageInfo = document.getElementById('pageInfo');
const modal = document.getElementById('movieModal');
const modalBody = document.getElementById('modalBody');
const closeModal = document.querySelector('.close');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadImageConfig();
    loadMovies();
    setupEventListeners();
});

// IMDb image config - fallback olarak kullan
async function loadImageConfig() {
    console.log('IMDb kullanılıyor, image config şu anda gerekli değil');
}

// Event Listeners
function setupEventListeners() {
    // Category navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = e.target.dataset.category;
            currentPage = 1;
            loadMovies();
        });
    });

    // Type filter (movie/tv)
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            currentType = e.currentTarget.dataset.type;
            currentPage = 1;
            loadMovies();
        });
    });

    // Search
    searchBtn.addEventListener('click', searchMovies);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchMovies();
    });

    // Pagination
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadMovies();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            loadMovies();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    // Modal
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Load Movies - IMDb API'yi kullan
async function loadMovies() {
    showLoading();
    
    try {
        let url;
        if (isProduction) {
            url = `${BASE_URL}/${currentCategory}`;
        } else {
            url = `${BASE_URL}/${currentCategory}?api_key=${API_KEY}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        
        displayMovies(data.items || data.results || []);
        totalPages = 1; // IMDb pagination farklı çalışıyor
        updatePagination();
    } catch (error) {
        console.error('Filmler yüklenirken hata oluştu:', error);
        moviesGrid.innerHTML = `
            <div class="loading">
                <i class="fas fa-exclamation-circle"></i>
                <p>Filmler yüklenirken bir hata oluştu.</p>
                <p style="font-size: 14px; margin-top: 10px;">Backend kontrolünü yapın.</p>
            </div>
        `;
    }
}

// Search Movies - IMDb Search endpoint
async function searchMovies() {
    const query = searchInput.value.trim();
    
    if (!query) {
        loadMovies();
        return;
    }
    
    showLoading();
    currentPage = 1;
    
    try {
        const url = isProduction
            ? `/api/imdb/SearchMovie?expression=${encodeURIComponent(query)}`
            : `https://tv-api.com/en/API/SearchMovie/k_12345678?expression=${encodeURIComponent(query)}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        
        displayMovies(data.results || []);
        updatePagination();
    } catch (error) {
        console.error('Arama sırasında hata oluştu:', error);
        moviesGrid.innerHTML = `
            <div class="loading">
                <i class="fas fa-exclamation-circle"></i>
                <p>Arama sırasında bir hata oluştu.</p>
            </div>
        `;
    }
}

// Display Movies
function displayMovies(movies) {
    if (!movies || movies.length === 0) {
        moviesGrid.innerHTML = `
            <div class="loading">
                <i class="fas fa-film"></i>
                <p>Sonuç bulunamadı.</p>
            </div>
        `;
        return;
    }
    
    moviesGrid.innerHTML = movies.map(movie => {
        // IMDb formatı uyarlandı
        const title = movie.title || movie.originalTitle || movie.fullTitle;
        const year = movie.year || movie.description || '';
        const rating = movie.imDbRating || 'N/A';
        const posterPath = movie.image; // IMDb direkt image URL veriyor
        const imdbId = movie.id; // IMDb ID'si (tt...)
        
        return `
            <div class="movie-card" onclick="window.location.href='watch.html?id=${imdbId}&type=movie'">
                ${posterPath 
                    ? `<img src="${posterPath}" alt="${title}" onerror="this.onerror=null;this.replaceWith('<div class=\'no-image\'><i class=\'fas fa-film\'></i></div>')">`
                    : `<div class="no-image"><i class="fas fa-film"></i></div>`
                }
                <div class="movie-info">
                    <div class="movie-header">
                        <h3 class="movie-title">${title}</h3>
                        <span class="type-badge">Film</span>
                    </div>
                    <div class="rating">
                        <i class="fas fa-star"></i>
                        <span>${rating}</span>
                    </div>
                    <div class="movie-date">
                        <i class="fas fa-calendar"></i>
                        <span>${year || 'Bilinmiyor'}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Show Movie Details - IMDb API'den al
async function showMovieDetails(id) {
    try {
        const url = isProduction
            ? `/api/imdb/Title/${id}`
            : `https://tv-api.com/en/API/Title/k_12345678/${id}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const movie = await response.json();
        
        const title = movie.fullTitle || movie.title;
        const year = movie.year;
        const rating = movie.imDbRating || 'N/A';
        const runtime = movie.runtimeStr;
        const posterPath = movie.image;
        const description = movie.plot || '';
        
        const genres = movie.genreList?.map(g => `<span class="genre-tag">${g}</span>`).join('') || '';
        const directors = movie.directors ? movie.directors.split(', ').slice(0, 3).join(', ') : 'Bilinmiyor';
        const actors = movie.actorList?.map(a => a.name).join(', ') || 'Bilinmiyor';
        const imdbId = movie.id;
        
        modalBody.innerHTML = `
            ${posterPath ? `<img src="${posterPath}" alt="${title}" class="modal-backdrop" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 10px;">` : ''}
            <div class="modal-details">
                <h2>${title}</h2>
                <div class="modal-meta">
                    <div class="meta-item">
                        <i class="fas fa-star"></i>
                        <span>${rating} / 10</span>
                    </div>
                    ${year ? `
                    <div class="meta-item">
                        <i class="fas fa-calendar"></i>
                        <span>${year}</span>
                    </div>
                    ` : ''}
                    ${runtime ? `
                    <div class="meta-item">
                        <i class="fas fa-clock"></i>
                        <span>${runtime}</span>
                    </div>
                    ` : ''}
                </div>
                
                ${genres ? `<div class="genres" style="margin: 15px 0;">${genres}</div>` : ''}
                
                <!-- Player -->
                <div class="player-container" style="margin: 30px 0;">
                    <button onclick="loadPlayer('${imdbId}')" class="play-button" id="playButton">
                        <i class="fas fa-play"></i> İzle
                    </button>
                    <div id="playerFrame" style="display: none; position: relative;">
                        <iframe 
                            id="playerIframe"
                            width="100%" 
                            height="500" 
                            frameborder="0" 
                            allowfullscreen
                            sandbox="allow-same-origin allow-scripts allow-presentation allow-popups"
                            style="border-radius: 15px;">
                        </iframe>
                    </div>
                </div>
                
                ${description ? `
                <div>
                    <h3 style="margin-top: 20px; margin-bottom: 10px;">Özet</h3>
                    <p class="modal-overview">${description}</p>
                </div>
                ` : ''}
                
                ${directors ? `
                <div>
                    <h3 style="margin-top: 20px; margin-bottom: 10px;">Yönetmen</h3>
                    <p style="color: var(--text-secondary);">${directors}</p>
                </div>
                ` : ''}
                
                <div>
                    <h3 style="margin-top: 20px; margin-bottom: 10px;">Oyuncular</h3>
                    <p style="color: var(--text-secondary);">${actors}</p>
                </div>
                
                <div style="margin-top: 30px;">
                    <a href="https://www.imdb.com/title/${imdbId}" target="_blank" style="background: var(--accent-color); color: white; padding: 12px 30px; border-radius: 25px; text-decoration: none; display: inline-block; transition: all 0.3s;">
                        <i class="fas fa-external-link-alt"></i> IMDb'de Aç
                    </a>
                </div>
            </div>
        `;
        
        modal.style.display = 'block';
    } catch (error) {
        console.error('Film detayları yüklenirken hata oluştu:', error);
        modalBody.innerHTML = `
            <div style="padding: 40px; text-align: center;">
                <i class="fas fa-exclamation-circle" style="font-size: 48px; color: var(--accent-color);"></i>
                <p style="margin-top: 20px;">Film detayları yüklenirken bir hata oluştu.</p>
                <p style="font-size: 14px; color: var(--text-secondary);">${error.message}</p>
            </div>
        `;
        modal.style.display = 'block';
    }
}

// Update Pagination
function updatePagination() {
    pageInfo.textContent = `Sayfa ${currentPage} / ${totalPages}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
}

// Show Loading
function showLoading() {
    moviesGrid.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Yükleniyor...</p>
        </div>
    `;
}

// Load Player - watch.html'ye yönlendir
function loadPlayer(imdbId) {
    window.location.href = `watch.html?id=${imdbId}&type=movie`;
}