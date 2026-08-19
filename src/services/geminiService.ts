/**
 * Layanan API untuk berkomunikasi dengan Server Backend Gemini
 * 
 * File ini memisahkan logika pemanggilan API dari komponen UI
 * sehingga kode lebih rapi, modular, dan mudah dipahami siswa/pemula.
 */

import { SummarizeRequest, SummarizeResponse } from '../types';

/**
 * Mengirim teks dan opsi ringkasan ke endpoint backend (/api/summarize)
 * 
 * @param request Objek berisi teks yang ingin diringkas dan opsinya
 * @returns Promise yang menghasilkan objek SummarizeResponse (ringkasan dan statistik)
 */
export async function summarizeText(request: SummarizeRequest): Promise<SummarizeResponse> {
  try {
    const response = await fetch('/api/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Terjadi kesalahan saat memproses data (${response.status})`);
    }

    return data as SummarizeResponse;
  } catch (error: any) {
    console.error('API Error:', error);
    // Teruskan pesan kesalahan yang informatif
    throw new Error(error.message || 'Gagal terhubung ke server. Pastikan koneksi internet aktif.');
  }
}
