'use client';

import { useState } from 'react';
import { 
  Activity, Cpu, Database, AlertTriangle, ShieldCheck, Sparkles, 
  Terminal, Search, ChevronDown, Check, ArrowRight, RefreshCw
} from 'lucide-react';
import { triggerSentryServerErrorAction } from '@/lib/actions';
import * as Sentry from '@sentry/nextjs';

export interface TelemetryLog {
  _id: string;
  endpoint: string;
  model: string;
  prompt: string;
  response?: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
  status: 'success' | 'error';
  errorMessage?: string;
  createdAt: string;
}

interface TelemetryClientProps {
  initialLogs: TelemetryLog[];
  metrics: {
    totalRequests: number;
    avgLatency: number;
    totalTokens: number;
    successRate: number;
    errorCount: number;
  };
}

export default function TelemetryClient({ initialLogs, metrics }: TelemetryClientProps) {
  const [logs, setLogs] = useState<TelemetryLog[]>(initialLogs);
  const [filterEndpoint, setFilterEndpoint] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLog, setActiveLog] = useState<TelemetryLog | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sentryClientStatus, setSentryClientStatus] = useState<string | null>(null);
  const [sentryServerStatus, setSentryServerStatus] = useState<string | null>(null);

  // Trigger simulated client-side Sentry error
  const triggerClientError = () => {
    setSentryClientStatus('Triggering error...');
    try {
      // Intentionally throw client error to be captured by Sentry
      throw new Error('Simulated frontend client exception captured in Sentry error tracking dashboard!');
    } catch (err: any) {
      Sentry.captureException(err);
      setSentryClientStatus('Error thrown! Captured by Sentry Client.');
    }
  };

  // Trigger simulated server-side Sentry error (via Server Action)
  const triggerServerError = async () => {
    setSentryServerStatus('Invoking Server Action...');
    const res = await triggerSentryServerErrorAction();
    if (!res.success) {
      setSentryServerStatus('Exception logged! Caught by Sentry Server.');
    }
  };

  // Fetch updated logs from API without full page reload
  const refreshLogs = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/ai-logs-refresh');
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
      }
    } catch (err) {
      console.error('Failed to refresh logs:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesEndpoint = filterEndpoint === 'All' || log.endpoint.includes(filterEndpoint);
    const matchesSearch = 
      log.endpoint.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.errorMessage && log.errorMessage.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesEndpoint && matchesSearch;
  });

  const uniqueEndpoints = ['All', ...Array.from(new Set(logs.map(l => {
    if (l.endpoint.includes('completion')) return 'completion';
    if (l.endpoint.includes('assistant')) return 'assistant';
    if (l.endpoint.includes('chat')) return 'chat';
    if (l.endpoint.includes('search')) return 'search';
    if (l.endpoint.includes('candidates')) return 'candidates';
    return l.endpoint;
  })))];

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-16">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-xs font-black uppercase tracking-widest">
            Telemetry & Telecommunications
          </span>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mt-3">
            AI performance & error dashboard
          </h1>
          <p className="text-slate-500 font-bold text-sm mt-1">
            Real-time latency metrics, token consumption models, and Sentry error pipelines.
          </p>
        </div>
        <button
          onClick={refreshLogs}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl font-black text-xs text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-indigo-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh telemetry
        </button>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/40 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-indigo-50/60 transition-all"></div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-5 border border-indigo-100">
            <Activity className="w-6 h-6" />
          </div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Total AI Requests</p>
          <h3 className="text-3xl font-black text-slate-900 mt-2">{metrics.totalRequests}</h3>
          <div className="text-[10px] text-emerald-500 font-bold mt-2 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> <span>Real-time logger active</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50/40 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-amber-50/60 transition-all"></div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 mb-5 border border-amber-100">
            <Cpu className="w-6 h-6" />
          </div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Average Latency</p>
          <h3 className="text-3xl font-black text-slate-900 mt-2">{Math.round(metrics.avgLatency)}ms</h3>
          <div className="text-[10px] text-slate-400 font-bold mt-2">
            Target speed: &lt;1500ms
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50/40 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-purple-50/60 transition-all"></div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 mb-5 border border-purple-100">
            <Database className="w-6 h-6" />
          </div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Token Consumption</p>
          <h3 className="text-3xl font-black text-slate-900 mt-2">{metrics.totalTokens.toLocaleString()}</h3>
          <div className="text-[10px] text-purple-500 font-semibold mt-2">
            Input/Output tokens measured
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/40 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-emerald-50/60 transition-all"></div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-5 border border-emerald-100">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Success Rate</p>
          <h3 className="text-3xl font-black text-slate-900 mt-2">{(metrics.successRate * 100).toFixed(1)}%</h3>
          <div className="text-[10px] text-emerald-600 font-bold mt-2">
            AI pipelines operational
          </div>
        </div>

        {/* Metric 5 */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50/40 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-rose-50/60 transition-all"></div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 mb-5 border border-rose-100">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Sentry Logged Failures</p>
          <h3 className="text-3xl font-black text-slate-900 mt-2">{metrics.errorCount}</h3>
          <div className="text-[10px] text-rose-500 font-bold mt-2">
            Errors forwarded to Sentry
          </div>
        </div>
      </div>

      {/* SENTRY ERROR SANDBOX */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 border border-slate-800 rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <span className="text-indigo-300 text-xs font-black uppercase tracking-widest">Sentry Integration sandbox</span>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">
            Trigger simulated errors for production tracking
          </h2>
          <p className="text-slate-300 font-bold text-sm leading-relaxed">
            Verify that Sentry is actively intercepting and formatting exceptions in our pipeline. When clicked, these components will intentionally raise exceptions. Sentry captures them automatically, formatting their callstacks and routing them directly to your dashboard.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <div className="flex flex-col gap-2">
              <button
                onClick={triggerClientError}
                className="px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-rose-950/20 active:scale-95"
              >
                Trigger Sentry Client Error
              </button>
              {sentryClientStatus && (
                <span className="text-[10px] text-rose-300 font-bold ml-1">{sentryClientStatus}</span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={triggerServerError}
                className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-indigo-950/20 active:scale-95"
              >
                Trigger Sentry Server Error
              </button>
              {sentryServerStatus && (
                <span className="text-[10px] text-indigo-300 font-bold ml-1">{sentryServerStatus}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* DETAILED LOGS GRID */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
        {/* Grid Header */}
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">AI telemetry log records</h2>
            <p className="text-slate-400 font-bold text-xs mt-1">Showing the 10 most recent AI executions captured globally.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-200 bg-white rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 min-w-[200px]"
              />
            </div>

            <select
              value={filterEndpoint}
              onChange={(e) => setFilterEndpoint(e.target.value)}
              className="px-4 py-2 border border-slate-200 bg-white rounded-2xl text-xs font-black text-slate-700 focus:outline-none cursor-pointer hover:bg-slate-50"
            >
              {uniqueEndpoints.map(endpoint => (
                <option key={endpoint} value={endpoint}>{endpoint}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/30 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="py-4 px-6">Timestamp</th>
                <th className="py-4 px-6">Endpoint</th>
                <th className="py-4 px-6">Model</th>
                <th className="py-4 px-6 text-center">Latency</th>
                <th className="py-4 px-6 text-center">Tokens</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredLogs.length > 0 ? (
                filteredLogs.map(log => {
                  const dateStr = new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                  const isSuccess = log.status === 'success';
                  return (
                    <tr key={log._id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-500">{dateStr}</td>
                      <td className="py-4 px-6 font-black text-slate-900 font-mono text-[11px] truncate max-w-[180px]">{log.endpoint}</td>
                      <td className="py-4 px-6 font-semibold text-slate-600">{log.model}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-2.5 py-1 rounded-lg font-mono font-bold text-[11px] ${log.latencyMs > 2000 ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>
                          {log.latencyMs}ms
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center font-bold text-slate-700">
                        {log.totalTokens > 0 ? (
                          <div className="flex flex-col items-center leading-tight">
                            <span className="font-mono">{log.totalTokens}</span>
                            <span className="text-[9px] text-slate-400">P:{log.promptTokens} C:{log.completionTokens}</span>
                          </div>
                        ) : '0'}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${isSuccess ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isSuccess ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                          {log.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setActiveLog(log)}
                          className="px-3.5 py-1.5 bg-slate-100 hover:bg-indigo-600 hover:text-white rounded-xl text-slate-600 font-black text-[10px] uppercase tracking-wider transition-all"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-bold">
                    No matching AI logs found. Try triggering some completions!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* LOG INSPECTION DRAWER / MODAL */}
      {activeLog && (
        <div className="fixed inset-0 z-[200] flex items-center justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-[600px] h-screen bg-white shadow-2xl p-8 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="space-y-8">
              <div className="flex justify-between items-start">
                <div>
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${activeLog.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {activeLog.status} log
                  </span>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight mt-2 truncate max-w-[400px]">
                    {activeLog.endpoint}
                  </h3>
                  <p className="text-slate-400 font-bold text-xs mt-1">Model: {activeLog.model}</p>
                </div>
                <button
                  onClick={() => setActiveLog(null)}
                  className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-black text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Latency Duration</span>
                  <p className="text-lg font-black text-slate-800 font-mono mt-1">{activeLog.latencyMs}ms</p>
                </div>
                <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total AI Tokens</span>
                  <p className="text-lg font-black text-slate-800 font-mono mt-1">{activeLog.totalTokens}</p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Prompt / Payload Context</span>
                <div className="p-4 bg-slate-900 border border-slate-800 text-slate-200 font-mono text-[11px] rounded-2xl max-h-[160px] overflow-y-auto whitespace-pre-wrap">
                  {activeLog.prompt}
                </div>
              </div>

              {activeLog.response && (
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Completion Result</span>
                  <div className="p-4 bg-slate-900 border border-slate-800 text-slate-200 font-mono text-[11px] rounded-2xl max-h-[220px] overflow-y-auto whitespace-pre-wrap">
                    {activeLog.response}
                  </div>
                </div>
              )}

              {activeLog.errorMessage && (
                <div className="space-y-2">
                  <span className="text-[10px] text-rose-500 font-bold uppercase tracking-wider">Error Details</span>
                  <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 font-mono text-[11px] rounded-2xl overflow-y-auto">
                    {activeLog.errorMessage}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActiveLog(null)}
                className="px-6 py-3.5 bg-slate-950 hover:bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all w-full"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
