const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static('.')); // Statik dosyaları servis et

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

// Debug: API Key kontrol
console.log('🔑 API Key yüklendi:', API_KEY ? 'EVET ✅' : 'HAYIR ❌');
if (!API_KEY) {
    console.error('⚠️  HATA: TMDB_API_KEY .env.local dosyasında bulunamadı!');
    process.exit(1);
}

// Proxy endpoint - tüm TMDB isteklerini yönlendir
app.get('/api/*', async (req, res) => {
    try {
        const path = req.params[0];
        const queryParams = new URLSearchParams(req.query);
        queryParams.append('api_key', API_KEY);
        queryParams.append('language', 'tr-TR');
        
        const url = `${BASE_URL}/${path}?${queryParams}`;
        const response = await fetch(url);
        const data = await response.json();
        
        res.json(data);
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'API isteği başarısız oldu' });
    }
});

app.listen(PORT, () => {
    console.log(`🎬 Server çalışıyor: http://localhost:${PORT}`);
    console.log(`📡 API Proxy: http://localhost:${PORT}/api/`);
});
