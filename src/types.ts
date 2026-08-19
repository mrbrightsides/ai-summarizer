/**
 * Tipe Data dan Interface untuk AI Summarizer
 */

export type SummaryLength = 'short' | 'medium' | 'detailed';
export type SummaryFormat = 'paragraph' | 'bullet_points' | 'tldr';
export type SummaryLanguage = 'auto' | 'id' | 'en';

export interface SummarizeOptions {
  length: SummaryLength;
  format: SummaryFormat;
  language: SummaryLanguage;
}

export interface SummarizeStats {
  originalWords: number;
  summaryWords: number;
  reductionRate: number;
}

export interface SummarizeRequest {
  text: string;
  length?: SummaryLength;
  format?: SummaryFormat;
  language?: SummaryLanguage;
}

export interface SummarizeResponse {
  summary: string;
  stats: SummarizeStats;
  usedFallback?: boolean;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  originalText: string;
  summary: string;
  stats: SummarizeStats;
  options: SummarizeOptions;
  usedFallback?: boolean;
}
