'use client';

import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';

export type ExportFormat = 'pdf' | 'google-calendar' | 'notion';

export interface ExportResponse {
  url?: string;
  calendar_url?: string;
  notion_url?: string;
  pdf_url?: string;
  [key: string]: unknown;
}

/** Kick off an export job. Returns a URL the caller should open/download. */
export function useExportTrip() {
  return useMutation({
    mutationFn: async (args: { searchId: string; format: ExportFormat }): Promise<ExportResponse> => {
      const url =
        args.format === 'pdf'
          ? endpoints.exportPdf(args.searchId)
          : args.format === 'google-calendar'
          ? endpoints.exportGoogleCalendar(args.searchId)
          : endpoints.exportNotion(args.searchId);
      return api.post<ExportResponse>(url, {});
    },
  });
}

/** Past exports for a given trip. */
export interface ExportHistoryEntry {
  format: ExportFormat | string;
  created_at: string;
  url?: string;
  status?: string;
}

export interface ExportHistoryResponse {
  exports: ExportHistoryEntry[];
}

export function useExportHistory(searchId: string | null) {
  return useMutation({
    mutationFn: async (id?: string): Promise<ExportHistoryResponse> => {
      const target = id ?? searchId;
      if (!target) throw new Error('Missing searchId');
      return api.get<ExportHistoryResponse>(endpoints.exportHistory(target));
    },
  });
}
