import React from 'react';
import { Equipment } from '../types/maintenance';

interface MetricsBarProps {
  equipments: Equipment[];
  currentMonthName: string;
  currentYear: number;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({
  equipments,
}) => {
  let totalActivities = 0;
  let plannedCount = 0;
  let completedCount = 0;
  let suspendedCount = 0;
  let pendingCount = 0;
  let cancelledCount = 0;

  equipments.forEach((eq) => {
    totalActivities += eq.activities.length;
    eq.activities.forEach((act) => {
      Object.values(act.days || {}).forEach((cell) => {
        if (cell.status === 'P') plannedCount++;
        if (cell.status === 'OK' || cell.status === 'R') completedCount++;
        if (cell.status === 'SUSP' || cell.status === 'S') suspendedCount++;
        if (cell.status === 'PEND') pendingCount++;
        if (cell.status === 'C') cancelledCount++;
      });
    });
  });

  return (
    <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 no-print">
      <div className="max-w-[1920px] mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* KPI metrics in clean unboxed layout */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900 font-mono text-base tabular-nums">
              {equipments.length}
            </span>
            <span className="text-slate-500">equipamentos</span>
          </div>

          <span aria-hidden="true" className="text-slate-200">|</span>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900 font-mono text-base tabular-nums">
              {totalActivities}
            </span>
            <span className="text-slate-500">atividades</span>
          </div>

          <span aria-hidden="true" className="text-slate-200">|</span>

          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-slate-500">Planejadas:</span>
            <span className="font-bold text-blue-700 font-mono text-sm tabular-nums">
              {plannedCount}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-500">Realizadas:</span>
            <span className="font-bold text-emerald-700 font-mono text-sm tabular-nums">
              {completedCount}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-slate-500">Suspensas:</span>
            <span className="font-bold text-red-700 font-mono text-sm tabular-nums">
              {suspendedCount}
            </span>
          </div>

          {pendingCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-500">Pendentes:</span>
              <span className="font-bold text-amber-700 font-mono text-sm tabular-nums">
                {pendingCount}
              </span>
            </div>
          )}

          {cancelledCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <span className="text-slate-500">Canceladas:</span>
              <span className="font-semibold text-slate-600 font-mono text-sm tabular-nums">
                {cancelledCount}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
