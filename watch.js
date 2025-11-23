// API Configuration
const isProduction = window.location.hostname !== 'localhost' && !window.location.protocol.includes('file');
const BASE_URL = isProduction ? '/api/tmdb' : 'https://api.themoviedb.org/3';
const API_KEY = isProduction ? '' : 'b7be32426cfcc04c7b0463b60d81ed3f';
// Dinamik image config
let IMAGE_BASE = 'https://image.tmdb.org/t/p/';
let POSTER_SIZE = 'w500';
let STILL_SIZE = 'w300';
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
    await loadImageConfig();
    loadMovieDetails();
}

async function loadImageConfig() {
    try {
        const url = isProduction
            ? `${BASE_URL}/configuration`
            : `${BASE_URL}/configuration?api_key=${API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.images && data.images.secure_base_url) {
            IMAGE_BASE = data.images.secure_base_url;
            if (data.images.poster_sizes) {
                if (data.images.poster_sizes.includes('w500')) POSTER_SIZE = 'w500';
                else POSTER_SIZE = data.images.poster_sizes[Math.min(2, data.images.poster_sizes.length - 1)];
            }
            if (data.images.still_sizes) {
                STILL_SIZE = data.images.still_sizes.includes('w300') ? 'w300' : data.images.still_sizes[0];
            }
            if (data.images.backdrop_sizes) {
                BACKDROP_SIZE = data.images.backdrop_sizes.includes('original') ? 'original' : data.images.backdrop_sizes[data.images.backdrop_sizes.length - 1];
            }
            console.log('Watch image config:', IMAGE_BASE, POSTER_SIZE, STILL_SIZE, BACKDROP_SIZE);
        }
    } catch (e) {
        console.warn('Image config alınamadı (watch.js), fallback kullanılıyor:', e.message);
    }
}

// Load Movie Details
async function loadMovieDetails() {
    try {
        const url = isProduction
            ? `${BASE_URL}/${mediaType}/${movieId}?append_to_response=credits,videos`
            : `${BASE_URL}/${mediaType}/${movieId}?api_key=${API_KEY}&language=tr-TR&append_to_response=credits,videos`;
        const response = await fetch(url);
        const movie = await response.json();
        
        displayMovieDetails(movie);
    } catch (error) {
        console.error('Film yüklenirken hata:', error);
        loading.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <p>Film yüklenirken bir hata oluştu.</p>
            <a href="index.html" style="color: var(--accent-color); margin-top: 20px; display: inline-block;">Ana Sayfaya Dön</a>
        `;
    }
}

// Display Movie Details
function displayMovieDetails(movie) {
    const title = movie.title || movie.name;
    const date = movie.release_date || movie.first_air_date;
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    const runtime = movie.runtime || movie.episode_run_time?.[0];
    const year = date ? new Date(date).getFullYear() : 'Bilinmiyor';
    
    // Setup provider dropdown
    const providerSelect = document.getElementById('providerSelect');
    providerSelect.innerHTML = providers.map((p, i) => 
        `<option value="${i}">${p.name}</option>`
    ).join('');
    
    // Set player with current provider
    updatePlayerURL();
    
    if (mediaType !== 'movie') {
        totalSeasons = movie.number_of_seasons || 1;
        episodeSelector.style.display = 'block';
        setupSeasonSelector(totalSeasons);
        loadEpisodes();
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
        <p style="margin: 0; color: #b3b3b3; font-size: 14px;">Lütfen daha sonra tekrar deneyiniz.</p>
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
        ${runtime ? `<span><i class="fas fa-clock"></i> ${runtime} dakika</span>` : ''}
        ${movie.vote_count ? `<span><i class="fas fa-users"></i> ${movie.vote_count.toLocaleString()} oy</span>` : ''}
    `;
    
    // Set rating
    movieRating.innerHTML = `
        <i class="fas fa-star"></i>
        <span>${rating}</span>
    `;
    
    // Set genres
    if (movie.genres && movie.genres.length > 0) {
        movieGenres.innerHTML = movie.genres.map(g => `<span class="genre-tag">${g.name}</span>`).join('');
    }
    
    // Set overview
    movieOverview.textContent = movie.overview || 'Özet bilgisi bulunmuyor.';
    
    // Set director
    const director = movie.credits?.crew?.find(person => person.job === 'Director');
    if (director) {
        movieDirector.innerHTML = `
            <h4><i class="fas fa-film"></i> Yönetmen</h4>
            <p>${director.name}</p>
        `;
    }
    
    // Set cast
    const cast = movie.credits?.cast?.slice(0, 5).map(actor => actor.name).join(', ');
    if (cast) {
        movieCast.innerHTML = `
            <h4><i class="fas fa-users"></i> Oyuncular</h4>
            <p>${cast}</p>
        `;
    }
    
    // Set additional info
    const infoItems = [];
    if (movie.production_countries && movie.production_countries.length > 0) {
        infoItems.push(`<strong>Ülke:</strong> ${movie.production_countries[0].name}`);
    }
    if (movie.original_language) {
        infoItems.push(`<strong>Dil:</strong> ${movie.original_language.toUpperCase()}`);
    }
    if (movie.budget && movie.budget > 0) {
        infoItems.push(`<strong>Bütçe:</strong> $${movie.budget.toLocaleString()}`);
    }
    if (movie.revenue && movie.revenue > 0) {
        infoItems.push(`<strong>Hasılat:</strong> $${movie.revenue.toLocaleString()}`);
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

// Setup Season Selector
function setupSeasonSelector(seasons) {
    seasonSelect.innerHTML = '';
    for (let i = 1; i <= seasons; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Sezon ${i}`;
        if (i === currentSeason) option.selected = true;
        seasonSelect.appendChild(option);
    }
}

// Load Episodes for Current Season
async function loadEpisodes() {
    currentSeason = parseInt(seasonSelect.value);
    
    episodesGrid.innerHTML = '<div style="text-align: center; padding: 20px;"><i class="fas fa-spinner fa-spin" style="font-size: 24px; color: var(--accent-color);"></i></div>';
    
    try {
        const url = isProduction
            ? `${BASE_URL}/tv/${movieId}/season/${currentSeason}`
            : `${BASE_URL}/tv/${movieId}/season/${currentSeason}?api_key=${API_KEY}&language=tr-TR`;
        console.log('Bölümler yükleniyor:', url);
        const response = await fetch(url);
        const seasonData = await response.json();
        
        console.log('Sezon verisi:', seasonData);
        
        if (seasonData.episodes && seasonData.episodes.length > 0) {
            displayEpisodes(seasonData.episodes);
        } else {
            episodesGrid.innerHTML = '<p style="color: var(--text-secondary); padding: 20px;">Bu sezon için bölüm bulunamadı.</p>';
        }
    } catch (error) {
        console.error('Bölümler yüklenirken hata:', error);
        episodesGrid.innerHTML = `<p style="color: var(--accent-color); padding: 20px;">Bölümler yüklenemedi: ${error.message}</p>`;
    }
}

// Display Episodes
function displayEpisodes(episodes) {
    if (!episodes || episodes.length === 0) {
        episodesGrid.innerHTML = '<p style="color: var(--text-secondary); padding: 20px;">Bu sezon için bölüm bulunamadı.</p>';
        return;
    }
    
    episodesGrid.innerHTML = episodes.map(ep => {
        const isActive = ep.episode_number === currentEpisode;
        return `
            <div class="episode-card ${isActive ? 'active' : ''}" onclick="playEpisode(${ep.episode_number})">
                <div class="episode-number">${ep.episode_number}</div>
                <div class="episode-info">
                    <h4>${ep.name || `Bölüm ${ep.episode_number}`}</h4>
                    ${ep.air_date ? `<span class="episode-date"><i class="fas fa-calendar"></i> ${new Date(ep.air_date).toLocaleDateString('tr-TR')}</span>` : ''}
                    ${ep.runtime ? `<span class="episode-runtime"><i class="fas fa-clock"></i> ${ep.runtime} dk</span>` : ''}
                </div>
                ${ep.still_path ? `<img src="${STILL_URL()}${ep.still_path}" alt="${ep.name}" onerror="this.onerror=null;this.replaceWith('<div class=\'episode-placeholder\'><i class=\'fas fa-tv\'></i></div>')">` : '<div class="episode-placeholder"><i class="fas fa-tv"></i></div>'}
            </div>
        `;
    }).join('');
}

// Play Episode
function playEpisode(episodeNumber) {
    currentEpisode = episodeNumber;
    const playerUrl = `https://vidsrc-embed.ru/embed/tv?tmdb=${movieId}&season=${currentSeason}&episode=${episodeNumber}`;
    videoPlayer.src = playerUrl;
    
    // Update active state
    document.querySelectorAll('.episode-card').forEach(card => {
        card.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    
    // Scroll to player
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Update player URL based on provider and subtitle
function updatePlayerURL() {
    const provider = providers[currentProvider];
    const url = provider.getURL(movieId, mediaType, currentSeason, currentEpisode);
    
    // Add subtitle parameter if supported
    let finalURL = url;
    if (currentSubtitle !== 'off') {
        // Some providers support sub parameter
        finalURL += (url.includes('?') ? '&' : '?') + 'sub=' + currentSubtitle;
    }
    
    videoPlayer.src = finalURL;
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
