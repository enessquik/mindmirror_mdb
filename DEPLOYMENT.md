# 🚀 Vercel'e Deploy Etme Rehberi

## 📋 Ön Hazırlık

### 1. TMDB API Key Alın
- [TMDB](https://www.themoviedb.org/) hesabı oluşturun
- [API Settings](https://www.themoviedb.org/settings/api) sayfasından **API Key** alın
- Anahtarı bir yere not edin (Vercel'de kullanacağız)

### 2. GitHub Repository Oluşturun
```bash
# Projeyi git'e ekle
git init
git add .
git commit -m "İlk commit: Film sitesi projesi"

# GitHub'da yeni repo oluştur ve push et
git remote add origin https://github.com/KULLANICI_ADIN/mindmirror-mdb.git
git branch -M main
git push -u origin main
```

## 🌐 Vercel'e Deploy

### Yöntem 1: Vercel Dashboard (Kolay)

1. **Vercel'e Giriş**
   - [vercel.com](https://vercel.com) adresine gidin
   - GitHub hesabınızla giriş yapın

2. **Yeni Proje Oluştur**
   - "Add New" → "Project" tıklayın
   - GitHub reponuzu seçin (`mindmirror-mdb`)
   - "Import" butonuna tıklayın

3. **Environment Variables Ekle**
   - "Environment Variables" bölümüne gidin
   - Şu değişkeni ekleyin:
     ```
     Name: TMDB_API_KEY
     Value: [BURAYA_API_KEY_İNİZİ_YAPIŞTIRIN]
     ```
   - "Add" butonuna tıklayın

4. **Deploy**
   - "Deploy" butonuna tıklayın
   - 1-2 dakika içinde siteniz yayında! 🎉

### Yöntem 2: Vercel CLI (Gelişmiş)

```bash
# Vercel CLI'yi global yükle
npm install -g vercel

# Projeyi deploy et
vercel

# İlk deploy sırasında:
# - Set up and deploy? → Y
# - Which scope? → Kendi hesabınızı seçin
# - Link to existing project? → N
# - Project name? → mindmirror-mdb
# - Directory? → ./
# - Auto-detected settings? → Y

# Environment variable ekle
vercel env add TMDB_API_KEY

# Production'a deploy
vercel --prod
```

## 🔧 Environment Variables (Vercel Dashboard)

Proje → Settings → Environment Variables kısmına gidin:

| Name | Value | Environment |
|------|-------|-------------|
| `TMDB_API_KEY` | `your_api_key_here` | Production, Preview, Development |

**Not:** Her değişiklikte otomatik deploy olur. Environment variable değiştirirseniz yeniden deploy edin.

## 📝 Önemli Notlar

### ✅ Yapılması Gerekenler
- ✅ `.env.local` dosyasını `.gitignore`'a ekledik
- ✅ `.env.local.example` dosyası ile şablon oluşturduk
- ✅ `vercel.json` ile routing yapılandırdık
- ✅ API key güvenli şekilde Vercel'de saklanıyor

### ❌ Yapılmaması Gerekenler
- ❌ **ASLA** `.env.local` dosyasını Git'e eklemeyin
- ❌ **ASLA** API key'i kodda hard-code etmeyin
- ❌ **ASLA** API key'i frontend'e göndermeyin

## 🔄 Güncelleme Yapmak

```bash
# Değişiklikleri yap
git add .
git commit -m "Değişiklik açıklaması"
git push

# Vercel otomatik olarak yeni versiyonu deploy eder! 🚀
```

## 🌍 Domain Bağlama (İsteğe Bağlı)

1. Vercel Dashboard → Projeniz → Settings → Domains
2. Kendi domain'inizi ekleyin
3. DNS ayarlarını yapın
4. SSL otomatik aktif olur

## 🐛 Sorun Giderme

### API Key Hatası
```bash
# Vercel'de environment variable kontrolü
vercel env ls

# Yeni deployment tetikle
vercel --prod --force
```

### Logs Kontrol
```bash
# Vercel logları görüntüle
vercel logs
```

### Local Test
```bash
# .env.local oluştur
copy .env.local.example .env.local

# API key ekle
notepad .env.local

# Serveri başlat
npm run dev
```

## 📊 Deployment URL'leri

- **Production:** `https://mindmirror-mdb.vercel.app`
- **Preview:** Her PR için otomatik URL
- **Development:** `http://localhost:3000`

## 🎯 Sonraki Adımlar

- [ ] Custom domain ekleyin
- [ ] Analytics aktif edin (Vercel Analytics)
- [ ] Performans iyileştirmeleri
- [ ] Caching stratejisi ekleyin
- [ ] Error tracking (Sentry vb.)

---

**Başarılar!** 🎬 Film siteniz artık dünyayla paylaşıma hazır!