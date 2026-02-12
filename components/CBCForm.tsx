
import React, { useState } from 'react';
import { CBCData, Gender } from '../types';
import { PARAM_RANGES } from '../constants';

interface CBCFormProps {
  onSubmit: (data: CBCData) => void;
  isLoading: boolean;
}

const CBCForm: React.FC<CBCFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<Partial<CBCData>>({
    gender: Gender.FEMALE,
    age: undefined,
    hemoglobin: undefined,
    rbcCount: undefined,
    mcv: undefined,
    mch: undefined,
    mchc: undefined,
    rdw: undefined,
    hematocrit: undefined
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? undefined : parseFloat(value)) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isComplete = Object.values(formData).every(v => v !== undefined && v !== null);
    if (!isComplete) {
      alert("Please fill in all clinical parameters.");
      return;
    }
    onSubmit(formData as CBCData);
  };

  const fields = [
    { name: 'hemoglobin', label: 'Hemoglobin (Hb)', unit: 'g/dL', min: 2, max: 25, step: 0.1 },
    { name: 'rbcCount', label: 'RBC Count', unit: 'M/µL', min: 1, max: 10, step: 0.01 },
    { name: 'hematocrit', label: 'Hematocrit (Hct)', unit: '%', min: 10, max: 70, step: 0.1 },
    { name: 'mcv', label: 'MCV', unit: 'fL', min: 40, max: 150, step: 0.1 },
    { name: 'mch', label: 'MCH', unit: 'pg', min: 10, max: 50, step: 0.1 },
    { name: 'mchc', label: 'MCHC', unit: 'g/dL', min: 20, max: 45, step: 0.1 },
    { name: 'rdw', label: 'RDW', unit: '%', min: 5, max: 30, step: 0.1 },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="bg-blue-600 px-8 py-6">
        <h2 className="text-xl font-bold text-white">Enter CBC Parameters</h2>
        <p className="text-blue-100 text-sm mt-1">Provide values exactly as seen on your clinical report.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 block">Gender</label>
            <select 
              name="gender" 
              value={formData.gender} 
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
            >
              <option value={Gender.MALE}>Male</option>
              <option value={Gender.FEMALE}>Female</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 block">Age (Years)</label>
            <div className="flex flex-col gap-1">
               <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Entry Range: 1 - 120</span>
               <input 
                 type="number" 
                 name="age" 
                 min="1"
                 max="120"
                 value={formData.age || ''} 
                 onChange={handleChange}
                 placeholder="e.g. 25"
                 className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
               />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {fields.map(field => {
            return (
              <div key={field.name} className="space-y-2">
                <div className="flex flex-col">
                  <label className="text-sm font-bold text-slate-700 leading-tight">
                    {field.label}
                  </label>
                  <div className="mt-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">
                      LIMIT: {field.min} - {field.max} {field.unit}
                    </span>
                  </div>
                </div>
                <input 
                  type="number"
                  name={field.name}
                  value={formData[field.name as keyof CBCData] === undefined ? '' : formData[field.name as keyof CBCData] as number}
                  onChange={handleChange}
                  step={field.step}
                  min={field.min}
                  max={field.max}
                  required
                  placeholder={`${field.min}-${field.max}`}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-slate-300 text-sm font-medium"
                />
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-8">
          <div className="flex items-center text-slate-400 text-[10px] font-medium uppercase tracking-wider">
            <i className="fas fa-shield-alt mr-2 text-green-500"></i>
            Entry Bounds Active
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full sm:w-auto px-10 py-3.5 rounded-xl font-bold text-white shadow-lg flex items-center justify-center transition-all ${
              isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
            }`}
          >
            {isLoading ? (
              <>
                <i className="fas fa-circle-notch fa-spin mr-2"></i>
                Processing...
              </>
            ) : (
              <>
                Analyze Markers
                <i className="fas fa-arrow-right ml-2"></i>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CBCForm;
