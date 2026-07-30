'use client';

import { createContext, useContext, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getSessionId, getVisitorId, trackPageView } from '@/lib/analytics';

interface AnalyticsContextValue {
  visitorId: string;
  sessionId: string;
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

export function useAnalytics() {
  const value = useContext(AnalyticsContext);
  if (!value) {
    throw new Error('useAnalytics must be used within AnalyticsProvider');
  }
  return value;
}

export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ids = typeof window === 'undefined'
    ? { visitorId: '', sessionId: '' }
    : { visitorId: getVisitorId(), sessionId: getSessionId() };

  useEffect(() => {
    if (!pathname) return;
    void trackPageView(pathname);
  }, [pathname]);

  return (
    <AnalyticsContext.Provider value={ids}>
      {children}
    </AnalyticsContext.Provider>
  );
}
