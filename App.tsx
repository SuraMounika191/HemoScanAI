
import React, { useState, useEffect } from 'react';
import { CBCData, AnalysisResult, SavedReport } from './types';
import { analyzeCBC } from './utils/anemiaLogic';
import { getAIExplanation } from './services/geminiService';
import CBCForm from './components/CBCForm';
import ResultDisplay from './components/ResultDisplay';
import HistoryList from './components/HistoryList';
import Login from './components/Login';

const App: React.FC = () => {
  const [user, setUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [currentData, setCurrentData] = useState<CBCData | null>(null);
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [history, setHistory] = useState<SavedReport[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('hemoscan_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('hemoscan_history', JSON.stringify(history));
    }
  }, [history]);

  const logout = () => {
    setUser(null);
    setResult(null);
    setCurrentData(null);
    setActiveTab('new');
  };

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to delete all saved reports?")) {
      setHistory([]);
      localStorage.removeItem('hemoscan_history');
    }
  };

  const handlePredict = async (data: CBCData) => {
    setIsLoading(true);
    setCurrentData(data);
    
    // 1. Initial local analysis
    const initialResult = analyzeCBC(data);
    setResult(initialResult);
    
    // Scroll to results area immediately
    setTimeout(() => {
      const el = document.getElementById('result-area');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    try {
      // 2. Fetch AI insights
      const aiData = await getAIExplanation(data, initialResult);
      
      const finalResult: AnalysisResult = { 
        ...initialResult, 
        aiGuidance: aiData.guidance, 
        dietPlan: aiData.diet 
      };
      
      // Update UI with AI findings
      setResult(finalResult);

      // 3. Save full report to history
      const newReport: SavedReport = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        data: data,
        result: finalResult
      };

      setHistory(prev => [newReport, ...prev]);

    } catch (e) {
      console.error("Critical AI Error:", e);
      // Fallback is already handled inside geminiService, but we ensure state is solid here
    } finally {
      setIsLoading(false);
    }
  };

  const viewReportFromHistory = (report: SavedReport) => {
    setCurrentData(report.data);
    setResult(report.result);
    setActiveTab('new');
    setTimeout(() => {
      const el = document.getElementById('result-area');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="min-h-screen pb-20 bg-slate-50">
      {/* Header */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 px-4 md:px-0">
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
              <i className="fas fa-droplet"></i>
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">HemoScan <span className="text-blue-600">AI</span></span>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-4">
            <div className="flex bg-slate-100 p-1 rounded-xl mr-2 sm:mr-4">
              <button 
                onClick={() => setActiveTab('new')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'new' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Analysis
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                History
                {history.length > 0 && (
                  <span className="h-4 w-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-[8px] font-black">
                    {history.length}
                  </span>
                )}
              </button>
            </div>

            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-xs font-semibold text-slate-600 border border-slate-200">
              <i className="fas fa-user-circle text-blue-500"></i>
              {user}
            </div>
            <button 
              onClick={logout}
              className="h-9 w-9 flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm"
              title="Logout"
            >
              <i className="fas fa-power-off text-sm"></i>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
          {activeTab === 'new' ? 'Anemia Risk Analysis' : 'Your Screening History'}
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-slate-500 font-medium">
          {activeTab === 'new' 
            ? 'Enter your CBC markers to receive instant AI-powered screening and clinical guidance.' 
            : 'Access and verify your previously saved screening reports from our local secure database.'}
        </p>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 space-y-12">
        {activeTab === 'new' ? (
          <>
            {!result || isLoading ? (
              <CBCForm onSubmit={handlePredict} isLoading={isLoading} />
            ) : (
              <div className="flex justify-start">
                 <button 
                    onClick={() => {setResult(null); setCurrentData(null);}}
                    className="text-blue-600 bg-blue-50 px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-blue-100 transition-all shadow-sm"
                 >
                    <i className="fas fa-plus"></i>
                    Start New Screening
                 </button>
              </div>
            )}

            <div id="result-area">
              {result && currentData && (
                <ResultDisplay data={currentData} result={result} />
              )}
            </div>
          </>
        ) : (
          <HistoryList 
            history={history} 
            onViewReport={viewReportFromHistory} 
            onClearHistory={clearHistory} 
          />
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-4 mt-20 text-center border-t border-slate-200 pt-8 pb-10">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">Secure Screening Database</p>
        <p className="text-xs text-slate-400 max-w-3xl mx-auto leading-relaxed italic">
          Disclaimer: This application is for screening purposes only and does not replace a professional clinical diagnosis. 
          Your history is stored locally on this device for your privacy.
        </p>
      </footer>
    </div>
  );
};

export default App;
