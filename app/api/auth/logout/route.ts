import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  // 1. Cookie dükkanına gir
  const cookieStore = await cookies();

  // 2. 'auth_token' isimli cookie'yi SİL
  // (Next.js arka planda bu cookie'nin son kullanma tarihini geçmişe ayarlar)
  cookieStore.delete('auth_token');

  // 3. Kullanıcıyı Login sayfasına yönlendir (Server-Side Redirect)
  // JSON dönmek yerine doğrudan yönlendiriyoruz, böylece <form> etiketi otomatik çalışır.
  return NextResponse.redirect(new URL('/login', request.url));
}
