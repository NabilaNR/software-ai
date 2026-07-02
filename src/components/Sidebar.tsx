'use client';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Database, 
  Settings, 
  Cpu,
  MessageSquare
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab,
  selectedProjectId,
  setSelectedProjectId
}: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'general-chat', label: 'General AI Chat', icon: MessageSquare },
    { id: 'knowledge-base', label: 'Knowledge Base', icon: Database },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-slate-950/80 backdrop-blur-md flex flex-col h-full shrink-0 select-none">
      {/* Header */}
      <div className="p-6 border-b border-slate-850 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-blue-400/20">
          <Cpu className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            StackAuditor
          </h1>
          <span className="text-[10px] text-blue-500 font-bold tracking-widest uppercase">
            BNI Enterprise
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                // Reset selected project details view context when moving to top tabs
                if (['dashboard', 'general-chat', 'knowledge-base', 'settings'].includes(item.id)) {
                  setSelectedProjectId(null);
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive 
                  ? 'bg-blue-600/10 border-l-2 border-blue-500 text-blue-400 shadow-sm shadow-blue-500/5' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-105 ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-300'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer / User Profile Summary */}
      <div className="p-4 border-t border-slate-900 bg-slate-950/40">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/40 border border-slate-800/40">
          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
            EA
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-semibold text-slate-200 truncate">Enterprise Architect</h4>
            <p className="text-[10px] text-slate-500 truncate">architecture@bni.co.id</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
