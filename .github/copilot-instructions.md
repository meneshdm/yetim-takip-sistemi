# Yetim Takip Sistemi - Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Proje Açıklaması
Bu proje, yetim takip ve yardım sistemini yönetmek için geliştirilmiş bir web uygulamasıdır.

## Ana Özellikler
- **Ana Sayfa**: Genel kasa durumu ve aylık borç takibi
- **Gruplar**: Grup, kişi ve yetim yönetimi sistemi
- **Kişiler**: Bireysel ödeme ve borç takibi
- **Yetimler**: Yetim profilleri ve dosya yönetimi

## Teknik Stack
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Prisma ORM
- SQLite Database
- React Hook Form (form yönetimi için)
- Zustand (state yönetimi için)

## Kodlama Standartları
- Turkish dilinde UI metinleri kullanın
- Modern React patterns (hooks, functional components)
- TypeScript strict mode
- Responsive design (mobile-first)
- Clean code principles
- Component-based architecture

## Veritabanı Şeması
- Groups (Gruplar)
- People (Kişiler) 
- Orphans (Yetimler)
- Payments (Ödemeler)
- GroupMembers (Grup Üyeleri)
- OrphanAssignments (Yetim Atamaları)

## Özel Notlar
- Para birimi: Türk Lirası (₺)
- Tarih formatı: DD/MM/YYYY
- Dosya yükleme: PDF desteği
- Kullanıcı dostu hata mesajları
