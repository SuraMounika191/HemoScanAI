
import React from 'react';
import { SavedReport, AnemiaSeverity } from '../types';

interface HistoryListProps {
  history: SavedReport[];
  onViewReport: (report: SavedReport) => void;
  onClearHistory: () => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ history, onViewReport, onClearHistory }) => {
  if (history.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-xl">
        <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 text-3xl mx-auto mb-6">
          <i className="fas fa-history"></i>
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">No Screening History</h3>
        <p className="text-slate-500 max-w-xs mx-auto">Your past analyses will appear here once you perform a screening.</p>
      </div>
    );
  }

  const getSeverityBadge = (sev: AnemiaSeverity) => {
    switch (sev) {
      case AnemiaSeverity.NORMAL: return 'bg-green-100 text-green-700';
      case AnemiaSeverity.MILD: return 'bg-yellow-100 text-yellow-700';
      case AnemiaSeverity.MODERATE: return 'bg-orange-100 text-orange-700';
      case AnemiaSeverity.SEVERE: return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
          <i className="fas fa-database text-blue-600"></i>
          Saved Reports
          <span className="bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-black">
            {history.length} Records
          </span>
        </h3>
        <button 
          onClick={onClearHistory}
          className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
        >
          <i className="fas fa-trash-alt"></i>
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {history.map((item) => (
          <div 
            key={item.id} 
            className="group bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
            onClick={() => onViewReport(item)}
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <i className="fas fa-file-medical text-6xl"></i>
            </div>
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                  {new Date(item.timestamp).toLocaleDateString()} at {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <h4 className="font-bold text-slate-800 mt-1">
                  Hb: {item.data.hemoglobin} g/dL
                </h4>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider ${getSeverityBadge(item.result.severity)}`}>
                {item.result.severity}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500 font-medium mb-4">
              <span className="flex items-center gap-1">
                <i className="fas fa-venus-mars text-blue-400"></i>
                {item.data.gender}
              </span>
              <span className="h-1 w-1 rounded-full bg-slate-300"></span>
              <span className="flex items-center gap-1">
                <i className="fas fa-calendar-alt text-blue-400"></i>
                {item.data.age} yrs
              </span>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
               <span className="text-[10px] text-slate-400 font-bold uppercase italic">
                 {item.result.isAnemic ? item.result.type : "Healthy Profile"}
               </span>
               <div className="h-8 w-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <i className="fas fa-chevron-right text-xs"></i>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryList;
