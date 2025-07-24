import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Güvenlik için ortam değişkenlerini kullanmalısınız
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'yetim2024!';
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { message: 'Şifre gerekli' },
        { status: 400 }
      );
    }

    // Şifre kontrolü
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { message: 'Hatalı şifre' },
        { status: 401 }
      );
    }

    // JWT token oluştur
    const token = jwt.sign(
      { authenticated: true, timestamp: Date.now() },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return NextResponse.json(
      { 
        message: 'Giriş başarılı',
        token 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
