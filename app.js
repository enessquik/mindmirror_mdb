// API Configuration
// Production'da backend proxy, development'da direkt API
const isProduction = window.location.hostname !== 'localhost' && !window.location.protocol.includes('file');
const BASE_URL = isProduction ? '/api' : 'https://api.themoviedb.org/3';
const API_KEY = isProduction ? '' : 'b7be32426cfcc04c7b0463b60d81ed3f'; // Production'da backend'de
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_URL = 'https://image.tmdb.org/t/p/original';

// State
let currentPage = 1;
let currentCategory = 'popular';
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
document.addEventListener('DOMContentLoaded', () => {
    loadMovies();
    setupEventListeners();
});

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

// Load Movies
async function loadMovies() {
    showLoading();
    
    try {
        const url = isProduction 
            ? `${BASE_URL}/${currentType}/${currentCategory}?page=${currentPage}`
            : `${BASE_URL}/${currentType}/${currentCategory}?api_key=${API_KEY}&language=tr-TR&page=${currentPage}`;
        const response = await fetch(url);
        const data = await response.json();
        
        displayMovies(data.results);
        totalPages = data.total_pages;
        updatePagination();
    } catch (error) {
        console.error('Filmler yüklenirken hata oluştu:', error);
        moviesGrid.innerHTML = `
            <div class="loading">
                <i class="fas fa-exclamation-circle"></i>
                <p>Filmler yüklenirken bir hata oluştu.</p>
                <p style="font-size: 14px; margin-top: 10px;">Server çalışıyor mu kontrol edin.</p>
            </div>
        `;
    }
}

// Search Movies
async function searchMovies() {
    const query = searchInput.value.trim();
    
    if (!query) {
        loadMovies();
        return;
    }
    
    showLoading();
    currentPage = 1;
    
    try {
        // Multi-search kullan - hem film hem dizi ara
        const url = isProduction
            ? `${BASE_URL}/search/multi?query=${encodeURIComponent(query)}&page=${currentPage}`
            : `${BASE_URL}/search/multi?api_key=${API_KEY}&language=tr-TR&query=${encodeURIComponent(query)}&page=${currentPage}`;
        const response = await fetch(url);
        const data = await response.json();
        
        // Sadece film ve TV sonuçlarını filtrele
        const filtered = data.results.filter(item => 
            item.media_type === 'movie' || item.media_type === 'tv'
        );
        
        displayMovies(filtered);
        totalPages = data.total_pages;
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
        const title = movie.title || movie.name;
        const date = movie.release_date || movie.first_air_date;
        const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
        const posterPath = movie.poster_path 
            ? `${IMG_URL}${movie.poster_path}`
            : null;
        
        // media_type varsa onu kullan (multi-search için), yoksa currentType kullan
        const itemType = movie.media_type || currentType;
        
        return `
            <div class="movie-card" onclick="window.location.href='watch.html?id=${movie.id}&type=${itemType}'">
                ${posterPath 
                    ? `<img src="${posterPath}" alt="${title}">`
                    : `<div class="no-image"><i class="fas fa-film"></i></div>`
                }
                <div class="movie-info">
                    <div class="movie-header">
                        <h3 class="movie-title">${title}</h3>
                        ${movie.media_type ? `<span class="type-badge">${movie.media_type === 'movie' ? 'Film' : 'Dizi'}</span>` : ''}
                    </div>
                    <div class="rating">
                        <i class="fas fa-star"></i>
                        <span>${rating}</span>
                    </div>
                    <div class="movie-date">
                        <i class="fas fa-calendar"></i>
                        <span>${date ? new Date(date).getFullYear() : 'Bilinmiyor'}</span>
                    </div>
                    ${movie.overview ? `<p class="movie-overview">${movie.overview}</p>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Show Movie Details
async function showMovieDetails(id) {
    try {
        const url = `${BASE_URL}/${currentType}/${id}?api_key=${API_KEY}&language=tr-TR&append_to_response=credits,videos`;
        const response = await fetch(url);
        const movie = await response.json();
        
        const title = movie.title || movie.name;
        const date = movie.release_date || movie.first_air_date;
        const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
        const runtime = movie.runtime || movie.episode_run_time?.[0];
        const backdropPath = movie.backdrop_path 
            ? `${BACKDROP_URL}${movie.backdrop_path}`
            : (movie.poster_path ? `${IMG_URL}${movie.poster_path}` : null);
        
        const genres = movie.genres?.map(g => `<span class="genre-tag">${g.name}</span>`).join('') || '';
        
        const director = movie.credits?.crew?.find(person => person.job === 'Director');
        const cast = movie.credits?.cast?.slice(0, 5).map(actor => actor.name).join(', ') || 'Bilgi yok';
        
        // VixSrc embed URL
        const tmdbId = movie.id;
        const vixsrcUrl = currentType === 'movie' 
            ? `https://vidsrc.to/embed/movie/${tmdbId}`
            : `https://vidsrc.to/embed/tv/${tmdbId}`;
        
        modalBody.innerHTML = `
            ${backdropPath ? `<img src="${backdropPath}" alt="${title}" class="modal-backdrop">` : ''}
            <div class="modal-details">
                <h2>${title}</h2>
                <div class="modal-meta">
                    <div class="meta-item">
                        <i class="fas fa-star"></i>
                        <span>${rating} / 10</span>
                    </div>
                    ${date ? `
                    <div class="meta-item">
                        <i class="fas fa-calendar"></i>
                        <span>${new Date(date).toLocaleDateString('tr-TR')}</span>
                    </div>
                    ` : ''}
                    ${runtime ? `
                    <div class="meta-item">
                        <i class="fas fa-clock"></i>
                        <span>${runtime} dakika</span>
                    </div>
                    ` : ''}
                    ${movie.vote_count ? `
                    <div class="meta-item">
                        <i class="fas fa-users"></i>
                        <span>${movie.vote_count.toLocaleString()} oy</span>
                    </div>
                    ` : ''}
                </div>
                
                ${genres ? `<div class="genres">${genres}</div>` : ''}
                
                <!-- VixSrc Player -->
                <div class="player-container" style="margin: 30px 0;">
                    <button onclick="loadPlayer()" class="play-button" id="playButton">
                        <i class="fas fa-play"></i> İzle
                    </button>
                    <div id="playerFrame" style="display: none;">
                        <iframe 
                            src="${vixsrcUrl}" 
                            width="100%" 
                            height="500" 
                            frameborder="0" 
                            allowfullscreen
                            style="border-radius: 15px;">
                        </iframe>
                    </div>
                </div>
                
                ${movie.overview ? `
                <div>
                    <h3 style="margin-top: 20px; margin-bottom: 10px;">Özet</h3>
                    <p class="modal-overview">${movie.overview}</p>
                </div>
                ` : ''}
                
                ${director ? `
                <div>
                    <h3 style="margin-top: 20px; margin-bottom: 10px;">Yönetmen</h3>
                    <p style="color: var(--text-secondary);">${director.name}</p>
                </div>
                ` : ''}
                
                <div>
                    <h3 style="margin-top: 20px; margin-bottom: 10px;">Oyuncular</h3>
                    <p style="color: var(--text-secondary);">${cast}</p>
                </div>
                
                ${movie.homepage ? `
                <div style="margin-top: 30px;">
                    <a href="${movie.homepage}" target="_blank" style="background: var(--accent-color); color: white; padding: 12px 30px; border-radius: 25px; text-decoration: none; display: inline-block; transition: all 0.3s;">
                        <i class="fas fa-external-link-alt"></i> Resmi Website
                    </a>
                </div>
                ` : ''}
            </div>
        `;
        
        modal.style.display = 'block';
    } catch (error) {
        console.error('Film detayları yüklenirken hata oluştu:', error);
        modalBody.innerHTML = `
            <div style="padding: 40px; text-align: center;">
                <i class="fas fa-exclamation-circle" style="font-size: 48px; color: var(--accent-color);"></i>
                <p style="margin-top: 20px;">Film detayları yüklenirken bir hata oluştu.</p>
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

// Load Player
function loadPlayer() {
    const playButton = document.getElementById('playButton');
    const playerFrame = document.getElementById('playerFrame');
    
    playButton.style.display = 'none';
    playerFrame.style.display = 'block';
}