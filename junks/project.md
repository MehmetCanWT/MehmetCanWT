# MehmetCanWT - Proje Mimarisi ve Dokümantasyonu 🚀

Bu doküman, sistemin nasıl çalıştığını, kullanılan teknolojileri, klasör yapısını ve projeye ait özel mantıkları özetlemektedir.

## 🛠️ Temel Teknolojiler (Tech Stack)
Proje, maksimum hız, tip güvenliği (type-safety) ve modern geliştirici deneyimi için tasarlanmış bir **Fullstack Monorepo** yapısıdır.
- **Runtime & Paket Yöneticisi:** [Bun](https://bun.sh/) (Node.js yerine kullanılıyor, aşırı hızlı)
- **Backend (API):** [ElysiaJS](https://elysiajs.com/) (Bun için optimize edilmiş, dünyanın en hızlı TypeScript framework'lerinden biri)
- **Frontend (Web):** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) (SPA mimarisi)
- **Database (Veritabanı):** [PostgreSQL](https://www.postgresql.org/) (Yerel veya VDS üzerinde)
- **ORM (Veritabanı Yönetimi):** [Drizzle ORM](https://orm.drizzle.team/) (Tamamen Type-Safe)
- **Styling:** [TailwindCSS v4](https://tailwindcss.com/) + Özel CSS kuralları (Manga Halftone, Grid yapıları)

## 📁 Monorepo Klasör Yapısı
Proje, Bun Workspace özelliği kullanılarak 3 ana modüle ayrılmıştır:

```text
MehmetCanWT/
├── apps/
│   ├── api/          # ElysiaJS Backend sunucusu (Port: 3001)
│   └── web/          # Vite + React Frontend uygulaması (Port: 5173 - Prod: 3000)
├── packages/
│   └── db/           # Drizzle ORM şemaları ve veritabanı bağlantısı
├── junks/            # Fikirler, eski planlar ve dokümantasyonlar
└── package.json      # Ana workspace yöneticisi
```

## ⚙️ Uygulamanın Çalışma Mantığı ve Veri Akışı

### 1. "Offline-First / Safe-Mode" Veritabanı Yapısı
Sistem, bir veritabanı olmasa bile (veya PostgreSQL çökerse) frontend'in ve API'nin ayakta kalmasını sağlayacak bir mimaride yazılmıştır. `packages/db/src/index.ts` dosyasında yapılan try/catch blokları sayesinde DB kapalıysa sadece "Offline Mode" uyarısı verilir; guestbook ve quote kaydetme işlemleri atlanır, API dışarıdan (Steam/AniList) veri çekmeye devam eder.

### 2. Akıllı Önbellek (Caching) Sistemi (Redis + Memory)
API'nin rate-limit yememesi ve ışık hızında çalışması için `apps/api/src/lib/cache.ts` yazılmıştır.
- Öncelikle **Redis** arar (`REDIS_URL` varsa).
- Redis yoksa **In-Memory Cache (RAM Map)** kullanır.
- **Süreler:** Anime ve Steam verileri 1 saat (3600s), Haberler 30 dakika (1800s) önbellekte tutulur.

### 3. Frontend & Backend Haberleşmesi (Eden & Proxy)
- Frontend, Backend'e Vite içerisindeki proxy kuralıyla bağlanır (`/api` istekleri `localhost:3001`'e yönlendirilir).
- Elysia'nın **Eden Treaty** kütüphanesi kullanılmıyor olsa da mimari, React'in backend API'sini statik olarak bilmesini sağlayacak bağımsız `apiFetch` (içinde Authorization/Credentials tutan) helper'ı üzerinden yürür (`apps/web/src/lib/api.ts`).

---

## 🌟 Özel Özellikler ve Modüller

### 1. Live Telemetry (Lanyard & WebSockets)
Anasayfadaki Discord durumu (online/dnd), oynanan oyun ve dinlenen Spotify şarkısı doğrudan Lanyard'ın **WebSocket (`wss://api.lanyard.rest/socket`)** altyapısıyla çalışır. Backend API'sini yormaz, veri değişimleri sayfayı yenilemeden saliseler içinde React state'ine düşer.

### 2. Anime & Game API (AniList & Steam)
- **AniList:** `MehmetCanWT` kullanıcısının verilerini GraphQL üzerinden çeker. Özel olarak Anime listesi, kullanıcının verdiği puana (`userScore`) ve güncel izleme durumuna göre (Current -> Completed -> Paused) akıllı bir algoritmayla sıralanır. Favori anime ID `21` (One Piece) olarak sistemde sabitlenmiştir.
- **Steam:** Kütüphane oyunları ve toplam oynama saatleri çekilir. API anahtarı `WEB_KEY` zorunludur.

### 3. Günün Sözü (Daily Quote)
`Yurippe API` kullanılarak her gün anime replikleri çekilir. Eğer Yurippe API çökerse diye sistemin içinde hardcode (sabit) olarak Kamina, Goku ve Luffy repliklerinden oluşan bir **Fallback (Yedek) havuzu** vardır. Admin panelindeki butona basılarak (`/api/admin/quote/force-update`) zorla yeni söz çektirilebilir. Çekilen söz, Drizzle aracılığıyla PostgreSQL veritabanında "global" id'si ile kalıcı olarak saklanır.

### 4. Dinamik README Görseli (`/api/og/readme`)
GitHub profilinde gösterilmek üzere geliştirilmiş bir araçtır. **Satori** ve **Resvg** kütüphanelerini kullanarak JSX/CSS mantığıyla çizilen HTML elementlerini anında vektörel bir PNG'ye çevirir. İnternetten `Inter-Black.ttf` fontunu canlı indirerek kullanır.

### 5. Admin Paneli & Banka Seviyesi Güvenlik
- **Login:** Brute-force saldırılarını durdurmak için 15 dakikalık IP tabanlı rate limit (Maks 5 deneme) mevcuttur. Şifre eşleşmeleri `crypto.timingSafeEqual` ile yapılarak timing attack'ler engellenir.
- **JWT & HttpOnly Cookies:** Başarılı girişte üretilen JWT Token, tarayıcının `localStorage`'ı yerine güvenli olan `HttpOnly` Cookie'ye yazılır (XSS saldırılarına karşı koruma). Backend'deki admin guard'ı, yetki gerektiren endpoint'lerde bu cookie'yi otomatik doğrular.
- **Guestbook Spam Koruması:** `apps/api/src/index.ts` içindeki Guestbook POST isteğinde kötü kelime (BANNED_WORDS) filtresi ve yine dakika bazlı IP rate-limiting mevcuttur.

## 🏃 Geliştirme (Development) ve Dağıtım (Production) Komutları

- **Geliştirme Modu:** `bun dev` (Root klasöründe)
  Vite ve ElysiaJS'i eşzamanlı ve hot-reload destekli (anında yenilenen) şekilde ayağa kaldırır.
- **Veritabanını Güncelleme:** `bun --filter "db" run push`
- **Build (Derleme):** `bun build` veya `bun run build` (Root klasöründe)
  React kodlarını sıkıştırıp küçültür ve `apps/web/dist` klasörüne statik HTML/JS/CSS olarak çıkarır.
- **Canlı (Production) Başlatma:** `bun start`
  Elysia sunucusu ayağa kalkar, kendi API'sini sunmanın yanı sıra `apps/web/dist` klasöründeki statik React dosyalarını da okuyarak **tek bir port üzerinden (Port: 3000)** tüm siteyi dünyaya yayınlar.
