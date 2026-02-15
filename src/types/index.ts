export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  parentId: string | null;
  children?: FileNode[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Project {
  id: string;
  name: string;
  files: FileNode[];
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}
