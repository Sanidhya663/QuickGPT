/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { 
  Send, 
  ImageIcon, 
  Paperclip, 
  X, 
  Trash2, 
  User, 
  Bot, 
  Sparkles, 
  Check, 
  Copy, 
  Moon, 
  AlertTriangle, 
  HelpCircle, 
  Activity,
  ArrowRight,
  RefreshCw,
  Zap,
  ChevronDown,
  Menu
} from "lucide-react";
import Markdown from "react-markdown";

import Sidebar from "./components/Sidebar";
import SubscriptionModal from "./components/SubscriptionModal";
import ImageGenerator, { GeneratedImageItem } from "./components/ImageGenerator";
import Login from "./components/Login";
import { ChatSession, ChatMessage, SubscriptionStatus, SubscriptionTier } from "./types";

export default function App() {
  const [currentTab, setCurrentTab] = useState<"chat" | "creative_studio">("chat");
  const [isStripeModalOpen, setIsStripeModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Load login tracking parameters
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("quick_gpt_logged_in") === "true";
  });
  const [userEmail, setUserEmail] = useState(() => {
    return localStorage.getItem("quick_gpt_user_email") || "";
  });

  const handleLoginSuccess = (email: string) => {
    localStorage.setItem("quick_gpt_logged_in", "true");
    localStorage.setItem("quick_gpt_user_email", email);
    setIsLoggedIn(true);
    setUserEmail(email);

    // Prepare exactly user's requested message content to be inserted instantly
    const loginDoneMsg: ChatMessage = {
      id: `login-msg-${Date.now()}`,
      role: "assistant",
      content: "your login is done in quick gpt",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      modelUsed: "system"
    };

    setSessions(prev => {
      let targetId = activeSessionId;
      if (!targetId && prev.length > 0) {
        targetId = prev[0].id;
      }

      if (!targetId) {
        const defaultId = "welcome-session";
        const defaultSession: ChatSession = {
          id: defaultId,
          title: "Welcome to Quick GPT",
          messages: [loginDoneMsg],
          updatedAt: new Date().toISOString(),
          model: "gemini-3.5-flash"
        };
        setActiveSessionId(defaultId);
        return [defaultSession];
      }

      return prev.map(s => {
        if (s.id === targetId) {
          return {
            ...s,
            messages: [...s.messages, loginDoneMsg],
            updatedAt: new Date().toISOString()
          };
        }
        return s;
      });
    });
  };
  
  // Load subscription status from storage, default to free tier
  const [subscription, setSubscription] = useState<SubscriptionStatus>(() => {
    const saved = localStorage.getItem("quick_gpt_subscription");
    if (saved) return JSON.parse(saved);
    return {
      tier: "free",
      imageLimit: 10,
      imageCount: 0,
      isActive: true,
    };
  });

  // Load chat session logs from storage
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem("quick_gpt_sessions");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length > 0) return parsed;
    }
    
    // Create initial welcome session if empty
    const defaultSession: ChatSession = {
      id: "welcome-session",
      title: "Welcome to Quick GPT",
      messages: [
        {
          id: "welcome-msg-1",
          role: "assistant",
          content: "Hello! I am **Quick GPT**, your high-priority Gemini-assisted workspace assistant. \n\nI can answer general questions, refactor source code, write documentation, or interpret raw tables. For a creative experience, you can click on the **Creative Art Studio** in the sidebar to generate high-fidelity illustrations under our multi-tiered plan structures (Free, Basic Pro, Pro).\n\nFeel free to ask me anything or upload an image using the attach button below!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: "gemini-3.5-flash"
        }
      ],
      updatedAt: new Date().toISOString(),
      model: "gemini-3.5-flash"
    };
    return [defaultSession];
  });

  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    if (sessions.length > 0) return sessions[0].id;
    return null;
  });

  // Flat collection of generated files to maintain image portfolio state
  const [allGeneratedImages, setAllGeneratedImages] = useState<GeneratedImageItem[]>(() => {
    const saved = localStorage.getItem("quick_gpt_gallery");
    if (saved) return JSON.parse(saved);
    return [];
  });

  // Input states
  const [inputMessage, setInputMessage] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState("gemini-3.5-flash");
  const [isThinking, setIsThinking] = useState(false);
  const [errorBanner, setErrorBanner] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state to storage on every alteration
  useEffect(() => {
    localStorage.setItem("quick_gpt_subscription", JSON.stringify(subscription));
  }, [subscription]);

  useEffect(() => {
    localStorage.setItem("quick_gpt_sessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem("quick_gpt_gallery", JSON.stringify(allGeneratedImages));
  }, [allGeneratedImages]);

  // Keep chat scrolls to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessions, activeSessionId, isThinking]);

  const activeSession = sessions.find(s => s.id === activeSessionId) || null;

  // New Chat activation
  const handleNewChat = () => {
    const newId = `session-${Date.now()}`;
    const newSess: ChatSession = {
      id: newId,
      title: "Untitled Chat",
      messages: [],
      updatedAt: new Date().toISOString(),
      model: selectedModel,
    };
    setSessions(prev => [newSess, ...prev]);
    setActiveSessionId(newId);
    setCurrentTab("chat");
  };

  const handleDeleteSession = (id: string) => {
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    
    if (activeSessionId === id) {
      if (updated.length > 0) {
        setActiveSessionId(updated[0].id);
      } else {
        // Fallback default
        const fallbackId = `session-${Date.now()}`;
        const fallback: ChatSession = {
          id: fallbackId,
          title: "New Chat Session",
          messages: [],
          updatedAt: new Date().toISOString(),
          model: selectedModel,
        };
        setSessions([fallback]);
        setActiveSessionId(fallbackId);
      }
    }
  };

  const handleRenameSession = (id: string, name: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, title: name, updatedAt: new Date().toISOString() } : s));
  };

  // Convert attached files into base64 images
  const handleAttachImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) {
        setErrorBanner("Only image files (.jpg, .png, etc.) are allowed for chat integration.");
        continue;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAttachments(prev => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAttachment = (idx: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  // Upgrades plan triggers via Stripe Checkout simulation
  const handleUpgradeSuccess = (newTier: SubscriptionTier, cardLast4: string, cardBrand: string) => {
    const limits = { free: 10, basic_pro: 9999999, pro: 500 };
    setSubscription(prev => ({
      ...prev,
      tier: newTier,
      imageLimit: limits[newTier],
      cardBrand,
      cardLast4,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
    }));
  };

  // Chat request pipeline
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() && attachments.length === 0) return;
    if (isThinking) return;
    setErrorBanner("");

    // Make sure we have an active session
    let targetSessionId = activeSessionId;
    if (!targetSessionId) {
      const newId = `session-${Date.now()}`;
      const newSess: ChatSession = {
        id: newId,
        title: inputMessage.trim().slice(0, 30) || "Image Analysis",
        messages: [],
        updatedAt: new Date().toISOString(),
        model: selectedModel,
      };
      setSessions([newSess]);
      targetSessionId = newId;
      setActiveSessionId(newId);
    }

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: "user",
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachments: attachments.length > 0 ? [...attachments] : undefined
    };

    // Update session immediately to show User Bubble
    setSessions(prev => prev.map(s => {
      if (s.id === targetSessionId) {
        // Auto rename default session title if it was "Untitled Chat"
        const nextTitle = s.title === "Untitled Chat" ? inputMessage.trim().slice(0, 24) : s.title;
        return {
          ...s,
          title: nextTitle,
          messages: [...s.messages, userMsg],
          updatedAt: new Date().toISOString()
        };
      }
      return s;
    }));

    setInputMessage("");
    setAttachments([]);
    setIsThinking(true);

    try {
      // Fetch session object to get entire history
      const currentSess = sessions.find(s => s.id === targetSessionId);
      const recentHistory = currentSess ? [...currentSess.messages, userMsg] : [userMsg];

      // Call our server endpoint
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: recentHistory,
          model: selectedModel,
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to receive response from Gemini.");
      }

      const botMsg: ChatMessage = {
        id: `msg-bot-${Date.now()}`,
        role: "assistant",
        content: data.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed
      };

      // Set bot message in storage
      setSessions(prev => prev.map(s => {
        if (s.id === targetSessionId) {
          return {
            ...s,
            messages: [...s.messages, botMsg],
            updatedAt: new Date().toISOString()
          };
        }
        return s;
      }));

    } catch (err: any) {
      console.error(err);
      setErrorBanner(err.message || "An unexpected network error occurred. Please check Gemini secrets.");
      
      const errorMsg: ChatMessage = {
        id: `msg-error-${Date.now()}`,
        role: "assistant",
        content: `⚠️ **Error Code 500: Workspace Request Pipeline Disruption**\n\nCould not fetch response from the Gemini pipeline. ${err.message || "Please make sure your GEMINI_API_KEY is configured in the secrets menu."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setSessions(prev => prev.map(s => {
        if (s.id === targetSessionId) {
          return {
            ...s,
            messages: [...s.messages, errorMsg],
            updatedAt: new Date().toISOString()
          };
        }
        return s;
      }));
    } finally {
      setIsThinking(false);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Triggered when the inner ImageGenerator finishes generating an image
  const handleImageGenerated = (imageUrl: string, prompt: string, style: string, aspectRatio: string) => {
    const newItem: GeneratedImageItem = {
      id: `img-${Date.now()}`,
      url: imageUrl,
      prompt,
      style,
      aspectRatio,
      timestamp: new Date().toLocaleDateString()
    };

    setAllGeneratedImages(prev => [newItem, ...prev]);

    // Track state modifications
    setSubscription(prev => ({
      ...prev,
      imageCount: prev.imageCount + 1
    }));

    // Inject the generated artwork into the active chat session list for beautiful continuity!
    let targetSessionId = activeSessionId;
    if (!targetSessionId) {
      targetSessionId = `session-${Date.now()}`;
      const newSess: ChatSession = {
        id: targetSessionId,
        title: "Art Suite Creation",
        messages: [],
        updatedAt: new Date().toISOString(),
        model: selectedModel,
      };
      setSessions([newSess]);
      setActiveSessionId(targetSessionId);
    }

    const systemArtMessage: ChatMessage = {
      id: `msg-art-${Date.now()}`,
      role: "assistant",
      content: `🎨 I have built a custom high-fidelity illustration based on your commands:\n\n**Prompt:** *${prompt}*\n**Style:** ${style} • **Size:** ${aspectRatio}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isImage: true,
      imageUrls: [imageUrl],
      stylingOptions: { style, aspectRatio }
    };

    setSessions(prev => prev.map(s => {
      if (s.id === targetSessionId) {
        return {
          ...s,
          messages: [...s.messages, systemArtMessage],
          updatedAt: new Date().toISOString()
        };
      }
      return s;
    }));
  };

  // Fast start suggestions click details
  const handleFastConcept = (text: string) => {
    setInputMessage(text);
  };

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex h-screen bg-[#0d0d0d] text-[#ececec] font-sans overflow-hidden">
      
      {/* 1. Universal Sidebar Panel */}
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSessionSelect={setActiveSessionId}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        status={subscription}
        onUpgradeClick={() => {
          setIsStripeModalOpen(true);
        }}
      />

      {/* Sidebar background overlay drawer backdrop on Mobile viewports */}
      {isMobileSidebarOpen && (
        <div 
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity"
        />
      )}

      {/* 2. Primary Viewing Container */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Error Notification banner */}
        {errorBanner && (
          <div className="bg-red-500/15 border-b border-red-500/25 px-4 py-3 flex items-center justify-between z-20">
            <div className="flex items-center gap-2 text-red-400 text-xs font-medium">
              <AlertTriangle className="w-4 h-4" />
              <span>{errorBanner}</span>
            </div>
            <button 
              onClick={() => setErrorBanner("")} 
              className="text-red-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {currentTab === "chat" ? (
          <div className="flex-1 flex flex-col h-full bg-[#0d0d0d] overflow-hidden">
            
            {/* Header Block with Model Selector */}
            <div className="h-14 border-b border-white/5 px-4 md:px-6 flex items-center justify-between shrink-0 bg-[#0d0d0d]">
              <div className="flex items-center gap-2.5">
                {/* Hamburger menu selection drawer toggle */}
                <button
                  type="button"
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="p-1 px-1.5 md:hidden bg-white/5 hover:bg-white/10 text-[#ececec] border border-white/10 rounded-lg cursor-pointer transition-all"
                  title="Open Sidebar"
                >
                  <Menu className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline text-xs font-bold text-white/40 font-display uppercase tracking-widest text-[9px]">Active Workspace:</span>
                  <span className="text-xs text-white/85 font-mono italic max-w-[120px] sm:max-w-xs truncate">
                    {activeSession ? activeSession.title : "New Workspace"}
                  </span>
                </div>
              </div>

              {/* Advanced interactive Model Selector Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 hover:border-white/20 text-white/90 text-[11px] font-mono rounded-lg transition-all cursor-pointer"
                >
                  <Activity className="w-3.5 h-3.5 text-amber-500" />
                  <span>{selectedModel}</span>
                  <ChevronDown className="w-3 h-3 text-white/40" />
                </button>

                {isModelDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-60 rounded-xl bg-[#1a1a1a] border border-white/10 shadow-2xl z-40 py-1.5">
                    <button
                      onClick={() => {
                        setSelectedModel("gemini-3.5-flash");
                        setIsModelDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-white/5 flex flex-col transition-colors cursor-pointer"
                    >
                      <span className="text-xs font-bold text-white font-display font-semibold">gemini-3.5-flash</span>
                      <span className="text-[10px] text-white/40 mt-0.5 font-sans">Fast daily tasks, standard completions</span>
                    </button>
                    <button
                      onClick={() => {
                        if (subscription.tier !== "pro") {
                          setIsModelDropdownOpen(false);
                          setIsStripeModalOpen(true);
                        } else {
                          setSelectedModel("gemini-3.1-pro-preview");
                          setIsModelDropdownOpen(false);
                        }
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-white/5 flex flex-col transition-colors border-t border-white/5 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-400 font-display font-semibold">gemini-3.1-pro-preview</span>
                        {subscription.tier !== "pro" && (
                          <span className="text-[9px] font-bold text-amber-500 bg-amber-500/20 px-1 rounded uppercase font-mono">Pro</span>
                        )}
                      </div>
                      <span className="text-[10px] text-white/45 mt-0.5 font-sans">Extreme reasoning, coding & analysis</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Scrolling Chat messages block */}
            <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6">
              
              {!activeSession || activeSession.messages.length === 0 ? (
                <div className="max-w-2xl mx-auto py-12 md:py-20 text-center flex flex-col justify-center items-center">
                  
                  {/* Branding greeting header */}
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5">
                    <Zap className="w-8 h-8 text-white stroke-[1.5]" />
                  </div>
                  
                  <div className="space-y-2 mb-8">
                    <h2 className="text-3xl font-semibold tracking-tight text-white font-display">
                      How can I assist today?
                    </h2>
                    <p className="text-xs text-white/40 leading-normal max-w-md mx-auto">
                      Initiate a natural conversation or customize high resolution digital artwork under current billing tier capabilities.
                    </p>
                  </div>

                  {/* Starter Prompts cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                    <button
                      onClick={() => handleFastConcept("Write a clean Node.js script to read image files and return their format")}
                      className="p-4 bg-white/5 border border-white/10 rounded-xl text-left hover:bg-white/10 cursor-pointer shadow-sm transition-all group"
                    >
                      <p className="text-sm font-semibold mb-1 text-white/90 group-hover:text-amber-400 transition-colors">Generate Image</p>
                      <p className="text-xs text-white/40 font-sans">A cyberpunk city in the rain, 8k resolution</p>
                    </button>

                    <button
                      onClick={() => handleFastConcept("Explain quantum computing concepts to an absolute non-technical beginner")}
                      className="p-4 bg-white/5 border border-white/10 rounded-xl text-left hover:bg-white/10 cursor-pointer shadow-sm transition-all group"
                    >
                      <p className="text-sm font-semibold mb-1 text-white/90 group-hover:text-amber-400 transition-colors">Analyze Data</p>
                      <p className="text-xs text-white/40 font-sans">Check my local history for recurring themes</p>
                    </button>

                    <button
                      onClick={() => {
                        setCurrentTab("creative_studio");
                      }}
                      className="p-4 bg-white/5 border border-white/10 rounded-xl text-left hover:bg-white/10 cursor-pointer shadow-sm transition-all group"
                    >
                      <p className="text-sm font-semibold mb-1 text-white/90 group-hover:text-amber-400 transition-colors">Basic Pro Feature</p>
                      <p className="text-xs text-white/40 font-sans">Use the unlimited image generation engine</p>
                    </button>

                    <button
                      onClick={() => handleFastConcept("Compare SQL database engines and write outline recommendations")}
                      className="p-4 bg-white/5 border border-white/10 rounded-xl text-left hover:bg-white/10 cursor-pointer shadow-sm transition-all group"
                    >
                      <p className="text-sm font-semibold mb-1 text-white/90 group-hover:text-amber-400 transition-colors">Subscription</p>
                      <p className="text-xs text-white/40 font-sans">Check billing and Stripe integration</p>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto space-y-8 pb-32">
                  {activeSession.messages.map((msg) => {
                    const isUser = msg.role === "user";
                    return (
                      <div 
                        key={msg.id} 
                        className={`flex gap-4 ${isUser ? "justify-end" : "justify-start"}`}
                      >
                        {/* Bot avatar profile */}
                        {!isUser && (
                          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 shrink-0">
                            <Bot className="w-4 h-4 text-amber-500" />
                          </div>
                        )}

                        <div className={`max-w-[85%] ${isUser ? "bg-white/5 border border-white/10 p-4 rounded-2xl text-white/90" : "space-y-3"}`}>
                          
                          {/* Image attachments previews */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {msg.attachments.map((img, i) => (
                                <img
                                  key={i}
                                  src={img}
                                  alt="User attachment"
                                  className="h-28 w-28 object-cover rounded-lg border border-zinc-800 shadow shadow-black"
                                  referrerPolicy="no-referrer"
                                />
                              ))}
                            </div>
                          )}

                          {/* Message Content with Custom Elegant Markdown styling */}
                          {isUser ? (
                            <p className="text-sm font-sans leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                          ) : (
                            <div className="markdown-body p-1">
                              <Markdown
                                components={{
                                  code({ className, children, ...props }: any) {
                                    const match = /language-(\w+)/.exec(className || "");
                                    const inline = !match;
                                    return inline ? (
                                      <code className="bg-white/10 px-1.5 py-0.5 rounded text-amber-400 font-mono text-xs" {...props}>
                                        {children}
                                      </code>
                                    ) : (
                                      <pre className="bg-black/40 p-4 rounded-xl border border-white/5 my-3 overflow-x-auto font-mono text-xs text-zinc-300">
                                        <code className={className} {...props}>{children}</code>
                                      </pre>
                                    );
                                  },
                                  p: ({ children }) => <p className="mb-3.5 leading-relaxed text-sm text-[white/85] font-sans">{children}</p>,
                                  ul: ({ children }) => <ul className="list-disc pl-5 mb-3.5 space-y-1.5 text-sm text-[white/80] font-sans">{children}</ul>,
                                  ol: ({ children }) => <ol className="list-decimal pl-5 mb-3.5 space-y-1.5 text-sm text-[white/80] font-sans">{children}</ol>,
                                  li: ({ children }) => <li className="pl-1 text-sm text-[white/80] font-sans">{children}</li>,
                                  h1: ({ children }) => <h1 className="text-lg font-bold text-white mb-3 mt-4 font-display leading-tight">{children}</h1>,
                                  h2: ({ children }) => <h2 className="text-base font-bold text-white mb-2.5 mt-3.5 font-display leading-tight">{children}</h2>,
                                  h3: ({ children }) => <h3 className="text-sm font-bold text-white mb-2 mt-3 font-display leading-tight">{children}</h3>,
                                  table: ({ children }) => (
                                    <div className="overflow-x-auto my-4 rounded-lg border border-white/5">
                                      <table className="min-w-full divide-y divide-white/5 bg-white/[0.02] text-xs text-zinc-300 whitespace-nowrap">{children}</table>
                                    </div>
                                  ),
                                  th: ({ children }) => <th className="px-4 py-2 bg-white/5 font-semibold text-white text-left">{children}</th>,
                                  td: ({ children }) => <td className="px-4 py-2 border-t border-white/5">{children}</td>,
                                }}
                              >
                                {msg.content}
                              </Markdown>
                            </div>
                          )}

                          {/* Render image output block if generated inline */}
                          {msg.isImage && msg.imageUrls && (
                            <div className="grid grid-cols-1 gap-2.5 mt-4">
                              {msg.imageUrls.map((url, index) => (
                                <div key={index} className="max-w-md border border-zinc-850 rounded-xl overflow-hidden bg-zinc-950 shadow">
                                  <img 
                                    src={url} 
                                    alt="Inline generated art" 
                                    className="w-full h-auto object-contain max-h-[320px]"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Metadata row details */}
                          <div className="flex items-center gap-3 text-[9px] text-[#2c2c2c] font-mono mt-1">
                            <span>{msg.timestamp}</span>
                            {!isUser && msg.modelUsed && (
                              <span className="px-1.5 py-0.5 bg-white/5 rounded border border-white/5 text-white/50 uppercase tracking-wider scale-95 origin-left">
                                {msg.modelUsed}
                              </span>
                            )}
                            {!isUser && !msg.isImage && (
                              <button
                                onClick={() => handleCopyText(msg.content, msg.id)}
                                className="hover:text-white flex items-center gap-0.5 ml-1 select-none cursor-pointer text-white/40"
                              >
                                {copiedId === msg.id ? (
                                  <>
                                    <Check className="w-2.5 h-2.5 text-amber-400" />
                                    <span>Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-2.5 h-2.5" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>

                        </div>

                        {/* User profile details bubble placeholder */}
                        {isUser && (
                          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0 select-none">
                            <span>JD</span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Thinking Status overlay */}
                  {isThinking && (
                    <div className="flex gap-4 justify-start">
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 shrink-0">
                        <Bot className="w-4 h-4 text-amber-500 animate-pulse" />
                      </div>
                      <div className="space-y-2 bg-white/5 border border-white/10 px-4 py-3.5 rounded-2xl max-w-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white/95 font-display">Thinking Splicing Core</span>
                          <span className="flex gap-1">
                            <span className="w-1 h-1 bg-amber-400 rounded-full blink-dot" />
                            <span className="w-1 h-1 bg-amber-400 rounded-full blink-dot" />
                            <span className="w-1 h-1 bg-amber-400 rounded-full blink-dot" />
                          </span>
                        </div>
                        <p className="text-[11px] text-white/40 leading-normal font-sans italic animate-pulse">
                          Accessing Gemini API parameters and compiling optimal markdown...
                        </p>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Form Floating at bottom */}
            <div className="absolute bottom-0 inset-x-0 p-4 md:p-6 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/90 to-transparent z-10 shrink-0 border-t border-white/5 bg-[#0d0d0d]">
              <div className="max-w-3xl mx-auto space-y-2">
                
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2.5 bg-[#1a1a1a] p-2.5 border border-white/10 rounded-xl mb-2 items-center">
                    <span className="text-[9.5px] font-mono text-white/40 uppercase tracking-widest pl-1 mr-1">
                      Attachments:
                    </span>
                    {attachments.map((att, idx) => (
                      <div key={idx} className="relative group rounded overflow-hidden h-14 w-14 border border-white/5 shrink-0">
                        <img 
                          src={att} 
                          alt="preview" 
                          className="object-cover h-full w-full"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(idx)}
                          className="absolute -top-1 -right-1 p-0.5 bg-black/85 text-red-400 hover:text-white rounded-full transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="relative bg-[#1a1a1a] border border-white/10 rounded-2xl p-3.5 shadow-2xl">
                  <form onSubmit={handleSendMessage} className="flex flex-col gap-2">
                    
                    <input
                      type="text"
                      required={attachments.length === 0}
                      placeholder="Ask Quick GPT anything..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      className="w-full bg-transparent outline-none text-sm placeholder-white/20 py-2 text-white font-sans border-0 focus:ring-0 focus:outline-none"
                    />

                    <div className="flex justify-between items-center mt-1 border-t border-white/5 pt-2">
                      <div className="flex gap-2">
                        {/* File attach button triggers hidden input */}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="p-2 bg-transparent hover:bg-white/5 rounded-lg transition-colors cursor-pointer text-white/60 hover:text-white"
                          title="Attach pictures"
                        >
                          <Paperclip className="w-4.5 h-4.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setCurrentTab("creative_studio")}
                          className="p-2 bg-transparent hover:bg-white/5 rounded-lg transition-colors cursor-pointer text-white/60 hover:text-white"
                          title="Open Art Generator"
                        >
                          <Sparkles className="w-4.5 h-4.5 text-amber-400" />
                        </button>
                      </div>

                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleAttachImage}
                        className="hidden"
                        accept="image/*"
                        multiple
                      />

                      {/* Submit icon trigger button */}
                      <button
                        type="submit"
                        disabled={isThinking || (!inputMessage.trim() && attachments.length === 0)}
                        className="p-2 bg-white hover:bg-amber-400 disabled:bg-white/5 text-black disabled:text-white/20 rounded-xl transition-colors cursor-pointer"
                      >
                        <Send className="w-4.5 h-4.5 stroke-[2.5]" />
                      </button>
                    </div>
                  </form>
                </div>

                <p className="text-[10px] text-center mt-3 text-white/20 uppercase tracking-widest font-medium">
                  Quick GPT can make mistakes. Verify important info.
                </p>
              </div>
            </div>

          </div>
        ) : (
          <ImageGenerator
            onToggleSidebar={() => setIsMobileSidebarOpen(true)}
            status={subscription}
            allGeneratedImages={allGeneratedImages}
            onUpgradeClick={() => setIsStripeModalOpen(true)}
            onImageGenerated={handleImageGenerated}
          />
        )}

      </main>

      {/* Stripe Payment Method Checkout simulation modal */}
      <SubscriptionModal
        isOpen={isStripeModalOpen}
        onClose={() => setIsStripeModalOpen(false)}
        status={subscription}
        onUpgradeSuccess={handleUpgradeSuccess}
      />

    </div>
  );
}
