import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { GAEvents } from '@/lib/analytics';

interface RoastResult {
  score: number;
  roast: string;
  dimensions: Record<string, number>;
  ats_score: number;
  highlights: string[];
  weaknesses: string[];
  keywords_missing: string[];
}

interface PolishFullResult {
  polished: string;
  changes: string[];
}

interface PolishSentenceResult {
  result: string;
}

interface JDMatchResult {
  match_score: number;
  analysis: string;
  matched_keywords: string[];
  missing_keywords: string[];
  suggestions: string[];
}

// 更新使用统计
async function incrementUsageStats() {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // 先尝试获取今天的记录
    const { data: existing } = await supabase
      .from('usage_stats')
      .select('id, polish_count, dau')
      .eq('date', today)
      .single();
    
    if (existing) {
      // 更新现有记录
      await supabase
        .from('usage_stats')
        .update({ 
          polish_count: (existing.polish_count || 0) + 1,
          dau: (existing.dau || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);
    } else {
      // 创建新记录
      await supabase
        .from('usage_stats')
        .insert({ 
          date: today, 
          polish_count: 1,
          dau: 1
        });
    }
  } catch (error) {
    console.error('Failed to update usage stats:', error);
  }
}

export function useResumeAI() {
  const [isLoading, setIsLoading] = useState(false);

  const analyzeResume = async (content: string, industry: string): Promise<RoastResult | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('resume-ai', {
        body: { type: 'roast', content, industry },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      // 统计使用
      incrementUsageStats();
      
      // 追踪分析事件
      GAEvents.resumeAnalyze(industry);

      return data as RoastResult;
    } catch (error) {
      console.error('Resume analysis error:', error);
      toast.error(error instanceof Error ? error.message : '分析失败，请重试');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const polishFull = async (content: string, industry: string): Promise<PolishFullResult | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('resume-ai', {
        body: { type: 'polish_full', content, industry },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      // 统计使用
      incrementUsageStats();

      return data as PolishFullResult;
    } catch (error) {
      console.error('Polish full error:', error);
      toast.error(error instanceof Error ? error.message : '润色失败，请重试');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const polishSentence = async (
    content: string, 
    industry: string, 
    style: 'standard' | 'data' | 'expert'
  ): Promise<PolishSentenceResult | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('resume-ai', {
        body: { type: 'polish_sentence', content, industry, style },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      // 统计使用
      incrementUsageStats();

      return data as PolishSentenceResult;
    } catch (error) {
      console.error('Polish sentence error:', error);
      toast.error(error instanceof Error ? error.message : '润色失败，请重试');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const matchJD = async (content: string, jd: string, industry: string): Promise<JDMatchResult | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('resume-ai', {
        body: { type: 'jd_match', content, industry, jd },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      return data as JDMatchResult;
    } catch (error) {
      console.error('JD match error:', error);
      toast.error(error instanceof Error ? error.message : '分析失败，请重试');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    analyzeResume,
    polishFull,
    polishSentence,
    matchJD,
  };
}
