import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Hardcoded membership dates - gruplar sayfasından kopyalandı
const membershipDates: { [key: string]: Array<{ from: { month: number; year: number }; to: { month: number; year: number } | null }> } = {
  // Enes Gündoğan grubu
  'Enes Gündoğan-Enes Gündoğan': [
    { from: { month: 11, year: 2021 }, to: null }
  ],
  'Aykut Kılıç-Enes Gündoğan': [
    { from: { month: 5, year: 2025 }, to: null }
  ],
  
  // Kumanyalar grubu
  'Kerem Kızılboğa-Kumanyalar': [
    { from: { month: 3, year: 2023 }, to: null }
  ],
  'Enes Gündoğan-Kumanyalar': [
    { from: { month: 2, year: 2023 }, to: null }
  ],
  'Nesih Yiğit-Kumanyalar': [
    { from: { month: 2, year: 2023 }, to: null }
  ],
  'Samet Yıldırım-Kumanyalar': [
    { from: { month: 2, year: 2023 }, to: null }
  ],
  'Burak Sarı-Kumanyalar': [
    { from: { month: 2, year: 2023 }, to: null }
  ],
  'Aykut Kılıç-Kumanyalar': [
    { from: { month: 5, year: 2025 }, to: null }
  ],
  
  // Tevfik İleri grubu
  'Bedirhan Uçak-Tevfik ileri': [
    { from: { month: 4, year: 2023 }, to: null }
  ],
  'Zahid Yapıcı-Tevfik ileri': [
    { from: { month: 4, year: 2023 }, to: null }
  ],
  'Fahrettin Özkan-Tevfik ileri': [
    { from: { month: 4, year: 2023 }, to: null }
  ],
  'Faik Burak Çakar-Tevfik ileri': [
    { from: { month: 4, year: 2023 }, to: null }
  ],
  'Emir Balım-Tevfik ileri': [
    { from: { month: 4, year: 2023 }, to: null }
  ],
  'İbrahim Dinçsoy-Tevfik ileri': [
    { from: { month: 4, year: 2023 }, to: null }
  ],
  
  // Siyer grubu
  'Aykut Kılıç-Siyer': [
    { from: { month: 7, year: 2023 }, to: null }
  ],
  'Muhammed Denizoğlu-Siyer': [
    { from: { month: 7, year: 2023 }, to: null }
  ],
  'Ahmet Bera Çakmak-Siyer': [
    { from: { month: 7, year: 2023 }, to: null }
  ],
  'Ali İhsan Akkaş-Siyer': [
    { from: { month: 7, year: 2023 }, to: null }
  ],
  'Hafız Talha Kaya-Siyer': [
    { from: { month: 7, year: 2023 }, to: null }
  ],
  'Muhammed Yılmaz-Siyer': [
    { from: { month: 7, year: 2023 }, to: null }
  ],
  'Safa Alev-Siyer': [
    { from: { month: 7, year: 2023 }, to: null }
  ],
  'Çağrı Cengiz-Siyer': [
    { from: { month: 7, year: 2023 }, to: null }
  ],
  'Burak Sarı-Siyer': [
    { from: { month: 7, year: 2023 }, to: null }
  ],
  'Ahmet Selim Akkaş-Siyer': [
    { from: { month: 7, year: 2024 }, to: null }
  ],
  'Emir Yüce-Siyer': [
    { from: { month: 7, year: 2024 }, to: null }
  ],
  'Akif Şentürk-Siyer': [
    { from: { month: 7, year: 2024 }, to: null }
  ],
  'Emin Can-Siyer': [
    { from: { month: 7, year: 2025 }, to: null }
  ],
  'İdris Candan-Siyer': [
    { from: { month: 7, year: 2025 }, to: null }
  ],
  'Yasir Bağcı-Siyer': [
    { from: { month: 7, year: 2025 }, to: null }
  ],
  'Yavuz Özay-Siyer': [
    { from: { month: 7, year: 2025 }, to: null }
  ],
  
  // Çay Grubu
  'Yusuf Fatih Çevik-Çay Grubu': [
    { from: { month: 11, year: 2023 }, to: null }
  ],
  'Samet Tathan-Çay Grubu': [
    { from: { month: 11, year: 2023 }, to: null }
  ],
  'Yasir Bağcı-Çay Grubu': [
    { from: { month: 11, year: 2023 }, to: null }
  ],
  'Haşim Mert Tuynak-Çay Grubu': [
    { from: { month: 11, year: 2023 }, to: null }
  ],
  'Ercüment Balkan-Çay Grubu': [
    { from: { month: 11, year: 2023 }, to: null }
  ]
};

// Kişinin belirli bir tarihte grup üyesi olup olmadığını kontrol et
const isPersonInGroupAtDate = (personName: string, groupName: string, month: number, year: number): boolean => {
  const key = `${personName}-${groupName}`;
  const memberships = membershipDates[key];
  
  if (!memberships) {
    return false;
  }
  
  const currentDate = { month, year };
  
  return memberships.some(membership => {
    // Başlangıç tarihini kontrol et
    const isAfterStart = 
      currentDate.year > membership.from.year ||
      (currentDate.year === membership.from.year && currentDate.month >= membership.from.month);
    
    // Bitiş tarihini kontrol et (null ise hala aktif)
    const isBeforeEnd = membership.to === null || 
      currentDate.year < membership.to.year ||
      (currentDate.year === membership.to.year && currentDate.month <= membership.to.month);
    
    return isAfterStart && isBeforeEnd;
  });
};

// Güncel ay için ödenmemiş ödeme kayıtları oluştur
const createCurrentMonthPayments = async () => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 0-based to 1-based
  const currentYear = now.getFullYear();
  
  // Aktif grup üyelerini getir
  const activeMembers = await prisma.groupMember.findMany({
    where: { isActive: true },
    include: {
      person: true,
      group: true
    }
  });
  
  for (const member of activeMembers) {
    // Kişinin bu ay bu grupta üye olup olmadığını kontrol et
    if (isPersonInGroupAtDate(member.person.name, member.group.name, currentMonth, currentYear)) {
      // Bu ay için ödeme kaydının zaten var olup olmadığını kontrol et
      const existingPayment = await prisma.payment.findFirst({
        where: {
          personId: member.personId,
          groupId: member.groupId,
          month: currentMonth,
          year: currentYear
        }
      });
      
      if (!existingPayment) {
        const amount = member.customAmount || member.group.perPersonFee || 0;
        const paymentId = `payment_${member.personId}_${member.groupId}_${currentYear}_${currentMonth}`;
        
        // Ödenmemiş ödeme kaydı oluştur
        await prisma.payment.create({
          data: {
            id: paymentId,
            personId: member.personId,
            groupId: member.groupId,
            amount: amount,
            month: currentMonth,
            year: currentYear,
            isPaid: false,
            createdAt: new Date()
          }
        });
      }
    }
  }
};

// GET - Tüm kişileri getir
export async function GET() {
  try {
    // Önce güncel ay için ödenmemiş ödeme kayıtlarını oluştur
    await createCurrentMonthPayments();
    const people = await prisma.person.findMany({
      include: {
        groupMemberships: {
          include: {
            group: true
          }
        },
        payments: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Kişi verilerini işle
    const processedPeople = people.map(person => {
      const totalPayments = person.payments
        .filter(payment => payment.isPaid)
        .reduce((sum, payment) => sum + payment.amount, 0);
      
      // Tüm ödenmemiş borçları hesapla (sadece güncel ay değil)
      const totalDebt = person.payments
        .filter(payment => !payment.isPaid)
        .reduce((sum, payment) => sum + payment.amount, 0);

      const lastPayment = person.payments
        .filter(payment => payment.isPaid)
        .sort((a, b) => new Date(b.paidAt || 0).getTime() - new Date(a.paidAt || 0).getTime())[0];

      return {
        id: person.id,
        name: person.name,
        email: person.email,
        phone: person.phone,
        groups: person.groupMemberships.map(membership => membership.group.name),
        totalPayments,
        monthlyDebt: totalDebt, // Artık toplam borç
        lastPayment: lastPayment?.paidAt ? 
          new Date(lastPayment.paidAt).toLocaleDateString('tr-TR') : 
          'Henüz ödeme yok',
        status: totalDebt > 0 ? 'borçlu' : 'güncel',
        createdAt: person.createdAt.toLocaleDateString('tr-TR')
      };
    });

    return NextResponse.json(processedPeople);
  } catch (error) {
    console.error('Kişileri getirirken hata:', error);
    return NextResponse.json(
      { error: 'Kişiler getirilemedi' },
      { status: 500 }
    );
  }
}

// POST - Yeni kişi oluştur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'İsim gereklidir' },
        { status: 400 }
      );
    }

    // Email benzersizlik kontrolü (eğer verilmişse)
    if (email && email.trim() !== '') {
      const existingPerson = await prisma.person.findFirst({
        where: {
          email: email.trim()
        }
      });

      if (existingPerson) {
        return NextResponse.json(
          { error: 'Bu email adresi zaten kayıtlı' },
          { status: 400 }
        );
      }
    }

    const newPerson = await prisma.person.create({
      data: {
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null
      },
      include: {
        groupMemberships: {
          include: {
            group: true
          }
        },
        payments: true
      }
    });

    const processedPerson = {
      id: newPerson.id,
      name: newPerson.name,
      email: newPerson.email,
      phone: newPerson.phone,
      groups: [],
      totalPayments: 0,
      monthlyDebt: 0,
      lastPayment: 'Henüz ödeme yok',
      status: 'güncel',
      createdAt: newPerson.createdAt.toLocaleDateString('tr-TR')
    };

    return NextResponse.json(processedPerson, { status: 201 });
  } catch (error) {
    console.error('Kişi oluştururken hata:', error);
    return NextResponse.json(
      { error: 'Kişi oluşturulamadı' },
      { status: 500 }
    );
  }
}
