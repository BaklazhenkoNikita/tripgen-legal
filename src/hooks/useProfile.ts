'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/keys';

export interface Profile {
  user_id?: string;
  name?: string;
  email?: string;
  fingerprint?: string;
  preferences?: {
    preferred_activity_types?: string[];
    budget?: string;
    vibe_tags?: string[];
    energy_level?: string;
    who?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/** Fetches the authenticated user's profile. Requires sign-in. */
export function useProfile() {
  const { userId, isSignedIn } = useAuth();

  return useQuery({
    queryKey: queryKeys.profile.current(),
    queryFn: async (): Promise<Profile | null> => {
      if (!userId) return null;
      return api.get<Profile>(endpoints.profileById(userId));
    },
    enabled: !!isSignedIn && !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

/** PATCH the authenticated user's profile. Rate-limited by `profile_patch`. */
export function useUpdateProfile() {
  const { userId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Partial<Profile>): Promise<Profile> => {
      if (!userId) throw new Error('Not signed in');
      return api.patch<Profile>(endpoints.profileById(userId), updates);
    },
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.profile.current(), data);
    },
  });
}

/** DELETE — full account removal. Irreversible on backend. */
export function useDeleteProfile() {
  const { userId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Not signed in');
      return api.delete<{ deleted: boolean }>(endpoints.profileById(userId));
    },
    onSuccess: () => {
      qc.clear();
    },
  });
}

/** Personalization digest — used server-side to cohort the user. */
export function useProfileFingerprint() {
  const { userId, isSignedIn } = useAuth();
  return useQuery({
    queryKey: ['profile', 'fingerprint', userId ?? ''],
    queryFn: async (): Promise<{ fingerprint?: string } | null> => {
      if (!userId) return null;
      return api.get(`${endpoints.profileById(userId)}/fingerprint`);
    },
    enabled: !!isSignedIn && !!userId,
    staleTime: 30 * 60 * 1000,
  });
}

/**
 * GDPR data export. Returns the full user data blob; browser triggers a
 * download of the JSON rather than rendering it.
 */
export function useExportProfileData() {
  const { userId } = useAuth();
  return useMutation({
    mutationFn: async (): Promise<Record<string, unknown>> => {
      if (!userId) throw new Error('Not signed in');
      return api.get<Record<string, unknown>>(`${endpoints.profileById(userId)}/export`);
    },
  });
}
