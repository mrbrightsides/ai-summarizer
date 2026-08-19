import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

// Memuat variabel lingkungan dari file .env jika ada
dotenv.config();

const app = express();
const PORT = 3000;

// Middleware untuk mem-parsing body JSON
app.use(express.json({ limit: '5mb' }));

// Inisialisasi klien Gemini AI secara aman di sisi server
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Daftar kata henti (Stopwords) sederhana untuk Bahasa Indonesia dan Inggris
const STOPWORDS = new Set([
  // Indonesia
  'yang', 'di', 'dan', 'ini', 'dari', 'untuk', 'pada', 'adalah', 'dengan', 'ke', 'oleh',
  'dalam', 'akan', 'atau', 'juga', 'bisa', 'dapat', 'tersebut', 'ada', 'itu', 'karena',
  'serta', 'sebagai', 'bagi', 'sudah', 'telah', 'saat', 'lebih', 'agar', 'namun', 'para',
  'tidak', 'jika', 'mereka', 'kita', 'ia', 'dia', 'kami', 'bahwa', 'secara', 'harus',
  // English
  'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'to', 'for', 'of', 'with',
  'as', 'by', 'that', 'this', 'it', 'are', 'was', 'were', 'be', 'been', 'have', 'has',
  'had', 'do', 'does', 'did', 'but', 'or', 'if', 'because', 'as', 'until', 'while',
  'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above',
]);

/**
 * Mesin Ringkasan Ekstraktif (Fallback Offline NLP Engine)
 * Berjalan otomatis jika kuota atau izin API Gemini mengalami hambatan (seperti Error 403 Permission Denied).
 */
function generateExtractiveSummary(
  text: string,
  length: 'short' | 'medium' | 'detailed' = 'medium',
  format: 'paragraph' | 'bullet_points' | 'tldr' = 'paragraph'
): string {
  // 1. Bersihkan dan pisahkan kalimat
  const rawSentences = text
    .split(/(?<=[.?!])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15);

  if (rawSentences.length === 0) {
    return text.slice(0, 300);
  }

  // 2. Hitung frekuensi kata (Term Frequency)
  const wordFreq: Record<string, number> = {};
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));

  for (const word of words) {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  }

  // 3. Skor setiap kalimat berdasarkan kata penting dan posisi
  const scoredSentences = rawSentences.map((sentence, index) => {
    const sWords = sentence
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOPWORDS.has(w));

    let score = 0;
    for (const w of sWords) {
      score += wordFreq[w] || 0;
    }

    // Normalisasi panjang kalimat
    const normalizedScore = sWords.length > 0 ? score / sWords.length : 0;

    // Bobot posisi (kalimat awal biasanya mengandung inti topik)
    const positionBoost = index === 0 ? 1.5 : index === 1 ? 1.2 : index === rawSentences.length - 1 ? 1.1 : 1.0;

    return {
      sentence,
      originalIndex: index,
      score: normalizedScore * positionBoost,
    };
  });

  // 4. Tentukan jumlah kalimat berdasarkan panjang ringkasan yang diminta
  let sentenceCount = 3;
  if (length === 'short') {
    sentenceCount = Math.min(2, rawSentences.length);
  } else if (length === 'medium') {
    sentenceCount = Math.min(4, Math.max(2, Math.ceil(rawSentences.length * 0.4)));
  } else if (length === 'detailed') {
    sentenceCount = Math.min(6, Math.max(3, Math.ceil(rawSentences.length * 0.6)));
  }

  // Ambil kalimat dengan skor tertinggi, lalu urutkan kembali sesuai urutan kemunculan aslinya
  const topSentences = [...scoredSentences]
    .sort((a, b) => b.score - a.score)
    .slice(0, sentenceCount)
    .sort((a, b) => a.originalIndex - b.originalIndex)
    .map((item) => item.sentence);

  // 5. Format hasil sesuai pilihan (Paragraf, Bullet Points, TL;DR)
  if (format === 'bullet_points') {
    return topSentences.map((s) => `- ${s}`).join('\n');
  }

  if (format === 'tldr') {
    const mainIdea = topSentences[0] || '';
    const points = topSentences.slice(1).map((s) => `- ${s}`).join('\n');
    return `**TL;DR:** ${mainIdea}\n\n**Poin Penting:**\n${points || '- ' + mainIdea}`;
  }

  return topSentences.join(' ');
}

/**
 * Endpoint POST /api/summarize
 * Menerima teks dari pengguna, memanggil Gemini API dengan mekanisme fallback model & offline summarizer.
 */
app.post('/api/summarize', async (req: Request, res: Response): Promise<void> => {
  const { text, length = 'medium', format = 'paragraph', language = 'auto' } = req.body;

  // 1. Validasi input
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    res.status(400).json({
      error: 'Teks masukan tidak boleh kosong. Harap masukkan teks untuk diringkas.',
    });
    return;
  }

  if (text.trim().length < 20) {
    res.status(400).json({
      error: 'Teks terlalu pendek untuk diringkas. Masukkan setidaknya 20 karakter.',
    });
    return;
  }

  // 2. Siapkan prompt instruksi
  let lengthInstruction = 'Ringkas teks menjadi ringkasan yang seimbang, mencakup poin-poin utama.';
  if (length === 'short') {
    lengthInstruction = 'Ringkas teks menjadi sangat singkat dan padat (1-2 kalimat atau poin inti saja).';
  } else if (length === 'detailed') {
    lengthInstruction = 'Ringkas teks secara komprehensif, mencakup latar belakang, poin-poin penting, dan kesimpulan.';
  }

  let formatInstruction = 'Sajikan ringkasan dalam format paragraf yang mengalir dan mudah dibaca.';
  if (format === 'bullet_points') {
    formatInstruction = 'Sajikan ringkasan dalam daftar butir poin (bullet points) yang terstruktur rapi dengan tanda hubung (-).';
  } else if (format === 'tldr') {
    formatInstruction = 'Sajikan ringkasan dengan format TL;DR (Ringkasan Cepat) diikuti butir poin kunci terpenting.';
  }

  let languageInstruction = 'Gunakan bahasa yang sama dengan teks sumber.';
  if (language === 'id') {
    languageInstruction = 'Tulis ringkasan secara eksklusif dalam Bahasa Indonesia yang baik dan baku.';
  } else if (language === 'en') {
    languageInstruction = 'Tulis ringkasan secara eksklusif dalam Bahasa Inggris (English).';
  }

  const systemPrompt = `Anda adalah asisten AI profesional untuk meringkas teks (AI Text Summarizer).
Tugas Anda adalah membaca teks yang diberikan pengguna, mengekstrak gagasan pokok, dan menyajikan ringkasan yang akurat, jelas, dan mudah dipahami.

Instruksi Khusus:
1. ${lengthInstruction}
2. ${formatInstruction}
3. ${languageInstruction}
4. Jangan menambahkan fakta atau opini di luar teks sumber (no hallucinations).
5. Pertahankan nada dan makna asli teks sumber.`;

  const userPrompt = `Tolong ringkas teks berikut:\n\n"""\n${text}\n"""`;

  let summary = '';
  let usedFallback = false;

  // 3. Coba panggil Gemini AI dengan model valid
  const ai = getGeminiClient();

  if (ai) {
    // Model yang didukung untuk text summarization
    const candidateModels = ['gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: userPrompt,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.3,
          },
        });

        if (response && response.text) {
          summary = response.text;
          break; // Berhasil, keluar dari perulangan
        }
      } catch {
        // Coba model berikutnya secara senyap jika model ini ditolak atau tidak tersedia
      }
    }
  }

  // 4. Jika semua model Gemini tidak dapat diakses (misal karena penolakan akses kuota/permission API key pada project),
  // aktifkan mesin ekstraktif cerdas secara instan sehingga pengguna selalu mendapatkan hasil ringkasan.
  if (!summary) {
    summary = generateExtractiveSummary(text, length, format);
    usedFallback = true;
  }

  // 5. Hitung statistik kata & efisiensi
  const originalWords = text.trim().split(/\s+/).filter(Boolean).length;
  const summaryWords = summary.trim().split(/\s+/).filter(Boolean).length;
  const reductionRate =
    originalWords > 0 ? Math.max(0, Math.round(((originalWords - summaryWords) / originalWords) * 100)) : 0;

  res.json({
    summary,
    stats: {
      originalWords,
      summaryWords,
      reductionRate,
    },
    usedFallback,
  });
});

/**
 * Health check endpoint
 */
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

/**
 * Inisialisasi Vite middleware untuk pengembangan atau serve file statis untuk produksi
 */
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 AI Summarizer server berjalan di http://0.0.0.0:${PORT}`);
  });
}

startServer();
