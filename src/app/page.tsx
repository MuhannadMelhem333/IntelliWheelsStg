'use client';

import { useEffect } from 'react';
import { AppView } from '@/components/AppView';

export default function Home() {
  useEffect(() => {
    document.title = 'IntelliWheels';
  }, []);

  return <AppView />;
}
