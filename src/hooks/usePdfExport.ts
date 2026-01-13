import { useState, useCallback } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';
import { GAEvents } from '@/lib/analytics';

function sanitizeFilename(name: string) {
  // Windows/macOS/Linux common illegal filename chars
  return name
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);
}

export function usePdfExport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPdf = useCallback(
    async (
      element: HTMLElement | null, 
      filename: string = '我的简历',
      template: 'minimalist' | 'elite' | 'geek' = 'minimalist'
    ) => {
      if (!element) {
        toast.error('导出失败：无法找到简历内容');
        return;
      }

      setIsExporting(true);
      toast.loading('正在生成 PDF...', { id: 'pdf-export' });

      let clonedElement: HTMLElement | null = null;

      try {
        // 等待字体加载（避免导出时字体回退）
        if (document.fonts?.ready) {
          await document.fonts.ready;
        }
        await new Promise((resolve) => setTimeout(resolve, 200));

        // 克隆元素，避免影响页面显示
        clonedElement = element.cloneNode(true) as HTMLElement;

        // 将克隆元素放到屏幕外，确保布局按 A4 渲染
        clonedElement.style.position = 'absolute';
        clonedElement.style.left = '-9999px';
        clonedElement.style.top = '0';
        clonedElement.style.width = '210mm';
        clonedElement.style.minHeight = '297mm';
        clonedElement.style.backgroundColor = '#ffffff';
        clonedElement.style.color = '#000000';
        clonedElement.style.transform = 'none';
        clonedElement.style.margin = '0';
        clonedElement.style.boxShadow = 'none';
        clonedElement.style.overflow = 'visible';

        document.body.appendChild(clonedElement);

        // 再等一帧，确保 DOM/字体渲染完成
        await new Promise((resolve) => setTimeout(resolve, 100));

        // 将 DOM 转成 canvas（注意：过高 scale 容易导致内存爆）
        const canvas = await html2canvas(clonedElement, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          width: clonedElement.scrollWidth,
          height: clonedElement.scrollHeight,
          windowWidth: clonedElement.scrollWidth,
          windowHeight: clonedElement.scrollHeight,
        });

        const imgData = canvas.toDataURL('image/png', 1.0);

        // 创建 PDF
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // 分页（整张长图按页偏移）
        const pageHeight = 297;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
          heightLeft -= pageHeight;
        }

        const safeName = sanitizeFilename(filename) || '我的简历';

        // 有些环境 pdf.save 可能被限制；提供一个更稳的 fallback
        try {
          pdf.save(`${safeName}.pdf`);
        } catch {
          const blob = pdf.output('blob');
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${safeName}.pdf`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        }

        toast.success('PDF 导出成功！', { id: 'pdf-export' });
        
        // 追踪 PDF 导出事件
        GAEvents.pdfExport(template);
      } catch (error) {
        console.error('PDF export error:', error);
        toast.error('PDF 导出失败，请重试', { id: 'pdf-export' });
      } finally {
        if (clonedElement?.parentNode) {
          clonedElement.parentNode.removeChild(clonedElement);
        }
        setIsExporting(false);
      }
    },
    []
  );

  return { exportToPdf, isExporting };
}

