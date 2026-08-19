import React, { useEffect, useState } from 'react';
import { Sparkles, Bot } from 'lucide-react';

const LOADING_STEPS = [
  'Membaca dan menganalisis teks sumber...',
  'Mengekstraksi ide pokok dan fakta penting...',
  'Menyusun ringkasan dengan Gemini 3.7 AI...',
  'Menyempurnakan tata bahasa dan format...',
];

/**
 * Komponen LoadingIndicator
 * Menampilkan animasi pemuatan modern dengan teks status yang dinamis
 * dan dukungan mode gelap.
 */
export const LoadingIndicator: React.FC = () => {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 1200);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      id="loading-container"
      className="bg-white dark:bg-slate-800/90 rounded-2xl border border-blue-100 dark:border-slate-700 p-8 shadow-xs flex flex-col items-center justify-center text-center my-6 transition-colors duration-200"
    >
      <div className="relative mb-5">
        {/* Lingkaran Pulsa Animasi */}
        <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 animate-pulse">
          <Bot className="w-8 h-8 animate-bounce" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
      </div>

      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">
        Sedang Meringkas Teks dengan Gemini AI
      </h3>

      <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium h-6 transition-all duration-300">
        {LOADING_STEPS[stepIndex]}
      </p>

      <div className="w-48 bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mt-4 overflow-hidden">
        <div className="bg-blue-600 dark:bg-blue-500 h-1.5 rounded-full animate-[progress_1.5s_ease-in-out_infinite]" />
      </div>
    </div>
  );
};
