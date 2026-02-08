import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'; // Next.js'in Cookie yönetim kütüphanesi

export async function POST(request: Request) {
  try {
    // 1. Frontend'den gelen veriyi al
    const body = await request.json();
    const { username, password } = body;

    // 2. Backend'e (External API) istek at (Server-to-Server Communication)
    // Gerçek hayatta burası 'https://api.sirket.com/v1/login' olur.
    // Biz simülasyon servisimizi çağırıyoruz.
    const backendResponse = await fetch(
      'http://localhost:3000/api/external/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      },
    );

    const data = await backendResponse.json();

    // Eğer Backend hata döndüyse, biz de hata dönelim
    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: data.error || 'Giriş başarısız' },
        { status: backendResponse.status },
      );
    }

    // 3. KRİTİK NOKTA: Token'ı al ve HttpOnly Cookie'ye çevir
    // Next.js 15+ için cookies() asenkron olabilir, await ekliyoruz.
    const cookieStore = await cookies();

    cookieStore.set('auth_token', data.accessToken, {
      httpOnly: true,

      // 👇 BURAYI DEĞİŞTİRİYORUZ
      // Localhost'ta (HTTP) çalışması için şimdilik 'false' yapıyoruz.
      // Production'a çıkarken burayı tekrar 'true' yapacağız.
      secure: false,

      sameSite: 'lax', // 'strict' bazen localhost yönlendirmelerinde sorun çıkarabilir, 'lax' daha güvenlidir şimdilik.
      path: '/',
      maxAge: 60 * 15,
    });

    // 4. Frontend'e "Boş" ama "Başarılı" cevap dön
    // Token gövdede (body) YOK! Sadece Header'da gizli.
    return NextResponse.json({
      success: true,
      message: 'Giriş başarılı! (Cookie set edildi)',
    });
  } catch (error) {
    console.error('Login Proxy Hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
