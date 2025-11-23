// API Configuration - IMDb
const isProduction = window.location.hostname !== 'localhost' && !window.location.protocol.includes('file');
const BASE_URL = isProduction ? '/api/imdb' : 'https://tv-api.com/en/API';
const API_KEY = isProduction ? '' : 'k_12345678';
// Dinamik image config - IMDb direkt URL kullanıyor
let IMAGE_BASE = 'https://imdb-api.com/images/';
let POSTER_SIZE = 'original';
let STILL_SIZE = 'original';
let BACKDROP_SIZE = 'original';
const IMG_URL = () => `${IMAGE_BASE}${POSTER_SIZE}`;
const STILL_URL = () => `${IMAGE_BASE}${STILL_SIZE}`;
const BACKDROP_URL = () => `${IMAGE_BASE}${BACKDROP_SIZE}`;

// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get('id');
const mediaType = urlParams.get('type') || 'movie';
let currentSeason = 1;
let currentEpisode = 1;
let totalSeasons = 1;
let currentProvider = 0; // Provider index
let currentSubtitle = 'tr'; // Default Türkçe

// Player Providers - Güvenilir kaynaklar
const providers = [
    {
        name: 'NovaServer',
        getURL: (id, type, s, e) => type === 'movie' 
            ? `https://novaserver.com/movie/${id}`
            : `https://novaserver.com/tv/${id}-${s}-${e}`
    },
    {
        name: 'Vidsrc.me',
        getURL: (id, type, s, e) => type === 'movie'
            ? `https://vidsrc.me/embed/movie?tmdb=${id}`
            : `https://vidsrc.me/embed/tv?tmdb=${id}&season=${s}&episode=${e}`
    },
    {
        name: 'Vidbinge',
        getURL: (id, type, s, e) => type === 'movie'
            ? `https://vidbinge.dev/movie/${id}`
            : `https://vidbinge.dev/tv/${id}/${s}/${e}`
    },
    {
        name: 'MovieBox Pro',
        getURL: (id, type, s, e) => type === 'movie'
            ? `https://embed.smashystream.com/movie/${id}`
            : `https://embed.smashystream.com/tv/${id}/${s}/${e}`
    },
    {
        name: 'Embed.su',
        getURL: (id, type, s, e) => type === 'movie'
            ? `https://embed.su/embed/movie/${id}`
            : `https://embed.su/embed/tv/${id}/${s}/${e}`
    },
    {
        name: 'HiMovies',
        getURL: (id, type, s, e) => type === 'movie'
            ? `https://himovies.to/watch/movie/${id}`
            : `https://himovies.to/watch/tv/${id}-${s}-${e}`
    }
];

// DOM Elements
const loading = document.getElementById('loading');
const playerSection = document.getElementById('playerSection');
const videoPlayer = document.getElementById('videoPlayer');
const movieTitle = document.getElementById('movieTitle');
const movieMeta = document.getElementById('movieMeta');
const movieRating = document.getElementById('movieRating');
const movieGenres = document.getElementById('movieGenres');
const movieOverview = document.getElementById('movieOverview');
const movieDirector = document.getElementById('movieDirector');
const movieCast = document.getElementById('movieCast');
const movieInfo = document.getElementById('movieInfo');
const episodeSelector = document.getElementById('episodeSelector');
const seasonSelect = document.getElementById('seasonSelect');
const episodesGrid = document.getElementById('episodesGrid');

// Initialize
if (movieId) {
    init();
} else {
    window.location.href = 'index.html';
}

async function init() {
    loadMovieDetails();
}

// IMDb image config - sadece log
async function loadImageConfig() {
    console.log('IMDb kullanılıyor, resimleri doğrudan URL\'den alıyoruz');
}

// Load Movie Details - IMDb API'yi kullan
async function loadMovieDetails() {
    try {
        const url = isProduction
            ? `/api/imdb/Title/${movieId}`
            : `https://tv-api.com/en/API/Title/k_12345678/${movieId}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const movie = await response.json();
        
        displayMovieDetails(movie);
    } catch (error) {
        console.error('Film yüklenirken hata:', error);
        loading.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <p>Film yüklenirken bir hata oluştu: ${error.message}</p>
            <a href="index.html" style="color: var(--accent-color); margin-top: 20px; display: inline-block;">Ana Sayfaya Dön</a>
        `;
    }
}

// Display Movie Details - IMDb formatına uyarlandı
function displayMovieDetails(movie) {
    const title = movie.fullTitle || movie.title;
    const year = movie.year;
    const rating = movie.imDbRating || 'N/A';
    const runtime = movie.runtimeStr;
    
    // Setup provider dropdown
    const providerSelect = document.getElementById('providerSelect');
    providerSelect.innerHTML = providers.map((p, i) => 
        `<option value="${i}">${p.name}</option>`
    ).join('');
    
    // Set player with current provider
    updatePlayerURL();
    
    // IMDb TV endpointi farklı çalışıyor, episode selector'u disable et
    if (mediaType !== 'movie') {
        // IMDb'de TV show için farklı endpoint gerekli
        console.log('TV show detected, episodes may not be available');
        episodeSelector.style.display = 'none';
    }
    
    // Player yüklenme hatası için fallback mesaj ekle
    const playerContainer = videoPlayer.parentElement;
    const errorMessage = document.createElement('div');
    errorMessage.id = 'playerError';
    errorMessage.style.cssText = `
        display: none;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.9);
        color: #fff;
        padding: 40px;
        border-radius: 15px;
        text-align: center;
        z-index: 10;
        min-width: 300px;
    `;
    errorMessage.innerHTML = `
        <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #e50914; margin-bottom: 20px; display: block;"></i>
        <h3 style="margin: 0 0 15px 0;">Bu film şu anda mevcut değil.</h3>
        <p style="margin: 0; color: #b3b3b3; font-size: 14px;">Oynatıcı yüklenemedi, başka kaynak deneyin.</p>
        <a href="index.html" style="margin-top: 20px; display: inline-block; background: #e50914; color: white; padding: 10px 25px; border-radius: 5px; text-decoration: none;">Ana Sayfaya Dön</a>
    `;
    playerContainer.parentElement.insertBefore(errorMessage, playerContainer.nextSibling);
    
    // Player error kontrolü
    videoPlayer.addEventListener('error', () => {
        videoPlayer.style.display = 'none';
        errorMessage.style.display = 'block';
    });
    
    videoPlayer.style.position = 'relative';
    
    // Set title
    document.title = `${title} - İzle | MindMirror`;
    movieTitle.textContent = title;
    
    // Set meta
    movieMeta.innerHTML = `
        <span><i class="fas fa-calendar"></i> ${year}</span>
        ${runtime ? `<span><i class="fas fa-clock"></i> ${runtime}</span>` : ''}
    `;
    
    // Set rating
    movieRating.innerHTML = `
        <i class="fas fa-star"></i>
        <span>${rating}</span>
    `;
    
    // Set genres
    if (movie.genreList && movie.genreList.length > 0) {
        movieGenres.innerHTML = movie.genreList.map(g => `<span class="genre-tag">${g}</span>`).join('');
    }
    
    // Set overview
    movieOverview.textContent = movie.plot || 'Özet bilgisi bulunmuyor.';
    
    // Set directors
    if (movie.directors) {
        movieDirector.innerHTML = `
            <h4><i class="fas fa-film"></i> Yönetmen</h4>
            <p>${movie.directors}</p>
        `;
    }
    
    // Set cast
    if (movie.actorList && movie.actorList.length > 0) {
        const actors = movie.actorList.slice(0, 5).map(actor => actor.name).join(', ');
        movieCast.innerHTML = `
            <h4><i class="fas fa-users"></i> Oyuncular</h4>
            <p>${actors}</p>
        `;
    }
    
    // Set additional info
    const infoItems = [];
    if (movie.countries && movie.countries.length > 0) {
        infoItems.push(`<strong>Ülke:</strong> ${movie.countries.join(', ')}`);
    }
    if (movie.languages && movie.languages.length > 0) {
        infoItems.push(`<strong>Dil:</strong> ${movie.languages.join(', ')}`);
    }
    
    if (infoItems.length > 0) {
        movieInfo.innerHTML = `
            <h4><i class="fas fa-info-circle"></i> Bilgiler</h4>
            <p>${infoItems.join(' • ')}</p>
        `;
    }
    
    // Show player section
    loading.style.display = 'none';
    playerSection.style.display = 'block';
}

// Switch provider
function switchProvider() {
    const select = document.getElementById('providerSelect');
    currentProvider = parseInt(select.value);
    updatePlayerURL();
    console.log('Provider değiştirildi:', providers[currentProvider].name);
}

// Change subtitle
function changeSubtitle() {
    const select = document.getElementById('subtitleSelect');
    currentSubtitle = select.value;
    updatePlayerURL();
    console.log('Altyazı değiştirildi:', currentSubtitle);
}
