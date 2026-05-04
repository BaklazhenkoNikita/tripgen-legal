'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/keys';

export type CollabRole = 'editor' | 'viewer';

export interface InviteResponse {
  invite_token: string;
  invite_url: string;
  role: CollabRole;
}

export interface Collaborator {
  user_id: string;
  name?: string;
  email?: string;
  role: CollabRole;
  added_at?: string;
}

export interface CollaboratorsResponse {
  owner: Collaborator;
  editors: Collaborator[];
  viewers: Collaborator[];
  invite_tokens?: Array<{ role: CollabRole; token: string }>;
}

export interface TripVersionResponse {
  version: number;
  updated_at: string;
}

export interface SharedWithMeResponse {
  trips: Array<{
    search_id: string;
    destination: string;
    role: CollabRole;
    updated_at: string;
  }>;
  total?: number;
}

/** Invite link generation. */
export function useCreateInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { tripId: string; role: CollabRole }): Promise<InviteResponse> => {
      const q = new URLSearchParams({ role: args.role });
      return api.post<InviteResponse>(
        `${endpoints.tripInvite(args.tripId)}?${q.toString()}`,
        {},
      );
    },
    onSuccess: (_data, { tripId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.trips.collaborators(tripId) });
    },
  });
}

export function useRevokeInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { tripId: string; role: CollabRole }) => {
      const q = new URLSearchParams({ role: args.role });
      return api.delete<{ revoked: boolean }>(
        `${endpoints.tripInvite(args.tripId)}?${q.toString()}`,
      );
    },
    onSuccess: (_data, { tripId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.trips.collaborators(tripId) });
    },
  });
}

export function useJoinTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (inviteToken: string): Promise<{
      search_id: string;
      destination?: string;
      role: CollabRole;
      already_member: boolean;
    }> => {
      return api.post(endpoints.tripJoin(inviteToken), {});
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.trips.all });
    },
  });
}

/** Full collaborator list for a trip (owner + editors + viewers + invite tokens). */
export function useCollaborators(tripId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.trips.collaborators(tripId ?? ''),
    queryFn: async (): Promise<CollaboratorsResponse | null> => {
      if (!tripId) return null;
      return api.get<CollaboratorsResponse>(endpoints.tripCollaborators(tripId));
    },
    enabled: !!tripId,
    staleTime: 60 * 1000,
  });
}

export function useRemoveCollaborator() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { tripId: string; userId: string }) => {
      return api.delete<{ removed: boolean }>(
        `${endpoints.tripCollaborators(args.tripId)}/${encodeURIComponent(args.userId)}`,
      );
    },
    onSuccess: (_data, { tripId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.trips.collaborators(tripId) });
    },
  });
}

export function useChangeCollaboratorRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      tripId: string;
      userId: string;
      role: CollabRole;
    }) => {
      const q = new URLSearchParams({ role: args.role });
      return api.patch<{ role: CollabRole }>(
        `${endpoints.tripCollaboratorRole(args.tripId, args.userId)}?${q.toString()}`,
        {},
      );
    },
    onSuccess: (_data, { tripId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.trips.collaborators(tripId) });
    },
  });
}

export function useLeaveTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (tripId: string) => {
      return api.delete<{ left: boolean }>(endpoints.tripLeave(tripId));
    },
    onSuccess: (_data, tripId) => {
      qc.invalidateQueries({ queryKey: queryKeys.trips.detail(tripId) });
      qc.invalidateQueries({ queryKey: queryKeys.trips.all });
    },
  });
}

export function useTripVersion(tripId: string | null | undefined, options?: { pollMs?: number }) {
  return useQuery({
    queryKey: queryKeys.trips.version(tripId ?? ''),
    queryFn: async (): Promise<TripVersionResponse | null> => {
      if (!tripId) return null;
      return api.get<TripVersionResponse>(endpoints.tripVersion(tripId));
    },
    enabled: !!tripId,
    // Poll only when the tab is visible; `refetchInterval` returning `false`
    // pauses polling while the tab is hidden.
    refetchInterval: (query) => {
      if (typeof document === 'undefined') return false;
      if (document.visibilityState !== 'visible') return false;
      // Stop polling if the query is in an error state (backoff takes over).
      if (query.state.error) return false;
      return options?.pollMs ?? 30_000;
    },
    refetchIntervalInBackground: false,
    staleTime: 5_000,
  });
}

export function useSharedWithMe(args: { limit?: number; skip?: number } = {}) {
  const { limit = 20, skip = 0 } = args;
  return useQuery({
    queryKey: queryKeys.trips.sharedWithMe({ limit, skip }),
    queryFn: async (): Promise<SharedWithMeResponse> => {
      const q = new URLSearchParams();
      q.set('limit', String(limit));
      q.set('skip', String(skip));
      return api.get<SharedWithMeResponse>(
        `${endpoints.sharedWithMe}?${q.toString()}`,
      );
    },
    staleTime: 60 * 1000,
  });
}
