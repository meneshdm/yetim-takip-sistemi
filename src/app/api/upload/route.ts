import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const orphanId = data.get('orphanId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'Dosya seçilmedi' },
        { status: 400 }
      );
    }

    if (!orphanId) {
      return NextResponse.json(
        { error: 'Yetim ID gereklidir' },
        { status: 400 }
      );
    }

    // Dosya uzantısını kontrol et
    const allowedTypes = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !allowedTypes.includes(fileExtension)) {
      return NextResponse.json(
        { error: 'Desteklenmeyen dosya türü. Sadece PDF, DOC, DOCX, JPG, PNG dosyaları yükleyebilirsiniz.' },
        { status: 400 }
      );
    }

    // Dosya boyutunu kontrol et (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Dosya boyutu 5MB\'dan büyük olamaz' },
        { status: 400 }
      );
    }

    // Yetim var mı kontrol et
    const orphan = await prisma.orphan.findUnique({
      where: { id: orphanId }
    });

    if (!orphan) {
      return NextResponse.json(
        { error: 'Yetim bulunamadı' },
        { status: 404 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Dosya adını oluştur (timestamp + orijinal ad)
    const timestamp = Date.now();
    const fileName = `${timestamp}_${orphanId}_${file.name}`;
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    const filePath = join(uploadDir, fileName);

    // Uploads klasörü yoksa oluştur
    try {
      await writeFile(filePath, buffer);
    } catch (error) {
      // Klasör yoksa oluşturmaya çalış
      const { mkdir } = await import('fs/promises');
      await mkdir(uploadDir, { recursive: true });
      await writeFile(filePath, buffer);
    }

    // Mevcut dosyaları al
    const existingDocuments = orphan.documents ? JSON.parse(orphan.documents) : [];
    
    // Yeni dosyayı ekle
    const newDocument = {
      fileName: file.name,
      filePath: `/uploads/${fileName}`,
      uploadedAt: new Date().toISOString(),
      fileSize: file.size,
      fileType: fileExtension
    };

    const updatedDocuments = [...existingDocuments, newDocument];

    // Veritabanında dosya bilgisini kaydet
    const updatedOrphan = await prisma.orphan.update({
      where: { id: orphanId },
      data: {
        documents: JSON.stringify(updatedDocuments)
      }
    });

    return NextResponse.json({
      message: 'Dosya başarıyla yüklendi',
      fileName: file.name,
      filePath: `/uploads/${fileName}`,
      fileSize: file.size
    });

  } catch (error) {
    console.error('Dosya yükleme hatası:', error);
    return NextResponse.json(
      { error: 'Dosya yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
