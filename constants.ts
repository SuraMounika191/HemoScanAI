
import { Gender } from './types';

export const PARAM_RANGES: Record<string, { male: [number, number], female: [number, number], unit: string, label: string }> = {
  hemoglobin: {
    male: [13.5, 17.5],
    female: [12.0, 15.5],
    unit: 'g/dL',
    label: 'Hemoglobin (Hb)'
  },
  rbcCount: {
    male: [4.5, 5.9],
    female: [4.1, 5.1],
    unit: 'million/µL',
    label: 'RBC Count'
  },
  mcv: {
    male: [80, 100],
    female: [80, 100],
    unit: 'fL',
    label: 'MCV'
  },
  mch: {
    male: [27, 33],
    female: [27, 33],
    unit: 'pg',
    label: 'MCH'
  },
  mchc: {
    male: [32, 36],
    female: [32, 36],
    unit: 'g/dL',
    label: 'MCHC'
  },
  rdw: {
    male: [11.5, 14.5],
    female: [11.5, 14.5],
    unit: '%',
    label: 'RDW'
  },
  hematocrit: {
    male: [41, 50],
    female: [36, 44],
    unit: '%',
    label: 'Hematocrit'
  }
};
