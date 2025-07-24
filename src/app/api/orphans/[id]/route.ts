import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Tek yetim getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orphan = await prisma.orphan.findUnique({
      where: { id },
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
      }
    });

    if (!orphan) {
      return NextResponse.json(
        { error: 'Yetim bulunamadı' },
        { status: 404 }
      );
    }

    const assignedGroups = orphan.assignments.map(assignment => assignment.group.name);
    
    const totalPaid = orphan.orphanPayments
      .filter(payment => payment.isPaid)
      .reduce((sum, payment) => sum + payment.amount, 0);

    const processedOrphan = {
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
      createdAt: orphan.createdAt.toLocaleDateString('tr-TR')
    };

    return NextResponse.json(processedOrphan);
  } catch (error) {
    console.error('Yetim getirirken hata:', error);
    return NextResponse.json(
      { error: 'Yetim getirilemedi' },
      { status: 500 }
    );
  }
}

// PUT - Yetim güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { 
      name, 
      age, 
      location, 
      description, 
      monthlyFee 
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

    // Yetim var mı kontrol et
    const existingOrphan = await prisma.orphan.findUnique({
      where: { id }
    });

    if (!existingOrphan) {
      return NextResponse.json(
        { error: 'Yetim bulunamadı' },
        { status: 404 }
      );
    }

    const updatedOrphan = await prisma.orphan.update({
      where: { id },
      data: {
        name: name.trim(),
        age: age ? parseInt(age) : null,
        location: location?.trim() || null,
        description: description?.trim() || null,
        monthlyFee: parseFloat(monthlyFee)
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

    const assignedGroups = updatedOrphan.assignments.map(assignment => assignment.group.name);
    
    const totalPaid = updatedOrphan.orphanPayments
      .filter(payment => payment.isPaid)
      .reduce((sum, payment) => sum + payment.amount, 0);

    const processedOrphan = {
      id: updatedOrphan.id,
      name: updatedOrphan.name,
      age: updatedOrphan.age,
      location: updatedOrphan.location,
      photo: updatedOrphan.photo,
      description: updatedOrphan.description,
      monthlyFee: updatedOrphan.monthlyFee,
      pdfFile: updatedOrphan.pdfFile,
      documents: updatedOrphan.documents,
      groups: assignedGroups,
      totalPaid,
      createdAt: updatedOrphan.createdAt.toLocaleDateString('tr-TR')
    };

    return NextResponse.json(processedOrphan);
  } catch (error) {
    console.error('Yetim güncellerken hata:', error);
    return NextResponse.json(
      { error: 'Yetim güncellenemedi' },
      { status: 500 }
    );
  }
}

// DELETE - Yetim sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Yetim var mı kontrol et
    const existingOrphan = await prisma.orphan.findUnique({
      where: { id },
      include: {
        assignments: true,
        orphanPayments: true
      }
    });

    if (!existingOrphan) {
      return NextResponse.json(
        { error: 'Yetim bulunamadı' },
        { status: 404 }
      );
    }

    // İlişkili kayıtları sil (Prisma otomatik olarak onDelete: Cascade ile yapacak)
    await prisma.orphan.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: 'Yetim başarıyla silindi' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Yetim silme hatası:', error);
    return NextResponse.json(
      { error: 'Yetim silinemedi' },
      { status: 500 }
    );
  }
}
