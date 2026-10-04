import React from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { MONTH_NAMES, MONTH_SHORT_NAMES } from '../utils/dateUtils';
import { YearData } from '../types/maintenance';

interface MonthSelectorProps {
  currentYear: number;
  currentMonth: number;
  yearData: YearData;
  onSelectMonth: (monthIndex: number) => void;
  onChangeYear: (newYear: number) => void;
  onCopyMonthToNext?: () => void;
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({
  currentYear,
  currentMonth,
  yearData,
  onSelectMonth,
  onChangeYear,
}) => {
  return (
    <div className="bg-slate-100/90 border-b border-slate-200 px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 no-print">
      {/* Year Selector */}
      <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-1 shadow-2xs">
        <button
          onClick={() => onChangeYear(currentYear - 1)}
          className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
          title="Ano anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="px-2 text-xs font-bold font-mono text-slate-800 tracking-wider">
          {currentYear}
        </span>
        <button
          onClick={() => onChangeYear(currentYear + 1)}
          className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
          title="Próximo ano"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Month Sheet Tabs */}
      <div className="flex-1 flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-thin">
        {MONTH_SHORT_NAMES.map((shortName, index) => {
          const isActive = index === currentMonth;
          const monthEquipments = yearData[index] || [];
          
          // Count planned and completed tasks for this month
          let plannedCount = 0;
          let completedCount = 0;
          monthEquipments.forEach((eq) => {
            eq.activities.forEach((act) => {
              Object.values(act.days || {}).forEach((c) => {
                if (c.status === 'P') plannedCount++;
                if (c.status === 'OK') {
                  plannedCount++;
                  completedCount++;
                }
              });
            });
          });

          const hasData = monthEquipments.length > 0;

          return (
            <button
              key={index}
              onClick={() => onSelectMonth(index)}
              title={`${MONTH_NAMES[index]} ${currentYear} (${hasData ? `${plannedCount} itens` : 'Sem dados'})`}
              className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-xs ring-1 ring-blue-700'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-white/80 border border-slate-200/80 shadow-2xs'
              }`}
            >
              <span className="font-sans">{shortName}</span>
              {hasData && (
                <span
                  className={`text-[10px] font-mono px-1 rounded-sm ${
                    isActive ? 'bg-blue-700/60 text-blue-100' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {completedCount}/{plannedCount}
                </span>
              )}
              {isActive && (
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-1 bg-blue-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
