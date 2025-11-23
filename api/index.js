const fetch = require('node-fetch');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const IMDB_API_KEY = process.env.IMDB_API_KEY || 'k_12345678'; // Default key
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMDB_BASE_URL = 'https://tv-api.com/en/API';

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        // URL'den path ve query parametrelerini al
        const urlParts = req.url.split('?');
        const path = urlParts[0].replace('/api/', '');
        const queryString = urlParts[1] || '';
        
        // IMDb ID'yi TMDB ID'sine çevir (oynatıcı için)
        if (path.startsWith('convert/imdb-to-tmdb/')) {
            const imdbId = path.replace('convert/imdb-to-tmdb/', '');
            const tmdbUrl = `${TMDB_BASE_URL}/find/${imdbId}?api_key=${TMDB_API_KEY}&external_source=imdb_id`;
            
            console.log('Converting IMDb to TMDB:', imdbUrl);
            
            const response = await fetch(tmdbUrl);
            const data = await response.json();
            
            // En iyi sonucu döndür
            let result = null;
            if (data.movie_results && data.movie_results.length > 0) {
                result = { type: 'movie', id: data.movie_results[0].id };
            } else if (data.tv_results && data.tv_results.length > 0) {
                result = { type: 'tv', id: data.tv_results[0].id };
            }
            
            if (result) {
                return res.status(200).json(result);
            } else {
                return res.status(404).json({ error: 'TMDB ID bulunamadı', imdbId });
            }
        }
        
        // IMDb API proxy
        if (path.startsWith('imdb/')) {
            const imdbPath = path.replace('imdb/', '');
            const imdbUrl = `${IMDB_BASE_URL}/${imdbPath}/${IMDB_API_KEY}${queryString ? '?' + queryString : ''}`;
            
            console.log('Proxying IMDb:', imdbUrl);
            
            const response = await fetch(imdbUrl);
            const data = await response.json();
            
            return res.status(200).json(data);
        }
        
        // TMDB API proxy
        if (path.startsWith('tmdb/')) {
            const tmdbPath = path.replace('tmdb/', '');
            const tmdbUrl = `${TMDB_BASE_URL}/${tmdbPath}?${queryString}&api_key=${TMDB_API_KEY}&language=tr-TR`;
            
            console.log('Proxying TMDB:', tmdbUrl);
            
            const response = await fetch(tmdbUrl);
            const data = await response.json();
            
            return res.status(200).json(data);
        }
        
        // Fallback: IMDb proxy (default)
        const imdbUrl = `${IMDB_BASE_URL}/${path}/${IMDB_API_KEY}${queryString ? '?' + queryString : ''}`;
        
        console.log('Fetching IMDb (fallback):', imdbUrl);
        
        const response = await fetch(imdbUrl);
        const data = await response.json();
        
        return res.status(200).json(data);
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'API isteği başarısız oldu', message: error.message });
    }
};
