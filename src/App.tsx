/**
 * AI Summarizer - Aplikasi Ringkasan Teks Berbasis AI
 * Menggunakan React, TypeScript, Vite, dan Google Gemini AI (gemini-3.7-flash)
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TextInput } from './components/TextInput';
import { SamplePrompts } from './components/SamplePrompts';
import { SummaryResult } from './components/SummaryResult';
import { LoadingIndicator } from './components/LoadingIndicator';
import { ErrorMessage } from './components/ErrorMessage';
import { SummaryHistory } from './components/SummaryHistory';
import { summarizeText } from './services/geminiService';
import { HistoryItem, SummarizeOptions, SummarizeStats } from './types';
import { CheckCircle2, ShieldCheck, Zap, HelpCircle } from 'lucide-react';

const HISTORY_STORAGE_KEY = 'ai_summarizer_history';

export default function App() {
  // 1. State mode gelap (Dark Mode) dengan sinkronisasi local storage
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('ai_summarizer_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (darkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('ai_summarizer_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('ai_summarizer_theme', 'light');
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  // 2. State teks input sumber
  const [text, setText] = useState<string>('');

  // 3. State opsi ringkasan (panjang, format, bahasa)
  const [options, setOptions] = useState<SummarizeOptions>({
    length: 'medium',
    format: 'paragraph',
    language: 'auto',
  });

  // 4. State hasil ringkasan
  const [summary, setSummary] = useState<string | null>(null);
  const [stats, setStats] = useState<SummarizeStats | null>(null);

  // 5. State status pemrosesan & kesalahan
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 6. State riwayat ringkasan dengan persistensi localStorage
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Sinkronisasi riwayat ke localStorage
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (err) {
      console.warn('Gagal menyimpan riwayat ke localStorage:', err);
    }
  }, [history]);

  /**
   * Fungsi utama untuk mengirim permintaan ringkasan ke backend Gemini API
   */
  const handleSummarize = async () => {
    if (!text.trim() || text.trim().length < 20) {
      setError('Teks masukan minimal 20 karakter agar AI dapat mengekstrak ringkasan yang bermakna.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Panggil service API yang berkomunikasi dengan server backend
      const result = await summarizeText({
        text: text.trim(),
        length: options.length,
        format: options.format,
        language: options.language,
      });

      // Perbarui state dengan data hasil ringkasan dari Gemini
      setSummary(result.summary);
      setStats(result.stats);

      // Simpan ke riwayat lokal (maksimal 20 item terbaru)
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        originalText: text.trim(),
        summary: result.summary,
        stats: result.stats,
        options: { ...options },
      };
      setHistory((prev) => [newItem, ...prev.filter((i) => i.originalText !== newItem.originalText).slice(0, 19)]);

      // Scroll mulus ke area hasil
      setTimeout(() => {
        const resultElement = document.getElementById('summary-result-card');
        if (resultElement) {
          resultElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err: any) {
      console.error('Error saat memproses ringkasan:', err);
      setError(err.message || 'Terjadi kesalahan saat meringkas teks. Silakan coba kembali.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Mengisi teks dari contoh cepat
   */
  const handleSelectSample = (sampleText: string) => {
    setText(sampleText);
    setError(null);
  };

  /**
   * Memuat ringkasan dari riwayat
   */
  const handleSelectHistory = (item: HistoryItem) => {
    setText(item.originalText);
    setSummary(item.summary);
    setStats(item.stats);
    setOptions(item.options);
    setError(null);
    setTimeout(() => {
      const resultElement = document.getElementById('summary-result-card');
      if (resultElement) {
        resultElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-900 dark:selection:bg-blue-900 dark:selection:text-blue-100 transition-colors duration-200">
      {/* 1. Header Navigasi & Dark Mode Toggle */}
      <Header
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        isLoading={isLoading}
      />

      {/* 2. Konten Utama */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Banner Pembuka Singkat */}
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Ringkas Teks Apapun dalam Hitungan Detik
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mt-2 leading-relaxed">
            Tempelkan artikel, materi kuliah, esai, dokumen kerja, atau notula rapat. AI Gemini akan mengekstrak inti sari terpenting secara otomatis.
          </p>
        </div>

        {/* Formulir Input Teks Utama */}
        <TextInput
          text={text}
          setText={setText}
          options={options}
          setOptions={setOptions}
          onSummarize={handleSummarize}
          isLoading={isLoading}
        />

        {/* Contoh Teks Cepat (Sample Prompts) */}
        <SamplePrompts
          onSelectSample={handleSelectSample}
          disabled={isLoading}
        />

        {/* Indikator Loading saat AI Memproses */}
        {isLoading && <LoadingIndicator />}

        {/* Pesan Kesalahan jika Terjadi Error */}
        {error && !isLoading && (
          <ErrorMessage
            message={error}
            onRetry={handleSummarize}
            isLoading={isLoading}
          />
        )}

        {/* Tampilan Hasil Ringkasan */}
        {summary && stats && !isLoading && !error && (
          <SummaryResult
            summary={summary}
            stats={stats}
            isLoading={isLoading}
          />
        )}

        {/* 3. Panduan Penggunaan & Keunggulan untuk Pemula */}
        <section id="panduan" className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Cara Menggunakan & Keunggulan
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-sm mb-2.5">
                1
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">
                Tempelkan Teks
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Salin teks panjang dari artikel berita, dokumen, tugas kuliah, atau notula, lalu tempelkan ke area teks.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold text-sm mb-2.5">
                2
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">
                Sesuaikan Opsi
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Pilih panjang ringkasan (Singkat/Sedang/Detail) dan format tampilan (Paragraf atau Poin-Poin).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-bold text-sm mb-2.5">
                3
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">
                Salin & Simpan
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Dapatkan intisari penting dengan rasio penghematan kata hingga 80%, lalu salin dengan 1 klik.
              </p>
            </div>
          </div>

          <div className="mt-4 p-4 rounded-xl bg-blue-50/60 dark:bg-slate-900/80 border border-blue-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                <strong>Aman & Terlindungi:</strong> Kunci API disimpan secara aman di server, tidak terekspos ke browser.
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
              <Zap className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
              <span>
                Didukung model <strong>Gemini 3.7 Flash</strong> berkecepatan tinggi.
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* 4. Footer */}
      <footer className="w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 mt-12 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors duration-200">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 AI Summarizer • Dibuat dengan React, Vite, dan Gemini API.</p>
          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Siap untuk Pembelajaran
            </span>
          </div>
        </div>
      </footer>

      {/* Modal Riwayat Ringkasan */}
      <SummaryHistory
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectHistory={handleSelectHistory}
        onDeleteHistoryItem={handleDeleteHistoryItem}
        onClearHistory={handleClearHistory}
        isLoading={isLoading}
      />
    </div>
  );
}
