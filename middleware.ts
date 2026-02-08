import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 1. Korunacak rotaları ve Public rotaları tanımlayalım
const PROTECTED_ROUTES = ['/dashboard', '/profile', '/settings'];
const PUBLIC_ROUTES = ['/login', '/register', '/'];

export function middleware(request: NextRequest) {
  // 2. Kullanıcının gitmek istediği yer neresi?
  const { pathname } = request.nextUrl;

  // 3. Çerezlerde bizim 'auth_token' var mı?
  // Dikkat: Burada token'ın geçerliliğini (signature) kontrol etmiyoruz,
  // sadece varlığına bakıyoruz. Derin kontrolü Server Component'te yapacağız.
  const hasAuthToken = request.cookies.has('auth_token');

  // SENARYO A: Kullanıcı "Korunan" bir yere girmeye çalışıyor ama token yok.
  // Çözüm: Yallah Login sayfasına!
  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!hasAuthToken) {
      const loginUrl = new URL('/login', request.url);
      // Geri döndüğünde kaldığı yerden devam etmesi için query ekleyebiliriz
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // SENARYO B: Kullanıcı zaten giriş yapmış ama tekrar Login sayfasına girmeye çalışıyor.
  // Çözüm: "Zaten içeridesin", Dashboard'a yönlendir.
  if (PUBLIC_ROUTES.includes(pathname) && hasAuthToken) {
    // Sadece /login'e özel bir kontrol de yapabiliriz
    if (pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Her şey yolundaysa, geçişe izin ver.
  return NextResponse.next();
}

// Middleware sadece bu rotalarda çalışsın (Performans için önemli)
export const config = {
  matcher: [
    /*
     * Aşağıdakiler HARİÇ tüm requestlerde çalış:
     * - api (API route'ları)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
