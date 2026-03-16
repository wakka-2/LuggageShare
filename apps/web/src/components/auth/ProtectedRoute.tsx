'use client';

import { useAuth } from '@/providers/AuthProvider';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center blob-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-v2-primary/20" />
          <div className="h-4 w-32 bg-v2-primary/10 rounded-full" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // AuthProvider handles redirect
  }

  return <>{children}</>;
}
