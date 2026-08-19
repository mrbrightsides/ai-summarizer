import React, { useEffect } from 'react';
import { X, Trash2, Clock, ArrowRight, FileText } from 'lucide-react';
import { HistoryItem } from '../types';

interface SummaryHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
  onDeleteHistoryItem: (id: string) => void;
  onClearHistory: () => void;
  isLoading?: boolean;
}

/**
 * Komponen SummaryHistory
 * Menampilkan daftar ringkasan tersimpan dengan:
 * - Dukungan tombol Escape & klik backdrop untuk menutup modal
 * - Hapus per-item atau hapus seluruh riwayat
 * - Sinkronisasi tema gelap (Dark Mode)
 * - Aksesibilitas ARIA dialog
 */
export const SummaryHistory: React.FC<SummaryHistoryProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistory,
  onDeleteHistoryItem,
  onClearHistory,
  isLoading = false,
}) => {
  // Listener tombol Escape untuk menutup modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-modal-title"
    >
      <div
        id="history-modal"
        className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()} // Mencegah klik di dalam modal menutupnya
      >
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 id="history-modal-title" className="text-base font-bold text-slate-800 dark:text-white">
              Riwayat Ringkasan
            </h3>
            <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold px-2 py-0.5 rounded-full">
              {history.length} item
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Riwayat"
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Konten Riwayat */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600 stroke-[1.5]" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Belum ada riwayat ringkasan
              </p>
              <p className="text-xs mt-1 text-slate-500 dark:text-slate-400">
                Ringkasan yang Anda buat akan otomatis disimpan di browser ini.
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-blue-300 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900/80 transition-all group"
              >
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                  <span className="font-medium">
                    {new Date(item.timestamp).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    •{' '}
                    {new Date(item.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded text-[10px]">
                      Hemat {item.stats.reductionRate}% ({item.stats.summaryWords} kata)
                    </span>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => onDeleteHistoryItem(item.id)}
                      title="Hapus ringkasan ini"
                      aria-label="Hapus ringkasan ini"
                      className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors opacity-80 group-hover:opacity-100 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 italic mb-1.5">
                  "{item.originalText}"
                </p>

                <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-2 mb-2">
                  {item.summary}
                </p>

                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => {
                      onSelectHistory(item);
                      onClose();
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 disabled:opacity-50 cursor-pointer"
                  >
                    <span>Buka Ringkasan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Modal */}
        {history.length > 0 && (
          <div className="p-3.5 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
            <button
              type="button"
              disabled={isLoading}
              onClick={onClearHistory}
              className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 disabled:opacity-50 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Semua Riwayat</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
