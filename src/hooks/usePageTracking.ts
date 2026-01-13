import { useEffect } from 'react';
import { trackPageView } from '@/lib/analytics';

/**
 * 自动追踪页面浏览的 Hook
 */
export function usePageTracking() {
  useEffect(() => {
    // 组件挂载时追踪页面浏览
    trackPageView();
  }, []);
}
