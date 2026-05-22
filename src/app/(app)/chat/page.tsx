"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles } from "lucide-react";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWelcome from "@/components/chat/ChatWelcome";
import ChatMessageList from "@/components/chat/ChatMessageList";
import ChatInput from "@/components/chat/ChatInput";
import { Message, Conversation } from "@/components/chat/types";

export default function AIChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // File parsing states
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const [attachedFileText, setAttachedFileText] = useState<string | null>(null);
  const [isParsingFile, setIsParsingFile] = useState(false);

  const handleFileSelect = async (file: File) => {
    setIsParsingFile(true);
    setAttachedFileName(file.name);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/chat/parse", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setAttachedFileText(data.text);
      console.log("✅ Parsed file successfully");
    } catch (e: any) {
      console.error("❌ File parse failed:", e);
      alert(`Failed to parse file: ${e.message || "Unknown error"}`);
      setAttachedFileName(null);
      setAttachedFileText(null);
    } finally {
      setIsParsingFile(false);
    }
  };

  const handleClearAttachedFile = () => {
    setAttachedFileName(null);
    setAttachedFileText(null);
    setIsParsingFile(false);
  };

  // Load chat history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("recruitment_chat_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConversations(parsed);
      } catch (e) {
        console.error("Failed to load chat history", e);
      }
    }
  }, []);

  // Click outside to close options dropdown menu
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(".options-menu-container")) {
        return;
      }
      setActiveMenuId(null);
    };
    document.addEventListener("click", handleGlobalClick);
    return () => {
      document.removeEventListener("click", handleGlobalClick);
    };
  }, []);

  // Save to localStorage
  const saveToStorage = (updatedList: Conversation[]) => {
    localStorage.setItem("recruitment_chat_history", JSON.stringify(updatedList));
  };

  // Get active conversation messages
  const activeConversation = conversations.find((c) => c.id === activeId);
  const messages = activeConversation ? activeConversation.messages : [];

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isStreaming) return;

    const userMessage: Message = { role: "user", content: textToSend };

    let currentConversationId = activeId;
    let updatedConversations = [...conversations];
    let activeMessages: Message[] = [];

    if (!currentConversationId) {
      // Create a new conversation session
      const newId = Date.now().toString();
      const title = textToSend.substring(0, 24) + (textToSend.length > 24 ? "..." : "");
      const newConv: Conversation = {
        id: newId,
        title: title,
        messages: [userMessage, { role: "assistant" as const, content: "" }],
        documentName: attachedFileName,
        documentText: attachedFileText,
      };
      updatedConversations = [newConv, ...updatedConversations];
      currentConversationId = newId;
      activeMessages = newConv.messages;
      setConversations(updatedConversations);
      setActiveId(newId);
      saveToStorage(updatedConversations);
    } else {
      // Append to existing conversation session
      updatedConversations = conversations.map((c) => {
        if (c.id === currentConversationId) {
          const newMessages = [...c.messages, userMessage, { role: "assistant" as const, content: "" }];
          activeMessages = newMessages;

          const updatedConv = { ...c, messages: newMessages };
          // If a new file is attached during this turn, save it!
          if (attachedFileName && attachedFileText) {
            updatedConv.documentName = attachedFileName;
            updatedConv.documentText = attachedFileText;
          }
          return updatedConv;
        }
        return c;
      });
      setConversations(updatedConversations);
      saveToStorage(updatedConversations);
    }

    setInput("");
    setIsStreaming(true);

    const assistantMessageIndex = activeMessages.length - 1;

    try {
      // Strip off the empty assistant message before sending to API
      const messagesToSend = activeMessages.slice(0, assistantMessageIndex);

      // Get persistent or current document context
      const currentConv = updatedConversations.find(c => c.id === currentConversationId);
      const docName = currentConv?.documentName || attachedFileName;
      const docText = currentConv?.documentText || attachedFileText;

      if (docText) {
        messagesToSend.unshift({
          role: "system",
          content: `You have access to an attached document context titled "${docName}". 
Please answer the user's questions based on this document when relevant. 
Include specific details, metrics, and answers directly from the document.
If the user's query is completely unrelated to the document content (such as asking for general programming assistance, unrelated definitions, or random topics), ignore the document context entirely and answer generally as a helpful AI assistant.`,
        });
      }

      // Clear the temporary attachment states
      setAttachedFileName(null);
      setAttachedFileText(null);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: messagesToSend }),
      });

      if (!response.ok) {
        throw new Error("Failed to connect to AI server.");
      }

      if (!response.body) {
        throw new Error("No response body.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedResponse = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedResponse += chunk;

        setConversations((prev) => {
          const updated = prev.map((c) => {
            if (c.id === currentConversationId) {
              const newMessages = [...c.messages];
              newMessages[assistantMessageIndex] = {
                role: "assistant",
                content: accumulatedResponse,
              };
              return { ...c, messages: newMessages };
            }
            return c;
          });
          saveToStorage(updated);
          return updated;
        });
      }
    } catch (error: any) {
      console.error("❌ Streaming Error:", error);
      setConversations((prev) => {
        const updated = prev.map((c) => {
          if (c.id === currentConversationId) {
            const newMessages = [...c.messages];
            newMessages[assistantMessageIndex] = {
              role: "assistant",
              content: `⚠️ Failed to fetch stream: ${error.message || "Unknown network error."}. Please try again.`,
            };
            return { ...c, messages: newMessages };
          }
          return c;
        });
        saveToStorage(updated);
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  const handlePromptClick = (promptText: string) => {
    handleSend(promptText);
  };

  const handleStartNewChat = () => {
    setActiveId(null);
  };

  const handleDeleteChat = (e: React.MouseEvent, idToDelete: string) => {
    e.stopPropagation();
    const updated = conversations.filter((c) => c.id !== idToDelete);
    setConversations(updated);
    saveToStorage(updated);
    if (activeId === idToDelete) {
      setActiveId(null);
    }
    setActiveMenuId(null);
  };

  const handleMenuClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  return (
    <div className="flex h-[calc(100vh-80px)] w-full bg-white rounded-none border-none font-sans overflow-hidden text-slate-800 relative">

      {/* 1. Left History Sidebar Component */}
      <ChatSidebar
        conversations={conversations}
        activeId={activeId}
        activeMenuId={activeMenuId}
        onSelectConversation={setActiveId}
        onNewChat={handleStartNewChat}
        onDeleteChat={handleDeleteChat}
        onToggleMenu={handleMenuClick}
      />

      {/* 2. Right Chat Main Area */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">

        {/* Simple model bar */}
        <header className="h-14 px-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <button className="text-sm font-bold text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 border border-slate-100 shadow-sm active:scale-98">
              <span>Groq Llama 3</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500/10" />
            </button>
          </div>
        </header>

        {/* Content scrolling */}
        <div className="flex-1 overflow-y-auto relative flex flex-col bg-white">
          {messages.length === 0 ? (
            /* Centered Start screen Component */
            <ChatWelcome
              input={input}
              onChangeInput={setInput}
              onSubmit={handleSubmitForm}
              onPromptClick={handlePromptClick}
              isStreaming={isStreaming}
              onFileSelect={handleFileSelect}
              attachedFileName={attachedFileName}
              onClearAttachedFile={handleClearAttachedFile}
              isParsingFile={isParsingFile}
            />
          ) : (
            /* Active messages history stream rendering Component */
            <ChatMessageList
              messages={messages}
              isStreaming={isStreaming}
              messagesEndRef={messagesEndRef}
              documentName={activeConversation?.documentName}
            />
          )}
        </div>

        {/* Sticky bottom search bar when active chat session is loaded */}
        {messages.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-white shrink-0">
            <div className="max-w-3xl mx-auto">
              <ChatInput
                value={input}
                onChange={setInput}
                onSubmit={handleSubmitForm}
                isStreaming={isStreaming}
                onFileSelect={handleFileSelect}
                attachedFileName={attachedFileName}
                onClearAttachedFile={handleClearAttachedFile}
                isParsingFile={isParsingFile}
              />
              <p className="text-[10px] text-center text-slate-400 mt-2 font-semibold">
                AI Assistant can make mistakes. Verify important info.
              </p>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
}

