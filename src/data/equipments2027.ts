import { Equipment } from '../types/maintenance';

export interface AttachedEquipmentItem {
  equipamento: string;
  fabricante: string;
}

export const ATTACHED_EQUIPMENTS_2027: AttachedEquipmentItem[] = [
  { equipamento: 'GA5-03', fabricante: 'Guven' },
  { equipamento: 'GA5-04', fabricante: 'Guven' },
  { equipamento: 'GA5-05', fabricante: 'Guven' },
  { equipamento: 'GA5-06', fabricante: 'Guven' },
  { equipamento: 'GB 8-05', fabricante: 'Guven' },
  { equipamento: 'GB 8-06', fabricante: 'Guven' },
  { equipamento: 'GB 10-01', fabricante: 'Guven' },
  { equipamento: 'GB 10-02', fabricante: 'Guven' },
  { equipamento: 'GB 10-03', fabricante: 'Arlona' },
  { equipamento: 'GB 10-04', fabricante: 'Arlona' },
  { equipamento: 'GB 10-05', fabricante: 'Guven' },
  { equipamento: 'GB 10-06', fabricante: 'Guven' },
  { equipamento: 'GB 12-02', fabricante: 'Guven' },
  { equipamento: 'GB 12-03', fabricante: 'Guven' },
  { equipamento: 'GB 12-04', fabricante: 'Orts' },
  { equipamento: 'GB 12-05', fabricante: 'Orts' },
  { equipamento: 'GB 12-06', fabricante: 'Guven' },
  { equipamento: 'GB 12-07', fabricante: 'Guven' },
  { equipamento: 'GB 12-08', fabricante: 'Orts' },
  { equipamento: 'GB 12-09', fabricante: 'Orts' },
  { equipamento: 'GB14-01', fabricante: 'Arlona' },
  { equipamento: 'GB14-02', fabricante: 'Arlona' },
  { equipamento: 'GB14-03', fabricante: 'Arlona' },
  { equipamento: 'GB 14-04', fabricante: 'Arlona' },
  { equipamento: 'GB 14-05', fabricante: 'Arlona' },
  { equipamento: 'GB 14-06', fabricante: 'Arlona' },
  { equipamento: 'CDMU 117', fabricante: 'Nectar' },
  { equipamento: 'CDMU 118', fabricante: 'Nectar' },
  { equipamento: 'CDMU 119', fabricante: 'Nectar' },
  { equipamento: 'CDMU 120', fabricante: 'Nectar' },
  { equipamento: 'CDMU 121', fabricante: 'Nectar' },
  { equipamento: 'CDMU 122', fabricante: 'Nectar' },
  { equipamento: 'CDMU 123', fabricante: 'Nectar' },
  { equipamento: 'CDMU 124', fabricante: 'Nectar' },
  { equipamento: 'FH7', fabricante: 'Palamenta' },
  { equipamento: 'FH8', fabricante: 'Palamenta' },
  { equipamento: 'C1', fabricante: 'Arlona' },
  { equipamento: 'C2', fabricante: 'Arlona' },
  { equipamento: 'C3', fabricante: 'Arlona' },
  { equipamento: 'C4', fabricante: 'Arlona' },
  { equipamento: 'DOH1', fabricante: 'Palamenta' },
  { equipamento: 'C9', fabricante: 'Arlona' },
  { equipamento: 'SC01', fabricante: 'Breston' },
  { equipamento: 'DC01', fabricante: 'Breston' },
  { equipamento: 'SC02', fabricante: 'Van Trier' },
  { equipamento: 'LC1', fabricante: 'Van Trier' },
  { equipamento: 'LC2', fabricante: 'Van Trier' },
  { equipamento: 'LC3', fabricante: 'Van Trier' },
  { equipamento: 'LC4', fabricante: 'Van Trier' },
  { equipamento: 'LC5', fabricante: 'Van Trier' },
  { equipamento: 'WHC1', fabricante: 'Arlona' },
  { equipamento: 'WHC2', fabricante: 'Arlona' },
  { equipamento: 'WHC3', fabricante: 'Arlona' },
  { equipamento: 'H8', fabricante: 'Nectar' },
  { equipamento: 'H9', fabricante: 'Nectar/ARLONA' },
  { equipamento: 'H10', fabricante: 'Nectar/ARLONA' },
  { equipamento: 'H11', fabricante: 'Nectar' },
  { equipamento: 'H12', fabricante: 'Nectar' },
  { equipamento: 'H13', fabricante: 'Nectar' },
  { equipamento: 'H14', fabricante: 'Nectar' },
  { equipamento: 'H15', fabricante: 'Nectar' },
  { equipamento: 'FH5', fabricante: 'Palamenta' },
  { equipamento: 'H16', fabricante: 'Arlona' },
  { equipamento: 'H17', fabricante: 'Arlona' },
  { equipamento: 'H18', fabricante: 'Arlona' },
  { equipamento: 'H19', fabricante: 'Arlona' },
  { equipamento: 'H20', fabricante: 'Arlona' },
  { equipamento: 'H21', fabricante: 'Arlona' },
  { equipamento: 'H22', fabricante: 'Arlona' },
];

export function get2027Equipments(monthIndex: number = 0): Equipment[] {
  return ATTACHED_EQUIPMENTS_2027.map((item, index) => {
    const slug = item.equipamento.toLowerCase().replace(/[^a-z0-9]/g, '-');
    return {
      id: `eq-2027-m${monthIndex}-${slug}-${index}`,
      tag: item.equipamento,
      name: `${item.equipamento}`,
      sector: item.fabricante,
      activities: [
        {
          id: `act-2027-m${monthIndex}-${slug}-act1`,
          name: `Manutenção Preventiva / Mecânica (${item.fabricante})`,
          maintenanceType: 'Manutenção Preventiva Mensal',
          frequency: 'Mensal',
          responsible: item.fabricante,
          days: {},
        },
        {
          id: `act-2027-m${monthIndex}-${slug}-act2`,
          name: `Inspeção Operacional / Elétrica (${item.fabricante})`,
          maintenanceType: 'Testes Operacionais',
          frequency: 'Mensal',
          responsible: item.fabricante,
          days: {},
        },
      ],
    };
  });
}

/**
 * Ensures that every equipment has exactly two activity rows for planning.
 */
export function ensureTwoActivitiesPerEquipment(equipments: Equipment[]): Equipment[] {
  return equipments.map((eq) => {
    const acts = [...eq.activities];
    if (acts.length === 0) {
      acts.push({
        id: `act-${eq.id}-1`,
        name: `Manutenção Preventiva / Mecânica (${eq.sector || ''})`,
        maintenanceType: 'Manutenção Preventiva Mensal',
        frequency: 'Mensal',
        responsible: eq.sector || 'Equipe Técnica',
        days: {},
      });
      acts.push({
        id: `act-${eq.id}-2`,
        name: `Inspeção Operacional / Elétrica (${eq.sector || ''})`,
        maintenanceType: 'Testes Operacionais',
        frequency: 'Mensal',
        responsible: eq.sector || 'Equipe Técnica',
        days: {},
      });
    } else if (acts.length === 1) {
      acts.push({
        id: `act-${eq.id}-2`,
        name: `Inspeção Operacional / Elétrica (${eq.sector || ''})`,
        maintenanceType: 'Testes Operacionais',
        frequency: 'Mensal',
        responsible: acts[0].responsible || eq.sector || 'Equipe Técnica',
        days: {},
      });
    } else if (acts.length > 2) {
      return {
        ...eq,
        activities: acts.slice(0, 2),
      };
    }
    return {
      ...eq,
      activities: acts,
    };
  });
}

export function buildAll2027Months(): Record<number, Equipment[]> {
  const result: Record<number, Equipment[]> = {};
  for (let m = 0; m < 12; m++) {
    result[m] = get2027Equipments(m);
  }
  return result;
}
