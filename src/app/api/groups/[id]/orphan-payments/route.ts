import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cache, CACHE_KEYS } from '@/lib/cache';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await params;
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month') || '0');
    const year = parseInt(searchParams.get('year') || '0');

    if (!month || !year) {
      return NextResponse.json(
        { error: 'Ay ve yıl parametreleri gerekli' },
        { status: 400 }
      );
    }

    const orphanPayment = await prisma.groupOrphanPayment.findFirst({
      where: {
        groupId,
        month,
        year,
      },
    });

    if (!orphanPayment) {
      return NextResponse.json(
        { isPaid: false, amount: 0 },
        { status: 404 }
      );
    }

    return NextResponse.json({
      isPaid: orphanPayment.isPaid,
      amount: orphanPayment.amount,
      paidAt: orphanPayment.paidAt?.toISOString(),
    });
  } catch (error) {
    console.error('Yetim ödeme durumu getirme hatası:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await params;
    const body = await request.json();
    const { month, year, amount, isPaid } = body;

    if (!month || !year || amount === undefined || isPaid === undefined) {
      return NextResponse.json(
        { error: 'Eksik parametreler' },
        { status: 400 }
      );
    }

    // Mevcut ödeme kaydını kontrol et
    const existingPayment = await prisma.groupOrphanPayment.findFirst({
      where: {
        groupId,
        month,
        year,
      },
    });

    if (existingPayment) {
      // Güncelle
      const updatedPayment = await prisma.groupOrphanPayment.update({
        where: { id: existingPayment.id },
        data: {
          amount,
          isPaid,
          paidAt: isPaid ? new Date() : null,
        },
      });

      // Dashboard cache'ini temizle çünkü bakiye değişti
      cache.delete(CACHE_KEYS.DASHBOARD);

      return NextResponse.json({
        success: true,
        payment: {
          isPaid: updatedPayment.isPaid,
          amount: updatedPayment.amount,
          paidAt: updatedPayment.paidAt?.toISOString(),
        },
      });
    } else {
      // Yeni kayıt oluştur
      const newPayment = await prisma.groupOrphanPayment.create({
        data: {
          groupId,
          month,
          year,
          amount,
          isPaid,
          paidAt: isPaid ? new Date() : null,
        },
      });

      // Dashboard cache'ini temizle çünkü bakiye değişti
      cache.delete(CACHE_KEYS.DASHBOARD);

      return NextResponse.json({
        success: true,
        payment: {
          isPaid: newPayment.isPaid,
          amount: newPayment.amount,
          paidAt: newPayment.paidAt?.toISOString(),
        },
      });
    }
  } catch (error) {
    console.error('Yetim ödeme durumu güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
