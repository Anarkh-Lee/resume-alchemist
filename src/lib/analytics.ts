// src/lib/analytics.ts
import ReactGA from "react-ga4";

/**
 * 初始化 Google Analytics
 */
export const initGA = () => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  
  if (!measurementId) {
    console.warn('Google Analytics Measurement ID not found');
    return;
  }

  // 初始化 GA4
  ReactGA.initialize(measurementId, {
    // 开发环境下的配置
    gaOptions: {
      debug_mode: import.meta.env.DEV, // 开发环境启用调试
    },
    gtagOptions: {
      send_page_view: false, // 我们手动控制页面浏览追踪
    }
  });

  console.log('✅ Google Analytics initialized:', measurementId);
};

/**
 * 追踪页面浏览
 * @param path - 页面路径 (可选,默认使用当前路径)
 * @param title - 页面标题 (可选)
 */
export const trackPageView = (path?: string, title?: string) => {
  const pagePath = path || window.location.pathname + window.location.search;
  const pageTitle = title || document.title;

  ReactGA.send({ 
    hitType: "pageview", 
    page: pagePath,
    title: pageTitle
  });

  console.log('📊 Page view tracked:', pagePath);
};

/**
 * 追踪自定义事件
 * @param category - 事件类别 (如: 'Resume', 'AI', 'Export')
 * @param action - 事件动作 (如: 'analyze', 'polish', 'download')
 * @param label - 事件标签 (可选,如: 'tech_industry')
 * @param value - 事件值 (可选,如: 评分)
 */
export const trackEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number
) => {
  ReactGA.event({
    category,
    action,
    label,
    value,
  });

  console.log('🎯 Event tracked:', { category, action, label, value });
};

/**
 * 预定义的业务事件
 */
export const GAEvents = {
  // 简历分析
  resumeAnalyze: (industry: string) => {
    trackEvent('Resume', 'analyze', industry);
  },

  // AI 润色
  resumePolish: (mode: 'standard' | 'data_driven' | 'expert') => {
    trackEvent('AI', 'polish', mode);
  },

  // 职位匹配
  jdMatch: (score: number) => {
    trackEvent('AI', 'jd_match', undefined, score);
  },

  // PDF 导出
  pdfExport: (template: 'minimalist' | 'elite' | 'geek') => {
    trackEvent('Export', 'download_pdf', template);
  },

  // 行业选择
  industrySelect: (industry: string) => {
    trackEvent('UI', 'select_industry', industry);
  },

  // 简历上传
  resumeUpload: (fileSize: number) => {
    trackEvent('Upload', 'resume_file', undefined, fileSize);
  },
};