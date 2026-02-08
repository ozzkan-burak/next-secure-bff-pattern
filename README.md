# Next.js Secure BFF Pattern: The Fortress

> **"Identity is the new perimeter."**

Bu proje, modern web uygulamalarında kimlik doğrulama (Authentication) süreçlerini **Client-Side** (Tarayıcı) üzerinden yönetmek yerine, Next.js'i bir **BFF (Backend for Frontend)** katmanı olarak kullanarak güvenli hale getiren bir referans mimarisidir.

Amaç: Hassas verileri (JWT Access Token) tarayıcının JavaScript erişimine tamamen kapatarak **XSS (Cross-Site Scripting)** saldırılarını etkisiz hale getirmektir.



## Problem: "LocalStorage" Yanılgısı

Geleneksel SPA (Single Page Application) mimarilerinde Access Token genellikle `localStorage` veya `sessionStorage` içinde saklanır.

* **Senaryo:** Sitenize zararlı bir 3. parti script (reklam, analitik vb.) sızarsa veya bir XSS açığı bulunursa; saldırgan tek bir satır kodla (`localStorage.getItem('token')`) kullanıcının oturumunu çalabilir.
* **Risk:** Yüksek. Token çalındığında, saldırgan kullanıcı adına API'ye her türlü isteği atabilir.

## 🛡️ Çözüm: "The Fortress" Mimarisi (HttpOnly Cookie Proxy)

Bu mimaride Next.js, Frontend ile Backend API arasında bir **Güvenlik Duvarı (Proxy)** görevi görür.

1.  **Backend (API):** Token üretir ve JSON olarak döner (Cookie bilmez).
2.  **Next.js (BFF):** Token'ı API'den alır. Onu **`HttpOnly`**, **`Secure`** ve **`SameSite`** bayraklarına sahip bir Cookie içine paketler.
3.  **Browser:** Cookie'yi saklar ama JavaScript ile **ASLA** okuyamaz (`document.cookie` boştur).
4.  **Middleware:** Her istekte Cookie'yi kontrol eder, gerekirse token'ı ayrıştırıp (decode) kullanıcıyı yetkilendirir.

### Mimari Akış Diyagramı

```mermaid
sequenceDiagram
    participant User as Browser (JavaScript)
    participant Next as Next.js (BFF / Proxy)
    participant API as External Backend (.NET/Go/Node)

    Note over User, Next: 1. GÜVENSİZ BÖLGE (Frontend)
    User->>Next: POST /api/auth/login (Creds)
    
    Note over Next, API: 2. GÜVENLİ BÖLGE (Server-Side)
    Next->>API: POST /external-api/login
    API-->>Next: 200 OK + { accessToken: "eyJ..." }
    
    Note right of Next: 3. DÖNÜŞÜM (The Fortress Logic)
    Next->>Next: Token -> HttpOnly Cookie Paketleme
    
    Next-->>User: 200 OK + Set-Cookie: auth_token=...; HttpOnly
    
    Note over User: 4. SONUÇ
    Note right of User: JS token'ı göremez. <br/>XSS saldırıları token'ı çalamaz.
