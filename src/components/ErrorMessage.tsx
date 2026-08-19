import React from 'react';
import { AlertTriangle, RefreshCw, Key } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry: () => void;
  isLoading?: boolean;
}

/**
 * Komponen ErrorMessage
 * Menampilkan pesan kesalahan yang jelas, informatif, tombol coba lagi (Retry),
 * dan dukungan mode gelap.
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry, isLoading = false }) => {
  const isApiKeyIssue = message.toLowerCase().includes('api_key') || message.toLowerCase().includes('kunci api');

  return (
    <div
      id="error-alert-banner"
      className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-5 my-6 shadow-2xs text-left transition-colors duration-200"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 rounded-xl shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200 mb-1">
            Gagal Membuat Ringkasan
          </h3>
          <p className="text-xs sm:text-sm text-rose-700 dark:text-rose-300 leading-relaxed mb-3">
            {message}
          </p>

          {isApiKeyIssue && (
            <div className="p-3 bg-white/80 dark:bg-slate-900/70 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs text-rose-800 dark:text-rose-300 mb-3 flex items-start gap-2">
              <Key className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
              <span>
                Pastikan variabel lingkungan <code>GEMINI_API_KEY</code> telah dikonfigurasi dengan benar di panel Settings &gt; Secrets atau file <code>.env</code>.
              </span>
            </div>
          )}

          <button
            id="btn-retry"
            type="button"
            onClick={onRetry}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-500 active:bg-rose-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Mencoba lagi...' : 'Coba Lagi'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
