
export enum AnemiaSeverity {
  NORMAL = 'Normal',
  MILD = 'Mild',
  MODERATE = 'Moderate',
  SEVERE = 'Severe'
}

export enum RiskLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female'
}

export interface CBCData {
  gender: Gender;
  age: number;
  hemoglobin: number; // Hb
  rbcCount: number; // RBC
  mcv: number; // Mean Corpuscular Volume
  mch: number; // Mean Corpuscular Hemoglobin
  mchc: number; // Mean Corpuscular Hemoglobin Concentration
  rdw: number; // Red Cell Distribution Width
  hematocrit: number; // Hct
}

export interface DietMeal {
  meal: string;
  suggestions: string[];
}

export interface AnalysisResult {
  isAnemic: boolean;
  severity: AnemiaSeverity;
  riskLevel: RiskLevel;
  type: string; 
  explanations: string[];
  aiGuidance?: string;
  dietPlan?: DietMeal[];
}

export interface SavedReport {
  id: string;
  timestamp: number;
  data: CBCData;
  result: AnalysisResult;
}

export interface ParameterRange {
  name: string;
  min: number;
  max: number;
  unit: string;
}
