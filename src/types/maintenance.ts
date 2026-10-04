export const MAINTENANCE_TYPES = [
  'Manutenção Preventiva Mensal',
  'Manutenção Preventiva Anual',
  'Testes Operacionais',
  'Revisão do Sistema Hidráulico - Troca de Óleo',
  'Grandes Intervenções',
] as const;

export type MaintenanceType = (typeof MAINTENANCE_TYPES)[number];

export type StandardStatus = 'P' | 'OK' | 'PEND' | 'C' | '';

export interface CellData {
  status: string; // 'P' (Planejado), 'OK' (Realizado), 'PEND' (Pendente), 'C' (Cancelado), or custom text
  notes?: string;
  technician?: string;
  updatedAt?: string;
}

export type FrequencyType = 'Diária' | 'Semanal' | 'Quinzenal' | 'Mensal' | 'Bimestral' | 'Trimestral' | 'Semestral' | 'Anual';

export interface Activity {
  id: string;
  name: string;
  maintenanceType: MaintenanceType | string;
  frequency?: FrequencyType | string;
  responsible: string;
  days: Record<number, CellData>; // key: day of month (1..31)
}

export interface Equipment {
  id: string;
  name: string;
  tag: string;
  sector: string;
  activities: Activity[];
}

export interface MonthData {
  equipments: Equipment[];
  notes?: string;
}

export type YearData = Record<number, Equipment[]>; // month index 0..11 -> Equipment[]

export interface StorageData {
  version: number;
  currentYear: number;
  currentMonth: number; // 0..11
  years: Record<number, YearData>; // year (e.g. 2026) -> MonthData
  lastSaved?: string;
}
