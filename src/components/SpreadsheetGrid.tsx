import React, { useState, useMemo } from 'react';
import { 
  Edit3, 
  CalendarRange, 
  Wrench, 
  Check,
  Lock
} from 'lucide-react';
import { Equipment, Activity, CellData } from '../types/maintenance';
import { DayInfo } from '../utils/dateUtils';
import { getEquipmentCategory, EquipmentCategory } from '../utils/equipmentCategories';

interface SpreadsheetGridProps {
  equipments: Equipment[];
  days: DayInfo[];
  isAdminUnlocked?: boolean;
  canEdit?: boolean;
  onUpdateCell: (equipmentId: string, activityId: string, day: number, data: CellData) => void;
  onOpenCellDetails: (equipmentId: string, activityId: string, day: number, currentData: CellData) => void;
  onEditActivity: (equipmentId: string, activity: Activity) => void;
  onEditEquipment?: (equipment: Equipment) => void;
  onDeleteEquipment?: (equipmentId: string) => void;
  onBatchPlanActivity: (equipmentId: string, activityId: string) => void;
  onOpenNewEquipment?: () => void;
}

export const SpreadsheetGrid: React.FC<SpreadsheetGridProps> = ({
  equipments,
  days,
  isAdminUnlocked = false,
  canEdit = true,
  onUpdateCell,
  onOpenCellDetails,
  onEditActivity,
  onBatchPlanActivity,
}) => {
  const [editingCellKey, setEditingCellKey] = useState<string | null>(null);
  const [inlineInputVal, setInlineInputVal] = useState<string>('');

  const handleCellClick = (
    equipmentId: string,
    activityId: string,
    day: number,
    currentData: CellData
  ) => {
    // Quando no modo só admin (não desbloqueado), o toque para edição não tem nenhuma resposta
    if (!canEdit) return;

    // Direct spreadsheet touch cycle:
    // Toque 1: 'P' (Planificada)
    // Toque 2: 'OK' (Realizado)
    // Toque 3: 'SUSP' (Suspenso)
    // Toque 4: '' (Vazio)
    let nextStatus = 'P';
    if (!currentData.status) {
      nextStatus = 'P';
    } else if (currentData.status === 'P') {
      nextStatus = 'OK';
    } else if (currentData.status === 'OK' || currentData.status === 'R') {
      nextStatus = 'SUSP';
    } else if (currentData.status === 'SUSP' || currentData.status === 'S' || currentData.status === 'PEND' || currentData.status === 'C') {
      nextStatus = '';
    } else {
      nextStatus = '';
    }

    onUpdateCell(equipmentId, activityId, day, {
      ...currentData,
      status: nextStatus,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleCellDoubleClick = (
    equipmentId: string,
    activityId: string,
    day: number,
    currentData: CellData
  ) => {
    // Quando no modo só admin (não desbloqueado), o toque para edição não tem nenhuma resposta
    if (!canEdit) return;
    onOpenCellDetails(equipmentId, activityId, day, currentData);
  };

  const commitInlineEdit = (
    equipmentId: string,
    activityId: string,
    day: number,
    currentData: CellData
  ) => {
    onUpdateCell(equipmentId, activityId, day, {
      ...currentData,
      status: inlineInputVal.trim().toUpperCase(),
      updatedAt: new Date().toISOString(),
    });
    setEditingCellKey(null);
  };

  // Group equipments by category: GRABS, BAGGING UNITS, CONVEYORS, HOPPERS
  const groupedEquipments = useMemo(() => {
    const categoryMap = new Map<string, { category: EquipmentCategory; equipments: Equipment[] }>();
    const CATEGORY_ORDER = ['grabs', 'bagging', 'conveyors', 'hoppers', 'other'];

    equipments.forEach((eq) => {
      const cat = getEquipmentCategory(eq.tag);
      if (!categoryMap.has(cat.id)) {
        categoryMap.set(cat.id, { category: cat, equipments: [] });
      }
      categoryMap.get(cat.id)!.equipments.push(eq);
    });

    const groups: { category: EquipmentCategory; equipments: Equipment[] }[] = [];
    CATEGORY_ORDER.forEach((catId) => {
      if (categoryMap.has(catId)) {
        groups.push(categoryMap.get(catId)!);
      }
    });

    return groups;
  }, [equipments]);

  return (
    <div className="relative w-full overflow-x-auto overflow-y-auto max-h-[calc(100vh-230px)] border-b border-slate-200 bg-white spreadsheet-container">
      <table className="w-full border-collapse text-left border-spacing-0">
        {/* Table Head: Fixed Sticky Header */}
        <thead className="sticky top-0 z-30 bg-slate-100 text-slate-700 text-xs shadow-xs">
          <tr className="border-b border-slate-300">
            {/* Frozen Left Columns Header */}
            <th
              scope="col"
              className="sticky left-0 z-40 bg-slate-100 px-3 py-2.5 font-bold text-slate-900 tracking-wider border-r border-slate-300 min-w-[190px] max-w-[220px]"
            >
              EQUIPAMENTOS
            </th>
            <th
              scope="col"
              className="sticky left-[190px] z-40 bg-slate-100 px-3 py-2 font-semibold text-slate-800 border-r border-slate-300 min-w-[280px] max-w-[340px]"
            >
              Actividade planificada
            </th>

            {/* Days columns */}
            {days.map((day) => (
              <th
                key={day.dayNumber}
                scope="col"
                className={`text-center font-mono py-1 px-1 border-r border-slate-200 min-w-[34px] max-w-[38px] ${
                  day.isWeekend ? 'bg-slate-200/70 text-slate-800' : 'bg-slate-100 text-slate-900'
                } ${day.isToday ? 'ring-1 ring-inset ring-blue-600 font-bold bg-blue-50/70' : ''}`}
                title={`${day.formattedDate} - ${day.weekdayFull}`}
              >
                <div className="text-[11px] font-bold tabular-nums">
                  {String(day.dayNumber).padStart(2, '0')}
                </div>
                <div
                  className={`text-[9px] font-medium tracking-tighter ${
                    day.isWeekend ? 'text-amber-700' : 'text-slate-500'
                  }`}
                >
                  {day.weekdayShort}
                </div>
              </th>
            ))}

            {/* Summary Columns */}
            <th
              scope="col"
              className="text-center px-2 py-2 font-semibold text-blue-800 bg-blue-50/80 border-r border-slate-300 min-w-[50px]"
              title="Total de tarefas planejadas"
            >
              Plan.
            </th>
            <th
              scope="col"
              className="text-center px-2 py-2 font-semibold text-emerald-800 bg-emerald-50/80 border-r border-slate-300 min-w-[50px]"
              title="Total de tarefas realizadas"
            >
              Real.
            </th>
            <th
              scope="col"
              className="text-center px-2 py-2 font-semibold text-slate-800 bg-slate-100 border-r border-slate-300 min-w-[55px]"
              title="Taxa percentual de cumprimento"
            >
              %
            </th>
            <th
              scope="col"
              className="text-center px-2 py-2 font-semibold text-slate-600 bg-slate-100 min-w-[70px] no-print"
            >
              Ações
            </th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-slate-200 text-xs">
          {equipments.length === 0 ? (
            <tr>
              <td
                colSpan={days.length + 7}
                className="py-12 text-center text-slate-400 bg-slate-50/50"
              >
                <Wrench className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-medium text-slate-600">
                  Nenhuma atividade encontrada com os filtros selecionados
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Selecione "Todos os Tipos" ou clique em "+ Novo Equipamento" para cadastrar.
                </p>
              </td>
            </tr>
          ) : (
            groupedEquipments.map((group) => (
              <React.Fragment key={group.category.id}>
                {/* Equipment Category Header Row */}
                <tr className="bg-slate-900 text-white font-bold border-t-2 border-b border-slate-700 print:bg-slate-200 print:text-black print:border-black">
                  <td
                    colSpan={days.length + 6}
                    className={`sticky left-0 z-20 px-3.5 py-2 bg-slate-900 text-white border-l-4 ${group.category.borderColor} shadow-xs print:bg-slate-200 print:text-black`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="font-extrabold text-xs sm:text-sm tracking-wider uppercase text-white print:text-black truncate">
                          {group.category.name}
                        </span>
                        <span className="text-[11px] font-normal text-slate-300 print:text-slate-700 hidden sm:inline truncate">
                          · {group.category.subtitle}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono font-bold bg-slate-800 text-slate-200 print:bg-transparent print:text-black px-2.5 py-0.5 rounded border border-slate-700 shrink-0">
                        {group.equipments.length} {group.equipments.length === 1 ? 'Equipamento' : 'Equipamentos'}
                      </span>
                    </div>
                  </td>
                </tr>

                {/* Equipments and Activities belonging to this category */}
                {group.equipments.map((eq) => {
                  const activitiesCount = eq.activities.length;

                  return (
                    <React.Fragment key={eq.id}>
                  {/* Activity Rows */}
                  {activitiesCount === 0 ? (
                    <tr className="hover:bg-slate-50 border-b border-slate-200">
                      <td className="sticky left-0 z-10 bg-white px-3 py-2 text-slate-400 border-r border-slate-200 italic">
                        <span className="font-bold text-slate-800">{eq.tag}</span>
                        <span className="text-[10px] text-slate-400 block truncate">{eq.sector}</span>
                      </td>
                      <td
                        colSpan={days.length + 5}
                        className="px-3 py-2 text-slate-400 italic text-xs"
                      >
                        Nenhuma atividade cadastrada para este equipamento.
                      </td>
                    </tr>
                  ) : (
                    eq.activities.map((act, actIndex) => {
                      // Calculate row totals
                      let plannedTotal = 0;
                      let completedTotal = 0;

                      days.forEach((d) => {
                        const cell = act.days[d.dayNumber];
                        if (cell?.status === 'P' || cell?.status === 'OK' || cell?.status === 'SUSP' || cell?.status === 'S') {
                          plannedTotal++;
                        }
                        if (cell?.status === 'OK' || cell?.status === 'R') {
                          completedTotal++;
                        }
                      });

                      const completionRate =
                        plannedTotal > 0
                          ? Math.round((completedTotal / plannedTotal) * 100)
                          : 0;

                      const isLastActivityOfEquipment = actIndex === activitiesCount - 1;

                      return (
                        <tr
                          key={act.id}
                          className={`hover:bg-blue-50/30 transition-colors group ${
                            isLastActivityOfEquipment ? 'border-b-2 border-slate-300' : 'border-b border-slate-200'
                          }`}
                        >
                          {/* Col 1: EQUIPAMENTOS - Merged cell across both activity lines of this equipment */}
                          {actIndex === 0 && (
                            <td 
                              rowSpan={activitiesCount}
                              className="sticky left-0 z-10 bg-white px-3 py-2 border-r border-b-2 border-slate-300 text-slate-700 font-mono text-[11px] align-middle select-none border-l-4 border-l-blue-600 shadow-2xs"
                            >
                              <div className="flex flex-col justify-center h-full gap-0.5">
                                <span className="font-bold text-slate-900 text-xs tracking-tight">{eq.tag}</span>
                                <span className="text-[10px] text-slate-500 font-sans block truncate leading-tight">
                                  {eq.sector}
                                </span>
                              </div>
                            </td>
                          )}

                          {/* Col 2: Activity Name (Editable on click only when canEdit is true) */}
                          <td
                            className={`sticky left-[190px] z-10 bg-white group-hover:bg-blue-50/40 px-3 py-1.5 border-r border-slate-200 text-slate-800 text-xs font-medium select-none ${
                              canEdit ? 'cursor-pointer hover:text-blue-900' : 'cursor-default'
                            }`}
                            onClick={() => {
                              if (canEdit) onEditActivity(eq.id, act);
                            }}
                            title={canEdit ? "Clique para editar a descrição da atividade" : undefined}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="line-clamp-2 leading-tight">
                                {act.name}
                              </span>
                              {canEdit && (
                                <Edit3 className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                              )}
                            </div>
                          </td>

                          {/* Day Columns */}
                          {days.map((day) => {
                            const cell = act.days[day.dayNumber] || { status: '' };
                            const status = cell.status || '';
                            const cellKey = `${eq.id}_${act.id}_${day.dayNumber}`;
                            const isEditing = editingCellKey === cellKey;
                            const hasNotes = Boolean(cell.notes || cell.technician);

                            return (
                              <td
                                key={day.dayNumber}
                                onClick={() => handleCellClick(eq.id, act.id, day.dayNumber, cell)}
                                onDoubleClick={() =>
                                  handleCellDoubleClick(eq.id, act.id, day.dayNumber, cell)
                                }
                                className={`relative text-center p-0.5 border-r border-b border-slate-300 select-none transition-colors ${
                                  day.isWeekend ? 'bg-slate-100/70' : 'bg-white'
                                } ${
                                  canEdit
                                    ? 'cursor-pointer hover:bg-blue-50/70 active:scale-95'
                                    : 'cursor-default'
                                }`}
                                title={
                                  !canEdit
                                    ? `Dia ${day.dayNumber} (${day.weekdayShort}): ${status || 'Vazio'} · Modo Somente Leitura (Autentique-se como Admin para editar)`
                                    : `Dia ${day.dayNumber} (${day.weekdayShort}): ${
                                        status === 'P'
                                          ? 'Planificado (P)'
                                          : status === 'OK' || status === 'R'
                                          ? 'Realizado (OK)'
                                          : status === 'SUSP' || status === 'S'
                                          ? 'Suspenso (SUSP)'
                                          : 'Vazio'
                                      }\nToque para alternar: Planificado (P) → Realizado (OK) → Suspenso (SUSP) → Vazio`
                                }
                              >
                                {isEditing ? (
                                  <input
                                    autoFocus
                                    type="text"
                                    value={inlineInputVal}
                                    onChange={(e) => setInlineInputVal(e.target.value)}
                                    onBlur={() => commitInlineEdit(eq.id, act.id, day.dayNumber, cell)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        commitInlineEdit(eq.id, act.id, day.dayNumber, cell);
                                      } else if (e.key === 'Escape') {
                                        setEditingCellKey(null);
                                      }
                                    }}
                                    className="w-full h-7 text-center font-mono text-xs font-bold bg-white border border-blue-500 rounded focus:outline-hidden"
                                  />
                                ) : (
                                  <div
                                    className={`w-full h-7 rounded flex items-center justify-center font-mono text-[11px] font-bold transition-all relative ${
                                      status === 'P'
                                        ? 'bg-blue-100 text-blue-800 border-2 border-blue-400 shadow-2xs'
                                        : status === 'OK' || status === 'R'
                                        ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-400 shadow-2xs'
                                        : status === 'SUSP' || status === 'S'
                                        ? 'bg-red-100 text-red-800 border-2 border-red-400 shadow-2xs'
                                        : status === 'PEND'
                                        ? 'bg-amber-100 text-amber-800 border-2 border-amber-300'
                                        : status === 'C'
                                        ? 'bg-slate-200 text-slate-500 line-through font-medium'
                                        : status
                                        ? 'bg-purple-100 text-purple-800 border border-purple-300'
                                        : 'hover:bg-slate-100/70'
                                    }`}
                                  >
                                    {status === 'SUSP' || status === 'S' ? 'SUSP' : status}

                                    {/* Observation / Note badge dot */}
                                    {hasNotes && (
                                      <span
                                        className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-blue-600"
                                        title={`Nota: ${cell.notes || ''} ${cell.technician ? `(${cell.technician})` : ''}`}
                                      />
                                    )}
                                  </div>
                                )}
                              </td>
                            );
                          })}

                          {/* Row Summary: Total Planned */}
                          <td className="text-center font-mono font-bold text-blue-700 bg-blue-50/40 border-r border-slate-200 px-1 py-1 tabular-nums text-xs">
                            {plannedTotal}
                          </td>

                          {/* Row Summary: Total Realized */}
                          <td className="text-center font-mono font-bold text-emerald-700 bg-emerald-50/40 border-r border-slate-200 px-1 py-1 tabular-nums text-xs">
                            {completedTotal}
                          </td>

                          {/* Row Summary: % Rate */}
                          <td className="text-center font-mono font-semibold text-slate-700 border-r border-slate-200 px-1 py-1 tabular-nums text-xs">
                            <span
                              className={`${
                                completionRate >= 80
                                  ? 'text-emerald-700 font-bold'
                                  : completionRate > 0
                                  ? 'text-blue-700'
                                  : 'text-slate-400'
                              }`}
                            >
                              {completionRate}%
                            </span>
                          </td>

                          {/* Row Actions */}
                          <td className="text-center px-1 py-1 whitespace-nowrap no-print select-none">
                            {canEdit ? (
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => onBatchPlanActivity(eq.id, act.id)}
                                  title="Preencher dias em lote para esta atividade"
                                  className="p-1 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                                >
                                  <CalendarRange className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onEditActivity(eq.id, act)}
                                  title="Editar descrição e tipo da atividade"
                                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-300 font-mono" title="Modo Só Admin (Somente Leitura)">
                                —
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </React.Fragment>
              );
            })}
          </React.Fragment>
        ))
      )}
    </tbody>
      </table>
    </div>
  );
};
