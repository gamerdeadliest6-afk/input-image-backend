import React, { useState, useRef } from 'react';
import { Sparkles, Upload, Loader2, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { analyzeVlm } from './services/api';
import { VlmAnalysisResult } from './types';

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VlmAnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImage(base64);
      processImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async (base64: string) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await analyzeVlm({ imageBase64: base64, question: "Describe this image in detail." });
      setResult(res);
    } catch (err) {
      console.error("Processing failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A10] text-slate-200 font-sans selection:bg-[#00FFFF] selection:text-black flex flex-col">
      {/* Minimal Header */}
      <header className="px-6 py-4 border-b border-slate-800/80 bg-[#0B132B]/50 backdrop-blur-md">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-lg bg-gradient-to-tr from-[#8A2BE2] to-[#00FFFF] p-0.5 shadow-[0_0_15px_rgba(0,255,255,0.4)]">
            <div className="w-full h-full bg-[#0A0A10] rounded-[6px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#00FFFF]" />
            </div>
          </div>
          <div className="text-lg font-black font-orbitron tracking-wider text-white flex items-center gap-1.5">
            <span>SY</span>
            <span className="text-[#00FFFF]">NOVA</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 flex flex-col gap-8">
        
        {/* Upload Section */}
        {!image && (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-[#00FFFF]/50 bg-slate-900/50 hover:bg-slate-900/80 transition-all rounded-3xl p-16 flex flex-col items-center justify-center text-center cursor-pointer group shadow-xl"
          >
            <div className="w-20 h-20 rounded-full bg-slate-800 group-hover:bg-[#00FFFF]/10 flex items-center justify-center mb-6 transition-colors">
              <Upload className="w-8 h-8 text-slate-400 group-hover:text-[#00FFFF] transition-colors" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 font-orbitron tracking-wide">Upload Image for Processing</h2>
            <p className="text-slate-400 max-w-md">Select or drag & drop any high-resolution image to run Synova's visual analysis engine.</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileUpload} 
            />
          </div>
        )}

        {/* Processing & Results Section */}
        {image && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Preview */}
            <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
              <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> SOURCE IMAGE
                </span>
                <button 
                  onClick={() => { setImage(null); setResult(null); }}
                  className="text-xs font-mono text-[#00FFFF] hover:text-white transition-colors"
                >
                  UPLOAD NEW
                </button>
              </div>
              <div className="flex-1 bg-black relative flex items-center justify-center min-h-[300px]">
                <img src={image} alt="Uploaded" className="max-w-full max-h-[600px] object-contain" />
              </div>
            </div>

            {/* Analysis Results */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
              <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#8A2BE2]" />
                <span className="text-xs font-mono text-slate-300 uppercase tracking-wider">Analysis Engine</span>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                {loading ? (
                  <div className="flex flex-col items-center justify-center flex-1 space-y-4 text-slate-400">
                    <Loader2 className="w-10 h-10 animate-spin text-[#00FFFF]" />
                    <p className="text-sm font-mono tracking-widest animate-pulse uppercase">Processing Data...</p>
                  </div>
                ) : result ? (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[#00FFFF] font-mono text-xs uppercase tracking-widest">
                        <CheckCircle2 className="w-4 h-4" /> Processing Complete
                      </div>
                      <h3 className="text-lg font-bold text-white leading-snug">
                        "{result.caption}"
                      </h3>
                    </div>
                    
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
                      <h4 className="text-[10px] font-mono uppercase text-slate-500 mb-2">Detailed Summary</h4>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {result.sceneSummary}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

