"use client";

import { ArrowUp, Loader2, Plus, X, FileText } from "lucide-react";
import React, { useRef } from "react";

interface ChatInputProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isStreaming: boolean;
  placeholder?: string;
  onFileSelect?: (file: File) => void;
  attachedFileName?: string | null;
  onClearAttachedFile?: () => void;
  isParsingFile?: boolean;
}

export default function ChatInput({
  value,
  onChange,
  onSubmit,
  isStreaming,
  placeholder = "Ask anything",
  onFileSelect,
  attachedFileName,
  onClearAttachedFile,
  isParsingFile,
}: ChatInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Attached File Indicator Badge */}
      {(attachedFileName || isParsingFile) && (
        <div className="flex items-center gap-2 self-start px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 animate-fade-in">
          <FileText className="w-3.5 h-3.5 text-blue-500" />
          <span className="truncate max-w-[200px]">
            {isParsingFile ? "Parsing document..." : attachedFileName}
          </span>
          {!isParsingFile && onClearAttachedFile && (
            <button
              type="button"
              onClick={onClearAttachedFile}
              className="p-0.5 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-750 transition-colors"
              title="Remove file"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          {isParsingFile && <Loader2 className="w-3 h-3 animate-spin text-slate-400" />}
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className="w-full bg-slate-100 hover:bg-slate-100/90 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-200 border border-slate-200/60 rounded-[32px] p-2.5 transition-all shadow-sm flex items-center gap-2"
      >
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.docx,.txt"
          className="hidden"
        />

        <button
          type="button"
          onClick={handleAttachClick}
          disabled={isStreaming || isParsingFile}
          className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors shrink-0 disabled:opacity-50"
          title="Attach file (PDF, DOCX, TXT)"
        >
          <Plus className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={isStreaming || isParsingFile}
          className="flex-1 bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 text-sm font-medium py-1 px-1 disabled:opacity-50"
        />

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="submit"
            disabled={!value.trim() || isStreaming || isParsingFile}
            className="p-2.5 bg-slate-900 hover:bg-slate-850 text-white rounded-full transition-all disabled:opacity-30 disabled:hover:bg-slate-900 disabled:pointer-events-none active:scale-95 shadow-sm"
          >
            {isStreaming ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowUp className="w-4 h-4 text-white" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
