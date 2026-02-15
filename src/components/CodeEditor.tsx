import { FileNode } from '../types';
import { useEffect, useRef } from 'react';

interface CodeEditorProps {
  file: FileNode | null;
  onContentChange: (fileId: string, content: string) => void;
}

export default function CodeEditor({ file, onContentChange }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current && file) {
      textareaRef.current.value = file.content || '';
    }
  }, [file?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (file) {
      onContentChange(file.id, e.target.value);
    }
  };

  if (!file) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 text-gray-400">
        Select a file to edit
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-3 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-medium text-gray-700">{file.name}</h3>
      </div>
      <textarea
        ref={textareaRef}
        defaultValue={file.content || ''}
        onChange={handleChange}
        className="flex-1 p-4 font-mono text-sm resize-none focus:outline-none"
        spellCheck={false}
      />
    </div>
  );
}
