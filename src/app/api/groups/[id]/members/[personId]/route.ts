import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH - Grup üyesinin custom amount ve aktiflik durumunu güncelle
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; personId: string }> }
) {
  try {
    const { id: groupId, personId } = await params;
    const { customAmount, isActive } = await request.json();

    // Güncellenecek alanları hazırla
    const updateData: { customAmount?: number; isActive?: boolean } = {};
    if (customAmount !== undefined) {
      updateData.customAmount = customAmount;
    }
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    // Grup üyesini güncelle
    const updatedMember = await prisma.groupMember.updateMany({
      where: {
        groupId: groupId,
        personId: personId
      },
      data: updateData
    });

    if (updatedMember.count === 0) {
      return NextResponse.json(
        { error: 'Grup üyesi bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Grup üyesi güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'Grup üyesi güncellenemedi' },
      { status: 500 }
    );
  }
}
