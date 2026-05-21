"use client";

import { Bot, User, ArrowDown, FileText } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Message } from "./types";

interface ChatMessageListProps {
  messages: Message[];
  isStreaming: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  documentName?: string | null;
}

export default function ChatMessageList({
  messages,
  isStreaming,
  messagesEndRef,
  documentName,
}: ChatMessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    // Show arrow if user scrolled up more than 300px from the bottom
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 300;
    setShowScrollButton(!isNearBottom);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Instant scroll jump to bottom when changing conversation or active session loads
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages.length]);

  return (
    <div className="flex-1 relative overflow-hidden flex flex-col bg-white">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-6 py-8 space-y-6"
      >
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Persisted Document Attachment Card */}
        {documentName && (
          <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl max-w-sm mb-2 animate-fade-in shadow-sm">
            <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-xl text-blue-600 shrink-0">
              <FileText className="w-5 h-5 text-blue-600 animate-pulse" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 truncate">{documentName}</p>
              <p className="text-[10px] font-bold text-slate-400">Attached Document Context</p>
            </div>
          </div>
        )}

        {messages.map((message, index) => {
          const isAi = message.role === "assistant";
          return (
            <div
              key={index}
              className={`flex gap-4 animate-fade-in ${
                isAi ? "justify-start" : "justify-end"
              }`}
            >
              {isAi && (
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="w-4 h-4 text-slate-600" />
                </div>
              )}

              <div
                className={`text-sm leading-relaxed max-w-[85%] ${
                  isAi
                    ? "text-slate-800 font-normal pr-4 flex-1"
                    : "bg-slate-100 border border-slate-200/60 text-slate-800 rounded-3xl px-5 py-3 shadow-sm"
                }`}
              >
                {isAi ? (
                  /* AI Response formatted via Markdown + GFM */
                  <div className="prose prose-slate max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => (
                          <p className="mb-3.5 last:mb-0 leading-relaxed text-slate-800 font-normal">
                            {children}
                          </p>
                        ),
                        h1: ({ children }) => (
                          <h1 className="text-xl font-bold text-slate-900 mb-2 mt-4 first:mt-0">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-lg font-bold text-slate-900 mb-2 mt-3 first:mt-0">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-base font-bold text-slate-850 mb-1.5 mt-3 first:mt-0">
                            {children}
                          </h3>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc pl-5 mb-3.5 space-y-1 text-slate-700">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal pl-5 mb-3.5 space-y-1 text-slate-700">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="text-slate-700 leading-relaxed">
                            {children}
                          </li>
                        ),
                        code: ({ inline, children, ...props }: any) => {
                          return inline ? (
                            <code
                              className="bg-slate-100 text-slate-900 px-1.5 py-0.5 rounded text-xs font-semibold"
                              {...props}
                            >
                              {children}
                            </code>
                          ) : (
                            <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto text-xs my-3 font-mono shadow-sm">
                              <code {...props}>{children}</code>
                            </pre>
                          );
                        },
                        table: ({ children }) => (
                          <div className="overflow-x-auto my-4 rounded-xl border border-slate-200 shadow-sm">
                            <table className="min-w-full divide-y divide-slate-200 bg-white text-sm">
                              {children}
                            </table>
                          </div>
                        ),
                        thead: ({ children }) => (
                          <thead className="bg-slate-50">{children}</thead>
                        ),
                        tbody: ({ children }) => (
                          <tbody className="divide-y divide-slate-100">
                            {children}
                          </tbody>
                        ),
                        tr: ({ children }) => <tr>{children}</tr>,
                        th: ({ children }) => (
                          <th className="px-4 py-2.5 text-left font-bold text-slate-700 border-r last:border-r-0 border-slate-200">
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td className="px-4 py-2.5 text-slate-650 border-r last:border-r-0 border-slate-200">
                            {children}
                          </td>
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                    {isStreaming && index === messages.length - 1 && (
                      <span className="inline-block w-1.5 h-4 ml-1 bg-slate-800 animate-pulse align-middle" />
                    )}
                  </div>
                ) : (
                  /* User response bubble */
                  <div className="whitespace-pre-wrap select-text font-normal">
                    {message.content}
                  </div>
                )}
              </div>

              {!isAi && (
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                  <User className="w-4 h-4 text-slate-600" />
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>

      {/* Floating Down Arrow Scroll Action */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-6 right-6 p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 z-40 animate-bounce flex items-center justify-center bg-white/95 backdrop-blur-sm"
          title="Scroll to bottom"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
