import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProfileApi } from '../api/profile.api';

export function useAuth(supabase: any) {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      setAuthLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setAuthLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: any, session: any) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  const profileQuery = useQuery({
    queryKey: ['profile', user?.id],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    queryFn: () => getProfileApi(supabase),
  });

  const currentUser = user ? {
    ...user,
    profile: profileQuery.data,
  } : null;

  const isLoading = authLoading || profileQuery.isLoading;

  return {
    user,
    profile: profileQuery.data,
    profileQuery,
    currentUser,
    isLoading,
  };
}