import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import InputBar from './components/InputBar';
import { Login } from './components/Login';
import { PricingModal } from './components/PricingModal';
import { Message, ChatSession, ModelType, UserProfile } from './types';
import { sendMessageStream, initChat } from './services/geminiService';
import { Menu } from 'lucide-react';

const MOCK_SESSIONS: ChatSession[] = [
  { id: '1', title: 'React Component Help', date: '2 days ago', preview: 'How to create a...' },
  { id: '2', title: 'Creative Writing', date: '5 days ago', preview: 'Write a story about...' },
];

const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<UserProfile | null>(null);
  
  // App State
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>(MOCK_SESSIONS);
  const [isDarkMode, setIsDarkMode] = useState(true); 
  const [selectedModel, setSelectedModel] = useState<ModelType>(ModelType.FAST);
  
  // UI Modal State
  const [showPricing, setShowPricing] = useState(false);

  useEffect(() => {
    // Basic Persistence
    const storedUser = localStorage.getItem('quickgpt_user');
    if (storedUser) {
        setUser(JSON.parse(storedUser));
    }

    if (isDarkMode) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    initChat(selectedModel);
  }, [isDarkMode, selectedModel]);

  // Handlers
  const handleLogin = (name: string) => {
      const newUser: UserProfile = {
          name: name,
          credits: 5, // Sign up bonus
          avatarUrl: ''
      };
      setUser(newUser);
      localStorage.setItem('quickgpt_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
      setUser(null);
      localStorage.removeItem('quickgpt_user');
      setMessages([]);
      setActiveSessionId(null);
  };

  const handlePurchaseCredits = (amount: number) => {
      if (user) {
          const updatedUser = { ...user, credits: user.credits + amount };
          setUser(updatedUser);
          localStorage.setItem('quickgpt_user', JSON.stringify(updatedUser));
      }
  };

  const handleSendMessage = async (text: string, model: ModelType) => {
    if (!user) return;
    
    // Check credits for PRO model
    if (model === ModelType.PRO && user.credits <= 0) {
        setShowPricing(true);
        return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const modelMessageId = (Date.now() + 1).toString();
    const modelMessagePlaceholder: Message = {
      id: modelMessageId,
      role: 'model',
      text: '',
      timestamp: Date.now(),
      isStreaming: true
    };
    
    setMessages((prev) => [...prev, modelMessagePlaceholder]);

    try {
      const stream = sendMessageStream(text, model);
      let accumulatedText = "";

      for await (const chunk of stream) {
        accumulatedText += chunk;
        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === modelMessageId 
              ? { ...msg, text: accumulatedText } 
              : msg
          )
        );
      }
      
      setMessages((prev) => 
        prev.map((msg) => 
            msg.id === modelMessageId 
            ? { ...msg, isStreaming: false } 
            : msg
        )
      );
      
      if (!activeSessionId) {
         const newSessionId = Date.now().toString();
         const newSession: ChatSession = {
             id: newSessionId,
             title: text.length > 30 ? text.substring(0, 30) + '...' : text,
             date: 'Just now',
             preview: text
         };
         setSessions(prev => [newSession, ...prev]);
         setActiveSessionId(newSessionId);
      }

    } catch (error) {
      console.error(error);
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === modelMessageId 
            ? { ...msg, text: "Sorry, something went wrong.", isStreaming: false } 
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setActiveSessionId(null);
    initChat(selectedModel);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    setMessages([
        { id: '1', role: 'user', text: 'This is a restored history for demo.', timestamp: Date.now() },
        { id: '2', role: 'model', text: 'Indeed, this is a visual demonstration.', timestamp: Date.now() }
    ]);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  // If not logged in, show Login
  if (!user) {
      return <Login onLogin={handleLogin} />;
  }

  return (
    // Use h-[100dvh] for mobile browsers to account for URL bar movement
    <div className="flex h-[100dvh] bg-background text-textMain overflow-hidden font-sans relative">
      <Sidebar 
        isOpen={sidebarOpen}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
        isDarkMode={isDarkMode}
        toggleTheme={() => setIsDarkMode(!isDarkMode)}
        user={user}
        onOpenPricing={() => setShowPricing(true)}
        onLogout={handleLogout}
      />

      <PricingModal 
        isOpen={showPricing} 
        onClose={() => setShowPricing(false)} 
        onPurchase={handlePurchaseCredits} 
      />

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 flex flex-col min-w-0 relative h-full w-full">
        {/* Mobile Header - Fixed at top with safe area padding */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-surface/95 backdrop-blur z-30 pt-safe">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="text-white p-2 -ml-2 hover:bg-white/10 rounded-lg transition-colors"
            >
                <Menu className="w-6 h-6" />
            </button>
            <span className="font-semibold text-white">QuickGPT</span>
            <div className="w-8" /> {/* Spacer to balance menu button */}
        </div>

        <ChatArea messages={messages} isLoading={isLoading} />
        
        <InputBar 
            onSendMessage={handleSendMessage} 
            isLoading={isLoading} 
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
        />
      </main>
    </div>
  );
};

export default App;