export type DailyActivityStatus = 
  | 'Em progresso' 
  | 'Suspenso' 
  | 'Replanificado' 
  | 'Continua' 
  | 'Concluído';

export const DAILY_STATUS_CONFIG: Record<
  DailyActivityStatus, 
  { label: string; bg: string; text: string; border: string; badge: string }
> = {
  'Em progresso': {
    label: 'Em progresso',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  'Suspenso': {
    label: 'Suspenso',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-800 border-red-300',
  },
  'Replanificado': {
    label: 'Replanificado',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  'Continua': {
    label: 'Continua',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    badge: 'bg-purple-100 text-purple-800 border-purple-300',
  },
  'Concluído': {
    label: 'Concluído',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
};

export const DAILY_ORIGINS = [
  'Manutenção Preventiva',
  'Manutenção Corretiva',
  'Manutenção Preditiva',
  'Inspeção / Rota',
  'Solicitação da Operação',
  'Melhoria / Reforma',
  'Testes Operacionais',
  'Outro',
] as const;

export type DailyOrigin = typeof DAILY_ORIGINS[number];

export interface DailyActivity {
  id: string;
  equipment: string;            // Ex: "CP-01 - Compressor de Ar Parafuso"
  description: string;          // Descrição da Manutenção
  origin: string;               // Origem (Preventiva, Corretiva, etc.)
  technicians: string;          // Técnicos Alocados na Manutenção
  estimatedDuration: string;    // Tempo previsto da actividade (ex: "02h 30m")
  estimatedCompletion: string;  // Previsão de Finalização (ex: "16:30")
  status: DailyActivityStatus;  // Estado da actividade
  comments: string;             // Comentários adicionais
  createdAt?: string;
  updatedAt?: string;
}

export interface DailyPlanData {
  date: string; // YYYY-MM-DD
  activities: DailyActivity[];
  updatedAt?: string;
}
