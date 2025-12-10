import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, FileText, Clock, Activity } from 'lucide-react';
import { analyzeXray } from '../services/geminiService';
import { AnalysisResult, Diagnosis } from '../types';

const DiagnosisLab: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      // Split data URI to get base64
      const base64Data = image.split(',')[1];
      const mimeType = image.split(';')[0].split(':')[1];
      const data = await analyzeXray(base64Data, mimeType);
      setResult(data);
    } catch (err) {
      setError("Analysis failed. Please try again or check your API key.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearImage = () => {
    setImage(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="text-blue-600" />
            Diagnosis Lab
        </h2>
        <p className="text-slate-500">Upload a chest X-ray for instant AI analysis and reporting.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0">
        {/* Left Column: Input */}
        <div className="flex flex-col gap-4 h-full">
          <div className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center relative overflow-hidden transition-colors ${image ? 'border-slate-300 bg-slate-50' : 'border-blue-300 bg-blue-50 hover:bg-blue-100'}`}>
            {image ? (
              <>
                <img src={image} alt="Uploaded X-ray" className="max-h-full max-w-full object-contain p-4" />
                <button 
                  onClick={clearImage}
                  className="absolute top-4 right-4 bg-white/80 p-2 rounded-full hover:bg-white text-slate-600 shadow-sm"
                >
                  <X size={20} />
                </button>
              </>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="text-center cursor-pointer p-10 w-full h-full flex flex-col items-center justify-center"
              >
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                  <Upload size={32} />
                </div>
                <h3 className="text-lg font-semibold text-slate-700">Upload Chest X-ray</h3>
                <p className="text-sm text-slate-500 mt-2">Drag & drop or click to browse</p>
                <p className="text-xs text-slate-400 mt-4">Supports JPEG, PNG (DICOM converted)</p>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!image || isAnalyzing}
            className={`w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 shadow-lg transition-all ${
              !image || isAnalyzing 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-900/20'
            }`}
          >
            {isAnalyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Activity size={20} />
                Run Diagnosis
              </>
            )}
          </button>
        </div>

        {/* Right Column: Results */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col h-full overflow-y-auto">
          {!result && !error ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 opacity-60">
              <FileText size={64} className="mb-4" />
              <p>Analysis results will appear here</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
              <AlertCircle size={20} />
              {error}
            </div>
          ) : result ? (
            <div className="space-y-6 animate-fade-in">
              {/* Diagnosis Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Prediction</h3>
                  <div className={`text-4xl font-bold mt-2 flex items-center gap-3 ${
                    result.diagnosis === Diagnosis.PNEUMONIA ? 'text-rose-600' : 'text-emerald-600'
                  }`}>
                    {result.diagnosis === Diagnosis.PNEUMONIA ? (
                        <AlertCircle size={36} />
                    ) : (
                        <CheckCircle size={36} />
                    )}
                    {result.diagnosis}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Confidence</div>
                  <div className="text-3xl font-bold text-slate-800 mt-1">
                    {(result.confidence * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Confidence Bar */}
              <div>
                <div className="flex justify-between text-sm mb-2 font-medium text-slate-600">
                    <span>Normal</span>
                    <span>Pneumonia</span>
                </div>
                <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex">
                    <div 
                        className="bg-emerald-500 h-full transition-all duration-1000" 
                        style={{ width: result.diagnosis === Diagnosis.NORMAL ? `${result.confidence * 100}%` : `${(1-result.confidence)*100}%` }}
                    />
                    <div 
                        className="bg-rose-500 h-full transition-all duration-1000" 
                        style={{ width: result.diagnosis === Diagnosis.PNEUMONIA ? `${result.confidence * 100}%` : `${(1-result.confidence)*100}%` }}
                    />
                </div>
              </div>

              {/* Generated Report */}
              <div className="bg-slate-50 p-5 rounded-lg border border-slate-200">
                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-3">
                    <FileText size={16} />
                    Generated Medical Report (BLIP-Style)
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed font-mono">
                    {result.report}
                </p>
              </div>

              {/* Explainability */}
              {result.heatmapExplanation && (
                 <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                    <h4 className="text-sm font-bold text-blue-800 flex items-center gap-2 mb-3">
                        <Activity size={16} />
                        AI Focus (Explainability)
                    </h4>
                    <p className="text-blue-700 text-sm leading-relaxed">
                        {result.heatmapExplanation}
                    </p>
                </div>
              )}

              {/* Metrics */}
              <div className="pt-4 flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                    <Clock size={12} />
                    Latency: {result.latency}ms
                </span>
                <span>Model: MedVLM-v1 (Gemini 2.5 Flash Backend)</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default DiagnosisLab;