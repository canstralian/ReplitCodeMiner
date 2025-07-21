import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      queryClient.clear();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return {
    user: user as User | undefined,
    isLoading,
    isAuthenticated: !!user,
    logout,
  };
}
