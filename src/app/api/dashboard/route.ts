import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cache, CACHE_KEYS } from '@/lib/cache';

// Local type definitions for the API
interface PaymentType {
  id: string;
  amount: number;
  isPaid: boolean;
}

interface GroupOrphanPaymentType {
  id: string;
  amount: number;
  isPaid: boolean;
}

// GET - Dashboard verileri
export async function GET() {
  try {
    // Check cache first
    const cachedData = cache.get(CACHE_KEYS.DASHBOARD);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Temel istatistikler
    const [groupCount, personCount, orphanCount] = await Promise.all([
      prisma.group.count(),
      prisma.person.count(),
      prisma.orphan.count()
    ]);

    // Tüm ödemeler (gelir) - Payment tablosundan
    const allPayments = await prisma.payment.findMany({
      where: { isPaid: true }
    });
    const totalIncome = allPayments.reduce((sum: number, payment: PaymentType) => sum + payment.amount, 0);

    // Tüm yetim ödemeleri (gider) - GroupOrphanPayment tablosundan
    const allOrphanPayments = await prisma.groupOrphanPayment.findMany({
      where: { isPaid: true }
    });
    const totalOrphanPayments = allOrphanPayments.reduce((sum: number, payment: GroupOrphanPaymentType) => sum + payment.amount, 0);

    // Mevcut bakiye = Ödemelerin toplamı - Yetim ödemelerinin toplamı
    const currentBalance = totalIncome - totalOrphanPayments;

    // Bu ay gelir - Bu ay için ödendi olan borçlar (Payment tablosundan)
    const thisMonthPayments = await prisma.payment.findMany({
      where: {
        month: currentMonth,
        year: currentYear,
        isPaid: true
      }
    });
    const monthlyIncome = thisMonthPayments.reduce((sum: number, payment: PaymentType) => sum + payment.amount, 0);

    // Aylık değişim
    const monthlyChange = monthlyIncome; // Bu ay gelir pozitif olarak gösterilir

    // Borçlu kişiler - ödenmemiş borcu olanlar
    const unpaidPayments = await prisma.payment.findMany({
      where: {
        isPaid: false
      },
      include: {
        person: true
      },
      orderBy: {
        amount: 'desc'
      }
    });

    // Toplam borç miktarını hesapla
    const totalDebt = unpaidPayments.reduce((sum: number, payment: PaymentType & { person: { id: string; name: string } }) => sum + payment.amount, 0);

    // Kişi bazında toplam borçları grupla
    const debtorMap = new Map();
    unpaidPayments.forEach((payment: PaymentType & { person: { id: string; name: string } }) => {
      const personId = payment.person.id;
      const personName = payment.person.name;
      
      if (debtorMap.has(personId)) {
        debtorMap.get(personId).amount += payment.amount;
      } else {
        debtorMap.set(personId, {
          id: personId,
          name: personName,
          amount: payment.amount,
          month: `${currentMonth}/${currentYear}`
        });
      }
    });

    // Map'i array'e çevir ve en yüksek borçlular önce gelsin
    const debtors = Array.from(debtorMap.values())
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10); // En fazla 10 borçlu göster

    const dashboardData = {
      stats: {
        totalGroups: groupCount,
        totalPeople: personCount,
        totalOrphans: orphanCount
      },
      balance: {
        current: currentBalance,
        monthlyIncome,
        monthlyExpense: totalOrphanPayments, // Toplam Bağış
        totalDebt, // Toplam borç
        monthlyChange
      },
      debtors
    };

    // Cache for 5 minutes
    cache.set(CACHE_KEYS.DASHBOARD, dashboardData, 300);

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Dashboard verilerini getirirken hata:', error);
    return NextResponse.json(
      { error: 'Dashboard verileri getirilemedi' },
      { status: 500 }
    );
  }
}
