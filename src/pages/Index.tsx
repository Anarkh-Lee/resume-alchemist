import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, FileText, Target, Wand2, Zap, ArrowLeft, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IndustrySelector } from '@/components/IndustrySelector';
import { ResumeInput } from '@/components/ResumeInput';
import { AnalysisResult } from '@/components/AnalysisResult';
import { PolishEditor } from '@/components/PolishEditor';
import { JDMatcher } from '@/components/JDMatcher';
import { ResumeExporter } from '@/components/ResumeExporter';
import { QuickPolish } from '@/components/QuickPolish';
import { Footer } from '@/components/Footer';
import { AnalysisLoadingOverlay } from '@/components/AnalysisLoadingOverlay';
import { useResumeAI } from '@/hooks/useResumeAI';
import { usePageTracking } from '@/hooks/usePageTracking';
import type { IndustryId } from '@/lib/constants';

type AppStep = 'landing' | 'input' | 'result' | 'polish' | 'export' | 'quick-polish';

export default function Index() {
  usePageTracking();
  
  const [step, setStep] = useState<AppStep>('landing');
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryId | null>(null);
  const [resumeContent, setResumeContent] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [polishedContent, setPolishedContent] = useState('');
  
  const { isLoading, analyzeResume } = useResumeAI();

  const handleIndustrySelect = (id: IndustryId) => {
    setSelectedIndustry(id);
  };

  const handleStartAnalysis = () => {
    if (selectedIndustry) {
      setStep('input');
    }
  };

  const handleQuickPolish = () => {
    if (selectedIndustry) {
      setStep('quick-polish');
    }
  };

  const handleResumeSubmit = async (content: string) => {
    setResumeContent(content);
    if (selectedIndustry) {
      const result = await analyzeResume(content, selectedIndustry);
      if (result) {
        setAnalysisResult(result);
        setStep('result');
      }
    }
  };

  const handleReset = () => {
    setStep('input');
    setAnalysisResult(null);
  };

  const handleGoHome = () => {
    setStep('landing');
    setResumeContent('');
    setAnalysisResult(null);
    setPolishedContent('');
  };

  // 根据当前步骤获取返回目标
  const getBackStep = (): AppStep => {
    switch (step) {
      case 'input': return 'landing';
      case 'result': return 'input';
      case 'polish': return 'result';
      case 'export': return polishedContent ? 'polish' : 'result';
      case 'quick-polish': return 'landing';
      default: return 'landing';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Analysis Loading Overlay */}
      <AnalysisLoadingOverlay isVisible={isLoading} />
      
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* 返回按钮（非首页时显示） */}
              {step !== 'landing' && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setStep(getBackStep())}
                  className="mr-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              
              {/* Logo - 点击返回首页 */}
              <button 
                onClick={handleGoHome}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <div className="p-2 rounded-xl bg-gradient-ai">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold">
                  <span className="text-gradient-ai">简历炼金术</span>
                </h1>
              </button>
            </div>
            
            {/* GitHub 链接 */}
            <a
              href="https://github.com/Anarkh-Lee/resume-alchemist"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              title="在 GitHub 上 Star 我"
            >
              <Github className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {step === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto space-y-12"
            >
              {/* Hero */}
              <div className="text-center space-y-6 pt-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                    让 AI 帮你打造
                    <br />
                    <span className="text-gradient-ai">一份无法拒绝的简历</span>
                  </h2>
                </motion.div>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-lg text-muted-foreground max-w-2xl mx-auto"
                >
                  智能分析 · 毒舌点评 · STAR法则润色 · 职位匹配
                </motion.p>
              </div>

              {/* Industry Selector */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                <h3 className="text-center font-medium text-muted-foreground">
                  选择你的目标职业
                </h3>
                <IndustrySelector 
                  selected={selectedIndustry} 
                  onSelect={handleIndustrySelect}
                />
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Button
                  size="lg"
                  onClick={handleStartAnalysis}
                  disabled={!selectedIndustry}
                  className="btn-ai-glow text-primary-foreground px-8 py-6 text-lg"
                >
                  开始体检我的简历
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleQuickPolish}
                  disabled={!selectedIndustry}
                  className="px-8 py-6 text-lg border-primary/50 hover:bg-primary/10"
                >
                  <Zap className="w-5 h-5 mr-2 text-primary" />
                  单句原子润色
                </Button>
              </motion.div>

              {/* Features */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8"
              >
                {[
                  { icon: FileText, title: '智能诊断', desc: '综合评分 + 六维雷达图' },
                  { icon: Wand2, title: 'AI 润色', desc: 'STAR法则 + 量化数据' },
                  { icon: Target, title: '职位匹配', desc: '关键词对比 + 优化建议' },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="glass-card p-6 text-center space-y-3 card-hover"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center mx-auto">
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <h4 className="font-semibold">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {step === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-3xl mx-auto space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">上传你的简历</h2>
                <p className="text-muted-foreground">
                  粘贴简历内容，AI 将进行全面体检
                </p>
              </div>
              <ResumeInput onSubmit={handleResumeSubmit} isLoading={isLoading} />
            </motion.div>
          )}

          {step === 'result' && analysisResult && (
            <motion.div
              key="result"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-5xl mx-auto"
            >
              <Tabs defaultValue="analysis" className="space-y-6">
                <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-muted/50">
                  <TabsTrigger value="analysis" className="gap-2">
                    <FileText className="w-4 h-4" />
                    分析报告
                  </TabsTrigger>
                  <TabsTrigger value="jd" className="gap-2">
                    <Target className="w-4 h-4" />
                    职位匹配
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="analysis">
                  <AnalysisResult
                    result={analysisResult}
                    onPolish={() => setStep('polish')}
                    onExport={() => setStep('export')}
                    onReset={handleReset}
                  />
                </TabsContent>

                <TabsContent value="jd">
                  <JDMatcher 
                    resumeContent={resumeContent} 
                    industry={selectedIndustry || 'programmer'} 
                  />
                </TabsContent>
              </Tabs>
            </motion.div>
          )}

          {step === 'polish' && (
            <motion.div
              key="polish"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-6xl mx-auto"
            >
              <PolishEditor
                originalContent={resumeContent}
                industry={selectedIndustry || 'programmer'}
                onBack={() => setStep('result')}
                onExport={(content) => {
                  setPolishedContent(content);
                  setStep('export');
                }}
              />
            </motion.div>
          )}

          {step === 'export' && (
            <motion.div
              key="export"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-6xl mx-auto"
            >
              <ResumeExporter
                resumeContent={resumeContent}
                polishedContent={polishedContent}
                onBack={() => setStep(polishedContent ? 'polish' : 'result')}
              />
            </motion.div>
          )}

          {step === 'quick-polish' && (
            <motion.div
              key="quick-polish"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto"
            >
              <QuickPolish
                industry={selectedIndustry || 'programmer'}
                onBack={() => setStep('landing')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
