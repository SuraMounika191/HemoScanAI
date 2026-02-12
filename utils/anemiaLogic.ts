
import { CBCData, AnalysisResult, AnemiaSeverity, RiskLevel, Gender } from '../types';
import { PARAM_RANGES } from '../constants';

export const analyzeCBC = (data: CBCData): AnalysisResult => {
  const { hemoglobin, gender, mcv, rbcCount, mchc, rdw } = data;
  const hbRange = gender === Gender.MALE ? PARAM_RANGES.hemoglobin.male : PARAM_RANGES.hemoglobin.female;
  
  const isAnemic = hemoglobin < hbRange[0];
  let severity = AnemiaSeverity.NORMAL;
  let riskLevel = RiskLevel.LOW;
  let type = "N/A";
  const explanations: string[] = [];

  // Clinical Datasets logic: Mentzer Index (MCV / RBC)
  // Index < 13 suggests Thalassemia trait, > 13 suggests Iron Deficiency
  const mentzerIndex = rbcCount > 0 ? (mcv / rbcCount) : 0;

  if (isAnemic) {
    // Severity mapping based on WHO Clinical Dataset thresholds
    if (hemoglobin >= 11) severity = AnemiaSeverity.MILD;
    else if (hemoglobin >= 8) severity = AnemiaSeverity.MODERATE;
    else severity = AnemiaSeverity.SEVERE;

    // Risk mapping influenced by severity and RDW (Red cell Distribution Width)
    // High RDW + Low Hb is a strong indicator of nutritional deficiency (Dataset: NHANES)
    if (severity === AnemiaSeverity.SEVERE) riskLevel = RiskLevel.HIGH;
    else if (severity === AnemiaSeverity.MODERATE || rdw > 16) riskLevel = RiskLevel.MEDIUM;
    else riskLevel = RiskLevel.LOW;

    // Advanced Morphology classification
    if (mcv < 80) {
      if (mentzerIndex < 13 && rbcCount > 5) {
        type = "Microcytic (Possible Thalassemia Trait)";
        explanations.push("Mentzer Index is " + mentzerIndex.toFixed(1) + " (< 13). This frequently indicates Thalassemia trait rather than simple iron deficiency.");
      } else {
        type = "Microcytic Hypochromic";
        explanations.push("Mentzer Index is " + mentzerIndex.toFixed(1) + " (> 13). This is highly suggestive of Iron Deficiency Anemia.");
      }
    } else if (mcv > 100) {
      type = "Macrocytic";
      explanations.push("Elevated MCV suggests Megaloblastic Anemia, often linked to Vitamin B12 or Folate deficiency datasets.");
    } else {
      type = "Normocytic";
      explanations.push("Normal cell size but low count suggests blood loss, chronic disease, or early-stage deficiency.");
    }

    if (mchc < 32) {
      explanations.push("Hypochromic markers detected (low MCHC), common in chronic iron depletion.");
    }
  } else {
    explanations.push("Hemoglobin is within healthy demographic bounds based on reference datasets.");
    if (rdw > 15) {
      explanations.push("Warning: Elevated RDW (Anisocytosis) detected. This can be an early warning sign of developing deficiency before Hb drops.");
    }
  }

  return { isAnemic, severity, riskLevel, type, explanations };
};
