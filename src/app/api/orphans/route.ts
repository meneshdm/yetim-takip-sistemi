import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Tüm yetimleri getir
export async function GET() {
  try {
    const orphans = await prisma.orphan.findMany({
      include: {
        assignments: {
          include: {
            group: true
          }
        },
        orphanPayments: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Yetim verilerini işle
    const processedOrphans = orphans.map(orphan => {
      const assignedGroups = orphan.assignments.map(assignment => assignment.group.name);
      
      const totalPaid = orphan.orphanPayments
        .filter(payment => payment.isPaid)
        .reduce((sum, payment) => sum + payment.amount, 0);

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      const currentMonthPayment = orphan.orphanPayments.find(payment => 
        payment.month === currentMonth && 
        payment.year === currentYear
      );

      return {
        id: orphan.id,
        name: orphan.name,
        age: orphan.age,
        location: orphan.location,
        photo: orphan.photo,
        description: orphan.description,
        monthlyFee: orphan.monthlyFee,
        pdfFile: orphan.pdfFile,
        documents: orphan.documents,
        groups: assignedGroups,
        totalPaid,
        currentMonthPaid: currentMonthPayment?.isPaid || false,
        createdAt: orphan.createdAt.toLocaleDateString('tr-TR')
      };
    });

    return NextResponse.json(processedOrphans);
  } catch (error) {
    console.error('Yetimleri getirirken hata:', error);
    return NextResponse.json(
      { error: 'Yetimler getirilemedi' },
      { status: 500 }
    );
  }
}

// POST - Yeni yetim oluştur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      age, 
      location, 
      photo, 
      description, 
      monthlyFee, 
      pdfFile 
    } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Yetim adı gereklidir' },
        { status: 400 }
      );
    }

    if (!monthlyFee || monthlyFee <= 0) {
      return NextResponse.json(
        { error: 'Geçerli bir aylık ücret giriniz' },
        { status: 400 }
      );
    }

    const newOrphan = await prisma.orphan.create({
      data: {
        name: name.trim(),
        age: age ? parseInt(age) : null,
        location: location?.trim() || null,
        photo: photo?.trim() || null,
        description: description?.trim() || null,
        monthlyFee: parseFloat(monthlyFee),
        pdfFile: pdfFile?.trim() || null
      },
      include: {
        assignments: {
          include: {
            group: true
          }
        },
        orphanPayments: true
      }
    });

    const processedOrphan = {
      id: newOrphan.id,
      name: newOrphan.name,
      age: newOrphan.age,
      location: newOrphan.location,
      photo: newOrphan.photo,
      description: newOrphan.description,
      monthlyFee: newOrphan.monthlyFee,
      pdfFile: newOrphan.pdfFile,
      documents: newOrphan.documents,
      groups: [],
      totalPaid: 0,
      currentMonthPaid: false,
      createdAt: newOrphan.createdAt.toLocaleDateString('tr-TR')
    };

    return NextResponse.json(processedOrphan, { status: 201 });
  } catch (error) {
    console.error('Yetim oluştururken hata:', error);
    return NextResponse.json(
      { error: 'Yetim oluşturulamadı' },
      { status: 500 }
    );
  }
}
