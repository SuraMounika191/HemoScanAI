
import React from 'react';
import { CBCData, AnalysisResult, AnemiaSeverity, RiskLevel } from '../types';
import { PARAM_RANGES } from '../constants';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, ReferenceLine
} from 'recharts';

interface ResultDisplayProps {
  data: CBCData;
  result: AnalysisResult;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ data, result }) => {
  const getSeverityColor = (sev: AnemiaSeverity) => {
    switch (sev) {
      case AnemiaSeverity.NORMAL: return 'bg-green-100 text-green-700 border-green-200';
      case AnemiaSeverity.MILD: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case AnemiaSeverity.MODERATE: return 'bg-orange-100 text-orange-700 border-orange-200';
      case AnemiaSeverity.SEVERE: return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getDietHeaderStyles = () => {
    if (!result.isAnemic) return { bg: 'bg-blue-600', text: 'Wellness & Maintenance Plan', icon: 'fa-hand-holding-heart', sub: 'Continue your current balanced diet and stay fit!' };
    switch (result.severity) {
      case AnemiaSeverity.SEVERE: return { bg: 'bg-red-700', text: 'Intensive Clinical Recovery Plan', icon: 'fa-hospital-user', sub: 'Critical nutritional intervention for severe deficiency' };
      case AnemiaSeverity.MODERATE: return { bg: 'bg-orange-600', text: 'Active Therapeutic Diet', icon: 'fa-shield-virus', sub: 'Focused iron-building strategy' };
      default: return { bg: 'bg-emerald-600', text: 'Nutritional Support Plan', icon: 'fa-leaf', sub: 'Gentle dietary correction for mild anemia' };
    }
  };

  const getRiskColor = (risk: RiskLevel) => {
    switch (risk) {
      case RiskLevel.LOW: return 'text-green-600';
      case RiskLevel.MEDIUM: return 'text-orange-600';
      case RiskLevel.HIGH: return 'text-red-600';
      default: return 'text-slate-600';
    }
  };

  const hbRange = data.gender === 'Male' ? PARAM_RANGES.hemoglobin.male : PARAM_RANGES.hemoglobin.female;
  const hbMean = (hbRange[0] + hbRange[1]) / 2;
  const hbSD = (hbRange[1] - hbRange[0]) / 4;

  const generateDistributionData = () => {
    const points = [];
    const min = hbMean - 4 * hbSD;
    const max = hbMean + 4 * hbSD;
    for (let i = min; i <= max; i += (max - min) / 60) {
      const y = (1 / (hbSD * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((i - hbMean) / hbSD, 2));
      points.push({ 
        x: parseFloat(i.toFixed(1)), 
        y: y,
        isAnemicZone: i < hbRange[0] ? y : 0,
        isHealthyZone: i >= hbRange[0] ? y : 0
      });
    }
    return points;
  };

  const distributionData = generateDistributionData();

  const getMealIcon = (meal: string) => {
    const lower = meal.toLowerCase();
    if (lower.includes('breakfast')) return 'fa-coffee';
    if (lower.includes('lunch')) return 'fa-hamburger';
    if (lower.includes('dinner')) return 'fa-utensils';
    if (lower.includes('wellness') || lower.includes('advice') || lower.includes('tip')) return 'fa-heart-pulse';
    return 'fa-apple-alt';
  };

  const mainParams = [
    { key: 'hemoglobin', label: 'Hemoglobin', unit: 'g/dL' },
    { key: 'rbcCount', label: 'RBC Count', unit: 'M/µL' },
    { key: 'mcv', label: 'MCV (Size)', unit: 'fL' },
    { key: 'rdw', label: 'RDW (Variation)', unit: '%' },
  ];

  const dietStyles = getDietHeaderStyles();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Prediction Summary */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className={`px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-6 border-b ${result.isAnemic ? 'bg-red-50/50' : 'bg-green-50/50'}`}>
          <div className="flex items-center gap-5">
            <div className={`h-16 w-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm ${result.isAnemic ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
              <i className={result.isAnemic ? "fas fa-exclamation-circle" : "fas fa-heart"}></i>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800">
                {result.isAnemic ? 'Anemia Detected' : 'Your Levels are Healthy'}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-slate-500 text-sm font-medium">{result.isAnemic ? result.type : "Normal Blood Morphology"}</span>
                <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                <span className="text-slate-400 text-xs italic">Based on WHO Reference Standards</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <div className={`px-5 py-2 rounded-xl text-sm font-bold border-2 ${getSeverityColor(result.severity)}`}>
              {result.severity.toUpperCase()} SEVERITY
            </div>
            <div className="px-5 py-2 rounded-xl text-sm font-bold bg-white border-2 border-slate-200 text-slate-700 shadow-sm">
              <span className="text-slate-400 mr-1">RISK:</span> 
              <span className={getRiskColor(result.riskLevel)}>{result.riskLevel.toUpperCase()}</span>
            </div>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div>
              <h4 className="font-bold text-slate-800 text-lg flex items-center mb-1">
                <i className="fas fa-chart-area mr-2 text-blue-500"></i>
                The Population Map
              </h4>
              <p className="text-sm text-slate-500 mb-6">See how your Hemoglobin compares to healthy peers.</p>
              
              <div className="h-[280px] w-full bg-slate-50 rounded-2xl p-6 border border-slate-100 relative">
                <div className="absolute top-4 left-6 px-2 py-1 bg-red-100 rounded text-[10px] font-bold text-red-600 uppercase tracking-tighter">Anemic Zone</div>
                <div className="absolute top-4 right-6 px-2 py-1 bg-green-100 rounded text-[10px] font-bold text-green-600 uppercase tracking-tighter">Healthy Zone</div>

                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={distributionData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAnemic" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorHealthy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22C55E" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="x" tick={{fontSize: 10}} label={{ value: 'Hb (g/dL)', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                    <YAxis hide />
                    <Tooltip 
                      content={({ payload }) => {
                        if (payload && payload.length) {
                          const val = payload[0].payload.x;
                          return <div className="bg-white px-2 py-1 shadow-md border rounded text-[10px]">{val} g/dL</div>;
                        }
                        return null;
                      }}
                    />
                    <Area type="monotone" dataKey="isAnemicZone" stroke="#EF4444" fillOpacity={1} fill="url(#colorAnemic)" isAnimationActive={true} />
                    <Area type="monotone" dataKey="isHealthyZone" stroke="#22C55E" fillOpacity={1} fill="url(#colorHealthy)" isAnimationActive={true} />
                    <ReferenceLine 
                      x={data.hemoglobin} 
                      stroke="#1E293B" 
                      strokeWidth={4} 
                      label={{ 
                        position: 'top', 
                        value: `YOU (${data.hemoglobin})`, 
                        fill: '#1E293B', 
                        fontSize: 12, 
                        fontWeight: '900',
                        offset: 10
                      }} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-5">
              <h4 className="font-bold text-slate-800 text-lg flex items-center">
                <i className="fas fa-tachometer-alt mr-2 text-indigo-500"></i>
                Detailed Markers
              </h4>
              <div className="grid grid-cols-1 gap-4">
                {mainParams.map((param) => {
                  const val = data[param.key as keyof CBCData] as number;
                  const range = data.gender === 'Male' ? PARAM_RANGES[param.key].male : PARAM_RANGES[param.key].female;
                  const percent = ((val - (range[0] * 0.7)) / (range[1] * 1.3 - range[0] * 0.7)) * 100;
                  const isSafe = val >= range[0] && val <= range[1];
                  
                  return (
                    <div key={param.key} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-slate-700">{param.label}</span>
                        <span className={`text-sm font-mono font-bold ${isSafe ? 'text-green-600' : 'text-red-600'}`}>
                          {val} <span className="text-[10px] text-slate-400 uppercase">{param.unit}</span>
                        </span>
                      </div>
                      <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden mb-1">
                        <div 
                          className="absolute h-full bg-green-100 border-x border-green-200"
                          style={{ left: '30%', width: '40%' }}
                        ></div>
                        <div 
                          className={`absolute h-full rounded-full transition-all duration-1000 ${isSafe ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.max(5, Math.min(100, percent))}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                        <span>LOW</span>
                        <span className="text-green-600 font-bold">NORMAL RANGE</span>
                        <span>HIGH</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-slate-900 rounded-2xl p-7 text-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <i className="fas fa-brain text-6xl"></i>
              </div>
              <h4 className="font-bold text-xl flex items-center mb-6">
                <i className="fas fa-robot mr-3 text-blue-400"></i>
                Clinical Findings
              </h4>
              <ul className="space-y-4">
                {result.explanations.map((exp, i) => (
                  <li key={i} className="flex items-start gap-4 text-sm text-slate-300">
                    <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 text-blue-400">
                      <i className="fas fa-check text-[10px]"></i>
                    </div>
                    <span className="leading-relaxed">{exp}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-indigo-50 rounded-2xl p-7 border border-indigo-100">
              <h4 className="font-bold text-indigo-900 flex items-center mb-4">
                <i className="fas fa-lightbulb mr-3 text-indigo-500"></i>
                AI Clinical Advice
              </h4>
              {result.aiGuidance ? (
                <div className="text-sm text-indigo-800 leading-relaxed prose-sm">
                  {result.aiGuidance}
                </div>
              ) : (
                <div className="flex items-center gap-4 text-indigo-400 py-4">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-.5s]"></div>
                  </div>
                  <p className="text-sm font-medium italic">Generating data-driven insights...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Personalized Improvement Path & Targets */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100">
          <h4 className="font-bold text-slate-800 text-lg flex items-center">
            <i className="fas fa-bullseye mr-3 text-red-500"></i>
            Personalized Health Targets
          </h4>
          <p className="text-sm text-slate-500 mt-1">Exact improvements required to reach your optimal health state.</p>
        </div>
        <div className="p-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {mainParams.map((param) => {
                const val = data[param.key as keyof CBCData] as number;
                const range = data.gender === 'Male' ? PARAM_RANGES[param.key].male : PARAM_RANGES[param.key].female;
                const isBelow = val < range[0];
                const diff = (range[0] - val).toFixed(2);
                
                return (
                  <div key={param.key} className={`p-6 rounded-2xl border transition-all ${isBelow ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-1">{param.label}</span>
                        <div className="flex items-baseline gap-2">
                           <span className={`text-2xl font-black ${isBelow ? 'text-red-600' : 'text-green-600'}`}>{val}</span>
                           <span className="text-slate-400 text-sm font-medium">{param.unit}</span>
                        </div>
                      </div>
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isBelow ? 'bg-red-500 text-white' : 'bg-green-500 text-white shadow-sm'}`}>
                         <i className={`fas ${isBelow ? 'fa-arrow-up' : 'fa-check'}`}></i>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                       <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-500">Your Current Level:</span>
                          <span className={isBelow ? 'text-red-500' : 'text-green-500'}>{val} {param.unit}</span>
                       </div>
                       <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-500">Target Range ({data.gender}):</span>
                          <span className="text-slate-700">{range[0]} - {range[1]} {param.unit}</span>
                       </div>
                       <div className="pt-3 border-t border-slate-200 mt-3">
                          {isBelow ? (
                            <div className="flex items-center gap-2 text-red-700">
                               <i className="fas fa-info-circle text-xs"></i>
                               <p className="text-sm font-bold">
                                 Increase your level by <span className="underline decoration-2">{diff} {param.unit}</span> to reach the healthy threshold.
                               </p>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-green-700">
                               <i className="fas fa-star text-xs"></i>
                               <p className="text-sm font-bold">
                                 Current level is optimal. Continue current lifestyle to maintain this status.
                               </p>
                            </div>
                          )}
                       </div>
                    </div>
                  </div>
                );
              })}
           </div>
           
           {!result.isAnemic && (
             <div className="mt-8 p-6 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-6">
                <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl flex-shrink-0 shadow-lg">
                   <i className="fas fa-glass-water"></i>
                </div>
                <div>
                   <h5 className="font-bold text-blue-900 text-lg">Maintaining Your Peak Performance</h5>
                   <p className="text-blue-700 text-sm leading-relaxed">
                     Your markers are currently excellent! Focus on consistency: stay hydrated, maintain a balanced diet, and keep up your current activity levels to stay healthy.
                   </p>
                </div>
             </div>
           )}
        </div>
      </div>

      {/* Dynamic Diet Plan Section */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className={`${dietStyles.bg} px-8 py-8 flex items-center justify-between transition-colors`}>
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">
              {dietStyles.text}
            </h3>
            <p className="text-white/80 text-sm">
              {dietStyles.sub}
            </p>
          </div>
          <div className="h-14 w-14 bg-white/20 rounded-2xl flex items-center justify-center text-white text-3xl">
            <i className={`fas ${dietStyles.icon}`}></i>
          </div>
        </div>
        
        <div className="p-8">
          {!result.dietPlan ? (
             <div className="flex flex-col items-center justify-center py-16 text-slate-400">
               <div className="relative mb-6">
                 <div className={`w-12 h-12 border-4 ${result.isAnemic ? 'border-red-100 border-t-red-500' : 'border-blue-100 border-t-blue-500'} rounded-full animate-spin`}></div>
               </div>
               <p className="font-medium">Building a custom strategy for your {result.severity.toLowerCase()} levels...</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {result.dietPlan.map((item, idx) => (
                <div key={idx} className={`bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:shadow-md transition-all group ${result.isAnemic ? 'hover:border-red-200' : 'hover:border-blue-200'}`}>
                  <div className={`h-12 w-12 bg-white shadow-sm rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform ${result.isAnemic ? 'text-red-600' : 'text-blue-600'}`}>
                    <i className={`fas ${getMealIcon(item.meal)} text-lg`}></i>
                  </div>
                  <h5 className="font-bold text-slate-800 text-lg mb-4 border-b border-slate-200 pb-2">{item.meal}</h5>
                  <ul className="space-y-3">
                    {item.suggestions.map((s, si) => (
                      <li key={si} className="text-sm text-slate-600 flex items-start gap-3">
                        <i className={`fas fa-plus-circle text-[10px] mt-1 ${result.isAnemic ? 'text-red-500' : 'text-blue-500'}`}></i>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-6">
        <button 
          onClick={() => window.location.reload()}
          className="w-full sm:w-auto bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-xl flex items-center justify-center gap-3"
        >
          <i className="fas fa-redo"></i>
          New Analysis
        </button>
        <button 
          onClick={() => window.print()}
          className="w-full sm:w-auto bg-white text-slate-900 px-10 py-4 rounded-2xl font-bold border-2 border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
        >
          <i className="fas fa-print"></i>
          Save Report
        </button>
      </div>
    </div>
  );
};

export default ResultDisplay;
