"use client";

import { Image as ImageIcon, PenTool, Globe } from "lucide-react";
import React from "react";
import ChatInput from "./ChatInput";

interface ChatWelcomeProps {
  input: string;
  onChangeInput: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onPromptClick: (promptText: string) => void;
  isStreaming: boolean;
  onFileSelect?: (file: File) => void;
  attachedFileName?: string | null;
  onClearAttachedFile?: () => void;
  isParsingFile?: boolean;
}

export default function ChatWelcome({
  input,
  onChangeInput,
  onSubmit,
  onPromptClick,
  isStreaming,
  onFileSelect,
  attachedFileName,
  onClearAttachedFile,
  isParsingFile,
}: ChatWelcomeProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full text-center">
      <h1 className="text-3xl md:text-4xl font-semibold text-slate-800 tracking-tight mb-8">
        What are you working on?
      </h1>

      {/* Reusable ChatInput */}
      <div className="w-full mb-4">
        <ChatInput
          value={input}
          onChange={onChangeInput}
          onSubmit={onSubmit}
          isStreaming={isStreaming}
          onFileSelect={onFileSelect}
          attachedFileName={attachedFileName}
          onClearAttachedFile={onClearAttachedFile}
          isParsingFile={isParsingFile}
        />

        {/* Pill Button Prompts directly underneath */}
        <div className="flex flex-wrap gap-2.5 justify-center mt-6">
          <button
            onClick={() =>
              onPromptClick(
                "Suggest a visual design or image generation prompt for a recruitment campaign targeting top-tier engineers."
              )
            }
            className="px-4 py-2 border border-slate-200/80 hover:bg-slate-50 active:bg-slate-100 rounded-full text-xs font-semibold text-slate-600 transition-all flex items-center gap-2 shadow-sm active:scale-95"
          >
            <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />
            <span>Create an image</span>
          </button>
          <button
            onClick={() =>
              onPromptClick(
                "Write a highly engaging candidate outreach email for a Senior Frontend Developer candidate."
              )
            }
            className="px-4 py-2 border border-slate-200/80 hover:bg-slate-50 active:bg-slate-100 rounded-full text-xs font-semibold text-slate-600 transition-all flex items-center gap-2 shadow-sm active:scale-95"
          >
            <PenTool className="w-3.5 h-3.5 text-amber-500" />
            <span>Write or edit</span>
          </button>
          <button
            onClick={() =>
              onPromptClick(
                "Evaluate the current best practices for assessing mid-to-senior fullstack developers in technical interviews."
              )
            }
            className="px-4 py-2 border border-slate-200/80 hover:bg-slate-50 active:bg-slate-100 rounded-full text-xs font-semibold text-slate-600 transition-all flex items-center gap-2 shadow-sm active:scale-95"
          >
            <Globe className="w-3.5 h-3.5 text-blue-500" />
            <span>Look something up</span>
          </button>
        </div>
      </div>
    </div>
  );
}
