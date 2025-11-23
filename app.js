// API Configuration
const isProduction = window.location.hostname !== 'localhost' && !window.location.protocol.includes('file');
const BASE_URL = isProduction ? '/api/tmdb' : 'https://api.themoviedb.org/3';
const API_KEY = isProduction ? '' : 'b7be32426cfcc04c7b0463b60d81ed3f';
// Image config
let IMAGE_BASE = 'https://image.tmdb.org/t/p/';
let POSTER_SIZE = 'w500';
let BACKDROP_SIZE = 'original';
const IMG_URL = () => `${IMAGE_BASE}${POSTER_SIZE}`;
const BACKDROP_URL = () => `${IMAGE_BASE}${BACKDROP_SIZE}`;

// State
let currentPage = 1;
let currentCategory = 'popular'; // TMDB endpoint
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
    console.log('Image config yükleniyor...');
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

// Load Movies - TMDB API'yi kullan
async function loadMovies() {
    showLoading();
    
    try {
        // TMDB'nin doğru endpoint yapısı: /movie/{category} veya /tv/{category}
        let url;
        if (isProduction) {
            url = `${BASE_URL}/${currentType}/${currentCategory}?page=${currentPage}`;
        } else {
            url = `${BASE_URL}/${currentType}/${currentCategory}?api_key=${API_KEY}&language=tr-TR&page=${currentPage}`;
        }
        
        console.log('Loading from:', url);
        const response = await fetch(url);
        const data = await response.json();
        
        if (!data.results || data.results.length === 0) {
            throw new Error('Sonuç bulunamadı');
        }
        
        displayMovies(data.results);
        totalPages = data.total_pages || 1;
        updatePagination();
    } catch (error) {
        console.error('Filmler yüklenirken hata oluştu:', error);
        moviesGrid.innerHTML = `
            <div class="loading">
                <i class="fas fa-exclamation-circle"></i>
                <p>Filmler yüklenirken bir hata oluştu.</p>
                <p style="font-size: 14px; margin-top: 10px;">Hata: ${error.message}</p>
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
        // TMDB formatı
        const title = movie.title || movie.name;
        const year = movie.release_date ? new Date(movie.release_date).getFullYear() : movie.first_air_date ? new Date(movie.first_air_date).getFullYear() : '';
        const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
        const posterPath = movie.poster_path;
        const id = movie.id;
        const type = movie.media_type || 'movie';
        
        return `
            <div class="movie-card" onclick="window.location.href='watch.html?id=${id}&type=${type}'">
                ${posterPath 
                    ? `<img src="${IMG_URL()}${posterPath}" alt="${title}" onerror="this.onerror=null;this.replaceWith('<div class=\'no-image\'><i class=\'fas fa-film\'></i></div>')">`
                    : `<div class="no-image"><i class="fas fa-film"></i></div>`
                }
                <div class="movie-info">
                    <div class="movie-header">
                        <h3 class="movie-title">${title}</h3>
                        <span class="type-badge">${type === 'tv' ? 'Dizi' : 'Film'}</span>
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

// Show Movie Details - TMDB API'den al
async function showMovieDetails(id) {
    try {
        const url = isProduction
            ? `/api/tmdb/${currentType}/${id}`
            : `${BASE_URL}/${currentType}/${id}?api_key=${API_KEY}&language=tr-TR`;
        const response = await fetch(url);
        const movie = await response.json();
        
        const title = movie.title || movie.name;
        const year = movie.release_date ? new Date(movie.release_date).getFullYear() : movie.first_air_date ? new Date(movie.first_air_date).getFullYear() : '';
        const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
        const runtime = movie.runtime || (movie.episode_run_time && movie.episode_run_time[0]);
        const posterPath = movie.poster_path;
        const overview = movie.overview;
        
        const genres = movie.genres?.map(g => `<span class="genre-tag">${g.name}</span>`).join('') || '';
        const director = movie.credits?.crew?.find(person => person.job === 'Director');
        const cast = movie.credits?.cast?.slice(0, 5).map(actor => actor.name).join(', ') || 'Bilgi yok';
        
        modalBody.innerHTML = `
            ${posterPath ? `<img src="${IMG_URL()}${posterPath}" alt="${title}" class="modal-backdrop" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 10px;">` : ''}
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
                        <span>${runtime} dk</span>
                    </div>
                    ` : ''}
                </div>
                
                ${genres ? `<div class="genres" style="margin: 15px 0;">${genres}</div>` : ''}
                
                <div>
                    <h3 style="margin-top: 20px; margin-bottom: 10px;">Özet</h3>
                    <p class="modal-overview">${overview || 'Özet bilgisi bulunmuyor.'}</p>
                </div>
                
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
                
                <div style="margin-top: 30px;">
                    <a href="watch.html?id=${id}&type=${currentType}" class="play-button" style="display: inline-block; background: var(--accent-color); color: white; padding: 12px 30px; border-radius: 25px; text-decoration: none; transition: all 0.3s;">
                        <i class="fas fa-play"></i> İzle
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
function loadPlayer(imdbId) {
    window.location.href = `watch.html?id=${imdbId}&type=${currentType}`;
}