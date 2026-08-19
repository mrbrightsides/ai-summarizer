import React from 'react';
import { Sparkles, BookOpen, Layers, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  historyCount: number;
  onOpenHistory: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  isLoading: boolean;
}

/**
 * Komponen Header
 * Menampilkan judul aplikasi, deskripsi singkat, tombol pengalih mode gelap (dark mode toggle),
 * serta tombol navigasi riwayat.
 */
export const Header: React.FC<HeaderProps> = ({
  historyCount,
  onOpenHistory,
  darkMode,
  onToggleDarkMode,
  isLoading,
}) => {
  return (
    <header
      className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs transition-colors duration-200"
      id="app-header"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3" id="brand-container">
          <div className="w-10 h-10 rounded-xl bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white shadow-sm shadow-blue-200 dark:shadow-none">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                AI Summarizer
              </h1>
              <span className="bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-semibold px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-800">
                Gemini 3.7
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Ringkas teks panjang secara instan dan akurat
            </p>
          </div>
        </div>

        {/* Action Buttons & Dark Mode Toggle */}
        <div className="flex items-center gap-2">
          {/* Tombol Pengalih Mode Gelap (Dark Mode Toggle) */}
          <button
            id="btn-dark-mode-toggle"
            type="button"
            onClick={onToggleDarkMode}
            disabled={isLoading}
            className="p-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            title={darkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Tombol Riwayat */}
          {historyCount > 0 && (
            <button
              id="btn-view-history"
              type="button"
              onClick={onOpenHistory}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              title="Lihat riwayat ringkasan"
            >
              <Layers className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>Riwayat</span>
              <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {historyCount}
              </span>
            </button>
          )}

          <a
            href="#panduan"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Panduan</span>
          </a>
        </div>
      </div>
    </header>
  );
};
