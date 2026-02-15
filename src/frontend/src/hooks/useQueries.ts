import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { IncomeEntry } from '../backend';

export function useGetEntries() {
  const { actor, isFetching } = useActor();

  return useQuery<IncomeEntry[]>({
    queryKey: ['entries'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getEntries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['isAdmin', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !!identity && !isFetching,
  });
}

export function useCreateIncomeEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ icpAmount, icpTokenValue }: { icpAmount: number; icpTokenValue: number }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createEntry(icpAmount, icpTokenValue);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
    },
  });
}

