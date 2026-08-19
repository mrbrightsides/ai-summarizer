import React, { useState } from 'react';
import {
  Clipboard,
  Trash2,
  ArrowRight,
  SlidersHorizontal,
  FileText,
  AlignLeft,
  ListOrdered,
  Type,
  Hash,
  CornerDownLeft,
  Info,
} from 'lucide-react';
import { SummarizeOptions, SummaryFormat, SummaryLength, SummaryLanguage } from '../types';

interface TextInputProps {
  text: string;
  setText: (text: string) => void;
  options: SummarizeOptions;
  setOptions: React.Dispatch<React.SetStateAction<SummarizeOptions>>;
  onSummarize: () => void;
  isLoading: boolean;
}

/**
 * Komponen TextInput
 * Menyediakan area input teks responsif dengan dukungan:
 * - Shortcut keyboard (Ctrl+Enter / Cmd+Enter) untuk eksekusi cepat
 * - Penghitung karakter & kata real-time
 * - Tombol Hapus (Clear) dan Tempel Teks (Paste) dengan fallback aman
 * - Pengaturan format, panjang, dan bahasa ringkasan
 * - Status disabled yang konsisten saat proses AI berjalan
 */
export const TextInput: React.FC<TextInputProps> = ({
  text,
  setText,
  options,
  setOptions,
  onSummarize,
  isLoading,
}) => {
  const [pasteNotice, setPasteNotice] = useState<string | null>(null);

  // Hitung jumlah karakter dan kata secara real-time
  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;

  // Fungsi untuk menempelkan teks dari papan klip (Clipboard) dengan fallback aman
  const handlePaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const clipboardText = await navigator.clipboard.readText();
        if (clipboardText) {
          setText(clipboardText);
          setPasteNotice(null);
        } else {
          setPasteNotice('Papan klip (clipboard) kosong.');
          setTimeout(() => setPasteNotice(null), 3000);
        }
      } else {
        setPasteNotice('Gunakan shortcut Ctrl+V / Cmd+V untuk menempelkan teks.');
        setTimeout(() => setPasteNotice(null), 4000);
      }
    } catch {
      // Fallback tanpa window.alert untuk lingkungan iframe
      setPasteNotice('Izin clipboard ditolak peramban. Silakan gunakan Ctrl+V / Cmd+V.');
      setTimeout(() => setPasteNotice(null), 4000);
    }
  };

  // Fungsi untuk menghapus teks masukan
  const handleClear = () => {
    setText('');
    setPasteNotice(null);
  };

  const isTextEmpty = text.trim().length === 0;
  const isTooShort = text.trim().length > 0 && text.trim().length < 20;
  const canSummarize = !isLoading && !isTextEmpty && !isTooShort;

  // Handler keyboard shortcut (Ctrl+Enter / Cmd+Enter)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (canSummarize) {
        onSummarize();
      }
    }
  };

  return (
    <div
      className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs p-4 sm:p-6 transition-colors duration-200"
      id="input-card"
    >
      {/* Header Form & Aksi Cepat */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-700/60">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
            Teks Sumber
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Tombol Tempel Teks (Paste) */}
          <button
            id="btn-paste-clipboard"
            type="button"
            onClick={handlePaste}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100 dark:bg-slate-700/70 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Tempel teks dari Clipboard"
          >
            <Clipboard className="w-3.5 h-3.5" />
            <span>Tempel Teks</span>
          </button>

          {/* Tombol Hapus (Clear) */}
          <button
            id="btn-clear-text"
            type="button"
            onClick={handleClear}
            disabled={isLoading || isTextEmpty}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-100 dark:border-rose-900/50 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Hapus semua teks masukan"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus</span>
          </button>
        </div>
      </div>

      {/* Notifikasi Clipboard Inline (jika ada) */}
      {pasteNotice && (
        <div className="mb-2 p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs flex items-center gap-2 animate-in fade-in duration-150">
          <Info className="w-4 h-4 shrink-0" />
          <span>{pasteNotice}</span>
        </div>
      )}

      {/* Area Masukan Teks (Textarea) */}
      <div className="relative">
        <textarea
          id="source-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder="Tuliskan atau tempel (paste) artikel, berita, esai, materi kuliah, atau notula rapat di sini... (Tekan Ctrl+Enter untuk meringkas)"
          rows={9}
          aria-label="Area teks masukan untuk diringkas"
          className="w-full p-3.5 sm:p-4 text-sm sm:text-base text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-slate-50/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-y disabled:opacity-60 disabled:cursor-not-allowed leading-relaxed font-sans"
        />

        {/* Baris Status & Penghitung Karakter / Kata */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-2 px-1 text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            {isTooShort ? (
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                ⚠️ Masukkan minimal 20 karakter agar ringkasan bermakna.
              </span>
            ) : isTextEmpty ? (
              <span className="text-slate-400 dark:text-slate-500">Area teks kosong</span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                ✓ Siap diringkas
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Badge Penghitung Karakter Input */}
            <div
              id="char-counter-badge"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-200 font-medium text-[11px]"
              title="Jumlah karakter pada teks masukan"
            >
              <Type className="w-3 h-3 text-slate-400 dark:text-slate-400" />
              <span>
                Karakter: <strong className="text-slate-900 dark:text-white">{charCount.toLocaleString()}</strong>
              </span>
            </div>

            {/* Badge Penghitung Kata Input */}
            <div
              id="word-counter-badge"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-200 font-medium text-[11px]"
              title="Jumlah kata pada teks masukan"
            >
              <Hash className="w-3 h-3 text-slate-400 dark:text-slate-400" />
              <span>
                Kata: <strong className="text-slate-900 dark:text-white">{wordCount.toLocaleString()}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pengaturan Pilihan Ringkasan (Opsi Panjang, Format, Bahasa) */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700/60 space-y-4">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Pengaturan Ringkasan</span>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-normal normal-case text-slate-400 dark:text-slate-500">
            <CornerDownLeft className="w-3 h-3" />
            Shortcut: <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[10px]">Ctrl+Enter</kbd>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Pilihan Panjang */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Panjang Ringkasan
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300">
              {(
                [
                  { id: 'short', label: 'Singkat' },
                  { id: 'medium', label: 'Sedang' },
                  { id: 'detailed', label: 'Detail' },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  id={`opt-length-${item.id}`}
                  type="button"
                  disabled={isLoading}
                  onClick={() => setOptions((prev) => ({ ...prev, length: item.id as SummaryLength }))}
                  className={`py-1.5 px-2 rounded-lg text-center transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
                    options.length === item.id
                      ? 'bg-white dark:bg-slate-750 text-blue-700 dark:text-blue-300 font-bold shadow-xs'
                      : 'hover:text-slate-900 dark:hover:text-white text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pilihan Format Output */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Format Tampilan
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300">
              {(
                [
                  { id: 'paragraph', label: 'Paragraf', icon: AlignLeft },
                  { id: 'bullet_points', label: 'Poin', icon: ListOrdered },
                  { id: 'tldr', label: 'TL;DR', icon: FileText },
                ] as const
              ).map((item) => {
                return (
                  <button
                    key={item.id}
                    id={`opt-format-${item.id}`}
                    type="button"
                    disabled={isLoading}
                    onClick={() => setOptions((prev) => ({ ...prev, format: item.id as SummaryFormat }))}
                    className={`py-1.5 px-1.5 rounded-lg flex items-center justify-center gap-1 text-center transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
                      options.format === item.id
                        ? 'bg-white dark:bg-slate-750 text-blue-700 dark:text-blue-300 font-bold shadow-xs'
                        : 'hover:text-slate-900 dark:hover:text-white text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pilihan Bahasa Output */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Bahasa Hasil
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300">
              {(
                [
                  { id: 'auto', label: 'Otomatis' },
                  { id: 'id', label: 'Indonesia' },
                  { id: 'en', label: 'English' },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  id={`opt-lang-${item.id}`}
                  type="button"
                  disabled={isLoading}
                  onClick={() => setOptions((prev) => ({ ...prev, language: item.id as SummaryLanguage }))}
                  className={`py-1.5 px-1.5 rounded-lg text-center transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
                    options.language === item.id
                      ? 'bg-white dark:bg-slate-750 text-blue-700 dark:text-blue-300 font-bold shadow-xs'
                      : 'hover:text-slate-900 dark:hover:text-white text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tombol Summarize (Ringkas) - Dinonaktifkan saat isLoading atau teks belum valid */}
      <div className="mt-6">
        <button
          id="btn-summarize"
          type="button"
          disabled={!canSummarize}
          onClick={onSummarize}
          className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-150 flex items-center justify-center gap-2 text-base cursor-pointer"
        >
          <span>{isLoading ? 'Sedang Memproses Ringkasan...' : 'Ringkas Sekarang'}</span>
          {!isLoading && <ArrowRight className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};
