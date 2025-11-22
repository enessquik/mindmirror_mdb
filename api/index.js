const fetch = require('node-fetch');

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

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
        
        // Player proxy - VixSrc yükle
        if (path.startsWith('player/')) {
            const playerPath = path.replace('player/', '');
            const playerUrl = `https://vidsrc.to/embed/${playerPath}`;
            console.log('Proxying player:', playerUrl);
            
            const response = await fetch(playerUrl);
            const html = await response.text();
            
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.setHeader('X-Frame-Options', 'ALLOW');
            return res.status(200).send(html);
        }
        
        // TMDB API proxy
        if (path.startsWith('tmdb/')) {
            const tmdbPath = path.replace('tmdb/', '');
            const tmdbUrl = `${BASE_URL}/${tmdbPath}?${queryString}&api_key=${API_KEY}&language=tr-TR`;
            
            console.log('Proxying TMDB:', tmdbUrl);
            
            const response = await fetch(tmdbUrl);
            const data = await response.json();
            
            return res.status(200).json(data);
        }
        
        // Fallback: eğer tmdb/ prefix yoksa direkt path'i TMDB'ye gönder
        const tmdbUrl = `${BASE_URL}/${path}?${queryString}&api_key=${API_KEY}&language=tr-TR`;
        
        console.log('Fetching TMDB (fallback):', tmdbUrl);
        
        const response = await fetch(tmdbUrl);
        const data = await response.json();
        
        return res.status(200).json(data);
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'API isteği başarısız oldu', message: error.message });
    }
};
