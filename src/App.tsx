import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import ChatPanel from './components/ChatPanel';
import FileTree from './components/FileTree';
import CodeEditor from './components/CodeEditor';
import Preview from './components/Preview';
import SettingsModal from './components/SettingsModal';
import { FileNode, Message, Project } from './types';
import {
  FileSystemManager,
  createDefaultProject,
  generateId,
} from './utils/fileSystem';
import { generateWithClaude, createSystemPrompt, parseFilesFromResponse } from './utils/llm';

const fileSystemManager = new FileSystemManager();

function App() {
  const [project, setProject] = useState<Project | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  useEffect(() => {
    initializeProject();
    loadApiKey();
  }, []);

  const initializeProject = async () => {
    await fileSystemManager.init();
    const projects = await fileSystemManager.getAllProjects();

    if (projects.length > 0) {
      setProject(projects[0]);
      if (projects[0].files.length > 0) {
        setSelectedFile(projects[0].files[0]);
      }
    } else {
      const newProject = createDefaultProject();
      await fileSystemManager.saveProject(newProject);
      setProject(newProject);
      if (newProject.files.length > 0) {
        setSelectedFile(newProject.files[0]);
      }
    }
  };

  const loadApiKey = () => {
    const stored = localStorage.getItem('anthropic_api_key');
    if (stored) {
      setApiKey(stored);
    }
  };

  const saveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('anthropic_api_key', key);
  };

  const saveProject = async (updatedProject: Project) => {
    updatedProject.updatedAt = Date.now();
    await fileSystemManager.saveProject(updatedProject);
    setProject(updatedProject);
  };

  const handleSendMessage = async (content: string) => {
    if (!project || !apiKey) {
      if (!apiKey) {
        setShowSettings(true);
      }
      return;
    }

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    const updatedMessages = [...project.messages, userMessage];
    const updatedProject = { ...project, messages: updatedMessages };
    await saveProject(updatedProject);

    setIsProcessing(true);

    try {
      const filesContext = project.files
        .map((f) => `${f.name}:\n${f.content}`)
        .join('\n\n');
      const systemPrompt = createSystemPrompt(filesContext);

      const response = await generateWithClaude(
        updatedMessages,
        apiKey,
        systemPrompt
      );

      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      let finalProject = { ...updatedProject, messages: finalMessages };

      const parsedFiles = parseFilesFromResponse(response);
      if (parsedFiles.length > 0) {
        const updatedFiles = [...project.files];

        parsedFiles.forEach(({ filename, content }) => {
          const existingFileIndex = updatedFiles.findIndex(
            (f) => f.name === filename
          );

          if (existingFileIndex >= 0) {
            updatedFiles[existingFileIndex].content = content;
          } else {
            updatedFiles.push({
              id: generateId(),
              name: filename,
              type: 'file',
              parentId: null,
              content,
            });
          }
        });

        finalProject = { ...finalProject, files: updatedFiles };
      }

      await saveProject(finalProject);
      setPreviewKey((k) => k + 1);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to generate response. Please check your API key.'}`,
        timestamp: Date.now(),
      };
      await saveProject({
        ...updatedProject,
        messages: [...updatedMessages, errorMessage],
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContentChange = (fileId: string, content: string) => {
    if (!project) return;

    const updatedFiles = project.files.map((f) =>
      f.id === fileId ? { ...f, content } : f
    );

    const updatedProject = { ...project, files: updatedFiles };
    saveProject(updatedProject);

    if (selectedFile?.id === fileId) {
      setSelectedFile({ ...selectedFile, content });
    }
  };

  const handleSelectFile = (file: FileNode) => {
    setSelectedFile(file);
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">AI Code Builder</h1>
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Settings"
        >
          <Settings size={20} />
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 border-r border-gray-200">
          <ChatPanel
            messages={project.messages}
            onSendMessage={handleSendMessage}
            isProcessing={isProcessing}
          />
        </div>

        <div className="w-64 border-r border-gray-200">
          <FileTree
            files={project.files}
            selectedFileId={selectedFile?.id || null}
            onSelectFile={handleSelectFile}
          />
        </div>

        <div className="flex-1 flex">
          <div className="flex-1">
            <CodeEditor file={selectedFile} onContentChange={handleContentChange} />
          </div>
          <div className="flex-1 border-l border-gray-200">
            <Preview key={previewKey} files={project.files} onRefresh={() => setPreviewKey((k) => k + 1)} />
          </div>
        </div>
      </div>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        apiKey={apiKey}
        onSaveApiKey={saveApiKey}
      />
    </div>
  );
}

export default App;
