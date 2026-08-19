# 📝 AI Summarizer

Aplikasi web modern, responsif, dan ramah bagi pemula untuk meringkas teks panjang secara cerdas menggunakan Google Gemini AI (`gemini-3.7-flash`).

Aplikasi ini dirancang dengan arsitektur bersih yang memisahkan logika UI (React + TypeScript + Vite) dan pemrosesan AI di sisi server (Express.js) demi keamanan kunci API.

---

## 🌟 Fitur Utama

1. **Input Teks Mudah**: Mendukung pengetikan langsung, penempelan (*paste*) cepat dari clipboard, tombol Hapus (*Clear*), serta penghitung karakter dan kata real-time.
2. **Kustomisasi Ringkasan**:
   - **Panjang**: *Singkat* (1-2 kalimat), *Sedang* (seimbang), atau *Detail* (komprehensif).
   - **Format**: *Paragraf* mengalir, *Poin-poin (Bullet Points)* terstruktur, atau *TL;DR*.
   - **Bahasa**: *Otomatis* mengikuti teks asli, *Bahasa Indonesia*, atau *English*.
3. **Integrasi Gemini 3.7 AI**: Memanfaatkan model `gemini-3.7-flash` dengan performa tinggi dan hasil akurat.
4. **Indikator Pemuatan (*Loading*) Interaktif**: Animasi dinamis dengan pesan langkah pemrosesan real-time dan penonaktifan tombol otomatis saat AI sedang memproses.
5. **Penanganan Kesalahan (*Error Handling*) Ramah**: Pesan kesalahan yang jelas serta tombol coba lagi (*retry*).
6. **Statistik & Metrik Ringkasan**: Menampilkan penghitung kata & karakter ringkasan, persentase reduksi teks, dan estimasi waktu baca.
7. **Tindakan Cepat**: Tombol **Salin Ringkasan (Copy Summary)** dengan 1-klik dan unduh sebagai file teks (`.txt`).
8. **Mode Gelap (Dark Mode)**: Pengalih mode terang/gelap (Sun / Moon) dengan penyimpanan preferensi otomatis.
9. **Riwayat Sesi**: Menyimpan riwayat ringkasan selama sesi browser aktif.

---

## 📁 Struktur Proyek

```text
ai-summarizer/
├── .env.example              # Template variabel lingkungan (kunci API)
├── .gitignore                # Berkas yang diabaikan oleh Git
├── index.html                # Dokumen HTML utama
├── metadata.json             # Konfigurasi metadata aplikasi
├── package.json              # Daftar dependensi dan skrip proyek
├── README.md                 # Dokumentasi proyek lengkap
├── server.ts                 # Server backend Express & integrasi Gemini API
├── tsconfig.json             # Konfigurasi TypeScript
├── vite.config.ts            # Konfigurasi Vite & Tailwind CSS
└── src/
    ├── main.tsx              # Titik masuk utama React DOM
    ├── App.tsx               # Komponen utama aplikasi
    ├── index.css             # Penataan gaya CSS & animasi
    ├── types.ts              # Definisi interface & type TypeScript
    ├── services/
    │   └── geminiService.ts  # Modul pemanggilan API ke backend
    └── components/
        ├── Header.tsx        # Header navigasi & tombol riwayat
        ├── TextInput.tsx     # Area input teks, counter kata, & opsi ringkasan
        ├── SamplePrompts.tsx # Kartu contoh teks siap uji 1-klik
        ├── SummaryResult.tsx # Tampilan hasil ringkasan, metrik, & tombol salin
        ├── LoadingIndicator.tsx # Indikator pemuatan animasi
        ├── ErrorMessage.tsx  # Banner peringatan kesalahan & tombol retry
        └── SummaryHistory.tsx# Modal riwayat ringkasan sesi
```

---

## 🚀 Panduan Instalasi & Menjalankan Proyek

### 1. Prasyarat
- **Node.js** versi 18 ke atas
- Kunci API Google Gemini (Dapatkan secara gratis di [Google AI Studio](https://aistudio.google.com/))

### 2. Salin Variabel Lingkungan
Buat file `.env` di direktori utama berdasarkan `.env.example`:

```bash
cp .env.example .env
```

Buka file `.env` dan masukkan kunci API Gemini Anda:
```env
GEMINI_API_KEY="kunci_api_gemini_anda_di_sini"
```

> ⚠️ **Catatan Keamanan**: Jangan pernah membagikan atau mengunggah file `.env` yang berisi kunci API asli ke repositori publik seperti GitHub.

### 3. Menginstal Dependensi
Jalankan perintah berikut di terminal:

```bash
npm install
```

### 4. Menjalankan Server Pengembangan (*Development Server*)
Jalankan server aplikasi lokal:

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`. Buka alamat tersebut di peramban web Anda.

### 5. Membangun untuk Produksi (*Production Build*)
Untuk mengompilasi aplikasi ke format produksi:

```bash
npm run build
```

Untuk menjalankan aplikasi produksi yang sudah di-*build*:

```bash
npm start
```

---

## 💡 Penjelasan Arsitektur untuk Pembelajaran

1. **Mengapa Kunci API Ditaruh di Server (`server.ts`)?**
   Jika kunci API ditaruh langsung di kode React (frontend), siapa saja dapat membuka *Inspect Element / DevTools* di browser dan mencuri kunci API Anda. Dengan menyimpannya di `server.ts`, kunci tetap aman di sisi server.

2. **Pemisahan UI dan Logika API (`src/services/geminiService.ts`)**:
   Komponen antarmuka (`App.tsx`, `TextInput.tsx`) tidak perlu tahu bagaimana `fetch()` dilakukan. Jika nanti endpoint berubah, kita hanya perlu mengubah satu file di `geminiService.ts`.

3. **Type Safety dengan TypeScript (`src/types.ts`)**:
   Menghindari bug *runtime* seperti salah mengetik nama properti `originalWords` atau salah memasukkan opsi panjang ringkasan.

---

## 📄 Lisensi
Proyek ini dibuat untuk tujuan pembelajaran dan pengembangan open-source.
