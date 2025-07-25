import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Tek grup getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const group = await prisma.group.findUnique({
      where: {
        id: id
      },
      include: {
        members: {
          include: {
            person: {
              include: {
                payments: {
                  where: {
                    groupId: id
                  },
                  orderBy: [
                    { year: 'desc' },
                    { month: 'desc' }
                  ]
                }
              }
            }
          }
        },
        orphans: {
          include: {
            orphan: true
          }
        },
        orphanPayments: {
          orderBy: [
            { year: 'desc' },
            { month: 'desc' }
          ]
        }
      }
    });

    if (!group) {
      return NextResponse.json(
        { error: 'Grup bulunamadı' },
        { status: 404 }
      );
    }

    const processedGroup = {
      id: group.id,
      name: group.name,
      perPersonFee: group.perPersonFee,
      startMonth: group.startMonth,
      startYear: group.startYear,
      memberCount: group.members.length,
      orphanCount: group.orphans.length,
      totalMonthlyAmount: group.orphans.reduce((sum, assignment) => 
        sum + assignment.orphan.monthlyFee, 0
      ),
      createdAt: group.createdAt.toISOString(),
      members: group.members,
      orphans: group.orphans,
      orphanPayments: group.orphanPayments
    };

    return NextResponse.json(processedGroup);
  } catch (error) {
    console.error('Grup getirirken hata:', error);
    return NextResponse.json(
      { error: 'Grup getirilemedi' },
      { status: 500 }
    );
  }
}

// PUT - Grup güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, perPersonFee, memberIds, orphanIds, startMonth, startYear } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Grup adı gereklidir' },
        { status: 400 }
      );
    }

    // Grup var mı kontrol et
    const existingGroup = await prisma.group.findUnique({
      where: { id: id }
    });

    if (!existingGroup) {
      return NextResponse.json(
        { error: 'Grup bulunamadı' },
        { status: 404 }
      );
    }

    // Aynı isimde başka grup var mı kontrol et
    const duplicateGroup = await prisma.group.findFirst({
      where: {
        name: name.trim(),
        id: { not: id }
      }
    });

    if (duplicateGroup) {
      return NextResponse.json(
        { error: 'Bu isimde bir grup zaten mevcut' },
        { status: 400 }
      );
    }

    // Transaction ile güncelleme işlemini yap
    const updatedGroup = await prisma.$transaction(async (tx) => {
      // Grup bilgilerini güncelle
      const group = await tx.group.update({
        where: { id: id },
        data: {
          name: name.trim(),
          perPersonFee: perPersonFee ? parseFloat(perPersonFee) : null,
          startMonth: startMonth || null,
          startYear: startYear || null
        }
      });

      // Mevcut üyelikleri ve custom amount'ları al
      const existingMembers = await tx.groupMember.findMany({
        where: { groupId: id }
      });

      // Mevcut üyelikleri sil
      await tx.groupMember.deleteMany({
        where: { groupId: id }
      });

      // Mevcut yetim atamalarını sil
      await tx.orphanAssignment.deleteMany({
        where: { groupId: id }
      });

      // Yeni üyelikleri ekle
      if (memberIds && memberIds.length > 0) {
        const memberData = memberIds.map((personId: string) => {
          const existingMember = existingMembers.find(m => m.personId === personId);
          return {
            groupId: id,
            personId,
            customAmount: existingMember?.customAmount || null
          };
        });

        await tx.groupMember.createMany({
          data: memberData
        });
      }

      // Yeni yetim atamalarını ekle
      if (orphanIds && orphanIds.length > 0) {
        await tx.orphanAssignment.createMany({
          data: orphanIds.map((orphanId: string) => ({
            groupId: id,
            orphanId
          }))
        });
      }

      // Güncellenmiş grubu geri döndür
      return await tx.group.findUnique({
        where: { id: id },
        include: {
          members: {
            include: {
              person: true
            }
          },
          orphans: {
            include: {
              orphan: true
            }
          }
        }
      });
    });

    const processedGroup = {
      id: updatedGroup!.id,
      name: updatedGroup!.name,
      perPersonFee: updatedGroup!.perPersonFee,
      startMonth: updatedGroup!.startMonth,
      startYear: updatedGroup!.startYear,
      memberCount: updatedGroup!.members.length,
      orphanCount: updatedGroup!.orphans.length,
      totalMonthlyAmount: updatedGroup!.orphans.reduce((sum, assignment) => 
        sum + assignment.orphan.monthlyFee, 0
      ),
      createdAt: updatedGroup!.createdAt.toLocaleDateString('tr-TR'),
      members: updatedGroup!.members.map(member => member.person),
      orphans: updatedGroup!.orphans.map(assignment => assignment.orphan)
    };

    return NextResponse.json(processedGroup);
  } catch (error) {
    console.error('Grup güncellerken hata:', error);
    return NextResponse.json(
      { error: 'Grup güncellenemedi' },
      { status: 500 }
    );
  }
}

// DELETE - Grup sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Grup var mı kontrol et
    const existingGroup = await prisma.group.findUnique({
      where: { id: id },
      include: {
        members: true,
        orphans: true
      }
    });

    if (!existingGroup) {
      return NextResponse.json(
        { error: 'Grup bulunamadı' },
        { status: 404 }
      );
    }

    // Grupla ilişkili veriler varsa uyarı ver
    if (existingGroup.members.length > 0 || existingGroup.orphans.length > 0) {
      return NextResponse.json(
        { error: 'Bu grup üyeleri veya yetimleri olduğu için silinemez. Önce tüm ilişkileri kaldırın.' },
        { status: 400 }
      );
    }

    await prisma.group.delete({
      where: {
        id: id
      }
    });

    return NextResponse.json(
      { message: 'Grup başarıyla silindi' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Grup silerken hata:', error);
    return NextResponse.json(
      { error: 'Grup silinemedi' },
      { status: 500 }
    );
  }
}
