export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "URL parametresi gerekli. Örnek: /api/proxy?url=https://..." });
  }

  // URL decode
  let decodedUrl;
  try {
    decodedUrl = decodeURIComponent(url);
  } catch (error) {
    return res.status(400).json({ error: "Geçersiz URL encoding" });
  }

  // URL validation
  try {
    new URL(decodedUrl);
  } catch (error) {
    return res.status(400).json({ error: "Geçersiz URL" });
  }

  // Güvenli domain whitelist (opsiyonel - kaldırabilirsin)
  const whitelist = [
    'api.themoviedb.org',
    'image.tmdb.org',
    'blocked-api.com',
    'screenshot.com',
    // Daha fazla domain ekle gerekirse
  ];

  const urlObj = new URL(decodedUrl);
  const isDomainAllowed = whitelist.some(domain => 
    urlObj.hostname.includes(domain) || urlObj.hostname === domain
  );

  // Whitelist kontrol (strict mode için true yap, test sırasında false)
  const USE_WHITELIST = false;
  if (USE_WHITELIST && !isDomainAllowed) {
    return res.status(403).json({ error: "Bu domain'e erişim izni yok" });
  }

  try {
    const response = await fetch(decodedUrl, {
      method: req.method === 'POST' ? 'POST' : 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
        'Content-Type': 'application/json',
      },
      body: req.method === 'POST' ? JSON.stringify(req.body) : undefined,
      timeout: 10000, // 10 saniye timeout
    });

    const contentType = response.headers.get('content-type');
    
    // Response headers'ı kopyala
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    // Binary veri handle et
    const data = await response.arrayBuffer();
    res.status(response.status).send(Buffer.from(data));
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: "Proxy isteği başarısız oldu",
      message: error.message,
      url: decodedUrl
    });
  }
}
