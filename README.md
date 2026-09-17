# Sistem Informasi & Auto Answer UPTD Puskesmas Bawolato

PWA React + TypeScript + Vite dengan Supabase untuk data transaksi/admin dan GitHub JSON sebagai sumber pertanyaan-jawaban otomatis.

## 1. Instalasi

```bash
npm install
cp .env.example .env
npm run dev
```

## 2. Environment

Isi `.env`:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_GITHUB_OWNER=USERNAME_GITHUB
VITE_GITHUB_REPO=bawolato-question-data
VITE_GITHUB_BRANCH=main
VITE_GITHUB_QUESTIONS_PATH=data/questions.json
```

Jangan commit `.env`.

## 3. Supabase

1. Buat project Supabase.
2. Buka SQL Editor.
3. Jalankan `supabase/schema.sql`.
4. Buat satu akun admin melalui Authentication > Users.
5. Salin UUID user tersebut.
6. Tambahkan profil admin, contoh:

```sql
insert into public.profiles (id, username, role)
values ('UUID_USER_SUPABASE', 'admin', 'admin');
```

Password tidak disimpan di source code aplikasi.

## 4. GitHub question repository

Buat repository terpisah, misalnya `bawolato-question-data`.

Struktur:

```text
data/questions.json
```

Gunakan format objek `id`, `category`, `question`, `answer`, `active`, `sort_order`.

Aplikasi hanya membaca data publik ini. Jangan menaruh data pasien, token, password, atau data rahasia di repository tersebut.

## 5. Fitur

- Pertanyaan otomatis dari GitHub
- Cache pertanyaan terakhir
- Pertanyaan manual ke inbox admin
- Kritik & saran ke inbox admin
- Riwayat dengan snapshot pertanyaan/jawaban
- Export XLSX
- Supabase Auth + role admin + RLS
- Responsive mobile/desktop
- PWA installable
- Call Center 085179550988

## 6. Build

```bash
npm run build
npm run preview
```

## Catatan

Operasi baca/tulis Supabase membutuhkan koneksi internet. Service worker hanya membantu asset aplikasi dan cache pertanyaan publik.
