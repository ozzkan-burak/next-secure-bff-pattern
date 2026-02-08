import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

// Backend'deki gizli anahtarın aynısı (Simülasyon için)
const SECRET_KEY = new TextEncoder().encode(
  'bu-cok-gizli-bir-backend-anahtari-123456',
);

export default async function DashboardPage() {
  // 1. Server Component içinde Cookie'yi oku
  // Middleware "var" dedi ama biz burada "içini" okuyacağız.
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token');

  let userData = null;

  try {
    if (token) {
      // 2. Token'ı doğrula ve içindeki veriyi (Payload) al
      const { payload } = await jwtVerify(token.value, SECRET_KEY);
      userData = payload;
    }
  } catch (error) {
    // Token geçersizse veya süresi dolmuşsa
    return (
      <div className="text-red-500">
        Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          🏰 Kale İçi (Dashboard)
        </h1>

        <div className="bg-green-50 p-4 rounded mb-4">
          <p className="text-green-700 font-semibold">
            Hoşgeldin, {userData?.name as string}!
          </p>
          <p className="text-sm text-green-600">
            Role: {userData?.role as string}
          </p>
        </div>

        <div className="text-sm text-gray-500">
          <p className="mb-2">
            Bu veriler <strong>Server-Side</strong>'da token çözülerek alındı.
          </p>
          <p>
            Tarayıcıdaki JavaScript bu verilere <code>localStorage</code>{' '}
            üzerinden erişemez.
          </p>
        </div>

        {/* Çıkış Yap Butonu (İleride API ile bağlayacağız) */}
        <form action="/api/auth/logout" method="POST" className="mt-6">
          <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm">
            Oturumu Kapat (Cookie Sil)
          </button>
        </form>
      </div>
    </div>
  );
}
