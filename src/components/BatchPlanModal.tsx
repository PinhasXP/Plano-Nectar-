import React, { useState, useEffect } from 'react';
import { X, CalendarRange, Check, AlertCircle } from 'lucide-react';
import { Equipment } from '../types/maintenance';
import { DayInfo } from '../utils/dateUtils';

interface BatchPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipments: Equipment[];
  days: DayInfo[];
  preSelectedEquipmentId?: string;
  preSelectedActivityId?: string;
  onApplyBatch: (
    equipmentId: string,
    activityId: string,
    dayNumbers: number[],
    statusToApply: string
  ) => void;
}

export const BatchPlanModal: React.FC<BatchPlanModalProps> = ({
  isOpen,
  onClose,
  equipments,
  days,
  preSelectedEquipmentId,
  preSelectedActivityId,
  onApplyBatch,
}) => {
  const [selectedEqId, setSelectedEqId] = useState<string>('');
  const [selectedActId, setSelectedActId] = useState<string>('');
  const [pattern, setPattern] = useState<string>('workdays');
  const [targetWeekday, setTargetWeekday] = useState<number>(1); // 1 = Seg
  const [customInterval, setCustomInterval] = useState<number>(7);
  const [monthlyDay, setMonthlyDay] = useState<number>(1);
  const [statusToApply, setStatusToApply] = useState<string>('P');

  useEffect(() => {
    if (isOpen) {
      if (preSelectedEquipmentId) {
        setSelectedEqId(preSelectedEquipmentId);
      } else if (equipments.length > 0) {
        setSelectedEqId(equipments[0].id);
      }

      if (preSelectedActivityId) {
        setSelectedActId(preSelectedActivityId);
      }
    }
  }, [isOpen, preSelectedEquipmentId, preSelectedActivityId, equipments]);

  // Update selected activity when equipment changes
  useEffect(() => {
    if (selectedEqId) {
      const eq = equipments.find((e) => e.id === selectedEqId);
      if (eq && eq.activities.length > 0) {
        if (!eq.activities.some((a) => a.id === selectedActId)) {
          setSelectedActId(eq.activities[0].id);
        }
      } else {
        setSelectedActId('');
      }
    }
  }, [selectedEqId, equipments, selectedActId]);

  if (!isOpen) return null;

  const currentEquipment = equipments.find((e) => e.id === selectedEqId);

  const calculateTargetDays = (): number[] => {
    const targetDays: number[] = [];

    days.forEach((day) => {
      if (pattern === 'all_days') {
        targetDays.push(day.dayNumber);
      } else if (pattern === 'workdays') {
        if (!day.isWeekend) {
          targetDays.push(day.dayNumber);
        }
      } else if (pattern === 'weekday') {
        if (day.weekdayIndex === targetWeekday) {
          targetDays.push(day.dayNumber);
        }
      } else if (pattern === 'biweekly') {
        // e.g. 1st and 15th, or every 14 days
        if (day.dayNumber === 1 || day.dayNumber === 15) {
          targetDays.push(day.dayNumber);
        }
      } else if (pattern === 'monthly') {
        if (day.dayNumber === monthlyDay) {
          targetDays.push(day.dayNumber);
        }
      } else if (pattern === 'interval') {
        if (day.dayNumber % customInterval === 0 || day.dayNumber === 1) {
          targetDays.push(day.dayNumber);
        }
      }
    });

    return targetDays;
  };

  const previewDays = calculateTargetDays();

  const handleApply = () => {
    if (!selectedEqId || !selectedActId) return;
    const targetDays = calculateTargetDays();
    onApplyBatch(selectedEqId, selectedActId, targetDays, statusToApply);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <CalendarRange className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Preenchimento em Lote do Mês
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Equipment Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Equipamento Alvo
            </label>
            <select
              value={selectedEqId}
              onChange={(e) => setSelectedEqId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 text-slate-800"
            >
              {equipments.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  [{eq.tag}] {eq.name} ({eq.sector})
                </option>
              ))}
            </select>
          </div>

          {/* Activity Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Atividade a Preencher
            </label>
            <select
              value={selectedActId}
              onChange={(e) => setSelectedActId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 text-slate-800"
            >
              {currentEquipment?.activities.map((act) => (
                <option key={act.id} value={act.id}>
                  {act.name} ({act.frequency})
                </option>
              ))}
            </select>
          </div>

          {/* Recurrence Pattern */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Regra de Frequência / Recorrência
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPattern('workdays')}
                className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                  pattern === 'workdays'
                    ? 'border-blue-600 bg-blue-50/80 text-blue-900 font-semibold'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                Dias Úteis (Seg - Sex)
              </button>

              <button
                type="button"
                onClick={() => setPattern('all_days')}
                className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                  pattern === 'all_days'
                    ? 'border-blue-600 bg-blue-50/80 text-blue-900 font-semibold'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                Todos os Dias (Diário)
              </button>

              <button
                type="button"
                onClick={() => setPattern('weekday')}
                className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                  pattern === 'weekday'
                    ? 'border-blue-600 bg-blue-50/80 text-blue-900 font-semibold'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                Semanal (Dia Fixo)
              </button>

              <button
                type="button"
                onClick={() => setPattern('biweekly')}
                className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                  pattern === 'biweekly'
                    ? 'border-blue-600 bg-blue-50/80 text-blue-900 font-semibold'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                Quinzenal (Dias 01 e 15)
              </button>

              <button
                type="button"
                onClick={() => setPattern('monthly')}
                className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                  pattern === 'monthly'
                    ? 'border-blue-600 bg-blue-50/80 text-blue-900 font-semibold'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                Mensal (1x por Mês)
              </button>

              <button
                type="button"
                onClick={() => setPattern('interval')}
                className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                  pattern === 'interval'
                    ? 'border-blue-600 bg-blue-50/80 text-blue-900 font-semibold'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                Intervalo de Dias
              </button>
            </div>
          </div>

          {/* Sub-parameters based on pattern */}
          {pattern === 'weekday' && (
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Escolha o dia da semana:
              </label>
              <select
                value={targetWeekday}
                onChange={(e) => setTargetWeekday(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
              >
                <option value={1}>Toda Segunda-feira</option>
                <option value={2}>Toda Terça-feira</option>
                <option value={3}>Toda Quarta-feira</option>
                <option value={4}>Toda Quinta-feira</option>
                <option value={5}>Toda Sexta-feira</option>
                <option value={6}>Todo Sábado</option>
                <option value={0}>Todo Domingo</option>
              </select>
            </div>
          )}

          {pattern === 'monthly' && (
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Dia do mês:
              </label>
              <input
                type="number"
                min={1}
                max={days.length}
                value={monthlyDay}
                onChange={(e) => setMonthlyDay(Math.max(1, Math.min(days.length, Number(e.target.value))))}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-800"
              />
            </div>
          )}

          {pattern === 'interval' && (
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                A cada quantos dias:
              </label>
              <input
                type="number"
                min={2}
                max={30}
                value={customInterval}
                onChange={(e) => setCustomInterval(Math.max(2, Number(e.target.value)))}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-800"
              />
            </div>
          )}

          {/* Status to apply */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Status a Aplicar
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStatusToApply('P')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg border text-center transition-all ${
                  statusToApply === 'P'
                    ? 'bg-blue-600 text-white border-blue-700 shadow-2xs'
                    : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'
                }`}
              >
                [P] Planejado
              </button>
              <button
                type="button"
                onClick={() => setStatusToApply('OK')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg border text-center transition-all ${
                  statusToApply === 'OK'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                    : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                [OK] Realizado
              </button>
              <button
                type="button"
                onClick={() => setStatusToApply('')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg border text-center transition-all ${
                  statusToApply === ''
                    ? 'bg-slate-700 text-white border-slate-800 shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Limpar Dias
              </button>
            </div>
          </div>

          {/* Preview summary */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
            <span className="font-semibold text-slate-700 block mb-1">
              Pré-visualização:
            </span>
            <p className="text-slate-600">
              Serão afetados <strong className="text-blue-700 font-mono">{previewDays.length} dias</strong>:{' '}
              {previewDays.map((d) => String(d).padStart(2, '0')).join(', ')}.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
          >
            Aplicar ao Mês
          </button>
        </div>
      </div>
    </div>
  );
};
