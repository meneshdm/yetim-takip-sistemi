import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedDemoData() {
  try {
    console.log('🌱 Demo verileri ekleniyor...');

    // Demo Gruplar
    const group1 = await prisma.group.create({
      data: {
        name: 'Demo Grup 1',
        perPersonFee: 100,
        startMonth: 1,
        startYear: 2025
      }
    });

    const group2 = await prisma.group.create({
      data: {
        name: 'Demo Grup 2', 
        perPersonFee: 150,
        startMonth: 1,
        startYear: 2025
      }
    });

    // Demo Kişiler
    const person1 = await prisma.person.create({
      data: {
        name: 'Demo Kişi 1'
      }
    });

    const person2 = await prisma.person.create({
      data: {
        name: 'Demo Kişi 2'
      }
    });

    // Demo Yetimler
    const orphan1 = await prisma.orphan.create({
      data: {
        name: 'Demo Yetim 1',
        monthlyFee: 500,
        documents: null
      }
    });

    const orphan2 = await prisma.orphan.create({
      data: {
        name: 'Demo Yetim 2',
        monthlyFee: 600,
        documents: null
      }
    });

    // Grup üyelikleri
    await prisma.groupMember.createMany({
      data: [
        { groupId: group1.id, personId: person1.id },
        { groupId: group2.id, personId: person2.id }
      ]
    });

    // Yetim atamaları
    await prisma.orphanAssignment.createMany({
      data: [
        { groupId: group1.id, orphanId: orphan1.id },
        { groupId: group2.id, orphanId: orphan2.id }
      ]
    });

    // Demo ödemeler
    await prisma.payment.createMany({
      data: [
        {
          personId: person1.id,
          groupId: group1.id,
          amount: 100,
          month: 1,
          year: 2025,
          isPaid: true
        },
        {
          personId: person2.id,
          groupId: group2.id,
          amount: 150,
          month: 1,
          year: 2025,
          isPaid: false
        }
      ]
    });

    // Demo yetim ödemeleri
    await prisma.groupOrphanPayment.createMany({
      data: [
        {
          groupId: group1.id,
          amount: 500,
          month: 1,
          year: 2025,
          isPaid: true,
          description: 'Demo Yetim 1 için ödeme'
        },
        {
          groupId: group2.id,
          amount: 600,
          month: 1,
          year: 2025,
          isPaid: false,
          description: 'Demo Yetim 2 için ödeme'
        }
      ]
    });

    console.log('✅ Demo verileri başarıyla eklendi!');
    console.log('📊 Eklenenler:');
    console.log('- 2 Demo Grup');
    console.log('- 2 Demo Kişi');
    console.log('- 2 Demo Yetim');
    console.log('- 2 Demo Ödeme');
    console.log('- 2 Demo Yetim Ödemesi');

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDemoData();
