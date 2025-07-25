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
    type GroupRow = {
      id: number
      name: string
      perPersonFee: number
      startMonth: number
      startYear: number
      createdAt: string
      updatedAt: string
    }
    const groups = sqlite.prepare('SELECT * FROM Group').all() as GroupRow[]
    for (const group of groups) {
      await prisma.group.create({
        data: {
          id: String(group.id),
          name: group.name,
          perPersonFee: group.perPersonFee || 0,
          startMonth: group.startMonth || 1,
          startYear: group.startYear || 2024,
          createdAt: new Date(group.createdAt),
          updatedAt: new Date(group.updatedAt)
        }
      })
    }
    console.log(`✅ ${groups.length} grup aktarıldı`)
    
    // Kişileri aktar
    console.log('👤 Kişiler aktarılıyor...')
    type PersonRow = {
      id: number
      name: string
      email?: string
      phone?: string
      createdAt: string
      updatedAt: string
    }
    const people = sqlite.prepare('SELECT * FROM Person').all() as PersonRow[]
    for (const person of people) {
      await prisma.person.create({
        data: {
          id: String(person.id),
          name: person.name,
          email: person.email || '',
          phone: person.phone || '',
          createdAt: new Date(person.createdAt),
          updatedAt: new Date(person.updatedAt)
        }
      })
    }
    console.log(`✅ ${people.length} kişi aktarıldı`)
    
    // Yetimleri aktar
    console.log('👶 Yetimler aktarılıyor...')
    type OrphanRow = {
      id: number
      name: string
      age?: number
      location?: string
      monthlyFee?: number
      documents?: string
      createdAt: string
      updatedAt: string
    }
    const orphans = sqlite.prepare('SELECT * FROM Orphan').all() as OrphanRow[]
    for (const orphan of orphans) {
      await prisma.orphan.create({
        data: {
          id: String(orphan.id),
          name: orphan.name,
          age: orphan.age || 0,
          location: orphan.location || '',
          monthlyFee: orphan.monthlyFee || 0,
          documents: orphan.documents || '',
          createdAt: new Date(orphan.createdAt),
          updatedAt: new Date(orphan.updatedAt)
        }
      })
    }
    console.log(`✅ ${orphans.length} yetim aktarıldı`)
    
    // Grup üyeliklerini aktar
    console.log('🤝 Grup üyelikleri aktarılıyor...')
    type GroupMemberRow = {
      id: number
      groupId: number
      personId: number
      isActive: number
      customAmount?: number
      createdAt: string
      updatedAt: string
    }
    const groupMembers = sqlite.prepare('SELECT * FROM GroupMember').all() as GroupMemberRow[]
    for (const member of groupMembers) {
      await prisma.groupMember.create({
        data: {
          id: String(member.id),
          groupId: String(member.groupId),
          personId: String(member.personId),
          isActive: member.isActive === 1,
          customAmount: member.customAmount
        }
      })
    }
    console.log(`✅ ${groupMembers.length} grup üyeliği aktarıldı`)
    
    // Ödemeleri aktar
    console.log('💰 Ödemeler aktarılıyor...')
    type PaymentRow = {
      id: number
      personId: number
      groupId: number
      amount: number
      month: number
      year: number
      isPaid: number
      paidAt?: string | null
      createdAt: string
      updatedAt: string
    }
    const payments = sqlite.prepare('SELECT * FROM Payment').all() as PaymentRow[]
    for (const payment of payments) {
      await prisma.payment.create({
        data: {
          id: String(payment.id),
          personId: String(payment.personId),
          groupId: String(payment.groupId),
          amount: payment.amount,
          month: payment.month,
          year: payment.year,
          isPaid: payment.isPaid === 1,
          paidAt: payment.paidAt ? new Date(payment.paidAt) : null,
          createdAt: new Date(payment.createdAt)
        }
      })
    }
    console.log(`✅ ${payments.length} ödeme aktarıldı`)
    
    // Yetim atamalarını aktar
    console.log('👥 Yetim atamaları aktarılıyor...')
    type OrphanAssignmentRow = {
      id: number
      groupId: number
      orphanId: number
      createdAt: string
      updatedAt: string
    }
    const orphanAssignments = sqlite.prepare('SELECT * FROM OrphanAssignment').all() as OrphanAssignmentRow[]
    for (const assignment of orphanAssignments) {
      await prisma.orphanAssignment.create({
        data: {
          id: String(assignment.id),
          groupId: String(assignment.groupId),
          orphanId: String(assignment.orphanId)
        }
      })
    }
    console.log(`✅ ${orphanAssignments.length} yetim ataması aktarıldı`)
    
    sqlite.close()
    
    console.log('🎉 TÜM VERİLER BAŞARIYLA AKTARILDI!')
    console.log(`📊 Özet:`)
    console.log(`- ${groups.length} grup`)
    console.log(`- ${people.length} kişi`)
    console.log(`- ${orphans.length} yetim`)
    console.log(`- ${groupMembers.length} grup üyeliği`)
    console.log(`- ${payments.length} ödeme`)
    console.log(`- ${orphanAssignments.length} yetim ataması`)
    
  } catch (error) {
    console.error('❌ Hata:', error)
  } finally {
    await prisma.$disconnect()
  }
}

importFromSQLite()
