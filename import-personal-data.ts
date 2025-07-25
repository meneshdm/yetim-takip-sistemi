import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function importPersonalData() {
  console.log('🔄 Kişisel veriler yükleniyor...')
  
  try {
    // Önce demo verileri temizle
    console.log('🧹 Demo veriler temizleniyor...')
    await prisma.orphanAssignment.deleteMany()
    await prisma.groupMember.deleteMany()
    await prisma.payment.deleteMany()
    await prisma.orphan.deleteMany()
    await prisma.person.deleteMany()
    await prisma.group.deleteMany()
    
    // CSV dosyalarını oku
    const dataPath = path.join(process.env.HOME!, 'Desktop', 'yetim_takip_kisisel_veriler')
    
    // Gruplar CSV'sini oku
    const groupsCsv = fs.readFileSync(path.join(dataPath, 'Yetim Takibi Gruplar.csv'), 'utf-8')
    const groupsLines = groupsCsv.split('\n').filter(line => line.trim())
    
    // Kişiler CSV'sini oku  
    const peopleCsv = fs.readFileSync(path.join(dataPath, 'Yetim Takibi Kişiler ve Ödemeleri.csv'), 'utf-8')
    const peopleLines = peopleCsv.split('\n').filter(line => line.trim())
    
    // Yetimler CSV'sini oku
    const orphansCsv = fs.readFileSync(path.join(dataPath, 'Yetim Takibi Yetimler.csv'), 'utf-8')
    const orphansLines = orphansCsv.split('\n').filter(line => line.trim())
    
    console.log(`📊 Bulunan veriler:`)
    console.log(`- ${groupsLines.length - 1} grup`)
    console.log(`- ${peopleLines.length - 1} kişi/ödeme`)
    console.log(`- ${orphansLines.length - 1} yetim`)
    
    // Grupları import et
    console.log('👥 Gruplar ekleniyor...')
    for (let i = 1; i < groupsLines.length; i++) {
      const line = groupsLines[i]
      const [name, perPersonFee, startMonth, startYear] = line.split(',')
      
      if (name?.trim()) {
        await prisma.group.create({
          data: {
            name: name.trim(),
            perPersonFee: parseFloat(perPersonFee || '0'),
            startMonth: parseInt(startMonth || '1'),
            startYear: parseInt(startYear || '2024')
          }
        })
      }
    }
    
    // Kişileri import et
    console.log('👤 Kişiler ekleniyor...')
    for (let i = 1; i < peopleLines.length; i++) {
      const line = peopleLines[i]
      const parts = line.split(',')
      const [name, email, phone] = parts
      
      if (name?.trim()) {
        await prisma.person.create({
          data: {
            name: name.trim(),
            email: email?.trim() || '',
            phone: phone?.trim() || ''
          }
        })
      }
    }
    
    // Yetimleri import et
    console.log('👶 Yetimler ekleniyor...')
    for (let i = 1; i < orphansLines.length; i++) {
      const line = orphansLines[i]
      const [name, age, location] = line.split(',')
      
      if (name?.trim()) {
        await prisma.orphan.create({
          data: {
            name: name.trim(),
            age: parseInt(age || '0'),
            location: location?.trim() || '',
            monthlyFee: 0,
            documents: ''
          }
        })
      }
    }
    
    console.log('✅ Kişisel veriler başarıyla yüklendi!')
    console.log('📁 Uploads klasörünü manuel olarak kopyalamanız gerekiyor.')
    
  } catch (error) {
    console.error('❌ Hata:', error)
  } finally {
    await prisma.$disconnect()
  }
}

importPersonalData()
