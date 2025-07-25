import { PrismaClient } from '@prisma/client'
import Database from 'better-sqlite3'
import path from 'path'

const prisma = new PrismaClient()

async function importFromSQLite() {
  console.log('🔄 SQLite database\'den veriler aktarılıyor...')
  
  try {
    // SQLite database'e bağlan
    const dbPath = path.join(process.env.HOME!, 'Desktop', 'yetim_takip_kisisel_veriler', 'dev.db')
    const sqlite = new Database(dbPath)
    
    // Önce production database'i temizle
    console.log('🧹 Production database temizleniyor...')
    await prisma.orphanAssignment.deleteMany()
    await prisma.groupMember.deleteMany()
    await prisma.payment.deleteMany()
    await prisma.orphan.deleteMany()
    await prisma.person.deleteMany()
    await prisma.group.deleteMany()
    
    // Grupları aktar
    console.log('👥 Gruplar aktarılıyor...')
    const groups = sqlite.prepare('SELECT * FROM `Group`').all() as any[]
    for (const group of groups) {
      await prisma.group.create({
        data: {
          id: group.id,
          name: group.name,
          perPersonFee: group.perPersonFee || 0,
          startMonth: group.startMonth || 1,
          startYear: group.startYear || 2024
        }
      })
    }
    console.log(`✅ ${groups.length} grup aktarıldı`)
    
    // Kişileri aktar
    console.log('👤 Kişiler aktarılıyor...')
    const people = sqlite.prepare('SELECT * FROM `Person`').all() as any[]
    for (const person of people) {
      await prisma.person.create({
        data: {
          id: person.id,
          name: person.name,
          email: person.email || '',
          phone: person.phone || ''
        }
      })
    }
    console.log(`✅ ${people.length} kişi aktarıldı`)
    
    // Yetimleri aktar
    console.log('👶 Yetimler aktarılıyor...')
    const orphans = sqlite.prepare('SELECT * FROM `Orphan`').all() as any[]
    for (const orphan of orphans) {
      await prisma.orphan.create({
        data: {
          id: orphan.id,
          name: orphan.name,
          age: orphan.age || 0,
          location: orphan.location || '',
          monthlyFee: orphan.monthlyFee || 0,
          documents: orphan.documents || ''
        }
      })
    }
    console.log(`✅ ${orphans.length} yetim aktarıldı`)
    
    // Grup üyeliklerini aktar
    console.log('🤝 Grup üyelikleri aktarılıyor...')
    const groupMembers = sqlite.prepare('SELECT * FROM `GroupMember`').all() as any[]
    for (const member of groupMembers) {
      await prisma.groupMember.create({
        data: {
          id: member.id,
          groupId: member.groupId,
          personId: member.personId,
          isActive: member.isActive === 1,
          customAmount: member.customAmount
        }
      })
    }
    console.log(`✅ ${groupMembers.length} grup üyeliği aktarıldı`)
    
    // Ödemeleri aktar
    console.log('💰 Ödemeler aktarılıyor...')
    const payments = sqlite.prepare('SELECT * FROM `Payment`').all() as any[]
    for (const payment of payments) {
      await prisma.payment.create({
        data: {
          id: payment.id,
          personId: payment.personId,
          groupId: payment.groupId,
          amount: payment.amount,
          month: payment.month,
          year: payment.year,
          isPaid: payment.isPaid === 1,
          paidAt: payment.paidAt ? new Date(payment.paidAt) : null
        }
      })
    }
    console.log(`✅ ${payments.length} ödeme aktarıldı`)
    
    // Yetim atamalarını aktar
    console.log('👥 Yetim atamaları aktarılıyor...')
    const orphanAssignments = sqlite.prepare('SELECT * FROM `OrphanAssignment`').all() as any[]
    for (const assignment of orphanAssignments) {
      await prisma.orphanAssignment.create({
        data: {
          id: assignment.id,
          groupId: assignment.groupId,
          orphanId: assignment.orphanId
        }
      })
    }
    console.log(`✅ ${orphanAssignments.length} yetim ataması aktarıldı`)
    
    // Grup yetim ödemelerini aktar
    console.log('💰 Grup yetim ödemeleri aktarılıyor...')
    const groupOrphanPayments = sqlite.prepare('SELECT * FROM `GroupOrphanPayment`').all() as any[]
    for (const payment of groupOrphanPayments) {
      await prisma.groupOrphanPayment.create({
        data: {
          id: payment.id,
          groupId: payment.groupId,
          month: payment.month,
          year: payment.year,
          amount: payment.amount,
          isPaid: payment.isPaid === 1,
          paidAt: payment.paidAt ? new Date(payment.paidAt) : null,
          description: payment.description
        }
      })
    }
    console.log(`✅ ${groupOrphanPayments.length} grup yetim ödemesi aktarıldı`)
    
    sqlite.close()
    
    console.log('🎉 TÜM VERİLER BAŞARIYLA AKTARILDI!')
    console.log(`📊 Özet:`)
    console.log(`- ${groups.length} grup`)
    console.log(`- ${people.length} kişi`)
    console.log(`- ${orphans.length} yetim`)
    console.log(`- ${groupMembers.length} grup üyeliği`)
    console.log(`- ${payments.length} ödeme`)
    console.log(`- ${orphanAssignments.length} yetim ataması`)
    console.log(`- ${groupOrphanPayments.length} grup yetim ödemesi`)
    
  } catch (error) {
    console.error('❌ Hata:', error)
  } finally {
    await prisma.$disconnect()
  }
}

importFromSQLite()
