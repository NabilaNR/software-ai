'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import ProjectList from '@/components/ProjectList';
import ProjectDetail from '@/components/ProjectDetail';
import KnowledgeBase from '@/components/KnowledgeBase';
import Settings from '@/components/Settings';
import { dummyProjects, Project } from '@/services/dummyData';
import { baselineAudits } from '@/services/baselineAudits';
import { AIServiceConfig, AuditResponse } from '@/services/aiService';
import { IndexedDocument } from '@/services/ragService';
import { ShieldCheck, Info } from 'lucide-react';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  
  // Persistence States (loaded on mount)
  const [projects, setProjects] = useState<Project[]>(dummyProjects);
  const [config, setConfig] = useState<AIServiceConfig | null>(null);
  const [documents, setDocuments] = useState<IndexedDocument[]>([]);
  const [audits, setAudits] = useState<Record<string, AuditResponse>>(baselineAudits);
  const [chatHistories, setChatHistories] = useState<Record<string, { sender: 'user' | 'ai'; text: string; timestamp: Date }[]>>({});

  // Loading indicator states
  const [isAuditing, setIsAuditing] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // 1. Hydrate persistent settings from localStorage
  useEffect(() => {
    setMounted(true);
    
    // Load API configuration
    const savedConfig = localStorage.getItem('bni_ai_config');
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error('Error parsing config from localStorage', e);
      }
    }

    // Load Documents
    const savedDocs = localStorage.getItem('bni_ai_docs');
    if (savedDocs) {
      try {
        setDocuments(JSON.parse(savedDocs));
      } catch (e) {
        console.error('Error parsing docs from localStorage', e);
      }
    }

    // Load custom audits
    const savedAudits = localStorage.getItem('bni_ai_audits');
    if (savedAudits) {
      try {
        const parsedAudits = JSON.parse(savedAudits);
        setAudits(prev => ({ ...prev, ...parsedAudits }));
      } catch (e) {
        console.error('Error parsing audits from localStorage', e);
      }
    }

    // Load custom projects
    const savedProjects = localStorage.getItem('bni_ai_projects');
    if (savedProjects) {
      try {
        setProjects(JSON.parse(savedProjects));
      } catch (e) {
        console.error('Error parsing projects from localStorage', e);
      }
    }
  }, []);

  // Save changes to localStorage helper
  const saveConfig = (newConfig: AIServiceConfig) => {
    setConfig(newConfig);
    localStorage.setItem('bni_ai_config', JSON.stringify(newConfig));
  };

  const handleAddDocument = (newDoc: IndexedDocument) => {
    setDocuments(prev => {
      // If document already exists (updating status), replace it
      const filtered = prev.filter(d => d.id !== newDoc.id);
      const updated = [...filtered, newDoc];
      localStorage.setItem('bni_ai_docs', JSON.stringify(updated));
      return updated;
    });
  };

  const handleRemoveDocument = (id: string) => {
    setDocuments(prev => {
      const updated = prev.filter(d => d.id !== id);
      localStorage.setItem('bni_ai_docs', JSON.stringify(updated));
      return updated;
    });
  };

  const handleAddProject = (newProject: Project) => {
    setProjects(prev => {
      const updated = [...prev, newProject];
      localStorage.setItem('bni_ai_projects', JSON.stringify(updated));
      return updated;
    });
  };

  const handleToggleActive = (projectId: string) => {
    setProjects(prev => {
      const updated = prev.map(p => {
        if (p.id === projectId) {
          return { ...p, isActive: p.isActive === false ? true : false };
        }
        return p;
      });
      localStorage.setItem('bni_ai_projects', JSON.stringify(updated));
      return updated;
    });
  };

  const handleUpdateDescription = (projectId: string, newDesc: string) => {
    setProjects(prev => {
      const updated = prev.map(p => {
        if (p.id === projectId) {
          return { ...p, description: newDesc };
        }
        return p;
      });
      localStorage.setItem('bni_ai_projects', JSON.stringify(updated));
      return updated;
    });
  };

  const handleResetData = (onlyToken: boolean) => {
    if (onlyToken) {
      setConfig(null);
      localStorage.removeItem('bni_ai_config');
    } else {
      setConfig(null);
      setDocuments([]);
      setChatHistories({});
      setAudits(baselineAudits);
      setProjects(dummyProjects);
      localStorage.removeItem('bni_ai_config');
      localStorage.removeItem('bni_ai_docs');
      localStorage.removeItem('bni_ai_audits');
      localStorage.removeItem('bni_ai_projects');
    }
  };

  const getProjectDocumentsText = (projectId: string) => {
    const filteredDocs = documents.filter(doc => doc.projectId === projectId || doc.projectId === 'global');
    return filteredDocs.map(doc => `[File: ${doc.filename}]\n${doc.text}`).join('\n\n');
  };

  // Run Real LLM Audit
  const handleRunLiveAudit = async (projectId: string) => {
    if (!config || !config.apiKey) return;
    
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    setIsAuditing(true);
    setApiError(null);

    const docContext = getProjectDocumentsText(projectId);

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          project,
          config,
          documentsText: docContext
        })
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Failed to generate live audit.');
      }

      const freshAudit = await response.json() as AuditResponse;

      setAudits(prev => {
        const updated = { ...prev, [projectId]: freshAudit };
        localStorage.setItem('bni_ai_audits', JSON.stringify(updated));
        return updated;
      });

    } catch (err: any) {
      console.error('Audit API call error:', err);
      setApiError(err.message || 'An error occurred during AI analysis. Please verify your API Key and connection.');
      // Auto clear error after 5s
      setTimeout(() => setApiError(null), 6000);
    } finally {
      setIsAuditing(false);
    }
  };

  // Send message to AI Chat route
  const handleSendMessage = async (text: string) => {
    if (!selectedProjectId || !config || !config.apiKey) return;
    
    const project = projects.find(p => p.id === selectedProjectId);
    if (!project) return;

    const userMessage = { sender: 'user' as const, text, timestamp: new Date() };
    
    // Update local chat history state immediately
    const currentHistory = chatHistories[selectedProjectId] || [];
    const updatedHistory = [...currentHistory, userMessage];
    
    setChatHistories(prev => ({
      ...prev,
      [selectedProjectId]: updatedHistory
    }));

    setIsChatting(true);

    try {
      // Filter documents specific to this project or global
      const projectDocs = documents.filter(doc => doc.projectId === selectedProjectId || doc.projectId === 'global');

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: text,
          history: currentHistory.map(h => ({
            role: h.sender === 'user' ? 'user' : 'assistant',
            content: h.text
          })),
          project,
          config,
          documents: projectDocs
        })
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Failed to generate reply.');
      }

      const data = await response.json();
      const aiReply = { sender: 'ai' as const, text: data.reply, timestamp: new Date() };

      setChatHistories(prev => ({
        ...prev,
        [selectedProjectId]: [...updatedHistory, aiReply]
      }));

    } catch (err: any) {
      console.error('Chat API call error:', err);
      const errorReply = { 
        sender: 'ai' as const, 
        text: `Error calling LLM: ${err.message || 'Failed to connect'}. Please verify your API Key configuration in the settings tab.`, 
        timestamp: new Date() 
      };
      
      setChatHistories(prev => ({
        ...prev,
        [selectedProjectId]: [...updatedHistory, errorReply]
      }));
    } finally {
      setIsChatting(false);
    }
  };

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setActiveTab('projects'); // switch view context inside projects tab
  };

  // Prevent SSR mismatch flashes
  if (!mounted) {
    return (
      <div className="flex-1 bg-[#070b19] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-t-2 border-blue-500 border-r-2 border-transparent animate-spin" />
      </div>
    );
  }

  // Determine current active page layout view
  const renderActiveView = () => {
    if (selectedProjectId) {
      const project = projects.find(p => p.id === selectedProjectId);
      
      if (project) {
        const audit = audits[selectedProjectId] || 
                      baselineAudits[selectedProjectId] || 
                      {
                        overallScore: 0,
                        technologyHealth: 'Pending Audit',
                        security: 'Pending Audit',
                        scalability: 'Pending Audit',
                        maintainability: 'Pending Audit',
                        estimatedMonthlyCost: project.estimatedMonthlyCost,
                        outdatedComponentsCount: 0,
                        topRisks: ['No live audit has been run for this project yet. Please click "Run Live AI Audit" at the top right to generate a real-time audit report.'],
                        recommendations: [],
                        migrationSteps: [],
                        potentialSavingPercent: 0
                      };
        return (
          <ProjectDetail 
            project={project} 
            audit={audit}
            documents={documents}
            onBack={() => setSelectedProjectId(null)}
            config={config}
            onRunLiveAudit={handleRunLiveAudit}
            isAuditing={isAuditing}
            chatHistory={chatHistories[selectedProjectId] || []}
            onSendMessage={handleSendMessage}
            isChatting={isChatting}
            onToggleActive={handleToggleActive}
            onUpdateDescription={handleUpdateDescription}
          />
        );
      }
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            projects={projects} 
            audits={audits} 
            onSelectProject={handleSelectProject} 
          />
        );
      case 'projects':
      case 'audit':
      case 'architecture':
        // When selectedProjectId is null, show all projects grid.
        // If tab is audit or architecture, clicking project opens that tab directly.
        return (
          <ProjectList 
            projects={projects} 
            audits={audits} 
            onSelectProject={handleSelectProject} 
            onAddProject={handleAddProject}
          />
        );
      case 'knowledge-base':
        return (
          <KnowledgeBase 
            documents={documents} 
            projects={projects} 
            onAddDocument={handleAddDocument}
            onRemoveDocument={handleRemoveDocument}
          />
        );
      case 'settings':
        return (
          <Settings 
            config={config} 
            onSaveConfig={saveConfig} 
            onResetData={handleResetData}
          />
        );
      default:
        return (
          <Dashboard 
            projects={projects} 
            audits={audits} 
            onSelectProject={handleSelectProject} 
          />
        );
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden h-screen bg-[#070b19]">
      {/* Sidebar navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        selectedProjectId={selectedProjectId}
        setSelectedProjectId={setSelectedProjectId}
      />

      {/* Main panel */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* API Error Toast */}
        {apiError && (
          <div className="mx-8 mt-6 p-4 rounded-xl bg-red-950/40 border border-red-900/30 flex gap-3 text-xs text-red-200/90 leading-relaxed shadow-lg animate-pulse shrink-0">
            <Info className="w-4.5 h-4.5 shrink-0 text-red-500" />
            <div>
              <span className="font-bold block mb-0.5 text-red-400">Analysis API Error</span>
              {apiError}
            </div>
          </div>
        )}

        <div className="flex-1 py-8 px-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </div>
      </main>
    </div>
  );
}
