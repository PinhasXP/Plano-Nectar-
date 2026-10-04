import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from './config';
import { DailyActivity } from '../types/dailyPlan';
import { handleFirestoreError, OperationType } from './errors';

export function getDailyPlanStorageKey(date: string): string {
  return `daily_plan_${date}`;
}

export function getInitialDailyActivities(date: string): DailyActivity[] {
  // Sample initial activities for the day if first time opening
  return [
    {
      id: `daily-act-1`,
      equipment: 'CP-01 - Compressor de Ar Atlas Copco',
      description: 'Drenagem de condensados, inspeção de vazamento e troca de elemento filtrante do ar de admissão.',
      origin: 'Manutenção Preventiva',
      technicians: 'Carlos Silva (Mecânico), João Paulo (Auxiliar)',
      estimatedDuration: '02h 30m',
      estimatedCompletion: '11:30',
      status: 'Em progresso',
      comments: 'Manômetro de pressão diferencial do filtro operando na faixa amarela. Providenciar reserva.',
    },
    {
      id: `daily-act-2`,
      equipment: 'BC-01 - Bomba Centrífuga de Resfriamento',
      description: 'Análise de vibração no mancal lado acoplamento e medição de temperatura por infravermelho.',
      origin: 'Manutenção Preditiva',
      technicians: 'Roberto Lima (Preditiva)',
      estimatedDuration: '01h 00m',
      estimatedCompletion: '14:00',
      status: 'Continua',
      comments: 'Equipamento em operação plena. Vibração dentro da zona B da norma ISO 10816.',
    },
    {
      id: `daily-act-3`,
      equipment: 'TR-01 - Ponte Rolante 20T - Galpão Principal',
      description: 'Inspeção do cabo de aço de elevação, lubrificação de guias e teste dos fins de curso elétricos.',
      origin: 'Solicitação da Operação',
      technicians: 'Marcos Souza (Eletricista)',
      estimatedDuration: '03h 00m',
      estimatedCompletion: '16:30',
      status: 'Replanificado',
      comments: 'Aguardando liberação da equipe de produção às 13h30 para isolar a baia de carga.',
    },
  ];
}

export function subscribeToDailyPlan(
  date: string,
  onData: (activities: DailyActivity[] | null) => void,
  onError?: (error: unknown) => void
): () => void {
  const docRef = doc(db, 'daily_plans', date);

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        onData((data.activities as DailyActivity[]) || []);
      } else {
        onData(null);
      }
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, `daily_plans/${date}`);
    }
  );
}

export async function saveDailyPlanToCloud(
  date: string,
  activities: DailyActivity[]
): Promise<void> {
  const docRef = doc(db, 'daily_plans', date);

  try {
    await setDoc(docRef, {
      date,
      activities,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `daily_plans/${date}`);
  }
}
