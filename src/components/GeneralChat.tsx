'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Cpu, Sparkles, Key, FileText, HelpCircle } from 'lucide-react';
import { IndexedDocument } from '@/services/ragService';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

interface GeneralChatProps {
  history: Message[];
  onSendMessage: (text: string) => Promise<void>;
  isChatting: boolean;
  hasApiKey: boolean;
  documentsCount: number;
  documentsList: IndexedDocument[];
}

export default function GeneralChat({
  history,
  onSendMessage,
  isChatting,
  hasApiKey,
  documentsCount,
  documentsList
}: GeneralChatProps) {
  const [input, setInput] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const sampleQuestions = [
    'Bagaimana standar arsitektur microservices yang baik?',
    'Bagaimana merancang migration path dari Monolith ke Microservices?',
    'Apa saja compliance security (seperti OWASP, PCI-DSS) yang harus dipatuhi di BNI?',
    'Rekomendasi tech stack untuk aplikasi high-throughput & low-latency?',
    'Bagaimana merencanakan disaster recovery (DR) & backup strategy di cloud?',
    'Jelaskan konsep arsitektur event-driven menggunakan Apache Kafka.'
  ];

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isChatting]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isChatting) return;
    const text = input;
    setInput('');
    await onSendMessage(text);
  };

  const handleSampleClick = async (question: string) => {
    if (isChatting) return;
    await onSendMessage(question);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          General AI Chatbot
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          BNI Architecture Co-Pilot. Ask general software design, infrastructure, and governance questions powered by all indexed knowledge base files.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side: Knowledge Base Summary */}
        <div className="lg:col-span-1 glass-panel p-5 rounded-2xl flex flex-col justify-between space-y-4 h-[600px] select-none">
          <div className="space-y-4 overflow-y-auto pr-1">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800/60">
              <FileText className="w-4.5 h-4.5 text-blue-400" />
              <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">Active Context</h4>
            </div>
            
            <p className="text-[11px] text-slate-400 leading-relaxed">
              AI Chatbot has active retrieval access to all uploaded documents in the knowledge base.
            </p>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Indexed Files ({documentsCount})</span>
              {documentsList.length === 0 ? (
                <div className="p-3 rounded-xl bg-slate-900/30 border border-slate-800/40 text-[10px] text-slate-500 text-center font-mono">
                  No files uploaded yet.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[350px] overflow-y-auto">
                  {documentsList.map((doc, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-slate-900/60 border border-slate-850/50 flex items-center gap-2 text-[10px] text-slate-300">
                      <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="truncate flex-1 font-mono">{doc.filename}</span>
                      <span className="text-[8px] px-1 py-0.25 rounded bg-blue-600/10 text-blue-400 border border-blue-500/20 font-bold shrink-0 uppercase tracking-wider">
                        {doc.projectId === 'global' ? 'Global' : 'Project'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-900 text-[10px] text-slate-500 leading-normal">
            💡 The AI chatbot will dynamically query these documents via semantic terms matching to enrich its replies.
          </div>
        </div>

        {/* Right Side: Chat Panel */}
        <div className="lg:col-span-3 glass-panel rounded-2xl border border-slate-800/80 shadow-lg h-[600px] flex flex-col overflow-hidden relative">
          {/* Top Header */}
          <div className="bg-slate-900/60 px-5 py-4 border-b border-slate-800/80 flex items-center justify-between shrink-0 select-none">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200 font-sans">BNI Architecture Assistant</h4>
                <span className="text-[10px] text-slate-500 font-mono">Global Mode</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-[10px] text-slate-400 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Real AI API Mode
            </div>
          </div>

          {/* API Key warning overlay */}
          {!hasApiKey && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center select-none">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-4 animate-bounce">
                <Key className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-200">Real AI API Key Required</h3>
              <p className="text-slate-400 text-xs mt-2 max-w-sm leading-relaxed">
                AI Chat requires a live LLM integration. Please visit the **Settings** page in the sidebar and insert your API Key to enable the general co-pilot.
              </p>
            </div>
          )}

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0 bg-slate-950/20">
            {history.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center p-6 space-y-6">
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-850 flex items-center justify-center text-slate-500">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-200 text-sm">Welcome to BNI Architecture Co-Pilot!</h4>
                  <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
                    Ask me any questions about system design, microservices, cloud cost optimization, containerization, security policies, or migration.
                  </p>
                </div>

                <div className="max-w-xl w-full">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-left mb-3 flex items-center gap-1.5 justify-center">
                    <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                    Recommended Architect Questions
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                    {sampleQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSampleClick(q)}
                        className="p-3 text-[11px] leading-relaxed text-slate-300 bg-slate-900/50 border border-slate-850 hover:bg-slate-900/80 hover:border-slate-800 hover:text-blue-400 rounded-xl text-left transition-all duration-150"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              history.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center border text-xs font-bold ${
                    msg.sender === 'user' 
                      ? 'bg-blue-600 border-blue-500 text-white' 
                      : 'bg-slate-900 border-slate-850 text-slate-300'
                  }`}>
                    {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`p-4 rounded-2xl text-xs leading-relaxed space-y-1.5 ${
                    msg.sender === 'user' 
                      ? 'bg-blue-600/10 border border-blue-500/20 text-slate-100 rounded-tr-none' 
                      : 'bg-slate-900/40 border border-slate-850/60 text-slate-300 rounded-tl-none whitespace-pre-line'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))
            )}
            
            {isChatting && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-slate-900 border border-slate-850 text-slate-400">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-850/60 flex items-center gap-1.5 rounded-tl-none">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            
            <div ref={chatBottomRef} />
          </div>

          {/* Form Input */}
          <form 
            onSubmit={handleSubmit}
            className="p-4 bg-slate-900/40 border-t border-slate-800/80 flex gap-2 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask general architecture question or query indexed files..."
              className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-200 placeholder-slate-500 transition-all duration-150"
              disabled={isChatting || !hasApiKey}
            />
            <button
              type="submit"
              className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none shadow-md shadow-blue-500/10"
              disabled={isChatting || !input.trim() || !hasApiKey}
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
