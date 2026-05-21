'use client';

import { useChat, useCompletion } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Sparkles, Send, Loader2, Copy, Database, Search,
  FileText, Mail, FileCode, Check, Bot, User,
  Zap, Activity
} from 'lucide-react';


// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AIAssistantPage() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [template, setTemplate] = useState<'offer' | 'rejection' | 'spec'>('offer');
  const [completionInput, setCompletionInput] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const [chatInput, setChatInput] = useState('');

  // ── 1. useChat hook (Vercel AI SDK) ──────────────────────────────────────────
  const {
    messages,
    sendMessage,
    error: chatError,
    status,
  } = useChat({
    transport: new DefaultChatTransport({ api: '/api/assistant' }),
  });

  const chatLoading = status === 'submitted' || status === 'streaming';

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendMessage({ text: chatInput });
    setChatInput('');
  };

  // ── 2. useCompletion hook (Vercel AI SDK) ─────────────────────────────────────
  const {
    completion,
    complete,
    isLoading: completionLoading,
    error: completionError,
  } = useCompletion({
    api: '/api/completion',
    streamProtocol: 'text',
  });

  // Scroll chat to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Copy helper
  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  // Trigger useCompletion
  const handleGenerate = () => {
    if (!completionInput.trim()) return;
    const prefixes = {
      offer: 'Draft a warm, professional job offer letter. Details: ',
      rejection: 'Draft a polite, empathetic candidate rejection email. Details: ',
      spec: 'Write a detailed job description with requirements, responsibilities, and perks. Details: ',
    };
    complete(prefixes[template] + completionInput);
  };

  // Quick-prompt suggestions
  const suggestions = [
    { label: 'ES · Candidates', query: 'Search Elasticsearch index for candidates matching "React"', icon: <Search className="w-4 h-4" /> },
    { label: 'Mongo · Count', query: 'How many candidates are there in total in MongoDB?', icon: <Database className="w-4 h-4" /> },
    { label: 'ES · Jobs', query: 'Search Elasticsearch for job listings matching "Urgently Hiring"', icon: <Search className="w-4 h-4" /> },
    { label: 'Mongo · Jobs', query: 'Query MongoDB to count the total number of job listings.', icon: <Database className="w-4 h-4" /> },
  ];

  const safeInput = chatInput;

  return (
    <div className="flex h-[calc(100vh-80px)] w-full bg-white rounded-none border-none font-sans overflow-hidden text-slate-800 relative">

      {/* ══════════════════════════════════════════════════════════
          LEFT PANEL — useChat + Tool Calls
      ══════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col border-r border-slate-200 min-w-0">

        {/* Header */}
        <div className="h-14 px-5 flex items-center justify-between border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-extrabold tracking-tight text-slate-800 flex items-center gap-2">
                Hiring Assistant
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-indigo-500/15 text-indigo-600 border border-indigo-200 uppercase tracking-wide">useChat</span>
              </div>
              <div className="text-[10px] text-slate-600 font-semibold">Groq Llama‑3.3·70B · Tool Calling</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            Live Streaming
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
          {messages.length === 0 ? (
            /* Welcome screen */
            <div className="max-w-2xl mx-auto pt-8 space-y-8">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-2xl shadow-indigo-600/30 mb-4">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Ask your recruitment database</h1>
                <p className="text-slate-600 text-sm max-w-sm mx-auto">
                  I can query <span className="text-sky-600 font-bold">Elasticsearch</span> for full-text search, or access <span className="text-violet-600 font-bold">MongoDB</span> directly.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setChatInput(s.query)}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all text-left group"
                  >
                    <div className="flex items-center gap-2 mb-2 text-slate-600 group-hover:text-indigo-600 transition-colors">
                      {s.icon}
                      <span className="text-[10px] font-black uppercase tracking-wider">{s.label}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{s.query}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-5">
              {messages.map((m) => {
                const isUser = m.role === 'user';
                const messageText = m.parts
                  ? m.parts
                      .filter((p: any) => p.type === 'text' || p.type === 'reasoning')
                      .map((p: any) => p.text)
                      .join('')
                  : m.content ?? '';

                return (
                  <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-3 max-w-[88%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                      {/* Avatar */}
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isUser
                          ? 'bg-gradient-to-br from-indigo-600 to-violet-600'
                          : 'bg-slate-100 border border-slate-300'
                      }`}>
                        {isUser
                          ? <User className="w-3.5 h-3.5 text-white" />
                          : <Bot className="w-3.5 h-3.5 text-indigo-600" />}
                      </div>

                      {/* Bubble */}
                      <div className="flex flex-col gap-1">
                        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                          isUser
                            ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-tr-sm'
                            : 'bg-slate-100 border border-slate-200 text-slate-700 rounded-tl-sm'
                        }`}>
                          {messageText && (
                            isUser ? (
                              <div className="whitespace-pre-wrap">{messageText}</div>
                            ) : (
                              <div className="prose prose-sm max-w-none prose-p:my-1 prose-p:leading-relaxed prose-headings:font-bold prose-headings:text-slate-800 prose-h1:text-base prose-h2:text-sm prose-h3:text-sm prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-strong:text-slate-800 prose-code:bg-slate-200 prose-code:text-indigo-700 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono prose-pre:bg-slate-800 prose-pre:text-slate-100 prose-pre:rounded-xl prose-pre:p-3 prose-pre:text-xs prose-pre:overflow-x-auto prose-blockquote:border-l-2 prose-blockquote:border-indigo-400 prose-blockquote:pl-3 prose-blockquote:italic prose-blockquote:text-slate-600 prose-table:text-xs prose-th:bg-slate-100 prose-th:px-3 prose-th:py-1.5 prose-th:font-bold prose-td:px-3 prose-td:py-1.5 prose-td:border prose-td:border-slate-200 prose-hr:border-slate-200">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{messageText}</ReactMarkdown>
                              </div>
                            )
                          )}
                        </div>

                        {/* Copy action for assistant messages */}
                        {!isUser && messageText && (
                          <button
                            onClick={() => handleCopy(m.id, messageText)}
                            className="self-start flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-slate-500 hover:text-slate-700 transition-colors"
                          >
                            {copied === m.id
                              ? <><Check className="w-3 h-3 text-emerald-600" /><span className="text-emerald-600">Copied!</span></>
                              : <><Copy className="w-3 h-3" /> Copy</>}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Loading indicator */}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-300 flex items-center justify-center">
                      <Bot className="w-3.5 h-3.5 text-indigo-600" />
                    </div>
                    <div className="bg-slate-100 border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2 text-slate-600 text-xs">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                      <span>Thinking…</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error */}
              {chatError && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  ⚠ {chatError.message}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-3">
          <form
            onSubmit={handleChatSubmit}
            className="max-w-3xl mx-auto flex items-center gap-2"
          >
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={chatLoading}
              placeholder="Ask about candidates, jobs, or search the database…"
              className="flex-1 bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-500 outline-none transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-xl transition-all active:scale-95 shadow-lg"
            >
              {chatLoading
                ? <Loader2 className="w-4.5 h-4.5 animate-spin" />
                : <Send className="w-4 h-4" />}
            </button>
          </form>
          <p className="text-[10px] text-center text-slate-600 font-semibold mt-2">
            AI can trigger Elasticsearch & MongoDB tool calls based on your question
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          RIGHT PANEL — useCompletion (Smart Generator)
      ══════════════════════════════════════════════════════════ */}
      <div className="w-[440px] shrink-0 flex flex-col bg-slate-50 border-l border-slate-200">

        {/* Header */}
        <div className="h-14 px-5 flex items-center gap-3 border-b border-slate-200 bg-white shrink-0">
          <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div>
            <div className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              Smart Generator
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-pink-100 text-pink-600 border border-pink-200 uppercase tracking-wide">useCompletion</span>
            </div>
            <div className="text-[10px] text-slate-600 font-semibold">Stream any recruitment copy</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">

          {/* Template picker */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 block mb-2">Template</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'offer' as const, label: 'Offer Letter', icon: <FileText className="w-3.5 h-3.5" /> },
                { id: 'rejection' as const, label: 'Rejection', icon: <Mail className="w-3.5 h-3.5" /> },
                { id: 'spec' as const, label: 'Job Spec', icon: <FileCode className="w-3.5 h-3.5" /> },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                    template === t.id
                      ? 'bg-indigo-100 border-indigo-300 text-indigo-900'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-700'
                  }`}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt input */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 block mb-2">Details</label>
            <textarea
              value={completionInput}
              onChange={(e) => setCompletionInput(e.target.value)}
              rows={4}
              placeholder={
                template === 'offer'
                  ? 'e.g. Offer to Jane Smith, Senior React Dev, £85k, remote-first...'
                  : template === 'rejection'
                  ? 'e.g. Rejection for John Doe, applied for Backend role, strong but not selected...'
                  : 'e.g. Senior DevOps Engineer, AWS · Kubernetes · Terraform, 5+ yrs, London...'
              }
              className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-500 outline-none transition-all resize-none"
            />
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={completionLoading || !completionInput.trim()}
            className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {completionLoading ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Streaming…</>
            ) : (
              <><Sparkles className="w-3.5 h-3.5" /> Stream Draft</>
            )}
          </button>

          {/* Output */}
          <div className="flex-1 flex flex-col min-h-[200px]">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-700">Output</label>
              {completion && (
                <button
                  onClick={() => handleCopy('completion', completion)}
                  className="flex items-center gap-1 text-[10px] font-bold text-slate-600 hover:text-slate-800 transition-colors"
                >
                  {copied === 'completion'
                    ? <><Check className="w-3 h-3 text-emerald-600" /><span className="text-emerald-600">Copied!</span></>
                    : <><Copy className="w-3 h-3" /> Copy</>}
                </button>
              )}
            </div>

            <div className="flex-1 bg-white border border-slate-300 rounded-xl p-3 overflow-y-auto text-xs text-slate-700 leading-relaxed">
              {completion ? (
                <div className="prose prose-sm max-w-none prose-p:my-1.5 prose-p:leading-relaxed prose-headings:font-bold prose-headings:text-slate-800 prose-h1:text-sm prose-h2:text-xs prose-h3:text-xs prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-li:text-xs prose-strong:text-slate-800 prose-code:bg-slate-100 prose-code:text-indigo-700 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-[11px] prose-code:font-mono prose-pre:bg-slate-800 prose-pre:text-slate-100 prose-pre:rounded-lg prose-pre:p-3 prose-pre:text-[11px] prose-pre:overflow-x-auto prose-blockquote:border-l-2 prose-blockquote:border-indigo-400 prose-blockquote:pl-3 prose-blockquote:italic prose-blockquote:text-slate-600 prose-hr:border-slate-200 prose-table:text-[11px] prose-th:bg-slate-50 prose-th:px-2 prose-th:py-1 prose-th:font-bold prose-td:px-2 prose-td:py-1 prose-td:border prose-td:border-slate-200">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{completion}</ReactMarkdown>
                </div>
              ) : (
                <span className="text-slate-500 italic">
                  Select a template, fill in the details, then click Stream Draft…
                </span>
              )}
            </div>

            {completionError && (
              <p className="text-[10px] text-red-600 mt-2">⚠ {completionError.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
