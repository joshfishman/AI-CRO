'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function RouteLogger() {
  const pathname = usePathname();

  useEffect(() => {
    console.log('Route Logger mounted');
    console.log('Current pathname:', pathname);
  }, [pathname]);

  return null;
} 