import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Kişinin toplam borcunu hesapla
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Kişinin tüm ödemelerini getir
    const payments = await prisma.payment.findMany({
      where: {
        personId: id
      }
    });

    // Kişinin grup üyeliklerini ve custom amount'larını getir
    const groupMemberships = await prisma.groupMember.findMany({
      where: {
        personId: id,
        isActive: true
      },
      include: {
        group: {
          include: {
            orphans: {
              include: {
                orphan: true
              }
            }
          }
        }
      }
    });

    // Toplam borcu hesapla
    let totalDebt = 0;
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    // Her ay için borcu hesapla
    for (let year = 2024; year <= currentYear; year++) {
      const startMonth = year === 2024 ? 7 : 1; // Temmuz 2024'ten itibaren
      const endMonth = year === currentYear ? currentMonth : 12;

      for (let month = startMonth; month <= endMonth; month++) {
        // Bu ay için ödeme var mı?
        const payment = payments.find(p => p.month === month && p.year === year && p.isPaid);
        
        if (!payment) {
          // Ödeme yoksa, bu ayki borcu hesapla
          groupMemberships.forEach(membership => {
            const monthlyAmount = membership.customAmount || 0;
            totalDebt += monthlyAmount;
          });
        }
      }
    }

    return NextResponse.json({ totalDebt });
  } catch (error) {
    console.error('Borç hesaplanırken hata:', error);
    return NextResponse.json(
      { error: 'Borç hesaplanamadı' },
      { status: 500 }
    );
  }
}
