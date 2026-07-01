'use client';
import { useState, useRef, useEffect } from 'react';
import { Project } from '@/services/dummyData';
import { Send, Bot, User, Cpu, Sparkles, Key } from 'lucide-react';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

interface AIChatProps {
  project: Project;
  history: Message[];
  onSendMessage: (text: string) => Promise<void>;
  isChatting: boolean;
  hasApiKey: boolean;
}

export default function AIChat({
  project,
  history,
  onSendMessage,
  isChatting,
  hasApiKey
}: AIChatProps) {
  const [input, setInput] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const sampleQuestions = [
    'Apakah Laravel 8 masih layak?',
    'Kenapa menggunakan RabbitMQ?',
    'Alternatif Kafka?',
    'Bagaimana jika traffic naik 5x?',
    'Apakah React 17 perlu upgrade?',
    'Bagaimana menurunkan biaya AWS?',
    'Apakah Docker masih cocok?',
    'Apakah perlu Kubernetes?',
    'Buat roadmap migrasi.',
    'Berikan estimasi effort upgrade.',
    'Apa resiko terbesar project ini?'
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
    <div className="glass-panel rounded-2xl border border-slate-800/80 shadow-lg h-[600px] flex flex-col overflow-hidden relative">
      {/* Top Header */}
      <div className="bg-slate-900/60 px-5 py-4 border-b border-slate-800/80 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-200">AI Architecture Consultant</h4>
            <span className="text-[10px] text-slate-500 font-mono">Context: {project.name} Stack</span>
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
            AI Chat requires a live LLM integration. Please visit the **Settings** tab in the sidebar and insert your API Key (Gemini, Claude, or OpenAI) to chat about {project.name}.
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
              <h4 className="text-sm font-bold text-slate-300">How can I audit your architecture today?</h4>
              <p className="text-slate-500 text-xs mt-1 max-w-xs leading-normal">
                Ask specific questions about the tech stack, library compatibility, cost optimizations, or migration plans.
              </p>
            </div>
            {/* Quick Questions Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-lg w-full">
              {sampleQuestions.slice(0, 6).map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSampleClick(q)}
                  className="px-3 py-2 text-left bg-slate-900/60 hover:bg-blue-600/15 border border-slate-800/80 hover:border-blue-500/40 rounded-xl text-[10px] text-slate-400 hover:text-blue-300 font-medium transition-all duration-200 truncate"
                  title={q}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border text-xs font-semibold ${
                  msg.sender === 'user'
                    ? 'bg-blue-600/10 border-blue-500/20 text-blue-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}>
                  {msg.sender === 'user' ? <User className="w-4.5 h-4.5" /> : <Bot className="w-4.5 h-4.5" />}
                </div>

                {/* Message Body */}
                <div className={`p-4 rounded-2xl text-xs leading-relaxed shadow-sm border ${
                  msg.sender === 'user'
                    ? 'bg-blue-600/15 border-blue-500/30 text-blue-100'
                    : 'bg-slate-900/65 border-slate-800/80 text-slate-200'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}

            {isChatting && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 shrink-0 flex items-center justify-center text-slate-400">
                  <Bot className="w-4.5 h-4.5" />
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/65 border border-slate-800/80 text-slate-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>
        )}
      </div>

      {/* Quick Questions Carousel above input when chat is active */}
      {history.length > 0 && (
        <div className="px-5 py-2.5 bg-slate-950/40 border-t border-slate-900 flex gap-2 overflow-x-auto shrink-0 select-none no-scrollbar">
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSampleClick(q)}
              disabled={isChatting}
              className="px-3 py-1.5 bg-slate-900 border border-slate-850 hover:border-blue-500/40 hover:bg-blue-600/10 rounded-xl text-[10px] text-slate-400 hover:text-blue-300 font-medium transition-all duration-150 shrink-0 whitespace-nowrap"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <form onSubmit={handleSubmit} className="px-5 py-4 border-t border-slate-900 bg-slate-950/60 flex items-center gap-3 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isChatting || !hasApiKey}
          placeholder="Ask AI software architect a question..."
          className="flex-1 bg-slate-900 border border-slate-850 focus:border-blue-500/50 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all duration-200 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!input.trim() || isChatting || !hasApiKey}
          className="p-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all duration-200 disabled:bg-slate-900 disabled:text-slate-600 border border-blue-500 disabled:border-slate-850"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
