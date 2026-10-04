import { Equipment, StorageData, YearData, MAINTENANCE_TYPES } from '../types/maintenance';
import { getDefaultEquipments } from '../data/defaultData';
import { buildAll2027Months, get2027Equipments } from '../data/equipments2027';

const STORAGE_KEY = 'industrial_maintenance_plan_v2';
const CURRENT_VERSION = 2;

export function getInitialStorageData(): StorageData {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StorageData;
      if (parsed && parsed.years) {
        // Ensure 2027 has all 12 months with the attached 69 equipments
        if (!parsed.years[2027]) {
          parsed.years[2027] = buildAll2027Months();
        } else {
          for (let m = 0; m < 12; m++) {
            if (!parsed.years[2027][m] || parsed.years[2027][m].length === 0) {
              parsed.years[2027][m] = get2027Equipments(m);
            }
          }
        }

        // Set default to 2027 as requested
        if (!parsed.currentYear || parsed.currentYear < 2027) {
          parsed.currentYear = 2027;
        }

        // Ensure all activities have a valid maintenanceType
        let hasChanges = false;
        Object.values(parsed.years).forEach((yearData) => {
          Object.values(yearData).forEach((equipments) => {
            equipments.forEach((eq, eqIdx) => {
              eq.activities.forEach((act, actIdx) => {
                if (!act.maintenanceType) {
                  act.maintenanceType = MAINTENANCE_TYPES[actIdx % MAINTENANCE_TYPES.length];
                  hasChanges = true;
                }
              });
            });
          });
        });

        saveStorageData(parsed);
        return parsed;
      }
    }
  } catch (error) {
    console.error('Falha ao carregar dados do localStorage:', error);
  }

  // Create initial data structure if not exists
  const initialEquipments = getDefaultEquipments();
  const initialYearData: YearData = {};
  
  // Fill current month with default equipment
  initialYearData[currentMonth] = initialEquipments;

  const defaultData: StorageData = {
    version: CURRENT_VERSION,
    currentYear: 2027,
    currentMonth: 0, // Janeiro de 2027
    years: {
      2026: initialYearData,
      2027: buildAll2027Months(),
    },
    lastSaved: new Date().toISOString(),
  };

  saveStorageData(defaultData);
  return defaultData;
}

export function saveStorageData(data: StorageData): void {
  try {
    const dataToSave: StorageData = {
      ...data,
      lastSaved: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (error) {
    console.error('Erro ao salvar no localStorage:', error);
  }
}

export function resetToDefaults(): StorageData {
  const initialEquipments = getDefaultEquipments();
  const defaultData: StorageData = {
    version: CURRENT_VERSION,
    currentYear: 2027,
    currentMonth: 0,
    years: {
      2026: {
        0: initialEquipments,
      },
      2027: buildAll2027Months(),
    },
    lastSaved: new Date().toISOString(),
  };

  saveStorageData(defaultData);
  return defaultData;
}

export function exportBackupJSON(data: StorageData): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `plano_manutencao_backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseImportJSON(fileContent: string): StorageData {
  const parsed = JSON.parse(fileContent);
  if (!parsed.years || typeof parsed.currentYear !== 'number') {
    throw new Error('Arquivo de backup inválido.');
  }
  return parsed as StorageData;
}
