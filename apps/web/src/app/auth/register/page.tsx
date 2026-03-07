'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Registration and login use the same Google OAuth flow
export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/auth/login');
  }, [router]);

  return null;
}
