import { FileNode } from '../types';
import { File, Folder, ChevronRight, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface FileTreeProps {
  files: FileNode[];
  selectedFileId: string | null;
  onSelectFile: (file: FileNode) => void;
}

interface FileItemProps {
  file: FileNode;
  selectedFileId: string | null;
  onSelectFile: (file: FileNode) => void;
  level: number;
}

function FileItem({ file, selectedFileId, onSelectFile, level }: FileItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (file.type === 'folder') {
    return (
      <div>
        <div
          className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 cursor-pointer rounded"
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <Folder size={16} className="text-blue-500" />
          <span className="text-sm">{file.name}</span>
        </div>
        {isExpanded && file.children && (
          <div>
            {file.children.map((child) => (
              <FileItem
                key={child.id}
                file={child}
                selectedFileId={selectedFileId}
                onSelectFile={onSelectFile}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 px-2 py-1 hover:bg-gray-100 cursor-pointer rounded ${
        selectedFileId === file.id ? 'bg-blue-50' : ''
      }`}
      style={{ paddingLeft: `${level * 12 + 24}px` }}
      onClick={() => onSelectFile(file)}
    >
      <File size={16} className="text-gray-500" />
      <span className="text-sm">{file.name}</span>
    </div>
  );
}

export default function FileTree({ files, selectedFileId, onSelectFile }: FileTreeProps) {
  return (
    <div className="h-full bg-white border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Files</h2>
      </div>
      <div className="p-2">
        {files.map((file) => (
          <FileItem
            key={file.id}
            file={file}
            selectedFileId={selectedFileId}
            onSelectFile={onSelectFile}
            level={0}
          />
        ))}
      </div>
    </div>
  );
}
