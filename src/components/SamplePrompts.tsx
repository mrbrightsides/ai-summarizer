import React from 'react';
import { FileText, Cpu, Globe } from 'lucide-react';

interface SamplePromptsProps {
  onSelectSample: (text: string) => void;
  disabled: boolean;
}

interface SampleItem {
  id: string;
  title: string;
  category: string;
  icon: React.ReactNode;
  text: string;
}

const SAMPLES: SampleItem[] = [
  {
    id: 'sample-tech',
    title: 'Kecerdasan Buatan dalam Pendidikan',
    category: 'Teknologi',
    icon: <Cpu className="w-4 h-4 text-blue-500 dark:text-blue-400" />,
    text: `Perkembangan kecerdasan buatan (Artificial Intelligence / AI) telah membawa transformasi signifikan di berbagai sektor, terutama pendidikan. AI memungkinkan pembelajaran yang dipersonalisasi sesuai dengan kecepatan dan gaya belajar masing-masing siswa. Sistem bimbingan belajar cerdas dapat menganalisis kelemahan siswa dalam konsep matematika atau sains, lalu memberikan latihan adaptif untuk memperbaikinya.

Selain itu, guru dan pendidik dapat memanfaatkan AI untuk mengotomatiskan tugas-tugas administratif yang memakan waktu, seperti penilaian tes pilihan ganda, pelacakan kehadiran, dan penyusunan modul ajar. Hal ini memungkinkan para guru untuk lebih fokus pada interaksi mendalam, pembinaan karakter, dan diskusi kritis bersama murid.

Namun, adopsi AI di bidang pendidikan juga menghadapi sejumlah tantangan penting. Salah satu kekhawatiran utama adalah risiko ketergantungan berlebihan yang dapat menurunkan kemampuan berpikir kritis siswa, serta masalah privasi data peserta didik. Oleh karena itu, penerapan AI harus diimbangi dengan kurikulum etika digital dan pengawasan aktif dari para pendidik.`,
  },
  {
    id: 'sample-climate',
    title: 'Dampak Perubahan Iklim Global',
    category: 'Lingkungan',
    icon: <Globe className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />,
    text: `Perubahan iklim global terus menunjukkan dampak nyata terhadap ekosistem bumi dan kehidupan manusia. Kenaikan suhu rata-rata global telah memicu pencairan lapisan es di kutub utara dan selatan, yang berakibat langsung pada naiknya permukaan air laut. Banyak wilayah pesisir dan pulau-pulau kecil kini menghadapi ancaman abrasi dan tenggelam dalam beberapa dekade mendatang.

Selain kenaikan permukaan air laut, anomali cuaca ekstrem seperti gelombang panas yang berkepanjangan, badai tropis berkekuatan tinggi, dan kekeringan parah kini terjadi dengan frekuensi yang semakin sering. Fenomena ini merusak ketahanan pangan karena gagal panen meluas di berbagai negara agraris.

Untuk memitigasi krisis ini, komunitas internasional melalui Perjanjian Paris menargetkan pembatasan kenaikan suhu global di bawah 1,5 derajat Celsius. Langkah nyata yang harus dipercepat meliputi transisi energi terbarukan (seperti tenaga surya dan angin), reboisasi hutan tropis, serta adopsi ekonomi sirkular yang minim limbah karbon.`,
  },
  {
    id: 'sample-meeting',
    title: 'Notula Rapat Proyek Digital',
    category: 'Bisnis & Kerja',
    icon: <FileText className="w-4 h-4 text-amber-500 dark:text-amber-400" />,
    text: `Rapat Koordinasi Tim Pengembang - Proyek Aplikasi AI
Tanggal: 19 Agustus 2026
Peserta: Tim Frontend, Tim Backend, UI/UX Designer, Product Manager

Agenda & Pembahasan:
1. Progres Pengembangan Frontend: Tim UI berhasil menyelesaikan desain antarmuka responsif untuk modul input teks dan tampilan hasil ringkasan. Komponen disesuaikan agar ramah pemula dan mudah diakses di perangkat ponsel maupun desktop.
2. Integrasi Backend Gemini API: Endpoint API /api/summarize telah berfungsi stabil dengan menggunakan model Gemini 3.7 Flash. Waktu respons rata-rata tercatat 1,2 detik per permintaan dengan akurasi ekstraksi poin yang sangat memuaskan.
3. Keamanan Kunci API: Seluruh kredensial API disimpan secara ketat di variabel lingkungan (server-side environment variable) dan tidak pernah dibocorkan ke sisi browser klien.
4. Rencana Tindak Lanjut:
- Tim QA akan melakukan pengujian beban teks hingga 10.000 kata.
- Tim Desain akan menambahkan fitur salin cepat satu-klik dan opsi ekspor teks.
- Peluncuran versi beta publik dijadwalkan pada hari Jumat pekan ini.`,
  },
];

/**
 * Komponen SamplePrompts
 * Memudahkan pengguna untuk mencoba ringkasan dengan 1 klik contoh teks.
 */
export const SamplePrompts: React.FC<SamplePromptsProps> = ({ onSelectSample, disabled }) => {
  return (
    <div className="w-full mt-4" id="sample-prompts-section">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Atau coba contoh teks cepat:
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {SAMPLES.map((sample) => (
          <button
            key={sample.id}
            id={`btn-${sample.id}`}
            type="button"
            disabled={disabled}
            onClick={() => onSelectSample(sample.text)}
            className="flex flex-col text-left p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-slate-750 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed group shadow-2xs cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-1">
              {sample.icon}
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {sample.category}
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-blue-700 dark:group-hover:text-blue-300">
              {sample.title}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
              {sample.text}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
