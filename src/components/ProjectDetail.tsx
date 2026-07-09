'use client';
import { useState, useRef } from 'react';
import { Project } from '@/services/dummyData';
import { AuditResponse, AIServiceConfig } from '@/services/aiService';
import MermaidChart from './MermaidChart';
import { IndexedDocument } from '@/services/ragService';
import { checkVersionStatus } from '@/services/versionChecker';
import { 
  ArrowLeft, 
  Settings, 
  AlertTriangle, 
  Globe, 
  GitBranch, 
  ShieldAlert, 
  HelpCircle,
  Network,
  Cpu,
  RefreshCw,
  Coins,
  ChevronRight,
  TrendingDown,
  Info,
  Edit2,
  Save,
  X,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Plus,
  Upload
} from 'lucide-react';

interface ProjectDetailProps {
  project: Project;
  audit: AuditResponse;
  documents: IndexedDocument[];
  onBack: () => void;
  config: AIServiceConfig | null;
  onRunLiveAudit: (projectId: string) => Promise<void>;
  isAuditing: boolean;
  onToggleActive: (projectId: string) => void;
  onUpdateDescription: (projectId: string, newDesc: string) => void;
  onUpdateProject: (updatedProject: Project) => void;
}

type TabType = 'overview' | 'techstack' | 'architecture' | 'audit';

export default function ProjectDetail({
  project,
  audit,
  documents,
  onBack,
  config,
  onRunLiveAudit,
  isAuditing,
  onToggleActive,
  onUpdateDescription,
  onUpdateProject
}: ProjectDetailProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [editDescText, setEditDescText] = useState(project.description);

  // Recommendations state
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isGeneratingRecs, setIsGeneratingRecs] = useState(false);
  const [recError, setRecError] = useState<string | null>(null);

  const handleGenerateRecommendations = async () => {
    if (!config || !config.apiKey || !config.apiKey.trim()) {
      setRecError('API Key is required to generate AI recommendations. Please add your key in the Settings page.');
      return;
    }
    setIsGeneratingRecs(true);
    setRecError(null);
    try {
      const res = await fetch('/api/recommend-stack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: project.name,
          description: project.description,
          config: config
        })
      });

      if (!res.ok) {
        const errorJson = await res.json();
        throw new Error(errorJson.error || 'Failed to generate recommendations.');
      }

      const data = await res.json();
      setRecommendations(data.recommendations || []);
    } catch (err: any) {
      console.error(err);
      setRecError(err.message || 'An error occurred while calling the recommendation service.');
    } finally {
      setIsGeneratingRecs(false);
    }
  };

  const handleApplyRecommendations = () => {
    const formattedStack = recommendations.map(rec => ({
      layer: rec.layer,
      technology: rec.technology,
      version: rec.version,
      supportStatus: rec.supportStatus || 'Supported',
      risk: rec.risk || 'Low'
    }));

    const updatedProject = {
      ...project,
      techStack: formattedStack
    };

    onUpdateProject(updatedProject);
    setRecommendations([]);
  };

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: Globe },
    { id: 'techstack', label: 'Tech Stack', icon: Cpu },
    { id: 'architecture', label: 'Architecture', icon: Network },
    { id: 'audit', label: 'AI Audit', icon: ShieldAlert }
  ];

  // Helper for rendering badges
  const getSupportStatusBadge = (status: string) => {
    switch (status) {
      case 'Supported':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Supported</span>;
      case 'Deprecated':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">Deprecated</span>;
      case 'Warning':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">Warning</span>;
      case 'End of Life':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">End of Life</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">{status}</span>;
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'Low':
        return <span className="text-emerald-400 font-semibold text-xs">Low</span>;
      case 'Medium':
        return <span className="text-amber-400 font-semibold text-xs">Medium</span>;
      case 'High':
        return <span className="text-orange-400 font-semibold text-xs">High</span>;
      case 'Critical':
        return <span className="text-red-500 font-bold text-xs">Critical</span>;
      default:
        return <span className="text-slate-400 text-xs">{risk}</span>;
    }
  };

  const hasApiKey = config && config.apiKey && config.apiKey.trim() !== '';

  return (
    <div className="space-y-6">
      {/* Header / Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:bg-slate-850 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all duration-200"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-slate-100">{project.name}</h2>
              {project.isActive !== false ? (
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-600/10 text-blue-400 border border-blue-500/20 font-bold uppercase tracking-wider">
                  Active Audit
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-500 border border-slate-800 font-bold uppercase tracking-wider animate-pulse">
                  Disabled
                </span>
              )}
              
              <button
                onClick={() => onToggleActive(project.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all duration-200 ${
                  project.isActive !== false
                    ? 'bg-red-950/15 hover:bg-red-950/35 border-red-900/30 hover:border-red-900/50 text-red-400'
                    : 'bg-emerald-950/15 hover:bg-emerald-950/35 border-emerald-900/30 hover:border-emerald-900/50 text-emerald-400'
                }`}
              >
                {project.isActive !== false ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    Deactivate System
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    Activate System
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{project.owner}</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-900/60 border border-slate-800/80 p-1.5 rounded-2xl overflow-x-auto w-full sm:w-auto shrink-0 select-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/15'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="mt-6">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-2xl lg:col-span-2 space-y-6">
              <div>
                <div className="flex justify-between items-center border-b border-slate-800/60 pb-2">
                  <h3 className="text-base font-bold text-slate-200">Description</h3>
                  {!isEditingDesc && (
                    <button
                      onClick={() => {
                        setEditDescText(project.description);
                        setIsEditingDesc(true);
                      }}
                      className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 font-bold transition-all"
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit Description
                    </button>
                  )}
                </div>
                
                {isEditingDesc ? (
                  <div className="mt-3 space-y-3">
                    <textarea
                      value={editDescText}
                      onChange={(e) => setEditDescText(e.target.value)}
                      rows={4}
                      className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-200 transition-all"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setIsEditingDesc(false)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-slate-200 rounded-lg text-[10px] font-bold transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateDescription(project.id, editDescText);
                          setIsEditingDesc(false);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold transition-all"
                      >
                        <Save className="w-3.5 h-3.5" />
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-300 text-sm mt-3 leading-relaxed">{project.description}</p>
                )}
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-200 border-b border-slate-800/60 pb-2">Environments</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/60">
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest block mb-1">Production</span>
                    <a 
                      href={project.environments.production} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-xs text-blue-400 hover:underline break-all block font-mono"
                    >
                      {project.environments.production}
                    </a>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/60">
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block mb-1">Staging</span>
                    <a 
                      href={project.environments.staging} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-xs text-blue-400 hover:underline break-all block font-mono"
                    >
                      {project.environments.staging}
                    </a>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/60">
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest block mb-1">Development</span>
                    <a 
                      href={project.environments.development} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-xs text-blue-400 hover:underline break-all block font-mono"
                    >
                      {project.environments.development}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-200 border-b border-slate-800/60 pb-2">Metadata</h3>
                <div className="mt-4 space-y-3.5 text-xs">
                  <div>
                    <span className="text-slate-500 block">System Owner</span>
                    <span className="text-slate-200 font-semibold">{project.owner}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Source Code Repository</span>
                    <a 
                      href={project.repository.startsWith('http') ? project.repository : undefined}
                      target="_blank"
                      rel="noreferrer"
                      className={`font-mono text-blue-400 font-semibold block mt-0.5 break-all ${project.repository.startsWith('http') ? 'hover:underline' : 'pointer-events-none'}`}
                    >
                      <GitBranch className="w-3.5 h-3.5 inline mr-1 text-slate-500" />
                      {project.repository}
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Governance Checklist</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Audited & Compliance Documented
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TECH STACK TAB */}
        {activeTab === 'techstack' && (() => {
          if (project.techStack.length === 0) {
            return (
              <div className="space-y-6">
                <div className="glass-panel p-8 rounded-2xl text-center space-y-4 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                    <Cpu className="w-6 h-6 text-slate-500 animate-pulse" />
                  </div>
                  <div className="max-w-md">
                    <h3 className="text-sm font-bold text-slate-200">No Tech Stack Configured</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      This project specification document did not contain any technology stack details. You can let AI recommend a standard BNI architecture stack based on the project's profile.
                    </p>
                  </div>
                  
                  {isGeneratingRecs ? (
                    <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 animate-pulse">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                      AI is generating architecture recommendations...
                    </div>
                  ) : recommendations.length > 0 ? (
                    <div className="w-full max-w-xl text-left border border-slate-800/80 bg-slate-950/20 p-4 rounded-xl space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                        <span className="text-xs font-bold text-slate-200">Suggested BNI Enterprise Stack</span>
                        <button
                          type="button"
                          onClick={handleApplyRecommendations}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-[10px] font-bold text-white rounded-lg shadow-md transition-all hover:scale-[1.02] cursor-pointer"
                        >
                          Apply Stack to Project
                        </button>
                      </div>
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {recommendations.map((rec, idx) => (
                          <div key={idx} className="p-2.5 bg-slate-900 border border-slate-850/60 rounded-lg text-xs space-y-1">
                            <div className="flex justify-between items-center font-semibold">
                              <span className="text-slate-200">{rec.layer}: {rec.technology} ({rec.version})</span>
                              <span className="text-[9px] px-1.5 py-0.25 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase font-bold shrink-0">Recommended</span>
                            </div>
                            <p className="text-[10px] text-slate-500 leading-normal">{rec.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleGenerateRecommendations}
                      className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white rounded-xl shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Generate Recommended Stack
                    </button>
                  )}

                  {recError && (
                    <div className="p-3 rounded-xl bg-red-950/20 border border-red-900/30 text-[10px] text-red-400 flex gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{recError}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          }

          const outdatedItems = project.techStack
            .map(item => {
              const staticCheck = checkVersionStatus(item.technology, item.version);
              
              // Find matching AI Audit recommendation
              const aiRec = audit?.recommendations?.find(r => {
                const layerMatch = r.layer.toLowerCase() === item.layer.toLowerCase();
                const currentTechWord = r.currentTech.split(' ')[0].toLowerCase();
                const techMatch = r.currentTech.toLowerCase().includes(item.technology.toLowerCase()) ||
                                  item.technology.toLowerCase().includes(currentTechWord);
                return layerMatch && techMatch;
              });

              if (staticCheck.isOutdated || aiRec) {
                return {
                  item,
                  check: {
                    isOutdated: true,
                    latestVersion: aiRec?.recommendedTech || staticCheck.latestVersion || 'LTS Release',
                    reason: aiRec?.benefit || staticCheck.reason || 'IT Governance lifecycle upgrade required.'
                  }
                };
              }
              return null;
            })
            .filter(Boolean) as { item: typeof project.techStack[0]; check: any }[];

          return (
            <div className="space-y-6">
              {outdatedItems.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/30 text-xs text-amber-200/90 leading-relaxed shadow-sm space-y-2">
                  <div className="font-bold flex items-center gap-1.5 text-amber-400">
                    <AlertTriangle className="w-4.5 h-4.5" />
                    <span>Outdated Tech Stack Warning ({outdatedItems.length} components)</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    The following stack components are below the minimum recommended versions or have been flagged for governance review by the AI Audit.
                  </p>
                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {outdatedItems.map(({ item, check }, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-950/50 border border-slate-900 rounded-lg flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-slate-200 text-xs">{item.technology} ({item.layer})</span>
                          <span className="text-[9px] px-2 py-0.25 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">Outdated</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Current: <span className="font-mono text-red-400">{item.version}</span> → Recommended: <span className="font-mono text-emerald-400">{check.latestVersion}</span>
                        </div>
                        <div className="text-[9px] text-slate-500 leading-normal mt-0.5">
                          {check.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800/80 shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900/60 border-b border-slate-800/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        <th className="py-4 px-5">Layer</th>
                        <th className="py-4 px-5">Technology</th>
                        <th className="py-4 px-5">Version</th>
                        <th className="py-4 px-5">Support Status</th>
                        <th className="py-4 px-5">Risk</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-sm">
                      {project.techStack.map((item, idx) => {
                        const staticCheck = checkVersionStatus(item.technology, item.version);
                        
                        // Find matching AI Audit recommendation
                        const aiRec = audit?.recommendations?.find(r => {
                          const layerMatch = r.layer.toLowerCase() === item.layer.toLowerCase();
                          const currentTechWord = r.currentTech.split(' ')[0].toLowerCase();
                          const techMatch = r.currentTech.toLowerCase().includes(item.technology.toLowerCase()) ||
                                            item.technology.toLowerCase().includes(currentTechWord);
                          return layerMatch && techMatch;
                        });

                        const isOutdated = staticCheck.isOutdated || !!aiRec;
                        const latestVersion = aiRec?.recommendedTech || staticCheck.latestVersion || 'LTS Release';
                        const reason = aiRec?.benefit || staticCheck.reason || 'IT Governance lifecycle upgrade required.';

                        return (
                          <tr key={idx} className="hover:bg-slate-900/20 transition-colors duration-150">
                            <td className="py-3.5 px-5 font-semibold text-slate-300">{item.layer}</td>
                            <td className="py-3.5 px-5 text-slate-200">{item.technology}</td>
                            <td className="py-3.5 px-5 font-mono text-xs text-slate-400">
                              <div className="flex items-center gap-1.5">
                                <span>{item.version}</span>
                                {isOutdated && (
                                  <span 
                                    className="text-amber-500 cursor-help"
                                    title={`Update recommended: ${latestVersion}. Reason: ${reason}`}
                                  >
                                    <AlertTriangle className="w-4 h-4 animate-pulse" />
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-5">{getSupportStatusBadge(item.supportStatus)}</td>
                            <td className="py-3.5 px-5">{getRiskBadge(item.risk)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ARCHITECTURE TAB */}
        {activeTab === 'architecture' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800/60">
              <div>
                <h3 className="text-base font-bold text-slate-200">System Flowchart</h3>
                <p className="text-xs text-slate-500 mt-0.5">Automated architecture visualization rendered directly from specification documents.</p>
              </div>
            </div>

            {!project.architectureDiagram ? (
              <div className="glass-panel p-8 rounded-2xl text-center space-y-4 flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                  <Network className="w-6 h-6 text-slate-500" />
                </div>
                <div className="max-w-md">
                  <h3 className="text-sm font-bold text-slate-200">No Flowchart Diagram Available</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    This project does not have an architecture diagram set up yet. Please upload a specification document in the Knowledge Base to generate it.
                  </p>
                </div>
              </div>
            ) : (
              <MermaidChart chart={project.architectureDiagram} id={project.id} />
            )}
          </div>
        )}

        {/* AI AUDIT TAB */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            {/* Live Audit Prompt Info */}
            {!hasApiKey && (
              <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-900/30 flex gap-3 text-xs text-blue-200/90 leading-relaxed shadow-sm">
                <Info className="w-4.5 h-4.5 shrink-0 text-blue-400" />
                <div className="flex-1">
                  <span className="font-bold block mb-0.5 text-blue-300">Viewing Cached Baseline Audit Report</span>
                  To trigger a real-time, interactive audit customized with your uploaded documentation using a live LLM API, please add your API Key in the **Settings** tab.
                </div>
              </div>
            )}

            {/* Run Live Audit Button */}
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-200">AI Stack Report</h3>
                <p className="text-xs text-slate-500 mt-0.5">Calculated by software architecture AI models (Gemini, Claude, GPT).</p>
              </div>
              
              <button
                onClick={() => onRunLiveAudit(project.id)}
                disabled={isAuditing || !hasApiKey}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 border shadow ${
                  isAuditing
                    ? 'bg-slate-900 text-slate-500 border-slate-800/80 cursor-wait'
                    : !hasApiKey
                    ? 'bg-slate-900 text-slate-500 border-slate-850 cursor-not-allowed opacity-60'
                    : 'bg-blue-600 hover:bg-blue-500 border-blue-500 hover:border-blue-400 text-white hover:scale-[1.02]'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${isAuditing ? 'animate-spin' : ''}`} />
                {isAuditing ? 'Auditing Stack...' : 'Run Live AI Audit'}
              </button>
            </div>

            {isAuditing ? (
              <div className="glass-panel p-16 rounded-2xl text-center space-y-4">
                <div className="w-12 h-12 rounded-full border-t-2 border-blue-500 border-r-2 border-transparent animate-spin mx-auto" />
                <div>
                  <h4 className="font-semibold text-slate-200">Auditing Architecture Stack</h4>
                  <p className="text-slate-500 text-xs mt-1 animate-pulse">Running static configuration audit, assessing CVE risks, and optimizing container scaling plans...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Score and Core Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Circle Score Card */}
                  <div className="glass-panel p-5 rounded-2xl flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Overall Score</span>
                      <h3 className="text-3xl font-extrabold text-slate-100 mt-2">{audit.overallScore}/100</h3>
                    </div>
                    <div className="w-16 h-16 rounded-full border-4 border-slate-800 flex items-center justify-center relative">
                      <span className={`absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-blue-500 border-b-transparent border-l-transparent animate-pulse`} />
                      <span className="text-xs font-bold text-blue-400">{audit.overallScore}%</span>
                    </div>
                  </div>

                  {/* Health Metric */}
                  <div className="glass-panel p-5 rounded-2xl">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-medium">Technology Health</span>
                    <h3 className={`text-xl font-bold mt-3 ${
                      audit.technologyHealth === 'Excellent' || audit.technologyHealth === 'Good' ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {audit.technologyHealth}
                    </h3>
                  </div>

                  {/* Security Metric */}
                  <div className="glass-panel p-5 rounded-2xl">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-medium">Security Grade</span>
                    <h3 className={`text-xl font-bold mt-3 ${
                      audit.security === 'Good' ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {audit.security}
                    </h3>
                  </div>
                </div>

                {/* Risks and recommendations breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Risks Card */}
                  <div className="glass-panel p-6 rounded-2xl space-y-4">
                    <h4 className="font-bold text-slate-200 border-b border-slate-800/60 pb-2 flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-red-500" />
                      Critical Stack Risks
                    </h4>
                    <ul className="space-y-3">
                      {audit.topRisks.map((risk, idx) => (
                        <li key={idx} className="flex gap-2.5 text-xs text-slate-300 leading-relaxed bg-slate-900/35 border border-slate-850/60 p-3 rounded-xl">
                          <span className="w-5 h-5 rounded-full bg-red-950/20 text-red-400 flex items-center justify-center shrink-0 font-bold border border-red-900/30">!</span>
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommendations Card */}
                  <div className="glass-panel p-6 rounded-2xl space-y-4">
                    <h4 className="font-bold text-slate-200 border-b border-slate-800/60 pb-2 flex items-center gap-2">
                      <Coins className="w-5 h-5 text-blue-500" />
                      AI Optimization Tips
                    </h4>
                    <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                      {audit.recommendations.map((rec, idx) => {
                        let typeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                        if (rec.type === 'cost') typeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                        else if (rec.type === 'database') typeColor = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
                        else if (rec.type === 'performance') typeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';

                        return (
                          <div key={idx} className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/60 flex flex-col gap-2.5">
                            <div className="flex justify-between items-center gap-2">
                              <span className="text-xs font-bold text-slate-200">{rec.layer} Layer</span>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${typeColor}`}>
                                {rec.type}
                              </span>
                            </div>
                            <div className="text-xs">
                              <div className="flex items-center gap-2 text-slate-400 font-mono">
                                <span className="line-through">{rec.currentTech}</span>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                                <span className="text-blue-400 font-bold">{rec.recommendedTech}</span>
                              </div>
                              <p className="text-slate-400 mt-1.5 leading-normal text-[11px]">{rec.benefit}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Migration Planner Section */}
                <div className="glass-panel p-6 rounded-2xl space-y-4">
                  <h4 className="font-bold text-slate-200 border-b border-slate-800/60 pb-2">Migration Roadmap Planner</h4>
                  <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800">
                    {audit.migrationSteps.map((step, idx) => (
                      <div key={idx} className="flex gap-4 relative z-10">
                        <div className="w-6.5 h-6.5 rounded-full bg-slate-950 border border-slate-800 text-xs font-bold flex items-center justify-center shrink-0 text-slate-400">
                          {idx + 1}
                        </div>
                        <div className="bg-slate-900/35 border border-slate-850 p-4 rounded-xl flex-1 text-xs">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                            <h5 className="font-bold text-slate-200">{step.title}</h5>
                            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-bold shrink-0 self-start">
                              Effort: {step.effort}
                            </span>
                          </div>
                          <p className="text-slate-400 mt-2 leading-relaxed">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
export const dynamic = 'force-dynamic';
