import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Wand2, Loader2, FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { GAEvents } from '@/lib/analytics';

interface ResumeInputProps {
  onSubmit: (content: string) => void;
  isLoading: boolean;
}

export function ResumeInput({ onSubmit, isLoading }: ResumeInputProps) {
  const [content, setContent] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content.trim());
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const isValidFile = (file: File) => {
    const validTypes = ['text/plain', 'text/markdown', 'text/x-markdown'];
    const validExtensions = ['.txt', '.md', '.markdown'];
    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    return validTypes.includes(file.type) || validExtensions.includes(extension);
  };

  const handleFileRead = async (file: File) => {
    if (!isValidFile(file)) {
      toast.error('请上传 .md 或 .txt 格式的文件');
      return;
    }
    const text = await file.text();
    setContent(text);
    toast.success(`已导入: ${file.name}`);
    
    // 追踪简历上传事件
    GAEvents.resumeUpload(file.size);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      await handleFileRead(file);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileRead(file);
    }
    // 重置 input 以便可以再次选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div
        className={cn(
          'relative rounded-xl border-2 border-dashed transition-all duration-300',
          isDragging
            ? 'border-primary bg-primary/10'
            : 'border-border hover:border-primary/50'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="在这里粘贴你的简历内容，或拖拽文本文件到此处...

示例格式：

# 个人信息
张三 | 5年工作经验 | 北京

# 工作经历
**高级前端工程师** @ 某科技公司 (2021-至今)
- 负责核心业务系统的前端架构设计
- 主导了组件库的从0到1建设

# 项目经验
**电商平台重构项目**
- 使用React + TypeScript重构了老旧的jQuery项目
- 优化了首屏加载速度..."
          className="min-h-[300px] resize-none bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm scrollbar-thin"
        />
        
        {!content && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <div className="p-4 rounded-full bg-muted/50">
                <Upload className="w-6 h-6" />
              </div>
              <span className="text-sm">拖拽 Markdown/文本文件 或粘贴简历内容</span>
            </div>
          </div>
        )}
      </div>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.markdown,.txt,text/plain,text/markdown"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="w-4 h-4" />
            <span>{content.length} 字</span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="gap-2"
          >
            <FileUp className="w-4 h-4" />
            导入文件
          </Button>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!content.trim() || isLoading}
          className="btn-ai-glow text-primary-foreground"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              AI 分析中...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              开始 AI 体检
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
