import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from './config';
import { Equipment } from '../types/maintenance';
import { handleFirestoreError, OperationType } from './errors';

export function getMonthPlanDocId(year: number, month: number): string {
  return `${year}_${month}`;
}

export function subscribeToMonthlyPlan(
  year: number,
  month: number,
  onData: (equipments: Equipment[] | null) => void,
  onError?: (error: unknown) => void
): () => void {
  const planId = getMonthPlanDocId(year, month);
  const docRef = doc(db, 'monthly_plans', planId);

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        onData((data.equipments as Equipment[]) || []);
      } else {
        onData(null);
      }
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, `monthly_plans/${planId}`);
    }
  );
}

export async function saveMonthlyPlanToCloud(
  year: number,
  month: number,
  equipments: Equipment[]
): Promise<void> {
  const planId = getMonthPlanDocId(year, month);
  const docRef = doc(db, 'monthly_plans', planId);

  try {
    await setDoc(docRef, {
      year,
      month,
      equipments,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `monthly_plans/${planId}`);
  }
}
