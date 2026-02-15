import { useEffect, useRef } from 'react';
import { FileNode } from '../types';
import { RefreshCw } from 'lucide-react';

interface PreviewProps {
  files: FileNode[];
  onRefresh: () => void;
}

export default function Preview({ files, onRefresh }: PreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    updatePreview();
  }, [files]);

  const updatePreview = () => {
    if (!iframeRef.current) return;

    const htmlFile = files.find((f) => f.name === 'index.html');
    const jsFile = files.find((f) => f.name === 'script.js');

    if (!htmlFile) return;

    let htmlContent = htmlFile.content || '';

    if (jsFile && jsFile.content) {
      const scriptTag = `<script>${jsFile.content}</script>`;
      if (htmlContent.includes('</body>')) {
        htmlContent = htmlContent.replace('</body>', `${scriptTag}</body>`);
      } else {
        htmlContent += scriptTag;
      }
    }

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    if (iframeRef.current.src) {
      URL.revokeObjectURL(iframeRef.current.src);
    }

    iframeRef.current.src = url;
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Preview</h3>
        <button
          onClick={() => {
            onRefresh();
            updatePreview();
          }}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
          title="Refresh preview"
        >
          <RefreshCw size={16} />
        </button>
      </div>
      <iframe
        ref={iframeRef}
        className="flex-1 w-full border-0"
        sandbox="allow-scripts"
        title="Preview"
      />
    </div>
  );
}
