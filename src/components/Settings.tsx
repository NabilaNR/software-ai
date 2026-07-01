'use client';
import { useState, useEffect } from 'react';
import { AIServiceConfig } from '@/services/aiService';
import { 
  Key, 
  Settings as SettingsIcon, 
  Eye, 
  EyeOff, 
  Check, 
  Sparkles,
  ShieldCheck,
  Server,
  RotateCcw,
  Trash2,
  AlertTriangle
} from 'lucide-react';

interface SettingsProps {
  config: AIServiceConfig | null;
  onSaveConfig: (config: AIServiceConfig) => void;
  onResetData: (onlyToken: boolean) => void;
}

export default function Settings({ config, onSaveConfig, onResetData }: SettingsProps) {
  const [provider, setProvider] = useState<'gemini' | 'openai' | 'claude' | 'openrouter'>('gemini');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Model choices list by provider
  const modelsByProvider = {
    gemini: [
      { id: 'gemini-1.5-pro', name: '(Recommended) Gemini 1.5 Pro' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
      { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash' }
    ],
    openai: [
      { id: 'gpt-4o', name: '(Recommended) GPT-4o' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' }
    ],
    claude: [
      { id: 'claude-3-5-sonnet-latest', name: '(Recommended) Claude 3.5 Sonnet' },
      { id: 'claude-3-5-haiku-latest', name: 'Claude 3.5 Haiku' }
    ],
    openrouter: [
      { id: 'meta-llama/llama-3.1-70b-instruct:free', name: '(Free) Llama 3.1 70B' },
      { id: 'google/gemini-flash-1.5', name: 'Gemini 1.5 Flash (via OpenRouter)' },
      { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini (via OpenRouter)' }
    ]
  };

  // Populate config on load
  useEffect(() => {
    if (config) {
      setProvider(config.provider);
      setApiKey(config.apiKey);
      setModel(config.model);
    } else {
      // Set defaults
      setProvider('gemini');
      setApiKey('');
      setModel('gemini-1.5-flash');
    }
  }, [config]);

  // Adjust default model selection when provider changes
  const handleProviderChange = (newProvider: 'gemini' | 'openai' | 'claude' | 'openrouter') => {
    setProvider(newProvider);
    const firstModel = modelsByProvider[newProvider][0].id;
    setModel(firstModel);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      provider,
      apiKey: apiKey.trim(),
      model
    });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          System Integrations & Settings
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Configure active AI LLM connectors to perform live architecture audits and run RAG chats.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Form Card */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-2 space-y-6">
          <h3 className="text-base font-bold text-slate-200 border-b border-slate-800/60 pb-2 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-blue-500 animate-spin-slow" />
            AI Provider Configuration
          </h3>

          <form onSubmit={handleSave} className="space-y-5">
            {/* Provider selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Select LLM Provider</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(['gemini', 'openai', 'claude', 'openrouter'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleProviderChange(p)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all duration-200 uppercase tracking-wider ${
                      provider === p
                        ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/10'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Model select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Select LLM Model</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-250 font-medium"
              >
                {modelsByProvider[provider].map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* API Key */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Insert API Credentials Key</label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={`Enter your ${provider.toUpperCase()} API key...`}
                  className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl pl-3.5 pr-10 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-100 font-mono placeholder-slate-600 transition-all duration-150"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Save Buttons */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!apiKey.trim()}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 border shadow ${
                  !apiKey.trim()
                    ? 'bg-slate-900 text-slate-500 border-slate-850 cursor-not-allowed opacity-50'
                    : 'bg-blue-600 hover:bg-blue-500 border-blue-500 hover:border-blue-400 text-white hover:scale-[1.02]'
                }`}
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    Saved Successfully
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </form>

          <hr className="border-slate-800/65 my-6" />

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              Danger Zone
            </h4>
            <p className="text-slate-400 text-[11px] leading-normal">
              Manage saved credentials and application state. Deleting only the token keeps your custom documents, while resetting all data performs a factory reset.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  if (confirm("Are you sure you want to delete the active API Token?")) {
                    onResetData(true);
                    setApiKey('');
                  }
                }}
                className="flex items-center justify-center gap-2 px-4.5 py-2.5 bg-red-950/20 hover:bg-red-950/45 text-red-400 border border-red-900/30 hover:border-red-900/60 rounded-xl text-xs font-bold transition-all duration-200"
              >
                <Trash2 className="w-4 h-4" />
                Delete API Key
              </button>
              
              <button
                type="button"
                onClick={() => {
                  if (confirm("Are you sure you want to reset all application data? This will clear all API keys, custom uploaded documents, live audits, and chat logs.")) {
                    onResetData(false);
                    setApiKey('');
                  }
                }}
                className="flex items-center justify-center gap-2 px-4.5 py-2.5 bg-slate-900 hover:bg-red-600/10 text-slate-350 hover:text-red-400 border border-slate-800 hover:border-red-500/20 rounded-xl text-xs font-bold transition-all duration-200"
              >
                <RotateCcw className="w-4 h-4" />
                Reset All Application Data
              </button>
            </div>
          </div>
        </div>

        {/* Security & compliance panel */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800/60">
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />
            <h4 className="font-semibold text-slate-200">Security Credentials Notice</h4>
          </div>

          <div className="text-xs text-slate-400 space-y-4 leading-relaxed">
            <p>
              Your API keys are stored **exclusively in your browser local storage** (`localStorage`). They are never stored on BNI servers.
            </p>
            <p>
              When running queries, the client securely forwards the API key via request headers to the local Next.js server proxy which communicates directly with the respective LLM endpoint (Google, Anthropic, OpenAI, or OpenRouter).
            </p>
            <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center gap-2 text-[10px] text-slate-500">
              <Server className="w-4 h-4 shrink-0 text-slate-400" />
              <span>CORS requests are processed in standard Node.js server runtimes to prevent browser blocking.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export const dynamic = 'force-dynamic';
