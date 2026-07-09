'use client';
import { useState } from 'react';
import { Project, TechStackItem } from '@/services/dummyData';
import { AuditResponse, AIServiceConfig } from '@/services/aiService';
import { IndexedDocument } from '@/services/ragService';
import { 
  Search, 
  Layers, 
  DollarSign, 
  ShieldAlert, 
  ChevronRight,
  Shield,
  Plus,
  Trash2,
  ChevronLeft,
  Briefcase,
  Upload,
  FileText,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface ProjectListProps {
  projects: Project[];
  audits: Record<string, AuditResponse>;
  onSelectProject: (id: string) => void;
  onAddProject: (newProject: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onAddDocument: (doc: IndexedDocument) => void;
  config: AIServiceConfig | null;
}

export default function ProjectList({ 
  projects, 
  audits, 
  onSelectProject, 
  onAddProject, 
  onDeleteProject, 
  onAddDocument,
  config 
}: ProjectListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Simplified Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);

  const filteredProjects = projects.filter(project => {
    const query = searchQuery.toLowerCase();
    const nameMatch = project.name.toLowerCase().includes(query);
    const ownerMatch = project.owner.toLowerCase().includes(query);
    const techMatch = project.techStack.some(tech => 
      tech.technology.toLowerCase().includes(query)
    );
    return nameMatch || ownerMatch || techMatch;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setExtractError('Project name is required.');
      return;
    }
    if (!file) {
      setExtractError('Please upload a specification document (PDF, DOCX, TXT, MD, etc.) to analyze the project.');
      return;
    }
    if (!config || !config.apiKey || !config.apiKey.trim()) {
      setExtractError('API Key is required to extract project profiles using AI. Please configure it in Settings.');
      return;
    }

    setIsExtracting(true);
    setExtractError(null);

    try {
      // 1. Upload file to /api/upload to extract raw text content
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('projectId', 'temporary-extraction');

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData
      });

      if (!uploadRes.ok) {
        const errorJson = await uploadRes.json();
        throw new Error(errorJson.error || 'Failed to extract text from the document.');
      }

      const uploadResult = await uploadRes.json();
      const extractedText = uploadResult.text;

      if (!extractedText || !extractedText.trim()) {
        throw new Error('No readable text content found in the uploaded document.');
      }

      // 2. Call /api/extract-project to run the AI extraction
      const extractRes = await fetch('/api/extract-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectName: name,
          documentText: extractedText,
          config: config
        })
      });

      if (!extractRes.ok) {
        const errorJson = await extractRes.json();
        throw new Error(errorJson.error || 'AI Extraction failed. Please verify your document structure.');
      }

      const extractedProject = await extractRes.json();

      // Create a final Project object
      const projectId = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      const newProject: Project = {
        id: projectId,
        name: name,
        owner: extractedProject.owner || '',
        description: description.trim() || extractedProject.description || '',
        environments: extractedProject.environments || {
          production: '',
          staging: '',
          development: ''
        },
        repository: extractedProject.repository || '',
        estimatedMonthlyCost: Number(extractedProject.estimatedMonthlyCost) || 0,
        techStack: extractedProject.techStack || [],
        architectureDiagram: extractedProject.architectureDiagram || '',
        isActive: true
      };

      onAddProject(newProject);
      
      // Automatically add document to knowledge base
      const newDoc: IndexedDocument = {
        id: `${Date.now()}-${file.name}`,
        filename: file.name,
        projectId: projectId,
        text: extractedText,
        sizeBytes: file.size,
        status: 'Ready for AI',
        uploadedAt: new Date().toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };
      onAddDocument(newDoc);
      
      // Reset Form State
      setName('');
      setDescription('');
      setFile(null);
      setExtractError(null);
      setIsCreating(false);
    } catch (err: any) {
      console.error('Error during project onboarding extraction:', err);
      setExtractError(err.message || 'An unexpected error occurred during document parsing.');
    } finally {
      setIsExtracting(false);
    }
  };

  if (isCreating) {
    return (
      <div className="space-y-6">
        {/* Form Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-805/60">
          <button
            onClick={() => setIsCreating(false)}
            className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:bg-slate-850 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all duration-200"
          >
            <ChevronLeft className="w-4.5 h-4.5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Register New Project</h2>
            <p className="text-xs text-slate-500 mt-0.5">Let AI read your specification document and configure the project automatically.</p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-3xl space-y-8 max-w-2xl shadow-xl border border-slate-850/60">
          {extractError && (
            <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/30 flex gap-3 text-xs text-red-400 leading-relaxed shadow-lg">
              <AlertCircle className="w-4.5 h-4.5 shrink-0 text-red-500 animate-pulse" />
              <div>
                <span className="font-bold block mb-0.5 text-red-400">Onboarding Error</span>
                {extractError}
              </div>
            </div>
          )}

          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800/60 pb-2">
              <Briefcase className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-350">Basic Information</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {/* Project Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Project Name *</label>
                <input
                  type="text"
                  required
                  disabled={isExtracting}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., BNI Cash Management Service"
                  className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-105 placeholder-slate-600 transition-all disabled:opacity-50"
                />
              </div>

              {/* Project Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Project Description (Optional)</label>
                <textarea
                  disabled={isExtracting}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Briefly describe the business goals or purpose of this system..."
                  className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-105 placeholder-slate-600 transition-all disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Specification Document */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800/60 pb-2">
              <FileText className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-355">Specification Document</h3>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Specification File *</label>
              <div className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 transition-all duration-300 ${
                file 
                  ? 'border-blue-500/50 bg-blue-950/10' 
                  : 'border-slate-800/80 bg-slate-950/40 hover:border-blue-500/40'
              }`}>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt,.md"
                  disabled={isExtracting}
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0];
                    if (selectedFile) setFile(selectedFile);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:pointer-events-none"
                />
                
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all ${
                  file 
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 animate-pulse' 
                    : 'bg-slate-900/80 border-slate-800 text-slate-450'
                }`}>
                  {file ? (
                    <FileText className="w-6 h-6" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>

                <div className="text-center">
                  <p className={`text-xs font-bold transition-all ${file ? 'text-blue-450' : 'text-slate-300'}`}>
                    {file ? file.name : 'Choose a file or drag it here'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Accepts PDF, DOCX, TXT, or MD spec docs (Max 15MB)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-800/60 justify-end items-center">
            {isExtracting && (
              <div className="flex items-center gap-2 mr-auto text-xs font-semibold text-blue-400 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                AI is extracting stack & drawing architecture diagram...
              </div>
            )}
            
            <button
              type="button"
              disabled={isExtracting}
              onClick={() => setIsCreating(false)}
              className="px-5 py-2.5 bg-slate-900 border border-slate-800 text-slate-450 hover:text-slate-200 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isExtracting}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-700/65 text-white font-bold rounded-xl text-xs transition-all hover:scale-[1.02] disabled:hover:scale-100 disabled:opacity-80 cursor-pointer shadow-md shadow-blue-500/10"
            >
              {isExtracting ? 'Extracting...' : 'Save & Extract stack using AI'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search & Add */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            BNI Project Inventory
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Browse and manage all registered systems under governance review.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search stack item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-900/60 border border-slate-800 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-100 placeholder-slate-500 transition-all"
            />
          </div>

          {/* Add Project Button */}
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-xs font-bold rounded-xl text-white shadow shadow-blue-600/10 hover:scale-[1.02] transition-all"
          >
            <Plus className="w-4.5 h-4.5" />
            New Project
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center">
          <Search className="w-10 h-10 mx-auto text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-slate-300">No projects found</h3>
          <p className="text-slate-500 text-xs mt-1">Try searching for a different name or technology stack item.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => {
            const audit = audits[project.id];
            const score = audit?.overallScore || 70;
            const cost = project.estimatedMonthlyCost;

            // Determine health levels
            let scoreBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            if (score < 40) {
              scoreBg = 'bg-red-500/10 text-red-400 border-red-500/20';
            } else if (score < 70) {
              scoreBg = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            }

            // Determine highest risk
            const risks = project.techStack.map(t => t.risk);
            let overallRisk = 'Low';
            let riskColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            if (risks.includes('Critical')) {
              overallRisk = 'Critical';
              riskColor = 'text-red-400 bg-red-500/10 border-red-500/20';
            } else if (risks.includes('High')) {
              overallRisk = 'High';
              riskColor = 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            } else if (risks.includes('Medium')) {
              overallRisk = 'Medium';
              riskColor = 'text-blue-400 bg-blue-500/10 border-blue-500/20';
            }

             return (
              <div 
                key={project.id}
                onClick={() => onSelectProject(project.id)}
                className={`glass-panel p-5 rounded-2xl flex flex-col justify-between cursor-pointer glass-panel-hover ${project.isActive === false ? 'opacity-65 border-slate-900 bg-slate-950/10' : ''}`}
              >
                {/* Top Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="font-bold text-slate-200 text-base leading-snug hover:text-blue-400 transition-colors duration-150 flex items-center gap-1.5 flex-wrap">
                        {project.name}
                        {project.isActive === false && (
                          <span className="text-[8px] px-1.5 py-0.25 rounded bg-slate-900 border border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                            Disabled
                          </span>
                        )}
                      </h3>
                      <p className="text-[10px] font-medium text-slate-500 mt-1 uppercase tracking-wider">
                        {project.owner}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${scoreBg} shrink-0`}>
                      {score}%
                    </span>
                  </div>

                  <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                    {project.description}
                  </p>

                  {/* Core Stack Preview (Badges) */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {project.techStack.slice(0, 4).map((tech, idx) => (
                      <span 
                        key={idx} 
                        className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-[10px] text-slate-400 rounded-md font-medium"
                      >
                        {tech.technology} {tech.version}
                      </span>
                    ))}
                    {project.techStack.length > 4 && (
                      <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-[10px] text-slate-500 rounded-md font-medium">
                        +{project.techStack.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Section */}
                <div className="mt-5 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-1 border px-2 py-0.5 rounded-full text-[10px] font-semibold ${riskColor}`}>
                      <Shield className="w-3 h-3" />
                      {overallRisk} Risk
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
                          onDeleteProject(project.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-red-950/20 border border-red-900/30 text-red-400 hover:bg-red-900 hover:text-white hover:border-red-700 transition-all duration-200 cursor-pointer"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-blue-400 font-semibold flex items-center gap-0.5 hover:translate-x-0.5 transition-transform duration-200">
                    Audit Details
                    <ChevronRight className="w-4.5 h-4.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
export const dynamic = 'force-dynamic';
