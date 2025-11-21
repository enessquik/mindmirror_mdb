# 🎬 MindMirror - Film & Dizi Kütüphanesi

Modern ve karanlık temalı bir film ve dizi keşif platformu. The Movie Database (TMDB) API kullanılarak geliştirilmiştir.

## ✨ Özellikler

- 🌙 Modern karanlık tema tasarımı
- 🎥 Popüler filmler ve diziler
- ⭐ En yüksek puanlı içerikler
- 🔜 Yakında vizyona girecek filmler
- 🔍 Gelişmiş arama özelliği
- 📱 Responsive (mobil uyumlu) tasarım
- 🎭 Detaylı film/dizi bilgileri
- ⚡ Hızlı ve modern kullanıcı arayüzü

## 🚀 Kurulum

1. **TMDB API Key Alın:**
   - [The Movie Database](https://www.themoviedb.org/) sitesine kaydolun
   - [API Settings](https://www.themoviedb.org/settings/api) sayfasından API key alın

2. **API Key'i Ekleyin:**
   - `app.js` dosyasını açın
   - `API_KEY` değişkenine aldığınız API key'i yapıştırın:
   ```javascript
   const API_KEY = 'BURAYA_API_KEY_GİRİN';
   ```

3. **Projeyi Çalıştırın:**
   - `index.html` dosyasını bir web tarayıcısında açın
   - Veya VS Code'da Live Server extension'ı kullanın

## 📁 Proje Yapısı

```
mindmirror_mdb/
│
├── index.html          # Ana HTML dosyası
├── style.css           # Stil dosyası (karanlık tema)
├── app.js              # Frontend JavaScript
├── server.js           # Backend API proxy (API key güvenli!)
├── package.json        # Node.js bağımlılıkları
├── .env                # API key (GİT'E EKLENMİYOR!)
├── .env.example        # .env şablon dosyası
├── .gitignore          # Git ignore kuralları
└── README.md           # Proje dokümantasyonu
```

## 🎨 Özelleştirme

### Renk Temasını Değiştirme

`style.css` dosyasındaki CSS değişkenlerini düzenleyebilirsiniz:

```css
:root {
    --bg-primary: #0f0f0f;
    --bg-secondary: #1a1a1a;
    --accent-color: #e50914;
    --text-primary: #ffffff;
    /* ... diğer renkler */
}
```

## 🛠️ Teknolojiler

**Frontend:**
- HTML5
- CSS3 (Flexbox, Grid, Animations)
- Vanilla JavaScript (ES6+)
- Font Awesome Icons

**Backend:**
- Node.js
- Express.js (API Proxy)
- dotenv (Environment Variables)
- CORS

**API:**
- The Movie Database (TMDB) API v3

## 🔒 Güvenlik

✅ API key backend'de `.env` dosyasında tutulur  
✅ `.env` dosyası `.gitignore`'da, Git'e eklenmez  
✅ Frontend sadece proxy endpoint'e istek atar  
✅ API key asla client-side'a gönderilmez

## 📱 Responsive Tasarım

Proje tamamen responsive olarak tasarlanmıştır ve aşağıdaki cihazlarda sorunsuz çalışır:
- 💻 Masaüstü
- 📱 Tablet
- 📱 Mobil cihazlar

## 🔗 API Endpoints

Proje aşağıdaki TMDB API endpoint'lerini kullanır:

- `/movie/popular` - Popüler filmler
- `/movie/top_rated` - En yüksek puanlı filmler
- `/movie/upcoming` - Yakında çıkacak filmler
- `/tv/popular` - Popüler diziler
- `/search/movie` - Film arama
- `/search/tv` - Dizi arama
- `/movie/{id}` - Film detayları
- `/tv/{id}` - Dizi detayları

## 📝 Lisans

Bu proje eğitim amaçlı geliştirilmiştir. TMDB API'si kullanılmaktadır.

## 🙏 Teşekkürler

- [The Movie Database (TMDB)](https://www.themoviedb.org/) - Film ve dizi verileri için
- [Font Awesome](https://fontawesome.com/) - İkonlar için

---

**Not:** Bu proje TMDB tarafından onaylanmamış veya sertifikalandırılmamıştır.# mindmirror_mdb
