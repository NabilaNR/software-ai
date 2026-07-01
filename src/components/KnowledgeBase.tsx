'use client';
import { useState, useRef } from 'react';
import { Project } from '@/services/dummyData';
import { IndexedDocument } from '@/services/ragService';
import { 
  Upload, 
  FileText, 
  Trash2, 
  CheckCircle, 
  Loader2, 
  AlertCircle,
  Database,
  Building,
  HelpCircle
} from 'lucide-react';

interface KnowledgeBaseProps {
  documents: IndexedDocument[];
  projects: Project[];
  onAddDocument: (doc: IndexedDocument) => void;
  onRemoveDocument: (id: string) => void;
}

export default function KnowledgeBase({
  documents,
  projects,
  onAddDocument,
  onRemoveDocument
}: KnowledgeBaseProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('global');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (10MB for safety)
    if (file.size > 10 * 1024 * 1024) {
      setError('File is too large. Maximum size allowed is 10MB.');
      return;
    }

    const extension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['pdf', 'docx', 'txt', 'md', 'json', 'yaml', 'yml'];
    if (!extension || !allowedExtensions.includes(extension)) {
      setError('Unsupported file type. Please upload PDF, DOCX, TXT, MD, JSON, or YAML.');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', selectedProjectId);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Failed to parse file.');
      }

      const data = await response.json();
      
      // Document is indexed. Let's add it to the state.
      const newDoc: IndexedDocument = {
        id: `${Date.now()}-${file.name}`,
        filename: data.filename,
        projectId: data.projectId,
        text: data.text,
        sizeBytes: data.sizeBytes,
        status: 'Indexed',
        uploadedAt: new Date().toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      onAddDocument(newDoc);

      // Simulate the RAG indexing pipeline states: Indexed -> Embedding -> Ready
      setTimeout(() => {
        onAddDocument({
          ...newDoc,
          status: 'Embedding Complete'
        });

        setTimeout(() => {
          onAddDocument({
            ...newDoc,
            status: 'Ready for AI'
          });
        }, 1200);
      }, 1200);

    } catch (err: any) {
      console.error('Upload handler error:', err);
      setError(err.message || 'An unexpected error occurred during processing.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Indexed':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">Indexed</span>;
      case 'Embedding Complete':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">Embedding Sync</span>;
      case 'Ready for AI':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Ready for AI</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">{status}</span>;
    }
  };

  const getProjectName = (projectId: string) => {
    if (projectId === 'global') return 'Global Scope';
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Unknown Project';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Project Knowledge Base
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Upload and index software specification sheets, API documentations, or logs for RAG context extraction.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form Panel */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-200 border-b border-slate-800/60 pb-2">
              Index Document
            </h3>

            {/* Scope Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Target Project Scope</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-200"
              >
                <option value="global">Global (All projects)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Drag Zone Mock / Trigger */}
            <div 
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 select-none ${
                isUploading 
                  ? 'border-slate-800 bg-slate-900/10 cursor-wait' 
                  : 'border-slate-800 bg-slate-950/20 hover:bg-slate-900/30 hover:border-blue-500/40'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.docx,.txt,.md,.json,.yaml,.yml"
                className="hidden"
                disabled={isUploading}
              />
              
              {isUploading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                  <div>
                    <span className="text-xs font-bold text-slate-300">Extracting Document Text...</span>
                    <span className="text-[10px] text-slate-500 block mt-1">Generating index tokens</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Upload className="w-10 h-10 text-slate-500 group-hover:text-blue-500 transition-colors" />
                  <div>
                    <span className="text-xs font-bold text-slate-300">Choose file or drag here</span>
                    <span className="text-[10px] text-slate-500 block mt-1">PDF, DOCX, TXT, MD, JSON, YAML (Max 10MB)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-900/30 text-[11px] text-red-400 flex gap-2">
                <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 text-[10px] leading-relaxed text-slate-500 flex gap-2">
            <Database className="w-4 h-4 shrink-0 text-slate-400" />
            <span>Files are processed locally and stored in-memory. Embeddings simulate a RAG indexing pipeline before becoming fully searchable during chat auditing.</span>
          </div>
        </div>

        {/* Document list panel */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-2 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-200 border-b border-slate-800/60 pb-2">
              Indexed Documents ({documents.length})
            </h3>

            {documents.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <FileText className="w-10 h-10 mx-auto mb-2 text-slate-700" />
                <span className="text-xs font-bold block">No documents indexed yet</span>
                <span className="text-[10px] mt-1 block">Upload a file to start utilizing RAG context during chats.</span>
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
                {documents.map((doc) => (
                  <div 
                    key={doc.id}
                    className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-850 hover:border-slate-800 flex items-center justify-between gap-4 transition-all duration-150"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-slate-950 border border-slate-800 text-slate-400 rounded-lg shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-200 truncate" title={doc.filename}>
                          {doc.filename}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-slate-500 mt-1">
                          <span className="flex items-center gap-0.5">
                            <Building className="w-3 h-3" />
                            {getProjectName(doc.projectId)}
                          </span>
                          <span>•</span>
                          <span>{Math.round(doc.sizeBytes / 1024)} KB</span>
                          <span>•</span>
                          <span>{doc.uploadedAt}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {getStatusBadge(doc.status)}
                      <button
                        onClick={() => onRemoveDocument(doc.id)}
                        className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 hover:bg-red-500/10 hover:border-red-500/30 text-slate-500 hover:text-red-400 transition-all duration-200"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export const dynamic = 'force-dynamic';
