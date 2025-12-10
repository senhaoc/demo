import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area
} from 'recharts';
import { SCALING_LAW_DATA, PROMPT_ABLATION_DATA, ROBUSTNESS_DATA } from '../types';
import { Brain, Database, Zap, AlertTriangle } from 'lucide-react';

const StatCard = ({ title, value, subtext, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
        <p className="text-xs text-slate-400 mt-2">{subtext}</p>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">System Overview</h2>
           <p className="text-slate-500">Performance metrics based on 5216 training / 624 test images (Pneumonia MNIST).</p>
        </div>
        <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
            System Status: Operational
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          title="Diagnostic AUC" 
          value="0.95" 
          subtext="Ours (Linear Probe, 500-shot)" 
          icon={Brain} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Data Efficiency" 
          value="+15%" 
          subtext="Improvement over Baseline" 
          icon={Database} 
          color="bg-indigo-500" 
        />
        <StatCard 
          title="Inference Speed" 
          value="184ms" 
          subtext="Average latency per scan" 
          icon={Zap} 
          color="bg-amber-500" 
        />
        <StatCard 
          title="Robustness" 
          value="0.85" 
          subtext="AUC at 0.5 Gaussian Noise" 
          icon={AlertTriangle} 
          color="bg-rose-500" 
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scaling Law Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Data Efficiency Analysis (Scaling Law)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={SCALING_LAW_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="shots" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} label={{ value: 'Training Samples (N-Shot)', position: 'insideBottom', offset: -5, fontSize: 12 }} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={[0.5, 1.0]} />
                <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="scratch" name="ResNet (Scratch)" stroke="#94a3b8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="pretrained" name="ResNet (Pretrained)" stroke="#fbbf24" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="ours" name="Ours (MedVLM)" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Prompt Ablation Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Zero-Shot Prompt Sensitivity</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PROMPT_ABLATION_DATA} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" domain={[0, 1]} stroke="#64748b" fontSize={12} hide />
                <YAxis dataKey="name" type="category" width={120} stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px' }} />
                <Bar dataKey="auc" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={30} label={{ position: 'right', fill: '#334155', fontSize: 12, formatter: (val: number) => val.toFixed(4) }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

       {/* Charts Row 2 */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Robustness Chart */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Robustness Stress Test</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ROBUSTNESS_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="noise" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} label={{ value: 'Gaussian Noise Level (sigma)', position: 'insideBottom', offset: -5, fontSize: 12 }} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={[0.5, 1.0]} />
                <Tooltip contentStyle={{ borderRadius: '8px' }} />
                <defs>
                  <linearGradient id="colorAuc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="auc" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorAuc)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Info Card */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-xl shadow-md text-white flex flex-col justify-center">
            <h3 className="text-xl font-bold mb-2">MedVLM Architecture</h3>
            <p className="text-blue-100 mb-6">
                This system utilizes a hybrid approach combining CLIP for zero-shot recognition, 
                Stable Diffusion for high-fidelity data augmentation, and BLIP for automated medical reporting.
            </p>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                    <div className="text-2xl font-bold">ResNet-18</div>
                    <div className="text-xs text-blue-200">Backbone</div>
                </div>
                <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                    <div className="text-2xl font-bold">ViT-B/32</div>
                    <div className="text-xs text-blue-200">CLIP Model</div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;