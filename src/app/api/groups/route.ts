import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Tüm grupları getir
export async function GET() {
  try {
    const groups = await prisma.group.findMany({
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Grup verilerini işle
    const processedGroups = groups.map(group => ({
      id: group.id,
      name: group.name,
      startMonth: group.startMonth,
      startYear: group.startYear,
      memberCount: group.members.length,
      orphanCount: group.orphans.length,
      totalMonthlyAmount: group.orphans.reduce((sum, assignment) => 
        sum + assignment.orphan.monthlyFee, 0
      ),
      createdAt: group.createdAt.toLocaleDateString('tr-TR'),
      members: group.members.map(member => member.person),
      orphans: group.orphans.map(assignment => assignment.orphan)
    }));

    return NextResponse.json(processedGroups);
  } catch (error) {
    console.error('Grupları getirirken hata:', error);
    return NextResponse.json(
      { error: 'Gruplar getirilemedi' },
      { status: 500 }
    );
  }
}

// POST - Yeni grup oluştur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, startMonth, startYear } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Grup adı gereklidir' },
        { status: 400 }
      );
    }

    // Başlangıç tarihi validasyonu
    if (startMonth && (startMonth < 1 || startMonth > 12)) {
      return NextResponse.json(
        { error: 'Geçersiz ay seçimi' },
        { status: 400 }
      );
    }

    if (startYear && startYear < 2020) {
      return NextResponse.json(
        { error: 'Geçersiz yıl seçimi' },
        { status: 400 }
      );
    }

    // Aynı isimde grup var mı kontrol et
    const existingGroup = await prisma.group.findFirst({
      where: {
        name: name.trim()
      }
    });

    if (existingGroup) {
      return NextResponse.json(
        { error: 'Bu isimde bir grup zaten mevcut' },
        { status: 400 }
      );
    }

    const newGroup = await prisma.group.create({
      data: {
        name: name.trim(),
        startMonth: startMonth || null,
        startYear: startYear || null
      },
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

    const processedGroup = {
      id: newGroup.id,
      name: newGroup.name,
      memberCount: 0,
      orphanCount: 0,
      totalMonthlyAmount: 0,
      createdAt: newGroup.createdAt.toLocaleDateString('tr-TR'),
      members: [],
      orphans: []
    };

    return NextResponse.json(processedGroup, { status: 201 });
  } catch (error) {
    console.error('Grup oluştururken hata:', error);
    return NextResponse.json(
      { error: 'Grup oluşturulamadı' },
      { status: 500 }
    );
  }
}
