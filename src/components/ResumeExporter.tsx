import { useState, useRef, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FileDown, ArrowLeft, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResumeTemplatePreview } from '@/components/ResumeTemplatePreview';
import { ResumeDocument } from '@/components/ResumeDocument';
import { usePdfExport } from '@/hooks/usePdfExport';
import { RESUME_TEMPLATES, parseResumeContent } from '@/lib/resumeTemplates';
import '@/styles/print.css';

interface ResumeExporterProps {
  resumeContent: string;
  polishedContent?: string;
  onBack: () => void;
}

export function ResumeExporter({ resumeContent, polishedContent, onBack }: ResumeExporterProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('minimal');
  const resumeRef = useRef<HTMLDivElement>(null);
  const { exportToPdf, isExporting } = usePdfExport();

  const selectedTemplate = useMemo(
    () => RESUME_TEMPLATES.find(t => t.id === selectedTemplateId) || RESUME_TEMPLATES[0],
    [selectedTemplateId]
  );

  const resumeData = useMemo(
    () => parseResumeContent(polishedContent || resumeContent),
    [resumeContent, polishedContent]
  );

  const handleExport = useCallback(async () => {
    const templateId = selectedTemplateId as 'minimalist' | 'elite' | 'geek';
    await exportToPdf(
      resumeRef.current, 
      `简历_${resumeData.name}_${selectedTemplate.name}`,
      templateId
    );
  }, [exportToPdf, resumeData.name, selectedTemplate.name, selectedTemplateId]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-xl font-semibold">简历模板库</h2>
            <p className="text-sm text-muted-foreground">选择风格，一键导出 A4 PDF</p>
          </div>
        </div>
        <Button
          onClick={handleExport}
          disabled={isExporting}
          className="btn-ai-glow text-primary-foreground"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              生成中...
            </>
          ) : (
            <>
              <FileDown className="w-4 h-4 mr-2" />
              下载 PDF
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-muted/50">
          <TabsTrigger value="templates" className="gap-2">
            选择模板
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2">
            <Eye className="w-4 h-4" />
            全屏预览
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
            {/* 左侧：模板选择 */}
            <div className="space-y-3">
              <h3 className="font-medium text-muted-foreground">选择风格</h3>
              <div className="space-y-2">
                {RESUME_TEMPLATES.map((template) => (
                  <ResumeTemplatePreview
                    key={template.id}
                    template={template}
                    isSelected={selectedTemplateId === template.id}
                    onClick={() => setSelectedTemplateId(template.id)}
                    resumeData={resumeData}
                  />
                ))}
              </div>
            </div>

            {/* 右侧：预览 */}
            <div className="space-y-4 flex flex-col">
              <h3 className="font-medium text-muted-foreground">效果预览</h3>
              <div className="glass-card p-6 overflow-auto max-h-[80vh] flex items-start justify-center">
                <div 
                  className="transform origin-top" 
                  style={{ 
                    transform: 'scale(0.55)',
                    transformOrigin: 'top center'
                  }}
                >
                  <ResumeDocument
                    ref={resumeRef}
                    template={selectedTemplate}
                    resumeData={resumeData}
                    polishedContent={polishedContent}
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <div className="glass-card p-6 overflow-auto max-h-[85vh]">
            <div className="flex justify-center">
              <ResumeDocument
                ref={resumeRef}
                template={selectedTemplate}
                resumeData={resumeData}
                polishedContent={polishedContent}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
