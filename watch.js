// API Configuration - Direkt TMDB API
const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = 'b7be32426cfcc04c7b0463b60d81ed3f';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_URL = 'https://image.tmdb.org/t/p/original';

// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get('id');
const mediaType = urlParams.get('type') || 'movie';
let currentSeason = 1;
let currentEpisode = 1;
let totalSeasons = 1;

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
    loadMovieDetails();
} else {
    window.location.href = 'index.html';
}

// Load Movie Details
async function loadMovieDetails() {
    try {
        const url = `${BASE_URL}/${mediaType}/${movieId}?api_key=${API_KEY}&language=tr-TR&append_to_response=credits,videos`;
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
    
    // Set VixSrc iframe
    let vixsrcUrl;
    if (mediaType === 'movie') {
        vixsrcUrl = `https://vidsrc.to/embed/movie/${movieId}`;
    } else {
        // For TV shows, start with Season 1 Episode 1
        vixsrcUrl = `https://vidsrc.to/embed/tv/${movieId}/${currentSeason}/${currentEpisode}`;
        totalSeasons = movie.number_of_seasons || 1;
        
        // Show episode selector for TV shows
        episodeSelector.style.display = 'block';
        setupSeasonSelector(totalSeasons);
        loadEpisodes();
    }
    
    videoPlayer.src = vixsrcUrl;
    
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
        const url = `${BASE_URL}/tv/${movieId}/season/${currentSeason}?api_key=${API_KEY}&language=tr-TR`;
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
                ${ep.still_path ? `<img src="${IMG_URL}${ep.still_path}" alt="${ep.name}">` : '<div class="episode-placeholder"><i class="fas fa-tv"></i></div>'}
            </div>
        `;
    }).join('');
}

// Play Episode
function playEpisode(episodeNumber) {
    currentEpisode = episodeNumber;
    const vixsrcUrl = `https://vidsrc.to/embed/tv/${movieId}/${currentSeason}/${currentEpisode}`;
    videoPlayer.src = vixsrcUrl;
    
    // Update active state
    document.querySelectorAll('.episode-card').forEach(card => {
        card.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    
    // Scroll to player
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
