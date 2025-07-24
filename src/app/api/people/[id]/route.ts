import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Tek kişi getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const person = await prisma.person.findUnique({
      where: { id },
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
      }
    });

    if (!person) {
      return NextResponse.json(
        { error: 'Kişi bulunamadı' },
        { status: 404 }
      );
    }

    const groups = person.groupMemberships.map(membership => membership.group.name);
    
    const totalPayments = person.payments
      .filter(payment => payment.isPaid)
      .reduce((sum, payment) => sum + payment.amount, 0);

    const processedPerson = {
      id: person.id,
      name: person.name,
      email: person.email,
      phone: person.phone,
      groups,
      totalPayments,
      createdAt: person.createdAt.toLocaleDateString('tr-TR')
    };

    return NextResponse.json(processedPerson);
  } catch (error) {
    console.error('Kişi getirirken hata:', error);
    return NextResponse.json(
      { error: 'Kişi getirilemedi' },
      { status: 500 }
    );
  }
}

// PUT - Kişi güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, phone } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Kişi adı gereklidir' },
        { status: 400 }
      );
    }

    // Kişi var mı kontrol et
    const existingPerson = await prisma.person.findUnique({
      where: { id }
    });

    if (!existingPerson) {
      return NextResponse.json(
        { error: 'Kişi bulunamadı' },
        { status: 404 }
      );
    }

    const updatedPerson = await prisma.person.update({
      where: { id },
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

    const groups = updatedPerson.groupMemberships.map(membership => membership.group.name);
    
    const totalPayments = updatedPerson.payments
      .filter(payment => payment.isPaid)
      .reduce((sum, payment) => sum + payment.amount, 0);

    const processedPerson = {
      id: updatedPerson.id,
      name: updatedPerson.name,
      email: updatedPerson.email,
      phone: updatedPerson.phone,
      groups,
      totalPayments,
      createdAt: updatedPerson.createdAt.toLocaleDateString('tr-TR')
    };

    return NextResponse.json(processedPerson);
  } catch (error) {
    console.error('Kişi güncellerken hata:', error);
    return NextResponse.json(
      { error: 'Kişi güncellenemedi' },
      { status: 500 }
    );
  }
}

// DELETE - Kişi sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Kişi var mı kontrol et
    const existingPerson = await prisma.person.findUnique({
      where: { id },
      include: {
        groupMemberships: true,
        payments: true
      }
    });

    if (!existingPerson) {
      return NextResponse.json(
        { error: 'Kişi bulunamadı' },
        { status: 404 }
      );
    }

    // İlişkili kayıtları sil (Prisma otomatik olarak onDelete: Cascade ile yapacak)
    await prisma.person.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: 'Kişi başarıyla silindi' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Kişi silme hatası:', error);
    return NextResponse.json(
      { error: 'Kişi silinemedi' },
      { status: 500 }
    );
  }
}
