import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Download,
  TrendingDown,
  Clock,
  BookOpen,
  Hash,
  Type,
  FileCheck,
} from 'lucide-react';
import { SummarizeStats } from '../types';

interface SummaryResultProps {
  summary: string;
  stats: SummarizeStats;
  isLoading?: boolean;
}

/**
 * Render teks berformat sederhana (mendukung bold **teks**, heading ###, dan bullet points - / *)
 * tanpa perlu library eksternal berlebih, menjaga kode tetap ringan dan cepat.
 */
function renderFormattedSummary(text: string) {
  const lines = text.split('\n');

  return lines.map((line, idx) => {
    const trimmed = line.trim();

    // Baris kosong
    if (!trimmed) {
      return <div key={idx} className="h-3" />;
    }

    // Heading Markdown (e.g. ### Judul)
    if (trimmed.startsWith('### ')) {
      return (
        <h4 key={idx} className="text-sm sm:text-base font-bold text-blue-900 dark:text-blue-300 mt-3 mb-1">
          {trimmed.replace(/^###\s+/, '')}
        </h4>
      );
    }
    if (trimmed.startsWith('## ')) {
      return (
        <h3 key={idx} className="text-base font-bold text-slate-900 dark:text-white mt-3.5 mb-1.5">
          {trimmed.replace(/^##\s+/, '')}
        </h3>
      );
    }

    // Bullet points (e.g. - item atau * item atau • item)
    if (trimmed.match(/^[-*•]\s+/)) {
      const content = trimmed.replace(/^[-*•]\s+/, '');
      return (
        <div key={idx} className="flex items-start gap-2 my-1.5 pl-1 text-slate-800 dark:text-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 shrink-0" />
          <span className="flex-1 leading-relaxed">{formatBoldSpans(content)}</span>
        </div>
      );
    }

    // Numbered list (e.g. 1. item)
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      return (
        <div key={idx} className="flex items-start gap-2 my-1.5 pl-1 text-slate-800 dark:text-slate-200">
          <span className="font-bold text-xs text-blue-600 dark:text-blue-400 min-w-4 text-right mt-0.5">
            {numMatch[1]}.
          </span>
          <span className="flex-1 leading-relaxed">{formatBoldSpans(numMatch[2])}</span>
        </div>
      );
    }

    // Paragraf biasa
    return (
      <p key={idx} className="my-1.5 leading-relaxed text-slate-800 dark:text-slate-200">
        {formatBoldSpans(line)}
      </p>
    );
  });
}

/**
 * Mengubah **teks tebal** menjadi tag <strong>
 */
function formatBoldSpans(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold text-slate-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

/**
 * Komponen SummaryResult
 * Menampilkan:
 * - Ringkasan AI terformat rapi
 * - Penghitung kata & karakter ringkasan
 * - Tombol Salin Ringkasan (dengan fallback clipboard aman)
 * - Tombol Unduh .txt
 * - Statistik perbandingan & estimasi waktu baca
 */
export const SummaryResult: React.FC<SummaryResultProps> = ({
  summary,
  stats,
  isLoading = false,
}) => {
  const [copied, setCopied] = useState(false);

  // Hitung jumlah karakter dan kata ringkasan
  const summaryCharCount = summary.length;
  const summaryWordCount = stats.summaryWords || summary.trim().split(/\s+/).filter(Boolean).length;

  // Fungsi menyalin ringkasan dengan fallback aman
  const handleCopy = async () => {
    let success = false;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(summary);
        success = true;
      } catch {
        success = false;
      }
    }

    // Fallback menggunakan textarea element jika navigator.clipboard gagal
    if (!success) {
      try {
        const tempTextarea = document.createElement('textarea');
        tempTextarea.value = summary;
        tempTextarea.style.position = 'fixed';
        tempTextarea.style.opacity = '0';
        document.body.appendChild(tempTextarea);
        tempTextarea.select();
        success = document.execCommand('copy');
        document.body.removeChild(tempTextarea);
      } catch (err) {
        console.error('Fallback copy failed:', err);
      }
    }

    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Fungsi mengunduh ringkasan sebagai file teks (.txt)
  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([summary], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `ringkasan-ai-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
  };

  // Hitung perkiraan waktu baca (asumsi 200 kata per menit)
  const readingTimeSec = Math.max(1, Math.round((summaryWordCount / 200) * 60));

  return (
    <div
      id="summary-result-card"
      className="bg-white dark:bg-slate-800/95 rounded-2xl border border-blue-200 dark:border-blue-900/60 shadow-sm p-4 sm:p-6 my-6 text-left relative overflow-hidden transition-colors duration-200"
    >
      {/* Aksen visual halus di atas kartu */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500" />

      {/* Header Hasil Ringkasan */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100 dark:border-slate-700/70">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Hasil Ringkasan AI
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Dihasilkan secara cerdas dengan Gemini AI
            </p>
          </div>
        </div>

        {/* Tombol Tindakan Cepat */}
        <div className="flex items-center gap-2">
          {/* Tombol Salin Ringkasan (Copy Summary) */}
          <button
            id="btn-copy-summary"
            type="button"
            onClick={handleCopy}
            disabled={isLoading}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
              copied
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-100 dark:border-blue-900/50'
            }`}
            title="Salin hasil ringkasan ke clipboard"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copied ? 'Tersalin!' : 'Salin Ringkasan'}</span>
          </button>

          {/* Tombol Unduh .txt */}
          <button
            id="btn-download-summary"
            type="button"
            onClick={handleDownload}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Unduh ringkasan sebagai file teks (.txt)"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Unduh .txt</span>
          </button>
        </div>
      </div>

      {/* Statistik & Efisiensi Ringkasan */}
      <div className="grid grid-cols-3 gap-2.5 mb-5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-100 dark:border-slate-700/60 text-center">
        {/* Penghitung Kata Ringkasan */}
        <div className="flex flex-col items-center justify-center">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-slate-400" />
            Kata Ringkasan
          </span>
          <div
            className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 mt-0.5"
            id="summary-word-counter"
          >
            {summaryWordCount}{' '}
            <span className="text-xs font-normal text-slate-400">/ {stats.originalWords}</span>
          </div>
        </div>

        {/* Persentase Efisiensi */}
        <div className="flex flex-col items-center justify-center border-x border-slate-200 dark:border-slate-700">
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
            <TrendingDown className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
            Efisiensi
          </span>
          <div className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {stats.reductionRate}% Lebih Padat
          </div>
        </div>

        {/* Waktu Baca */}
        <div className="flex flex-col items-center justify-center">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            Waktu Baca
          </span>
          <div className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 mt-0.5">
            ~{readingTimeSec} detik
          </div>
        </div>
      </div>

      {/* Detail Penghitung Ringkasan (Kata & Karakter) */}
      <div className="flex items-center gap-2 mb-3 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/60 px-2 py-0.5 rounded-md font-medium">
          <Hash className="w-3 h-3 text-blue-500" />
          <strong>{summaryWordCount}</strong> kata
        </span>
        <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/60 px-2 py-0.5 rounded-md font-medium">
          <Type className="w-3 h-3 text-indigo-500" />
          <strong>{summaryCharCount.toLocaleString()}</strong> karakter
        </span>
      </div>

      {/* Konten Teks Ringkasan dengan Formatting Elegan */}
      <div className="text-sm sm:text-base bg-blue-50/25 dark:bg-slate-900/40 p-4 sm:p-5 rounded-xl border border-blue-100/60 dark:border-slate-700/60 font-sans select-text">
        {renderFormattedSummary(summary)}
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
        <span className="flex items-center gap-1">
          <FileCheck className="w-3.5 h-3.5 text-emerald-500" />
          Ringkasan selesai dan siap digunakan.
        </span>
      </div>
    </div>
  );
};
