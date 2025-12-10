import React, { useState } from 'react';
import { Microscope, Wand2, Download, RefreshCw } from 'lucide-react';
import { generateSyntheticXray } from '../services/geminiService';

const Generator: React.FC = () => {
  const [prompt, setPrompt] = useState("pneumonia opacity in right lung, consolidation, hazy white patches");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const imgUrl = await generateSyntheticXray(prompt);
      if (imgUrl) {
        setGeneratedImage(imgUrl);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to generate image. Check API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Microscope className="text-purple-600" />
            Synthetic Data Generator
        </h2>
        <p className="text-slate-500">
            Augment your dataset with AI-generated medical imagery using Stable Diffusion logic (simulated via Gemini).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Pathology Prompt
                </label>
                <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full h-32 p-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                    placeholder="Describe the medical condition..."
                />
                
                <div className="mt-4">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">
                        Preset Scenarios
                    </label>
                    <div className="flex flex-wrap gap-2">
                        <button 
                            onClick={() => setPrompt("pneumonia opacity in right lung, consolidation")}
                            className="px-3 py-1 bg-slate-100 text-xs rounded-full hover:bg-slate-200 text-slate-600"
                        >
                            Pneumonia
                        </button>
                        <button 
                            onClick={() => setPrompt("normal healthy lungs, clear diaphragm, no opacity")}
                            className="px-3 py-1 bg-slate-100 text-xs rounded-full hover:bg-slate-200 text-slate-600"
                        >
                            Normal
                        </button>
                        <button 
                             onClick={() => setPrompt("severe viral pneumonia, diffuse interstitial markings")}
                            className="px-3 py-1 bg-slate-100 text-xs rounded-full hover:bg-slate-200 text-slate-600"
                        >
                            Viral
                        </button>
                    </div>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                    {isGenerating ? (
                        <>
                           <RefreshCw className="animate-spin" size={18} />
                           Generating...
                        </>
                    ) : (
                        <>
                            <Wand2 size={18} />
                            Generate Synthetic Data
                        </>
                    )}
                </button>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-xs text-blue-800">
                <strong>Note:</strong> This uses a generative model to simulate the "Stable Diffusion" component of the MedVLM pipeline. The generated images are for research simulation only.
            </div>
        </div>

        {/* Output */}
        <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-2 h-[500px] flex items-center justify-center bg-slate-50">
                {generatedImage ? (
                    <div className="relative group w-full h-full flex items-center justify-center">
                        <img 
                            src={generatedImage} 
                            alt="Generated X-ray" 
                            className="max-h-full max-w-full object-contain rounded-lg shadow-md"
                        />
                        <a 
                            href={generatedImage} 
                            download="synthetic_xray.png"
                            className="absolute bottom-4 right-4 bg-white/90 p-2 rounded-lg shadow-lg hover:bg-white text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Download size={20} />
                        </a>
                    </div>
                ) : (
                    <div className="text-center text-slate-400">
                        <Microscope size={48} className="mx-auto mb-4 opacity-50" />
                        <p>Generated synthetic imagery will appear here</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Generator;