import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cache, CACHE_KEYS } from '@/lib/cache';

// POST - Ödeme işaretle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { personId, groupId, amount, month, year, description, isPaid = true } = body;

    if (!personId) {
      return NextResponse.json(
        { error: 'Kişi ID gereklidir' },
        { status: 400 }
      );
    }

    if (!groupId) {
      return NextResponse.json(
        { error: 'Grup ID gereklidir' },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Geçerli bir tutar giriniz' },
        { status: 400 }
      );
    }

    const currentDate = new Date();
    const paymentMonth = month || (currentDate.getMonth() + 1);
    const paymentYear = year || currentDate.getFullYear();

    // Kişi var mı kontrol et
    const person = await prisma.person.findUnique({
      where: { id: personId }
    });

    if (!person) {
      return NextResponse.json(
        { error: 'Kişi bulunamadı' },
        { status: 404 }
      );
    }

    // Bu ay için ödeme var mı kontrol et
    const existingPayment = await prisma.payment.findUnique({
      where: {
        personId_groupId_month_year: {
          personId,
          groupId,
          month: paymentMonth,
          year: paymentYear
        }
      }
    });

    let payment;

    if (existingPayment) {
      // Mevcut ödemeyi güncelle
      payment = await prisma.payment.update({
        where: {
          id: existingPayment.id
        },
        data: {
          amount,
          isPaid: isPaid,
          paidAt: isPaid ? new Date() : null,
          description: description?.trim() || null
        },
        include: {
          person: true,
          group: true
        }
      });
    } else {
      // Yeni ödeme oluştur
      payment = await prisma.payment.create({
        data: {
          personId,
          groupId,
          amount,
          month: paymentMonth,
          year: paymentYear,
          isPaid: isPaid,
          paidAt: isPaid ? new Date() : null,
          description: description?.trim() || null
        },
        include: {
          person: true,
          group: true
        }
      });
    }

    // Dashboard cache'ini temizle çünkü bakiye değişti
    cache.delete(CACHE_KEYS.DASHBOARD);

    return NextResponse.json({
      id: payment.id,
      personId: payment.personId,
      groupId: payment.groupId,
      personName: payment.person.name,
      groupName: payment.group.name,
      amount: payment.amount,
      month: payment.month,
      year: payment.year,
      isPaid: payment.isPaid,
      paidAt: payment.paidAt?.toLocaleDateString('tr-TR'),
      description: payment.description
    }, { status: 201 });
  } catch (error) {
    console.error('Ödeme işaretlerken hata:', error);
    return NextResponse.json(
      { error: 'Ödeme işaretlenemedi' },
      { status: 500 }
    );
  }
}

// GET - Ödemeleri getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const personId = searchParams.get('personId');
    const groupId = searchParams.get('groupId');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    // Eğer tek bir ödeme sorgulanıyorsa
    if (personId && month && year && groupId) {
      const payment = await prisma.payment.findUnique({
        where: {
          personId_groupId_month_year: {
            personId,
            groupId,
            month: parseInt(month),
            year: parseInt(year)
          }
        },
        include: {
          person: true,
          group: true
        }
      });

      if (!payment) {
        return NextResponse.json(
          { error: 'Ödeme bulunamadı' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        id: payment.id,
        personId: payment.personId,
        groupId: payment.groupId,
        personName: payment.person.name,
        groupName: payment.group.name,
        amount: payment.amount,
        month: payment.month,
        year: payment.year,
        isPaid: payment.isPaid,
        paidAt: payment.paidAt?.toISOString(),
        description: payment.description,
        createdAt: payment.createdAt.toISOString()
      });
    }

    // Çoklu ödeme sorgusu
    const whereClause: Record<string, unknown> = {};

    if (personId) {
      whereClause.personId = personId;
    }

    if (month) {
      whereClause.month = parseInt(month);
    }

    if (year) {
      whereClause.year = parseInt(year);
    }

    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        person: true
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    const processedPayments = payments.map(payment => ({
      id: payment.id,
      personId: payment.personId,
      personName: payment.person.name,
      amount: payment.amount,
      month: payment.month,
      year: payment.year,
      isPaid: payment.isPaid,
      paidAt: payment.paidAt?.toISOString(),
      description: payment.description,
      createdAt: payment.createdAt.toISOString()
    }));

    return NextResponse.json(processedPayments);
  } catch (error) {
    console.error('Ödemeleri getirirken hata:', error);
    return NextResponse.json(
      { error: 'Ödemeler getirilemedi' },
      { status: 500 }
    );
  }
}

// DELETE - Ödeme sil
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const personId = searchParams.get('personId');
    const groupId = searchParams.get('groupId');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    if (!personId || !groupId || !month || !year) {
      return NextResponse.json(
        { error: 'PersonId, groupId, month ve year parametreleri gerekli' },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findUnique({
      where: {
        personId_groupId_month_year: {
          personId,
          groupId,
          month: parseInt(month),
          year: parseInt(year)
        }
      }
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Ödeme bulunamadı' },
        { status: 404 }
      );
    }

    await prisma.payment.delete({
      where: {
        id: payment.id
      }
    });

    // Dashboard cache'ini temizle çünkü bakiye değişti
    cache.delete(CACHE_KEYS.DASHBOARD);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ödeme silinirken hata:', error);
    return NextResponse.json(
      { error: 'Ödeme silinemedi' },
      { status: 500 }
    );
  }
}
