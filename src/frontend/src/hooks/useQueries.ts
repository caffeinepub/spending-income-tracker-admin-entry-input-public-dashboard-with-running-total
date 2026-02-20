import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { getAdminTokens } from '../utils/adminTokens';
import type { IncomeEntry, Person, UserProfile, Time } from '../backend';

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

export function useGetAllEntries() {
  const { actor, isFetching } = useActor();

  return useQuery<IncomeEntry[]>({
    queryKey: ['allEntries'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getEntries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPersons() {
  const { actor, isFetching } = useActor();

  return useQuery<Person[]>({
    queryKey: ['persons'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPersons();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetEntriesByPerson(personId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<IncomeEntry[]>({
    queryKey: ['entries', 'person', personId?.toString()],
    queryFn: async () => {
      if (!actor || personId === null) return [];
      return actor.getEntriesByPerson(personId);
    },
    enabled: !!actor && !isFetching && personId !== null,
  });
}

export function useGetTotalIncomeByPerson(personId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<number>({
    queryKey: ['totalIncome', 'person', personId?.toString()],
    queryFn: async () => {
      if (!actor || personId === null) return 0;
      return actor.getTotalIncomeByPerson(personId);
    },
    enabled: !!actor && !isFetching && personId !== null,
  });
}

export function useGetRolling30DayIncomeSum(personId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<number>({
    queryKey: ['rolling30DayIncome', 'person', personId?.toString()],
    queryFn: async () => {
      if (!actor || personId === null) return 0;
      return actor.getRolling30DayIncomeSum(personId);
    },
    enabled: !!actor && !isFetching && personId !== null,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !!identity && !isFetching,
    retry: false,
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

export function useCreatePerson() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      if (!actor) throw new Error('Actor not available');
      const { adminToken, userProvidedToken } = getAdminTokens();
      return actor.createPerson(name, adminToken, userProvidedToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['persons'] });
    },
  });
}

export function useCreateIncomeEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      personId,
      icpAmount,
      icpTokenValue,
      date,
    }: {
      personId: bigint;
      icpAmount: number;
      icpTokenValue: number;
      date: Time;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const { adminToken, userProvidedToken } = getAdminTokens();
      return actor.createEntry(personId, icpAmount, icpTokenValue, date, adminToken, userProvidedToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      queryClient.invalidateQueries({ queryKey: ['allEntries'] });
      queryClient.invalidateQueries({ queryKey: ['totalIncome'] });
      queryClient.invalidateQueries({ queryKey: ['rolling30DayIncome'] });
    },
  });
}

export function useDeletePerson() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ personId }: { personId: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      const { adminToken, userProvidedToken } = getAdminTokens();
      return actor.deletePerson(personId, adminToken, userProvidedToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['persons'] });
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      queryClient.invalidateQueries({ queryKey: ['allEntries'] });
      queryClient.invalidateQueries({ queryKey: ['totalIncome'] });
      queryClient.invalidateQueries({ queryKey: ['rolling30DayIncome'] });
    },
  });
}

export function useDeleteEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ timestamp }: { timestamp: Time }) => {
      if (!actor) throw new Error('Actor not available');
      const { adminToken, userProvidedToken } = getAdminTokens();
      return actor.deleteEntry(timestamp, adminToken, userProvidedToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      queryClient.invalidateQueries({ queryKey: ['allEntries'] });
      queryClient.invalidateQueries({ queryKey: ['totalIncome'] });
      queryClient.invalidateQueries({ queryKey: ['rolling30DayIncome'] });
    },
  });
}

/**
 * Bootstrap mutation to initialize admin on first authenticated access
 * Calls saveCallerUserProfile with admin tokens to trigger backend's ensureInitialized
 */
export function useBootstrapAdmin() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor || !identity) throw new Error('Actor or identity not available');

      const { adminToken, userProvidedToken } = getAdminTokens();
      const principal = identity.getPrincipal().toString();

      // Check if we've already bootstrapped for this principal in this session
      const bootstrapKey = `admin-bootstrap-${principal}`;
      const alreadyBootstrapped = sessionStorage.getItem(bootstrapKey);

      if (alreadyBootstrapped === 'true') {
        return; // Already bootstrapped this session
      }

      // Get existing profile or create minimal default
      let profile: UserProfile;
      try {
        const existingProfile = await actor.getCallerUserProfile();
        profile = existingProfile || { name: 'Admin User' };
      } catch {
        profile = { name: 'Admin User' };
      }

      // Call saveCallerUserProfile with tokens to trigger ensureInitialized
      await actor.saveCallerUserProfile(profile, adminToken, userProvidedToken);

      // Mark as bootstrapped for this session
      sessionStorage.setItem(bootstrapKey, 'true');
    },
    onSuccess: () => {
      // Invalidate admin status to refetch and update UI
      queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
    },
  });
}
