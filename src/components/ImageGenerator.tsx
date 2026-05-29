/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { 
  Sparkles, 
  Image as ImageIcon, 
  Lock, 
  Compass, 
  Download, 
  Copy, 
  Check, 
  RefreshCw, 
  Zap, 
  Maximize2,
  X,
  Menu
} from "lucide-react";
import { SubscriptionTier, SubscriptionStatus } from "../types";

export interface GeneratedImageItem {
  id: string;
  url: string;
  prompt: string;
  style: string;
  aspectRatio: string;
  timestamp: string;
}

interface ImageGeneratorProps {
  status: SubscriptionStatus;
  allGeneratedImages: GeneratedImageItem[];
  onUpgradeClick: () => void;
  onImageGenerated: (imageUrl: string, prompt: string, style: string, aspectRatio: string) => void;
  onToggleSidebar?: () => void;
}

export default function ImageGenerator({
  status,
  allGeneratedImages,
  onUpgradeClick,
  onImageGenerated,
  onToggleSidebar,
}: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("None");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"workspace" | "portfolio">("workspace");
  const [zoomImage, setZoomImage] = useState<GeneratedImageItem | null>(null);

  // Available custom creative styles for Pro
  const stylesList = [
    { name: "None", description: "Standard raw generation", tier: "free" },
    { name: "Cinematic", description: "Movie lighting, dramatic", tier: "pro" },
    { name: "Neon", description: "Glowing retro synthwave", tier: "pro" },
    { name: "Digital Art", description: "Beautiful digital illustration", tier: "pro" },
    { name: "Photorealistic", description: "Depth of field, detailed", tier: "pro" },
    { name: "Cyberpunk", description: "Dark gritty futuristic neon", tier: "pro" },
    { name: "3D Render", description: "Octane style raytraced look", tier: "pro" },
    { name: "Anime", description: "Makoto Shinkai animated look", tier: "pro" },
    { name: "Watercolor", description: "Handpainted atmospheric wash", tier: "pro" },
  ];

  // Available Aspect Ratios
  const aspectRatios = [
    { label: "1:1 Square", value: "1:1", premium: false, iconClass: "w-6 h-6 border-2 border-zinc-500 rounded" },
    { label: "16:9 Landscape", value: "16:9", premium: true, iconClass: "w-9 h-5 border-2 border-zinc-500 rounded" },
    { label: "9:16 Portrait", value: "9:16", premium: true, iconClass: "w-5 h-9 border-2 border-zinc-500 rounded" },
    { label: "4:3 Classic", value: "4:3", premium: true, iconClass: "w-8 h-6 border-2 border-zinc-500 rounded" },
    { label: "3:4 Editorial", value: "3:4", premium: true, iconClass: "w-6 h-8 border-2 border-zinc-500 rounded" },
  ];

  const suggestions = [
    "A golden robotic cat wandering the cyberpunk neon streets of Tokyo",
    "Cozy glass study cabin in the middle of a snowy alpine forest with northern lights",
    "An astronaut sitting on a park bench on Mars reading a dusty magazine",
    "Vintage 1970s psychedelic vinyl album cover of a floating cloud palace",
  ];

  // Quick select dynamic quotes
  const handleSuggestionClick = (s: string) => {
    setPrompt(s);
  };

  // Lock checks
  const isStyleLocked = (tierRequired: string) => {
    if (tierRequired === "free") return false;
    return status.tier !== "pro"; // Only Pro unlocks advanced styling options!
  };

  const isRatioLocked = (ratioPremium: boolean) => {
    if (!ratioPremium) return false;
    return status.tier !== "pro"; // Only Pro unlocks non-standard aspect ratios!
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setErrorMsg("");
    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          style: status.tier === "pro" ? style : "None",
          aspectRatio: status.tier === "pro" ? aspectRatio : "1:1",
          tier: status.tier,
          imageCount: status.imageCount,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to generate image.");
      }

      const imageUrl = `data:image/png;base64,${data.base64}`;
      onImageGenerated(imageUrl, prompt, style, aspectRatio);
      
      // Clear input and switch to portfolio or stay
      setPrompt("");
      setActiveTab("portfolio");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An error occurred while generating the image.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper to copy prompt text
  const handleCopyPrompt = (p: string, id: string) => {
    navigator.clipboard.writeText(p);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Base64 download trigger
  const handleDownload = (base64Url: string, promptText: string) => {
    const link = document.createElement("a");
    link.href = base64Url;
    // Format name to be clean
    const safeName = promptText.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30);
    link.download = `quickgpt-studio-${safeName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Determine limit progress details
  const getProgressPercentage = () => {
    const limits = { free: 10, basic_pro: 9999999, pro: 500 };
    const max = limits[status.tier];
    if (max === 9999999) return 0;
    return Math.min(100, (status.imageCount / max) * 100);
  };

  return (
    <div id="ai-image-generator-panel" className="flex-1 flex flex-col h-full bg-[#0d0d0d] font-sans">
      
      {/* Studio Header Block */}
      <div className="border-b border-white/5 bg-[#0d0d0d] p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            {onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="p-1 px-1.5 md:hidden bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 rounded-lg cursor-pointer transition-colors mr-1"
                title="Open Sidebar"
              >
                <Menu className="w-4 h-4" />
              </button>
            )}
            <div className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-white font-display">
              Creative Art Suite & Studio
            </h1>
          </div>
          <p className="text-xs text-white/40 mt-1">
            Generate customized artwork using modern Google GenAI models with tier capabilities.
          </p>
        </div>

        {/* Tab selector */}
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10 self-start md:self-center">
          <button
            onClick={() => setActiveTab("workspace")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold font-display tracking-wide transition-all cursor-pointer ${
              activeTab === "workspace"
                ? "bg-white/10 text-white"
                : "text-white/40 hover:text-white"
            }`}
          >
            Studio Workspace
          </button>
          <button
            onClick={() => setActiveTab("portfolio")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold font-display tracking-wide transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "portfolio"
                ? "bg-white/10 text-white"
                : "text-white/40 hover:text-white"
            }`}
          >
            My Portfolio
            {allGeneratedImages.length > 0 && (
              <span className="w-4 h-4 bg-amber-500 text-black font-bold font-mono text-[9px] rounded-full flex items-center justify-center">
                {allGeneratedImages.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Studio Workspace container */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        
        {/* Tier status indicator / Upgrade Banner */}
        <div className="w-full max-w-4xl mx-auto mb-6">
          <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono tracking-widest uppercase font-bold px-2 py-0.5 rounded ${
                  status.tier === "pro" 
                    ? "bg-amber-500/10 text-amber-400"
                    : status.tier === "basic_pro"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-white/10 text-white/80"
                }`}>
                  {status.tier.replace("_", " ")} Level Space
                </span>
                <span className="text-white/60 text-xs">
                  {status.tier === "basic_pro" 
                    ? "Unlimited image creations unlocked!"
                    : `${status.imageCount} / ${status.tier === "pro" ? "500" : "10"} images generated`
                  }
                </span>
              </div>
              {status.tier !== "basic_pro" && (
                <div className="w-full md:w-80 bg-black/40 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-300 bg-amber-500" 
                    style={{ width: `${getProgressPercentage()}%` }} 
                  />
                </div>
              )}
            </div>

            {status.tier !== "pro" && (
              <button
                onClick={onUpgradeClick}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-xs font-bold rounded-lg leading-none tracking-wider uppercase transition-all shadow-lg cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                Upgrade to Pro (Unlocks ratios & styles!)
              </button>
            )}
          </div>
        </div>

        {activeTab === "workspace" && (
          <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Left Controls column */}
            <div className="md:col-span-12 lg:col-span-7 bg-white/[0.02] border border-white/10 rounded-2xl p-4 md:p-6 space-y-6">
              
              <form onSubmit={handleGenerate} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-xs leading-relaxed">
                    {errorMsg}
                  </div>
                )}

                {/* Main Prompts Box */}
                <div>
                  <label className="block text-xs font-medium text-white/45 font-display uppercase tracking-widest mb-2">
                    1. Command Studio Prompt
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your creative vision in details (e.g. 'Watercolor handpainted cottage in a quiet valley covered with lavender flowers at evening light...')"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full p-4 text-sm text-white placeholder-white/20 bg-black/40 border border-white/10 focus:outline-[#f59e0b] rounded-xl transition-all"
                  />
                </div>

                {/* Interactive suggestions */}
                <div className="space-y-2">
                  <span className="block text-[10px] uppercase tracking-wider font-mono text-white/30">
                    Need Inspiration? Try one:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSuggestionClick(s)}
                        className="px-2.5 py-1 text-[11px] text-white/60 bg-white/5 border border-white/10 hover:text-white hover:bg-white/10 rounded-lg transition-all font-sans cursor-pointer text-left truncate max-w-xs"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom styling premium selection */}
                <div className="pt-2 border-t border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-white/45 font-display uppercase tracking-widest">
                      2. Artistic Palette & Styles
                    </label>
                    {status.tier !== "pro" && (
                      <span className="text-[10px] text-amber-500 font-mono flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/10 rounded">
                        <Lock className="w-2.5 h-2.5" />
                        PRO locked
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {stylesList.map((st) => {
                      const locked = isStyleLocked(st.tier);
                      return (
                        <button
                          key={st.name}
                          type="button"
                          onClick={() => {
                            if (locked) {
                              onUpgradeClick();
                            } else {
                              setStyle(st.name);
                            }
                          }}
                          className={`relative p-3 rounded-xl border z-10 transition-all flex flex-col text-left cursor-pointer ${
                            locked
                              ? "bg-white/[0.01] border-white/5 text-white/20 hover:border-white/10"
                              : style === st.name
                                ? "bg-amber-500/10 border-amber-500 text-white"
                                : "bg-black/20 border-white/10 hover:border-white/25 text-white/80"
                          }`}
                        >
                          {locked && (
                            <div className="absolute top-2 right-2 text-white/20">
                              <Lock className="w-3 h-3" />
                            </div>
                          )}
                          <span className="text-xs font-bold leading-normal">{st.name}</span>
                          <span className="text-[9px] text-white/30 mt-1 leading-normal line-clamp-1">
                            {st.description}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Aspect ratio selections */}
                <div className="pt-2 border-t border-white/5 pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-xs font-semibold text-white/45 font-display uppercase tracking-widest">
                      3. Aspect Ratio Canvas Sizing
                    </label>
                    {status.tier !== "pro" && (
                      <span className="text-[10px] text-amber-500 font-mono flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/10 rounded">
                        <Lock className="w-2.5 h-2.5" />
                        PRO locked
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {aspectRatios.map((ratio) => {
                      const locked = isRatioLocked(ratio.premium);
                      const active = aspectRatio === ratio.value && (status.tier === "pro" || !ratio.premium);
                      return (
                        <button
                          key={ratio.value}
                          type="button"
                          onClick={() => {
                            if (locked) {
                              onUpgradeClick();
                            } else {
                              setAspectRatio(ratio.value);
                            }
                          }}
                          className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2.5 text-center transition-all cursor-pointer ${
                            locked
                              ? "bg-white/[0.01] border-white/5 text-white/20 hover:border-white/10"
                              : active
                                ? "bg-amber-500/10 border-amber-500 text-white"
                                : "bg-black/20 border-white/10 hover:border-white/25 text-white/80"
                          }`}
                        >
                          <div className="h-10 flex items-center justify-center p-1.5 shrink-0">
                            <div className={`${ratio.iconClass} ${active ? "border-[#f59e0b]" : "border-white/10"}`} />
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold tracking-tight">{ratio.label.split(" ")[1]}</span>
                            <span className="block text-[9px] text-white/40 mt-0.5">{ratio.value}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Launch Button */}
                <button
                  type="submit"
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full py-3 bg-white hover:bg-amber-400 text-black font-semibold text-sm rounded-xl leading-none tracking-widest uppercase transition-colors disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer z-10"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-black" />
                      Igniting Creative Suite...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#f59e0b]" />
                      Compose Custom Artwork
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right Display Placeholder column */}
            <div className="md:col-span-12 lg:col-span-5 bg-white/[0.02] border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
              {isGenerating ? (
                <div className="text-center space-y-4 max-w-xs z-10">
                  <div className="relative inline-flex items-center justify-center p-4 bg-amber-500/10 rounded-full mb-2">
                    <Sparkles className="w-8 h-8 text-amber-500 animate-spin" />
                  </div>
                  <h3 className="text-sm font-bold text-white font-display">Igniting Studio Pipeline</h3>
                  <p className="text-xs text-white/40 leading-normal animate-pulse">
                    The model is designing your custom high-fidelity output. Please allow a few seconds for synthesis...
                  </p>
                  <div className="space-y-1.5 pt-4 text-left border-t border-white/5">
                    <div className="h-1.5 bg-white/5 rounded overflow-hidden">
                      <div className="h-full bg-amber-500 rounded animate-[pulse_1.5s_infinite]" style={{ width: '40%' }} />
                    </div>
                    <span className="text-[9.5px] font-mono text-white/30 text-center block">Mapping base features & parameters</span>
                  </div>
                </div>
              ) : allGeneratedImages.length > 0 ? (
                <div className="flex flex-col h-full w-full justify-between items-center z-10">
                  <div className="text-center mb-4">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-white/30">Latest Art Creation</span>
                  </div>
                  
                  {/* Latest Image Showcase */}
                  <div className="relative group rounded-xl overflow-hidden border border-white/10 shadow-xl bg-black/40 aspect-square max-h-[300px] max-w-[300px] flex items-center justify-center">
                    <img 
                      src={allGeneratedImages[0].url} 
                      alt="Latest creation" 
                      className="object-contain w-full h-full"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleDownload(allGeneratedImages[0].url, allGeneratedImages[0].prompt)}
                        className="p-2.5 bg-[#1a1a1a] hover:bg-black text-white rounded-lg border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                        title="Download Hi-Res Artwork"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCopyPrompt(allGeneratedImages[0].prompt, allGeneratedImages[0].id)}
                        className="p-2.5 bg-[#1a1a1a] hover:bg-black text-white rounded-lg border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                        title="Copy Prompt"
                      >
                        {copiedId === allGeneratedImages[0].id ? <Check className="w-4 h-4 text-amber-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 text-center max-w-xs">
                    <p className="text-xs text-white/80 font-sans italic line-clamp-2">
                      "{allGeneratedImages[0].prompt}"
                    </p>
                    <span className="text-[9.5px] font-mono text-white/30 mt-1.5 block">
                      Style: {allGeneratedImages[0].style} • Ratio: {allGeneratedImages[0].aspectRatio}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-3 p-6 z-10">
                  <div className="p-3 bg-white/5 text-white/30 rounded-2xl inline-flex">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <h3 className="text-sm font-bold text-white/60">No Creations Yet</h3>
                  <p className="text-xs text-white/30 leading-normal max-w-xs">
                    Input your prompt to the left and click "Compose Custom Artwork" to initiate your very first digital creation in current sandbox limits.
                  </p>
                </div>
              )}

              {/* Decorative radial lighting */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/5 blur-[80px] pointer-events-none rounded-full" />
            </div>

          </div>
        )}

        {activeTab === "portfolio" && (
          <div className="w-full max-w-4xl mx-auto">
            {allGeneratedImages.length === 0 ? (
              <div className="p-16 border border-dashed border-white/10 rounded-2xl text-center bg-white/[0.02] max-w-md mx-auto">
                <ImageIcon className="w-10 h-10 text-white/20 mb-3 mx-auto" />
                <h3 className="text-sm font-semibold text-white font-display mb-1.5 animate-fade-in">Portfolio Empty</h3>
                <p className="text-xs text-white/40 leading-relaxed">
                  You haven't generated any images in this session. Generate creative assets on the Workspace tab to view them stored in your secure studio portfolio.
                </p>
                <button
                  onClick={() => setActiveTab("workspace")}
                  className="mt-5 px-4 py-2 bg-[#1a1a1a] hover:bg-white hover:text-black border border-white/10 text-white text-xs font-semibold rounded-lg transition-all cursor-pointer"
                >
                  Return to Workspace
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-semibold text-white/30 font-mono">
                    Portfolio Gallery ({allGeneratedImages.length} output records)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {allGeneratedImages.map((img) => (
                    <div 
                      key={img.id}
                      className="group bg-white/[0.02] border border-white/10 hover:border-white/20 rounded-2xl overflow-hidden p-3 transition-all flex flex-col justify-between"
                    >
                      {/* Image Frame */}
                      <div className="relative rounded-lg overflow-hidden bg-black/40 aspect-square w-full shrink-0 flex items-center justify-center">
                        <img 
                          src={img.url} 
                          alt="Portfolio image" 
                          className="object-contain w-full h-full"
                          referrerPolicy="no-referrer"
                        />
                        
                        {/* Hover Overlay controls */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            onClick={() => setZoomImage(img)}
                            className="p-2 bg-[#1a1a1a] hover:bg-black text-white rounded-lg border border-white/10 hover:border-white/20 cursor-pointer"
                            title="Fullscreen zoom"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDownload(img.url, img.prompt)}
                            className="p-2 bg-[#1a1a1a] hover:bg-black text-white rounded-lg border border-white/10 hover:border-white/20 cursor-pointer"
                            title="Download Art"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleCopyPrompt(img.prompt, img.id)}
                            className="p-2 bg-[#1a1a1a] hover:bg-black text-white rounded-lg border border-white/10 hover:border-white/20 cursor-pointer"
                            title="Copy Prompt"
                          >
                            {copiedId === img.id ? <Check className="w-3.5 h-3.5 text-amber-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Summary Data */}
                      <div className="mt-3.5">
                        <p className="text-[11px] text-white/80 font-sans line-clamp-2 italic shrink-0">
                          "{img.prompt}"
                        </p>
                        
                        <div className="flex items-center justify-between border-t border-white/5 pt-2.5 mt-2.5">
                          <span className="text-[9px] font-mono text-white/30 uppercase tracking-wider">
                            Style: {img.style}
                          </span>
                          <span className="text-[9px] font-mono text-white/50 font-semibold px-2 py-0.5 bg-black/20 rounded border border-white/10">
                            Ratio: {img.aspectRatio}
                          </span>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Fullscreen Art Zoom Modal */}
      {zoomImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fade-in">
          <button
            onClick={() => setZoomImage(null)}
            className="absolute top-4 right-4 p-2.5 bg-[#1a1a1a] hover:bg-black text-white border border-white/10 hover:border-white/20 rounded-full transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="max-w-4xl max-h-[85vh] flex flex-col justify-between items-center gap-4">
            <div className="flex-1 overflow-hidden flex items-center justify-center max-h-[70vh]">
              <img 
                src={zoomImage.url} 
                alt="Zoomed composition" 
                className="object-contain max-h-[70vh] rounded-lg border border-white/10"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-center max-w-xl">
              <p className="text-white/80 text-xs italic">
                "{zoomImage.prompt}"
              </p>
              <div className="flex items-center justify-center gap-3 mt-3">
                <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">
                  Style: {zoomImage.style} | Ratio: {zoomImage.aspectRatio} | Date: {zoomImage.timestamp}
                </span>
                <button
                  onClick={() => handleDownload(zoomImage.url, zoomImage.prompt)}
                  className="flex items-center gap-1 py-1 px-3 bg-white/5 hover:bg-white hover:text-black text-white rounded border border-white/10 text-xs font-mono cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download PNG
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
