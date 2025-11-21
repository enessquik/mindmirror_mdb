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
        // URL'den path'i al - /api/movie/popular -> movie/popular
        const path = req.url.replace('/api/', '');
        
        // Query parametrelerini kopyala ve API key ekle
        const url = new URL(path, BASE_URL);
        Object.keys(req.query || {}).forEach(key => {
            url.searchParams.append(key, req.query[key]);
        });
        url.searchParams.append('api_key', API_KEY);
        url.searchParams.append('language', 'tr-TR');
        
        console.log('Fetching:', url.toString());
        
        const response = await fetch(url.toString());
        const data = await response.json();
        
        return res.status(200).json(data);
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'API isteği başarısız oldu', message: error.message });
    }
};
