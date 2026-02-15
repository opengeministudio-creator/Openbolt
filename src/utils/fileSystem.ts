import { FileNode, Project } from '../types';

const DB_NAME = 'ai-coding-tool';
const DB_VERSION = 1;
const STORE_NAME = 'projects';

export class FileSystemManager {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  async saveProject(project: Project): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(project);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getProject(id: string): Promise<Project | null> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllProjects(): Promise<Project[]> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteProject(id: string): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function createDefaultProject(): Project {
  const id = generateId();
  return {
    id,
    name: 'New Project',
    files: [
      {
        id: generateId(),
        name: 'index.html',
        type: 'file',
        parentId: null,
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My App</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      margin: 0;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      text-align: center;
    }
    h1 {
      color: #333;
      margin: 0 0 20px 0;
    }
    p {
      color: #666;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Welcome to Your App</h1>
    <p>Start chatting with the AI to build something amazing!</p>
  </div>
  <script src="script.js"></script>
</body>
</html>`,
      },
      {
        id: generateId(),
        name: 'script.js',
        type: 'file',
        parentId: null,
        content: `console.log('Hello from your AI-generated app!');`,
      },
    ],
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
