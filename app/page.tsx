'use client';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Search, Send, Database, Maximize2, Layers, User, Cpu, Activity, Info, BarChart3, ChevronRight, Minimize2, Settings, TrendingUp, DollarSign, Package, AlertCircle, CheckCircle2, Filter, Table as TableIcon, Download, EyeOff, Eye, Zap, RefreshCw, Layout, Network } from 'lucide-react';
import dynamic from 'next/dynamic';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

export default function App() {
  const [messages, setMessages] = useState<any[]>([
    { role: 'assistant', content: '### Dodge AI S-Tier Intelligence Hub\nAutonomous transaction monitoring active. Context graph fully ingested and mapped to O2C Canonical Flow.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [activeHighlights, setActiveHighlights] = useState<Set<string>>(new Set());
  const [highlightLinks, setHighlightLinks] = useState<Set<string>>(new Set());
  const [selectedNodeInfo, setSelectedNodeInfo] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeLayer, setActiveLayer] = useState('all');
  const [stats, setStats] = useState({ revenue: '0', orders: 0, customers: 0 });
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showScanEffect, setShowScanEffect] = useState(false);
  const [layout, setLayout] = useState<string | undefined>(undefined);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const graphRef = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
    fetch('/api/graph')
      .then(res => res.json())
      .then(data => {
        if (data && data.nodes) {
            setGraphData(data);
            const orders = data.nodes.filter((n:any) => n.group === 'SalesOrder').length;
            const customers = data.nodes.filter((n:any) => n.group === 'Customer').length;
            const revNodes = data.nodes.filter((n:any) => n.group === 'Billing');
            const totalRev = revNodes.reduce((acc:any, n:any) => acc + (parseFloat(n.properties?.totalNetAmount || 0)), 0);
            setStats({ 
                revenue: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalRev),
                orders,
                customers
            });
        }
      })
      .catch(console.error);
  }, []);

  const downloadResults = (data: any[], filename: string) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + Object.keys(data[0]).join(",") + "\n"
      + data.map(row => Object.values(row).join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: input.trim() }]);
    setLoading(true);
    setShowScanEffect(true);
    setSelectedNodeInfo(null);
    setHighlightLinks(new Set());

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input.trim(), history: messages.slice(-8) }),
      });
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");
      const decoder = new TextDecoder();
      let assistantMsgId = -1;
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('__METADATA__')) {
            const meta = JSON.parse(line.replace('__METADATA__', ''));
            
            setMessages(prev => {
                const next = [...prev];
                assistantMsgId = next.length;
                next.push({ role: 'assistant', content: '', sql: meta.sql, results: meta.data, insights: meta.insights });
                return next;
            });
            
            const highlightIds = (meta.graph_highlights?.nodes || []).map((v: any) => String(v));
            const matchedIds = (graphData.nodes || []).filter((n: any) => {
                if (highlightIds.includes(String(n.id)) || highlightIds.includes(n.group) || highlightIds.includes(n.name)) return true;
                if (n.properties) return Object.values(n.properties).some((v:any) => v && highlightIds.includes(String(v)));
                return false;
            }).map((n: any) => n.id);
            
            const matchSet = new Set(matchedIds);
            setActiveHighlights(matchSet);

            const relevantLinks = (graphData.links || []).filter((l:any) => {
                const s = typeof l.source === 'object' ? l.source.id : l.source;
                const t = typeof l.target === 'object' ? l.target.id : l.target;
                return matchSet.has(s) && matchSet.has(t);
            }).map((l:any) => `${typeof l.source === 'object' ? l.source.id : l.source}-${typeof l.target === 'object' ? l.target.id : l.target}`);
            setHighlightLinks(new Set(relevantLinks));

            if (matchedIds.length > 0) {
               const primaryNode = (graphData.nodes || []).find((n: any) => n.id === matchedIds[0]);
               if (primaryNode) {
                  setSelectedNodeInfo(primaryNode);
                  setTimeout(() => {
                    (graphRef.current as any)?.centerAt((primaryNode as any).x, (primaryNode as any).y, 800);
                    (graphRef.current as any)?.zoom(4, 1000);
                  }, 200);
               }
            }
          } else {
            setMessages(prev => {
                const next = [...prev];
                if (assistantMsgId !== -1) {
                    next[assistantMsgId] = { ...next[assistantMsgId], content: next[assistantMsgId].content + line + '\n' };
                }
                return next;
            });
          }
        }
      }
    } catch (e: any) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'assistant', content: "Interrupted." }]);
    }
    setLoading(false);
    setTimeout(() => setShowScanEffect(false), 2000);
  };

  const drawNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const isHighlighted = activeHighlights.has(node.id);
    const isSelected = selectedNodeInfo?.id === node.id;
    const hasHighlights = activeHighlights.size > 0;
    
    // ISOLATION FOCUS MODE
    if (isFocusMode && hasHighlights && !isHighlighted) return;
    
    if (activeLayer !== 'all' && activeLayer !== node.group.toLowerCase()) {
        ctx.globalAlpha = 0.05;
    } else if (hasHighlights && !isHighlighted) {
        ctx.globalAlpha = 0.1;
    } else {
        ctx.globalAlpha = 1.0;
    }

    const size = isSelected ? 12 : (isHighlighted ? 10 : 5);
    const colorMap: Record<string, string> = {
        'SalesOrder': '#3b82f6', 'Delivery': '#10b981', 'Billing': '#8b5cf6', 'JournalEntry': '#f59e0b',
        'Customer': '#ef4444', 'Product': '#ec4899'
    };
    const color = colorMap[node.group] || '#94a3b8';

    if (isHighlighted || isSelected) {
        ctx.shadowBlur = 20; ctx.shadowColor = color;
    }

    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = isHighlighted ? 4 : 1.5; ctx.stroke();

    if (isHighlighted) {
        const ring = (Date.now() / 500) % 2;
        ctx.beginPath();
        ctx.arc(node.x, node.y, size + (ring * 8), 0, 2 * Math.PI);
        ctx.strokeStyle = color; ctx.globalAlpha = 1 - (ring / 2); ctx.stroke();
    }

    if (globalScale > 3.2 || isSelected) {
        ctx.font = `bold 4px Inter`; ctx.textAlign = 'center'; ctx.fillStyle = '#1e293b';
        ctx.fillText(node.name || node.id, node.x, node.y + size + 4);
    }
    
    ctx.globalAlpha = 1.0; ctx.shadowBlur = 0;
  }, [activeHighlights, selectedNodeInfo, activeLayer, isFocusMode]);

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden select-none">
      
      {/* Header - Glassmorphism Production Level */}
      <header className="flex-none px-8 py-5 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between z-50">
        <div className="flex items-center gap-5">
           <div className="bg-slate-900 p-2.5 rounded-2xl shadow-xl text-white">
              <Zap className="w-5 h-5 fill-current" />
           </div>
           <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase italic">Dodge S-Tier Grid</h1>
              <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest tracking-[0.2em]">Autonomous Transaction Monitor</span>
              </div>
           </div>
        </div>

        <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-10 px-8 border-r border-slate-200">
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase">System Revenue</span>
                    <span className="text-sm font-black text-blue-600">{stats.revenue}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase">Nodes Map</span>
                    <span className="text-sm font-black text-slate-800">{graphData.nodes.length}</span>
                </div>
            </div>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all shadow-sm">
                {isSidebarOpen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        
        {/* Advanced Interactive Grid */}
        <div className={`relative transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isSidebarOpen ? 'w-[60%]' : 'w-full'}`}>
          <ForceGraph2D
            ref={graphRef}
            graphData={graphData}
            nodeCanvasObject={drawNode}
            nodePointerAreaPaint={(n: any, color, ctx) => { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(n.x, n.y, 12, 0, 2 * Math.PI); ctx.fill(); }}
            linkDirectionalParticles={4}
            linkDirectionalParticleSpeed={l => highlightLinks.has(`${typeof l.source === 'object' ? l.source.id : l.source}-${typeof l.target === 'object' ? l.target.id : l.target}`) ? 0.02 : 0.003}
            linkDirectionalParticleWidth={l => highlightLinks.has(`${typeof l.source === 'object' ? l.source.id : l.source}-${typeof l.target === 'object' ? l.target.id : l.target}`) ? 4 : 0.6}
            linkDirectionalParticleColor={l => highlightLinks.has(`${typeof l.source === 'object' ? l.source.id : l.source}-${typeof l.target === 'object' ? l.target.id : l.target}`) ? '#3b82f6' : '#cbd5e1'}
            linkColor={l => highlightLinks.has(`${typeof l.source === 'object' ? l.source.id : l.source}-${typeof l.target === 'object' ? l.target.id : l.target}`) ? 'rgba(59, 130, 246, 0.4)' : '#f1f5f9'}
            linkWidth={l => highlightLinks.has(`${typeof l.source === 'object' ? l.source.id : l.source}-${typeof l.target === 'object' ? l.target.id : l.target}`) ? 2.5 : 1}
            backgroundColor="#ffffff"
            onNodeClick={(n: any) => setSelectedNodeInfo(n)}
          />

          {/* REAL TIME SCAN SCAN EFFECT */}
          {showScanEffect && (
              <div className="absolute inset-x-0 h-1 bg-blue-500/30 blur-md shadow-[0_0_20px_#3b82f6] animate-scan z-10"></div>
          )}

          {/* Advanced Grid Controls */}
          <div className="absolute top-8 left-8 flex flex-col gap-4">
              <div className="bg-white/90 backdrop-blur p-2 rounded-2xl flex gap-2 shadow-2xl border border-slate-100">
                  {['all', 'salesorder', 'billing'].map(l => (
                      <button 
                        key={l}
                        onClick={() => setActiveLayer(l)}
                        className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            activeLayer === l ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'
                        }`}
                      >
                         {l}
                      </button>
                  ))}
              </div>
              
              <button 
                onClick={() => setIsFocusMode(!isFocusMode)}
                className={`p-4 rounded-2xl flex items-center gap-3 transition-all shadow-xl group ${
                    isFocusMode ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
                }`}
              >
                 {isFocusMode ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                 <span className="text-[10px] font-black uppercase tracking-widest">ISOLATION FOCUS: {isFocusMode ? 'ON' : 'OFF'}</span>
              </button>
          </div>

          {selectedNodeInfo && (
            <div className="absolute top-8 right-8 w-[360px] bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 flex flex-col gap-8 animate-in zoom-in-95 slide-in-from-top-10 duration-500">
                <div className="flex items-start justify-between">
                    <div>
                        <span className="text-[10px] font-black text-blue-500 tracking-[0.3em] uppercase block mb-2">Live Node Profile</span>
                        <h2 className="text-3xl font-black text-slate-900 leading-tight">{selectedNodeInfo.group}</h2>
                    </div>
                    <button onClick={() => setSelectedNodeInfo(null)} className="p-3 bg-slate-50 rounded-full hover:bg-slate-200">
                        <ChevronRight className="w-6 h-6 rotate-90" />
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-6 max-h-[350px] overflow-y-auto pr-4 custom-scroll">
                    {Object.entries(selectedNodeInfo.properties || {}).map(([k, v]) => (
                        <div key={k} className="flex flex-col gap-1 group">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-500 transition-colors uppercase">{k}</label>
                            <p className="text-base font-bold text-slate-700 break-all">{String(v)}</p>
                        </div>
                    ))}
                </div>

                <div className="pt-6 border-t border-slate-100">
                     <div className="flex items-center gap-4 text-emerald-500 font-black text-[10px] uppercase tracking-[0.2em]">
                        <CheckCircle2 className="w-4 h-4" />
                        Audit Status: VERIFIED
                     </div>
                </div>
            </div>
          )}
        </div>

        {/* Enterprise Analyst Hub */}
        <div className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] bg-white border-l border-slate-200 flex flex-col z-40 ${isSidebarOpen ? 'w-[40%]' : 'w-0 opacity-0 overflow-hidden'}`}>
          <div className="p-10 border-b border-slate-100">
             <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-black tracking-tight text-slate-900 uppercase flex items-center gap-3">
                    <Cpu className="w-6 h-6 text-blue-600" /> Analyst Core <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full border border-blue-200">V4</span>
                </h3>
                <div className="flex items-center justify-between">
                    <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-3 py-1 bg-slate-50 rounded-full border border-slate-100">Neural Connect v4</span>
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-bold rounded-full border border-emerald-200 shadow-sm">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_#10b981]"></div>
                        LIVE ANALYTICS
                    </div>
                </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-bold rounded-full border border-emerald-200 shadow-sm">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_#10b981]"></div>
                        LIVE ANALYTICS
                    </div>
                </div>
             </div>
             <p className="text-sm font-bold text-slate-400 leading-relaxed max-w-[80%] italic">Dodge S-Tier parsing transactional context across the O2C grid.</p>
          </div>

          <div className="flex-1 overflow-y-auto p-10 space-y-12 bg-slate-50/20 custom-scroll">
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col gap-4 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {m.role === 'user' && <div className="text-[10px] font-black text-slate-300 uppercase mr-2">Authorized Session</div>}
                  <div className={`p-8 rounded-[2rem] shadow-xl leading-relaxed max-w-full border-2 ${
                    m.role === 'user' ? 'bg-slate-900 text-white border-slate-900 rounded-tr-none' : 'bg-white border-slate-100 text-slate-700 rounded-tl-none font-medium'
                  }`}>
                    <div className="prose prose-sm prose-slate max-w-none text-inherit font-medium">
                        {m.content.split('\n').map((l:any, idx:any) => <p key={idx} className={idx > 0 ? 'mt-4' : ''}>{l}</p>)}
                    </div>

                    {m.results && m.results.length > 0 && (
                        <div className="mt-8">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">
                                    <TableIcon className="w-4 h-4" /> Structural Audit Data
                                </div>
                                <button 
                                  onClick={() => downloadResults(m.results, 'audit_report')}
                                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black hover:bg-blue-600 transition-all uppercase"
                                >
                                    <Download className="w-3 h-3" /> Export CSV
                                </button>
                            </div>
                            <div className="overflow-x-auto rounded-[1.5rem] bg-slate-50 border border-slate-100">
                                <table className="w-full text-left border-collapse min-w-[350px]">
                                    <thead>
                                        <tr>
                                            {Object.keys(m.results[0]).slice(0, 4).map(k => (
                                                <th key={k} className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase border-b border-slate-200">{k}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {m.results.slice(0, 10).map((row:any, ri:any) => (
                                            <tr key={ri} className="hover:bg-blue-50/80 transition-all">
                                                {Object.values(row).slice(0, 4).map((v:any, ci:any) => (
                                                    <td key={ci} className="px-5 py-4 text-xs font-black text-slate-600 truncate max-w-[150px]">{String(v)}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                  </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-4 text-[10px] font-black text-blue-600 tracking-[0.3em] animate-pulse p-6 bg-white border border-slate-100 rounded-2xl w-fit shadow-lg">
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-ping"></div>
                NEURAL GRID SEARCH ACTIVE...
              </div>
            )}
          </div>

          <div className="p-10 bg-white border-t border-slate-200">
            <form onSubmit={handleSubmit} className="relative group">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about materials, billing, or trace flows..."
                className="w-full bg-slate-50/50 border-2 border-slate-200 rounded-[1.8rem] py-6 pl-10 pr-20 text-sm font-bold placeholder:text-slate-300 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-12 focus:ring-blue-600/5 transition-all shadow-sm"
              />
              <button disabled={loading} className="absolute right-4 top-4 bottom-4 px-8 bg-slate-900 group-focus-within:bg-blue-600 text-white rounded-[1.2rem] shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center">
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes scan {
          0% { transform: translateY(-10vh); opacity: 0; }
          40% { opacity: 1; }
          60% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
        .custom-scroll::-webkit-scrollbar { width: 5px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
}
