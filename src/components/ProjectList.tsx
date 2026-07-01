'use client';
import { useState } from 'react';
import { Project, TechStackItem } from '@/services/dummyData';
import { AuditResponse } from '@/services/aiService';
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
  Briefcase
} from 'lucide-react';

interface ProjectListProps {
  projects: Project[];
  audits: Record<string, AuditResponse>;
  onSelectProject: (id: string) => void;
  onAddProject: (newProject: Project) => void;
}

export default function ProjectList({ projects, audits, onSelectProject, onAddProject }: ProjectListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [owner, setOwner] = useState('');
  const [description, setDescription] = useState('');
  const [production, setProduction] = useState('');
  const [staging, setStaging] = useState('');
  const [development, setDevelopment] = useState('');
  const [repository, setRepository] = useState('');
  const [cost, setCost] = useState('1000');
  const [techStack, setTechStack] = useState<TechStackItem[]>([
    { layer: 'Frontend', technology: 'React', version: '18.2.0', supportStatus: 'Supported', risk: 'Low' }
  ]);
  const [diagram, setDiagram] = useState(`flowchart TD
  Client[Client Browser] --> WebServer[Backend Service]
  WebServer --> Database[(Database)]`);

  const filteredProjects = projects.filter(project => {
    const query = searchQuery.toLowerCase();
    const nameMatch = project.name.toLowerCase().includes(query);
    const ownerMatch = project.owner.toLowerCase().includes(query);
    const techMatch = project.techStack.some(tech => 
      tech.technology.toLowerCase().includes(query)
    );
    return nameMatch || ownerMatch || techMatch;
  });

  const handleAddTechItem = () => {
    setTechStack(prev => [
      ...prev,
      { layer: 'Backend', technology: '', version: '', supportStatus: 'Supported', risk: 'Low' }
    ]);
  };

  const handleRemoveTechItem = (idx: number) => {
    setTechStack(prev => prev.filter((_, i) => i !== idx));
  };

  const handleTechItemChange = (idx: number, field: keyof TechStackItem, value: string) => {
    setTechStack(prev => prev.map((item, i) => {
      if (i === idx) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !owner) return;

    const projectId = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const newProject: Project = {
      id: projectId,
      name,
      owner,
      description,
      environments: {
        production: production || 'https://bni.co.id',
        staging: staging || 'https://staging.bni.co.id',
        development: development || 'https://dev.bni.co.id'
      },
      repository: repository || 'https://github.com/bni-enterprise/' + projectId,
      estimatedMonthlyCost: Number(cost) || 0,
      techStack,
      architectureDiagram: diagram
    };

    onAddProject(newProject);
    
    // Reset Form
    setName('');
    setOwner('');
    setDescription('');
    setProduction('');
    setStaging('');
    setDevelopment('');
    setRepository('');
    setCost('1000');
    setTechStack([{ layer: 'Frontend', technology: 'React', version: '18.2.0', supportStatus: 'Supported', risk: 'Low' }]);
    setDiagram(`flowchart TD
  Client[Client Browser] --> WebServer[Backend Service]
  WebServer --> Database[(Database)]`);
    
    setIsCreating(false);
  };

  if (isCreating) {
    return (
      <div className="space-y-6">
        {/* Form Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800/60">
          <button
            onClick={() => setIsCreating(false)}
            className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:bg-slate-850 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all duration-200"
          >
            <ChevronLeft className="w-4.5 h-4.5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Register New Project</h2>
            <p className="text-xs text-slate-500 mt-0.5">Define metadata, technology stacks, and Mermaid layouts.</p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl space-y-6 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Project Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Project Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., BNI Cash Management Service"
                className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-100 placeholder-slate-600 transition-all"
              />
            </div>

            {/* Owner */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">System Owner / Division *</label>
              <input
                type="text"
                required
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="e.g., Transactional Banking Technology"
                className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-100 placeholder-slate-600 transition-all"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-400">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe the business objectives and architecture of this project..."
                className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-100 placeholder-slate-600 transition-all"
              />
            </div>

            {/* Cost & Repo */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Estimated Monthly Cost ($ USD)</label>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-100 placeholder-slate-600 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Source Repository URL</label>
              <input
                type="text"
                value={repository}
                onChange={(e) => setRepository(e.target.value)}
                placeholder="e.g., https://github.com/bni-enterprise/cash-mgmt.git"
                className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-100 placeholder-slate-600 transition-all"
              />
            </div>

            {/* Env details */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Production Endpoint</label>
              <input
                type="text"
                value={production}
                onChange={(e) => setProduction(e.target.value)}
                placeholder="e.g., https://cms.bni.co.id"
                className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-100 placeholder-slate-600 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Staging Endpoint</label>
              <input
                type="text"
                value={staging}
                onChange={(e) => setStaging(e.target.value)}
                placeholder="https://staging.cms.bni.co.id"
                className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-100 placeholder-slate-600 transition-all"
              />
            </div>
          </div>

          {/* Tech Stack List section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800/60">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest">Technology Stack Configuration</h3>
              <button
                type="button"
                onClick={handleAddTechItem}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600 border border-blue-500/20 hover:border-blue-500 text-[10px] text-blue-400 hover:text-white rounded-lg font-bold transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </button>
            </div>

            {/* List items */}
            <div className="space-y-3">
              {techStack.map((item, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-5 gap-2 bg-slate-950/45 p-3 rounded-xl border border-slate-900 items-end">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500">Layer</label>
                    <input
                      type="text"
                      required
                      value={item.layer}
                      onChange={(e) => handleTechItemChange(idx, 'layer', e.target.value)}
                      placeholder="e.g. Frontend"
                      className="w-full text-[11px] bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500">Technology</label>
                    <input
                      type="text"
                      required
                      value={item.technology}
                      onChange={(e) => handleTechItemChange(idx, 'technology', e.target.value)}
                      placeholder="e.g. React"
                      className="w-full text-[11px] bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500">Version</label>
                    <input
                      type="text"
                      required
                      value={item.version}
                      onChange={(e) => handleTechItemChange(idx, 'version', e.target.value)}
                      placeholder="e.g. 18.2.0"
                      className="w-full text-[11px] bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500">Status</label>
                      <select
                        value={item.supportStatus}
                        onChange={(e) => handleTechItemChange(idx, 'supportStatus', e.target.value)}
                        className="w-full text-[11px] bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-200"
                      >
                        <option value="Supported">Supported</option>
                        <option value="Warning">Warning</option>
                        <option value="Deprecated">Deprecated</option>
                        <option value="End of Life">End of Life</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500">Risk</label>
                      <select
                        value={item.risk}
                        onChange={(e) => handleTechItemChange(idx, 'risk', e.target.value)}
                        className="w-full text-[11px] bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-200"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={techStack.length === 1}
                      onClick={() => handleRemoveTechItem(idx)}
                      className="p-2.5 bg-red-950/10 hover:bg-red-950/30 text-red-500 hover:text-red-400 border border-transparent hover:border-red-900/40 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Architecture diagram code */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Mermaid Architecture Flowchart</label>
            <textarea
              value={diagram}
              onChange={(e) => setDiagram(e.target.value)}
              rows={4}
              className="w-full text-[11px] font-mono bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-200 transition-all"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2 border-t border-slate-800/60 justify-end">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-5 py-2.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all hover:scale-[1.02]"
            >
              Save Project
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
                    <div className="flex items-center gap-0.5">
                      <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-semibold text-slate-300">{cost.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-500">/mo</span>
                    </div>

                    <div className={`flex items-center gap-1 border px-2 py-0.5 rounded-full text-[10px] font-semibold ${riskColor}`}>
                      <Shield className="w-3 h-3" />
                      {overallRisk} Risk
                    </div>
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
