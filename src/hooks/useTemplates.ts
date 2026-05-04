'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import type { TravelData } from '@/types';

export interface TemplateSummary {
  template_id?: string;
  slug?: string;
  title: string;
  destination: string;
  days?: number;
  summary?: string;
  images?: Array<{ url?: string | null }>;
}

export interface TemplatesResponse {
  templates: TemplateSummary[];
  total?: number;
}

/** Curated templates for a given city (`/api/templates/{city}`). */
export function useCityTemplates(city: string | null | undefined) {
  return useQuery({
    queryKey: ['templates', 'city', city ?? ''],
    queryFn: async (): Promise<TemplatesResponse | null> => {
      if (!city) return null;
      return api.get<TemplatesResponse>(endpoints.cityTemplates(city));
    },
    enabled: !!city,
    staleTime: 60 * 60 * 1000,
  });
}

/** Fork a curated template into a personal trip. Rate-limited by `ai_enrich`. */
export function useForkTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (templateId: string): Promise<{ search_id: string }> => {
      return api.post<{ search_id: string }>(endpoints.templateFork(templateId), {});
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

// --- Public templates (community-published trips) ---

export interface PublicTemplateSummary {
  slug: string;
  title: string;
  destination: string;
  days?: number;
  vote_score?: number;
  fork_count?: number;
  images?: Array<{ url?: string | null }>;
}

export interface PublicTemplateResponse {
  slug: string;
  title: string;
  travel_state: TravelData;
  vote_score: number;
  fork_count: number;
  owner_name?: string;
  user_vote?: 1 | -1 | 0;
}

export function usePublicTemplate(slug: string | null | undefined) {
  return useQuery({
    queryKey: ['publicTemplate', slug ?? ''],
    queryFn: async (): Promise<PublicTemplateResponse | null> => {
      if (!slug) return null;
      return api.get<PublicTemplateResponse>(endpoints.publicTemplate(slug));
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

export function useClonePublicTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { slug: string; start_date?: string }): Promise<{
      search_id: string;
      forked_from_slug: string;
      forked_from_owner_name?: string;
    }> => {
      const body = args.start_date ? { start_date: args.start_date } : {};
      return api.post(endpoints.publicTemplateClone(args.slug), body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

export function useVotePublicTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { slug: string; vote: 1 | -1 | 0 }): Promise<{
      vote: number;
      vote_score: number;
    }> => {
      return api.post(endpoints.publicTemplateVote(args.slug), { vote: args.vote });
    },
    onSuccess: (_data, { slug }) => {
      qc.invalidateQueries({ queryKey: ['publicTemplate', slug] });
    },
  });
}
