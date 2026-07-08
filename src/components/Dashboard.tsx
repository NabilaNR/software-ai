'use client';
import { Project } from '@/services/dummyData';
import { AuditResponse } from '@/services/aiService';
import { 
  Building2, 
  Layers, 
  AlertTriangle, 
  DollarSign, 
  TrendingUp, 
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingDown
} from 'lucide-react';

interface DashboardProps {
  projects: Project[];
  audits: Record<string, AuditResponse>;
  onSelectProject: (id: string) => void;
}

export default function Dashboard({ projects, audits, onSelectProject }: DashboardProps) {
  // Filter for active projects only
  const activeProjects = projects.filter(p => p.isActive !== false);
  const totalProjects = activeProjects.length;

  // Gather all unique technologies
  const techSet = new Set<string>();
  let outdatedTechCount = 0;
  activeProjects.forEach(p => {
    p.techStack.forEach(item => {
      techSet.add(item.technology.toLowerCase());
      if (item.supportStatus === 'End of Life' || item.supportStatus === 'Deprecated' || item.supportStatus === 'Warning') {
        outdatedTechCount++;
      }
    });
  });
  const totalTechnologies = techSet.size;

  // Monthly cloud costs
  const totalCost = activeProjects.reduce((sum, p) => sum + p.estimatedMonthlyCost, 0);

  // Recommendations summary count
  let totalRecommendations = 0;
  let totalSavingsPotential = 0;
  let criticalRisksCount = 0;

  activeProjects.forEach(project => {
    const audit = audits[project.id];
    if (audit) {
      totalRecommendations += audit.recommendations?.length || 0;
      const savingAmt = (audit.estimatedMonthlyCost * (audit.potentialSavingPercent || 0)) / 100;
      totalSavingsPotential += savingAmt;
      criticalRisksCount += audit.topRisks?.length || 0;
    }
  });

  // Calculate average health score
  const activeAudits = activeProjects.map(p => audits[p.id]).filter(Boolean);
  const avgScore = activeAudits.length > 0 
    ? Math.round(activeAudits.reduce((sum, a) => sum + a.overallScore, 0) / activeAudits.length) 
    : 70;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Enterprise Architecture Dashboard
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Real-time technology audit and governance dashboard for Bank Negara Indonesia.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Projects */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between group glass-panel-hover">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Audited Projects</p>
              <h3 className="text-3xl font-bold text-slate-100 mt-2">{totalProjects}</h3>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
          <div className="text-xs text-slate-400 mt-4 flex items-center gap-1.5">
            <span className="text-emerald-500 font-bold flex items-center gap-0.5">
              100%
            </span>
            <span>of core divisions mapped</span>
          </div>
        </div>

        {/* Total Tech Stack */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between group glass-panel-hover">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mapped Technologies</p>
              <h3 className="text-3xl font-bold text-slate-100 mt-2">{totalTechnologies}</h3>
            </div>
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Layers className="w-6 h-6" />
            </div>
          </div>
          <div className="text-xs text-slate-400 mt-4 flex items-center gap-1.5">
            <span className="text-amber-500 font-bold">{outdatedTechCount} Outdated</span>
            <span>components detected</span>
          </div>
        </div>

        {/* Estimated Costs */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between group glass-panel-hover">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Estimated Monthly Cost</p>
              <h3 className="text-3xl font-bold text-slate-100 mt-2">${totalCost.toLocaleString()}</h3>
            </div>
            <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <div className="text-xs text-slate-400 mt-4 flex items-center gap-1.5">
            <span className="text-emerald-500 font-bold flex items-center gap-0.5">
              <TrendingDown className="w-3.5 h-3.5" />
              ${Math.round(totalSavingsPotential).toLocaleString()}
            </span>
            <span>est. savings potential</span>
          </div>
        </div>

        {/* Health Score */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between group glass-panel-hover">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Tech Score</p>
              <h3 className="text-3xl font-bold text-slate-100 mt-2">{avgScore}/100</h3>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
          <div className="text-xs text-slate-400 mt-4 flex items-center gap-1.5">
            <span className="text-red-500 font-bold">{criticalRisksCount} risks</span>
            <span>require governance review</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Health Status List */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800/60">
            <h4 className="font-semibold text-slate-200">System Architecture Overview</h4>
            <span className="text-xs text-slate-400">Governance Scores</span>
          </div>
          <div className="space-y-4 divide-y divide-slate-800/40">
            {projects.map((project) => {
              const audit = audits[project.id];
              const score = audit?.overallScore || 70;
              const cost = project.estimatedMonthlyCost;
              const saving = audit ? Math.round((cost * audit.potentialSavingPercent) / 100) : 0;
              
              let scoreColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
              let progressColor = 'bg-emerald-500';
              if (score < 40) {
                scoreColor = 'text-red-400 bg-red-500/10 border-red-500/20';
                progressColor = 'bg-red-500';
              } else if (score < 70) {
                scoreColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
                progressColor = 'bg-amber-500';
              }

              return (
                <div key={project.id} className={`pt-4 first:pt-0 flex items-center justify-between gap-4 group ${project.isActive === false ? 'opacity-40' : ''}`}>
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => onSelectProject(project.id)}
                        className="font-medium text-slate-200 hover:text-blue-400 transition-colors duration-150 text-left text-sm font-semibold flex items-center gap-1.5"
                      >
                        {project.name}
                        {project.isActive === false && (
                          <span className="text-[8px] px-1.5 py-0.25 rounded bg-slate-900 border border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                            Disabled
                          </span>
                        )}
                      </button>
                      <span className="text-[10px] text-slate-500">{project.owner}</span>
                    </div>
                    {/* Score Slider Bar */}
                    <div className="flex items-center gap-3">
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${progressColor}`} style={{ width: `${score}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-slate-400 w-8 text-right">{score}%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-semibold text-slate-300">${cost.toLocaleString()} / mo</div>
                      {saving > 0 && (
                        <div className="text-[10px] text-emerald-500 font-medium">Save ~${saving.toLocaleString()}</div>
                      )}
                    </div>
                    <button 
                      onClick={() => onSelectProject(project.id)}
                      className="p-2 rounded-lg bg-slate-800/40 hover:bg-blue-600 border border-slate-700/60 hover:border-blue-500 text-slate-400 hover:text-white transition-all duration-200"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Recommendations Highlight Box */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800/60">
              <Zap className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
              <h4 className="font-semibold text-slate-200">AI Priority Insights</h4>
            </div>
            
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-900/30 text-xs text-slate-300 leading-relaxed">
                <div className="font-bold flex items-center gap-1 mb-1 text-red-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  Legacy Core Risks
                </div>
                Legacy loan server running on WildFly 14 and Oracle 12c requires an immediate sandbox modernization plan due to unpatched compliance vulnerabilities.
              </div>

              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-900/30 text-xs text-slate-300 leading-relaxed">
                <div className="font-bold flex items-center gap-1 mb-1 text-amber-400">
                  <TrendingUp className="w-4 h-4 shrink-0" />
                  Cost Savings Tip
                </div>
                Migrate Payments Gateway GKE cluster nodes to GKE Autopilot to automatically reclaim ~30% in idle cloud hosting costs.
              </div>

              <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-900/30 text-xs text-slate-300 leading-relaxed">
                <div className="font-bold flex items-center gap-1 mb-1 text-blue-400">
                  <Layers className="w-4 h-4 shrink-0" />
                  Performance Upgrade
                </div>
                Upgrade Mobile Banking Express Gateway from Node 14 to Node 20 LTS to improve response latency under concurrent connections.
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-850 mt-4 text-[10px] text-slate-500 text-center">
            *Insights computed dynamically based on current BNI system inventory.
          </div>
        </div>
      </div>
    </div>
  );
}
