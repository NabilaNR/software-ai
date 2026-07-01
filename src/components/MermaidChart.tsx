'use client';
import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

// Initialize mermaid settings
mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    background: 'transparent',
    primaryColor: '#1e40af', // Deep blue
    primaryTextColor: '#f3f4f6',
    primaryBorderColor: '#3b82f6',
    lineColor: '#94a3b8', // Cool slate lines
    secondaryColor: '#0f172a',
    tertiaryColor: '#1e293b',
    actorBorder: '#3b82f6',
    actorBkg: '#1e293b',
    actorTextColor: '#f3f4f6',
    signalColor: '#f3f4f6',
    signalLineColor: '#3b82f6'
  },
  securityLevel: 'loose',
  fontFamily: 'Inter, sans-serif'
});

interface MermaidChartProps {
  chart: string;
  id: string;
}

export default function MermaidChart({ chart, id }: MermaidChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    
    const renderChart = async () => {
      if (!containerRef.current || !chart) return;
      
      try {
        setError(false);
        // Generate unique ID for this render pass
        const elementId = `mermaid-svg-${id}-${Math.floor(Math.random() * 10000)}`;
        
        // Clean chart formatting (ensure newline spacing)
        const cleanChart = chart.trim();
        
        const { svg: renderedSvg } = await mermaid.render(elementId, cleanChart);
        
        if (isMounted) {
          setSvg(renderedSvg);
        }
      } catch (err) {
        console.error('Mermaid render error:', err);
        if (isMounted) {
          setError(true);
        }
      }
    };

    // Small delay to ensure DOM element is ready
    const timer = setTimeout(() => {
      renderChart();
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [chart, id]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-6 border border-red-900/30 bg-red-950/20 text-red-400 rounded-xl">
        <svg className="w-8 h-8 mb-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span className="text-sm font-semibold">Diagram rendering error</span>
        <span className="text-xs mt-1 text-slate-400">Please check the syntax of the architecture code.</span>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center py-6 px-4 bg-slate-950/50 rounded-2xl border border-slate-800/80 shadow-inner overflow-x-auto select-none">
      <div 
        ref={containerRef} 
        className="mermaid w-full max-w-full flex justify-center" 
        dangerouslySetInnerHTML={{ __html: svg || '<div className="text-slate-500 animate-pulse py-12">Rendering Architecture Diagram...</div>' }} 
      />
    </div>
  );
}
