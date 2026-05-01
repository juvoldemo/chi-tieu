# Be Bong

Mobile-first React web app quan ly thu chi cho hai vo chong, thiet ke iOS glassmorphism/liquid glass, dung Supabase Database va san sang deploy Vercel.

App da bo man hinh dang nhap. Mo web la vao thang man hinh chinh.

## Cai dat

```bash
npm install
cp .env.example .env.local
npm run dev
```

Dien `.env.local`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Supabase

1. Tao project Supabase.
2. Vao **SQL Editor**.
3. Chay toan bo file `supabase/schema.sql`.
4. Lay `Project URL` va `anon public key` dua vao `.env.local`.

Schema hien tai la che do app ca nhan khong dang nhap: RLS van bat, nhung cho phep `anon` va `authenticated` doc/ghi du lieu. Neu deploy public, hay dat bao ve bang Vercel password/protection hoac chi chia se URL trong gia dinh.

## Deploy Vercel

1. Push repo len GitHub.
2. Import project vao Vercel.
3. Framework preset: **Vite**.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Them Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
7. Deploy.

## PWA tren iPhone

App da co:

- `manifest.webmanifest`
- icon app
- `apple-mobile-web-app-capable`
- `viewport-fit=cover`
- safe-area bottom cho iPhone tai tho

Sau khi deploy HTTPS, mo bang Safari iOS, chon **Share > Add to Home Screen**.
