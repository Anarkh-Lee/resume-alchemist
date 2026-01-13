import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileSearch, Loader2, CheckCircle2, XCircle, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScoreDisplay } from './ScoreDisplay';
import { useResumeAI } from '@/hooks/useResumeAI';
import { GAEvents } from '@/lib/analytics';

interface JDMatcherProps {
  resumeContent: string;
  industry: string;
}

interface MatchResult {
  match_score: number;
  analysis: string;
  matched_keywords: string[];
  missing_keywords: string[];
  suggestions: string[];
}

export function JDMatcher({ resumeContent, industry }: JDMatcherProps) {
  const [jd, setJD] = useState('');
  const [result, setResult] = useState<MatchResult | null>(null);
  const { isLoading, matchJD } = useResumeAI();

  const handleMatch = async () => {
    if (!jd.trim()) return;
    const matchResult = await matchJD(resumeContent, jd, industry);
    if (matchResult) {
      setResult(matchResult);
      GAEvents.jdMatch(matchResult.match_score);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-2">
        <FileSearch className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold">职位匹配度分析</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: JD Input */}
        <div className="space-y-4">
          <h3 className="font-medium text-muted-foreground">粘贴目标职位描述 (JD)</h3>
          <Textarea
            value={jd}
            onChange={(e) => setJD(e.target.value)}
            placeholder="粘贴职位描述，例如：

岗位职责：
1. 负责公司核心业务系统的前端开发
2. 参与技术方案设计和代码评审
...

任职要求：
1. 3年以上前端开发经验
2. 精通 React/Vue 等主流框架
..."
            className="min-h-[300px] resize-none bg-card/50"
          />
          <Button
            onClick={handleMatch}
            disabled={!jd.trim() || isLoading}
            className="w-full btn-ai-glow text-primary-foreground"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                分析中...
              </>
            ) : (
              <>
                <FileSearch className="w-4 h-4 mr-2" />
                分析匹配度
              </>
            )}
          </Button>
        </div>

        {/* Right: Results */}
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {/* Score */}
              <div className="glass-card p-6 flex flex-col items-center">
                <ScoreDisplay score={result.match_score} label="匹配度" size="md" />
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  {result.analysis}
                </p>
              </div>

              {/* Matched Keywords */}
              <div className="glass-card p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <h4 className="font-medium">已匹配关键词</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.matched_keywords.map((keyword, index) => (
                    <Badge key={index} className="bg-green-500/20 text-green-400 border-green-500/30">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Missing Keywords */}
              <div className="glass-card p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-400" />
                  <h4 className="font-medium">缺少的关键词</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.missing_keywords.map((keyword, index) => (
                    <Badge key={index} variant="outline" className="border-red-500/30 text-red-400">
                      + {keyword}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Suggestions */}
              <div className="glass-card p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-400" />
                  <h4 className="font-medium">优化建议</h4>
                </div>
                <ul className="space-y-2">
                  {result.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-0.5">{index + 1}.</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card min-h-[400px] flex flex-col items-center justify-center text-center p-8"
            >
              <FileSearch className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">粘贴职位描述开始分析</p>
              <p className="text-sm text-muted-foreground/60 mt-2">
                AI 将对比你的简历与职位要求的匹配程度
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
