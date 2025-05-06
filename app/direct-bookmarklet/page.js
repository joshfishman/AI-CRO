'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DirectBookmarkletRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/bookmarklet');
  }, [router]);
  
  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-600">Redirecting to bookmarklet page...</p>
    </div>
  );
} 