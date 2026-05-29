/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { 
  Zap, 
  MessageSquare, 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Crown, 
  Gem, 
  HelpCircle, 
  Layers,
  X
} from "lucide-react";
import { ChatSession, SubscriptionStatus } from "../types";

interface SidebarProps {
  currentTab: "chat" | "creative_studio";
  onTabChange: (tab: "chat" | "creative_studio") => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSessionSelect: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, name: string) => void;
  status: SubscriptionStatus;
  onUpgradeClick: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  currentTab,
  onTabChange,
  sessions,
  activeSessionId,
  onSessionSelect,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  status,
  onUpgradeClick,
  isOpen,
  onClose
}: SidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState("");

  const handleStartRename = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(session.id);
    setTempTitle(session.title);
  };

  const handleCompleteRename = (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (tempTitle.trim()) {
      onRenameSession(id, tempTitle.trim());
    }
    setEditingId(null);
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteSession(id);
  };

  // Get visual representation of the active tier
  const getTierIcon = () => {
    if (status.tier === "pro") {
      return <Crown className="w-4 h-4 text-teal-400 fill-teal-400" />;
    }
    if (status.tier === "basic_pro") {
      return <Gem className="w-4 h-4 text-emerald-400 fill-emerald-400" />;
    }
    return <Zap className="w-4 h-4 text-zinc-500 fill-zinc-500" />;
  };

  const getTierLabel = () => {
    if (status.tier === "pro") return "Pro Account";
    if (status.tier === "basic_pro") return "Basic Pro";
    return "Free Space";
  };

  return (
    <aside id="app-sidebar-nav" className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#050505] border-r border-white/5 flex flex-col justify-between h-full font-sans text-white/80 shrink-0 transition-transform duration-300 md:static md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
      
      {/* 1. App logo and Primary CTA action */}
      <div className="p-5 flex flex-col gap-4">
        
        {/* Elegant warm amber/orange gradient lightning bolt logo */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-400 to-[#ea580c] flex items-center justify-center shadow-lg shadow-amber-500/10 text-black">
              <Zap className="w-4.5 h-4.5 fill-black text-black" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white font-display uppercase tracking-wider">
                Quick GPT
              </h2>
              <span className="text-[9px] text-white/40 font-mono">v1.4 Intelligent Core</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 hover:bg-white/5 text-white/40 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Close Drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat CTA with cmd shortcut reference look */}
        <button
          onClick={() => {
            onNewChat();
            onClose();
          }}
          id="new-chat-sidebar-cta"
          className="w-full flex items-center justify-between py-2.5 px-4 bg-transparent hover:bg-white/5 text-white/90 hover:text-white rounded-xl border border-white/10 text-xs font-semibold tracking-wide transition-all cursor-pointer shrink-0 group"
        >
          <span className="flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-white/60 group-hover:text-amber-400 transition-colors" />
            New Chat
          </span>
          <span className="text-[10px] font-mono text-white/20 group-hover:text-white/50 transition-colors">⌘N</span>
        </button>

        {/* Primary Modes selectors */}
        <div className="flex flex-col gap-1 mt-1">
          <button
            onClick={() => {
              onTabChange("chat");
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold font-display tracking-wide transition-all cursor-pointer ${
              currentTab === "chat"
                ? "bg-white/5 text-white border border-white/10"
                : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
            }`}
          >
            <MessageSquare className="w-4 h-4 text-white/80" />
            Chat Assistant
          </button>

          <button
            onClick={() => {
              onTabChange("creative_studio");
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold font-display tracking-wide transition-all cursor-pointer ${
              currentTab === "creative_studio"
                ? "bg-white/5 text-white border border-white/10"
                : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            Creative Art Studio
          </button>
        </div>

      </div>

      {/* 2. Historic List, Grouped Scroll Area */}
      <div className="flex-1 overflow-y-auto px-5 py-2 space-y-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40 font-mono block px-1 mb-2">
            History • Local Active
          </span>

          {sessions.length === 0 ? (
            <div className="p-4 border border-dashed border-white/5 rounded-lg text-center font-mono text-[10px] text-white/20 block">
              No chat logs found
            </div>
          ) : (
            <div className="space-y-1">
              {sessions.map((sess) => {
                const isActive = sess.id === activeSessionId;
                const isEditing = sess.id === editingId;

                return (
                  <div
                    key={sess.id}
                    onClick={() => {
                      onTabChange("chat");
                      onSessionSelect(sess.id);
                      onClose();
                    }}
                    className={`relative group w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all cursor-pointer border ${
                      isActive && currentTab === "chat"
                        ? "bg-white/5 border-white/10 text-white font-semibold"
                        : "bg-transparent border-transparent hover:bg-white/5 text-white/60 hover:text-white"
                    }`}
                  >
                    {isEditing ? (
                      <form
                        onSubmit={(e) => handleCompleteRename(sess.id, e)}
                        className="w-full mr-6"
                      >
                        <input
                          type="text"
                          required
                          value={tempTitle}
                          onChange={(e) => setTempTitle(e.target.value)}
                          onBlur={(e) => handleCompleteRename(sess.id, e)}
                          className="w-full bg-[#0d0d0d] text-white text-xs px-2 py-0.5 border border-amber-400 rounded focus:outline-none"
                          autoFocus
                        />
                      </form>
                    ) : (
                      <span className="truncate pr-8 font-sans leading-relaxed">
                        {sess.title}
                      </span>
                    )}

                    {/* Operational controls */}
                    {!isEditing && (
                      <div className="absolute right-2 opacity-0 group-hover:opacity-100 flex items-center gap-1.5 transition-all">
                        <button
                          onClick={(e) => handleStartRename(sess, e)}
                          className="p-1 hover:bg-white/10 text-white/40 hover:text-white rounded transition-all cursor-pointer"
                          title="Rename log"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteClick(sess.id, e)}
                          className="p-1 hover:bg-white/10 text-white/40 hover:text-red-400 rounded transition-all cursor-pointer"
                          title="Delete log"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. Subscription tier box & upgrade hooks */}
      <div className="p-4 border-t border-white/5 bg-transparent shrink-0">
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-3.5 text-white/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {getTierIcon()}
              <span className="text-xs font-bold text-white font-display">
                {getTierLabel()}
              </span>
            </div>
            
            <button
              onClick={onUpgradeClick}
              className="text-[10px] font-mono text-amber-500 hover:text-amber-400 underline font-semibold cursor-pointer"
            >
              Configure
            </button>
          </div>

          <p className="text-[11px] leading-relaxed text-white/60">
            {status.tier === "free" && "Standard text assistance. Standard 10-image limit."}
            {status.tier === "basic_pro" && "High priority text access. Unlimited image creations."}
            {status.tier === "pro" && "Premium 3.1 dual API access. 500 high-res image outputs."}
          </p>

          <div className="space-y-1">
            <span className="text-[9px] font-semibold text-white/40 uppercase tracking-widest block font-mono">
              Creative Balance
            </span>
            <span className="text-xs text-white">
              {status.tier === "basic_pro" ? "Unlimited images" : `${status.imageCount} / ${status.tier === "pro" ? "500" : "10"} created`}
            </span>
          </div>

          {status.tier === "free" && (
            <button
              onClick={onUpgradeClick}
              className="w-full bg-white text-black py-2 rounded-lg text-xs font-bold hover:bg-zinc-200 transition-colors cursor-pointer block text-center"
            >
              Manage via Stripe
            </button>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-white/20 mt-3.5 font-mono">
          <span>Stripe Gateway Active</span>
          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
        </div>
      </div>

    </aside>
  );
}
