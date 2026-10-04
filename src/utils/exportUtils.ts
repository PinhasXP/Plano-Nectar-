import { Equipment } from '../types/maintenance';
import { DayInfo, MONTH_NAMES } from './dateUtils';

export function exportMonthToCSV(
  equipments: Equipment[],
  days: DayInfo[],
  monthIndex: number,
  year: number
): void {
  const monthName = MONTH_NAMES[monthIndex];
  
  // Header row
  const headers = [
    'Setor',
    'TAG',
    'EQUIPAMENTOS',
    'Actividade planificada',
    'Tipo de Manutenção',
    'Frequência',
    'Responsável',
    ...days.map((d) => `Dia ${String(d.dayNumber).padStart(2, '0')} (${d.weekdayShort})`),
    'Total Planejado',
    'Total Realizado',
    '% Conclusão',
  ];

  const rows: string[][] = [];

  equipments.forEach((eq) => {
    eq.activities.forEach((act) => {
      let plannedCount = 0;
      let completedCount = 0;

      const dayCells = days.map((d) => {
        const cell = act.days[d.dayNumber];
        const status = cell?.status || '';
        if (status === 'P') plannedCount++;
        if (status === 'OK') {
          plannedCount++;
          completedCount++;
        }
        return status;
      });

      const rate = plannedCount > 0 ? `${Math.round((completedCount / plannedCount) * 100)}%` : '0%';

      rows.push([
        eq.sector,
        eq.tag,
        eq.name,
        act.name,
        act.maintenanceType || 'Não definido',
        act.frequency || '',
        act.responsible,
        ...dayCells,
        String(plannedCount),
        String(completedCount),
        rate,
      ]);
    });
  });

  const escapeCSV = (val: string) => {
    const stringVal = String(val ?? '');
    if (stringVal.includes(';') || stringVal.includes('"') || stringVal.includes('\n')) {
      return `"${stringVal.replace(/"/g, '""')}"`;
    }
    return stringVal;
  };

  const csvContent =
    '\uFEFF' + // UTF-8 BOM for Excel
    [headers.map(escapeCSV).join(';'), ...rows.map((row) => row.map(escapeCSV).join(';'))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `plano_manutencao_${monthName.toLowerCase()}_${year}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
