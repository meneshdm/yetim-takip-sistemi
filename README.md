# 📊 Yetim Takip Sistemi

Yetim yardım grupları için geliştirilmiş modern web uygulaması.

## 🌟 Özellikler

- **👥 Grup Yönetimi**: Yardım gruplarını oluşturun ve yönetin
- **👤 Kişi Takibi**: Grup üyelerinin ödeme durumlarını takip edin
- **👶 Yetim Profilleri**: Yardım edilen yetimlerin bilgilerini saklayın
- **💰 Ödeme Sistemi**: Aylık ödemeler ve borçları yönetin
- **📊 Dashboard**: Genel durumu analiz edin
- **🔐 Güvenlik**: JWT tabanlı kimlik doğrulama
- **📱 Responsive**: Mobil uyumlu tasarım

## 🚀 Hızlı Başlangıç

### Gereksinimler
- Node.js 18+
- npm veya yarn

### Kurulum

1. **Projeyi klonlayın:**
   ```bash
   git clone https://github.com/meneshdm/yetim-takip-sistemi.git
   cd yetim-takip-sistemi
   ```

2. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

3. **Environment dosyasını oluşturun:**
   ```bash
   cp .env.example .env
   ```

4. **Veritabanını başlatın:**
   ```bash
   npx prisma db push
   ```

5. **Demo verilerini yükleyin:**
   ```bash
   npx tsx seed-demo.ts
   ```

6. **Development server'ı başlatın:**
   ```bash
   npm run dev
   ```

Site `http://localhost:3000` adresinde çalışacaktır.

## 🔑 Giriş Bilgileri

- **Şifre:** `YetimTakip2025!`

## 🛠️ Teknolojiler

- **Frontend:** Next.js 15, React 19, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** SQLite (dev), PostgreSQL (production)
- **ORM:** Prisma
- **Authentication:** JWT
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod
- **Development:** GitHub Copilot (AI pair programming)

## 📁 Proje Yapısı

```
src/
├── app/              # Next.js App Router
│   ├── api/         # API endpoints
│   ├── login/       # Giriş sayfası
│   ├── gruplar/     # Grup yönetimi
│   ├── kisiler/     # Kişi yönetimi
│   ├── yetimler/    # Yetim profilleri
│   └── odemeler/    # Ödeme takibi
├── components/       # React bileşenleri
├── lib/             # Yardımcı fonksiyonlar
└── types/           # TypeScript tip tanımları
```

## 🔧 Scripts

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run start` - Production server
- `npm run lint` - Code linting
- `npx tsx seed-demo.ts` - Demo data yükleme

## 🌐 Deployment

### Vercel (Önerilen)

1. GitHub repository'yi Vercel'e connect edin
2. PostgreSQL database ekleyin
3. Environment variables'ları ayarlayın:
   - `ADMIN_PASSWORD`
   - `JWT_SECRET`
   - `NODE_ENV=production`

### Diğer Platformlar

Railway, DigitalOcean, Heroku gibi platformlarda da çalışır.

## 📝 Lisans

Bu proje özel kullanım içindir.

## 👨‍💻 Geliştirici

**Enes Gündoğan** - GitHub: [@meneshdm](https://github.com/meneshdm)

🤖 **GitHub Copilot** ile geliştirilmiştir - AI pair programming ile modern bir geliştirme deneyimi

---

💡 **Not:** Bu sistem kişisel verileri korumak amacıyla tasarlanmıştır. Production kullanımında güvenlik önlemlerini gözden geçirmeyi unutmayın.
