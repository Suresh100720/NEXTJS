"use client";

import { MessageSquare, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { Conversation } from "./types";

interface ChatSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  activeMenuId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (e: React.MouseEvent, id: string) => void;
  onToggleMenu: (e: React.MouseEvent, id: string) => void;
}

export default function ChatSidebar({
  conversations,
  activeId,
  activeMenuId,
  onSelectConversation,
  onNewChat,
  onDeleteChat,
  onToggleMenu,
}: ChatSidebarProps) {
  return (
    <aside className="w-64 md:w-72 bg-slate-50 border-r border-slate-200/80 flex flex-col shrink-0">
      {/* New Chat Action */}
      <div className="p-4 border-b border-slate-200/40">
        <button
          onClick={onNewChat}
          className="w-full py-2.5 px-4 border border-slate-200 hover:bg-slate-100 bg-white text-slate-800 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-98 shadow-sm hover:shadow"
        >
          <Plus className="w-4 h-4 text-slate-600" />
          <span>New chat</span>
        </button>
      </div>

      {/* History Scroll List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1 py-4">
        <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          History
        </div>

        {conversations.length === 0 ? (
          <div className="text-center text-xs text-slate-400 py-8 italic">
            No recent chats
          </div>
        ) : (
          conversations.map((conv) => {
            const isActive = conv.id === activeId;
            return (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all relative ${
                  isActive
                    ? "bg-slate-200/70 text-slate-900"
                    : "hover:bg-slate-100 text-slate-600 hover:text-slate-800"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-4">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-500 shrink-0" />
                  <span className="truncate">{conv.title}</span>
                </div>

                {/* Three-dots Options Trigger */}
                <div className="relative shrink-0 options-menu-container">
                  <button
                    onClick={(e) => onToggleMenu(e, conv.id)}
                    className="opacity-40 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition-all"
                    title="Options"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  {/* Floating dropdown menu */}
                  {activeMenuId === conv.id && (
                    <div className="absolute right-0 mt-1 w-28 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50 animate-fade-in">
                      <button
                        onClick={(e) => onDeleteChat(e, conv.id)}
                        className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-650 hover:text-red-750 text-[11px] font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-650" />
                        <span className="text-red-600">Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
