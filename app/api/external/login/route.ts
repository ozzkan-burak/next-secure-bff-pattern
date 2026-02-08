import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';

// Bu gizli anahtar normalde .NET sunucusunda olur.
// Biz simülasyon için buraya koyuyoruz.
const SECRET_KEY = new TextEncoder().encode(
  'bu-cok-gizli-bir-backend-anahtari-123456',
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // 1. Basit Doğrulama (Mock Database Check)
    if (username !== 'admin' || password !== '123456') {
      return NextResponse.json(
        { error: 'Kullanıcı adı veya şifre hatalı!' },
        { status: 401 },
      );
    }

    // 2. JWT Oluşturma (Backend Token Üretiyor)
    // Bu token şunları içerir: Kullanıcı ID, Rol, Yetkiler
    const accessToken = await new SignJWT({
      id: 'user-777',
      role: 'admin',
      name: 'Mimar Sinan',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('15m') // 15 dakika ömürlü (Kısa ömürlü olması güvenliktir)
      .sign(SECRET_KEY);

    // 3. Yanıt: Sadece JSON (Cookie yok!)
    // Backend: "Al sana token, ne yaparsan yap."
    return NextResponse.json({
      accessToken: accessToken,
      message: 'Giriş başarılı (.NET Backend)',
    });
  } catch (error) {
    console.error('External Login Hatası:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
