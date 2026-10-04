import React, { useState, useEffect } from 'react';
import { X, Check, Clock, AlertTriangle, Trash2, User, FileText } from 'lucide-react';
import { CellData } from '../types/maintenance';
import { DayInfo } from '../utils/dateUtils';

interface CellModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayInfo?: DayInfo;
  equipmentName?: string;
  activityName?: string;
  cellData: CellData;
  onSave: (newData: CellData) => void;
}

export const CellModal: React.FC<CellModalProps> = ({
  isOpen,
  onClose,
  dayInfo,
  equipmentName,
  activityName,
  cellData,
  onSave,
}) => {
  const [status, setStatus] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [technician, setTechnician] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setStatus(cellData.status || '');
      setNotes(cellData.notes || '');
      setTechnician(cellData.technician || '');
    }
  }, [isOpen, cellData]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      status: status.trim().toUpperCase(),
      notes: notes.trim(),
      technician: technician.trim(),
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  const handleClear = () => {
    onSave({
      status: '',
      notes: '',
      technician: '',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/70">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Detalhes do Dia {dayInfo ? `${String(dayInfo.dayNumber).padStart(2, '0')} (${dayInfo.weekdayFull})` : ''}
            </h3>
            <p className="text-xs text-slate-500 truncate max-w-[320px]">
              {equipmentName}
            </p>
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
          <div>
            <span className="text-[11px] font-medium text-slate-500 block mb-1">
              Atividade:
            </span>
            <p className="text-xs font-semibold text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              {activityName}
            </p>
          </div>

          {/* Quick Status Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Status da Manutenção
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              <button
                type="button"
                onClick={() => setStatus('P')}
                className={`py-2 px-1 text-[11px] font-bold rounded-lg border text-center transition-all ${
                  status === 'P'
                    ? 'bg-blue-600 text-white border-blue-700 shadow-xs ring-2 ring-blue-300'
                    : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'
                }`}
              >
                [P] Planificado
              </button>
              <button
                type="button"
                onClick={() => setStatus('OK')}
                className={`py-2 px-1 text-[11px] font-bold rounded-lg border text-center transition-all ${
                  status === 'OK' || status === 'R'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs ring-2 ring-emerald-300'
                    : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                [OK] Realizado
              </button>
              <button
                type="button"
                onClick={() => setStatus('SUSP')}
                className={`py-2 px-1 text-[11px] font-bold rounded-lg border text-center transition-all ${
                  status === 'SUSP' || status === 'S'
                    ? 'bg-red-600 text-white border-red-700 shadow-xs ring-2 ring-red-300'
                    : 'bg-white text-red-700 border-red-200 hover:bg-red-50'
                }`}
              >
                [SUSP] Suspenso
              </button>
              <button
                type="button"
                onClick={() => setStatus('PEND')}
                className={`py-2 px-1 text-[11px] font-bold rounded-lg border text-center transition-all ${
                  status === 'PEND'
                    ? 'bg-amber-600 text-white border-amber-700 shadow-xs ring-2 ring-amber-300'
                    : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50'
                }`}
              >
                [PEND] Pendente
              </button>
              <button
                type="button"
                onClick={() => setStatus('C')}
                className={`py-2 px-1 text-[11px] font-bold rounded-lg border text-center transition-all ${
                  status === 'C'
                    ? 'bg-slate-700 text-white border-slate-800 shadow-xs ring-2 ring-slate-300'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                [C] Cancelar
              </button>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[11px] text-slate-500">Ou texto personalizado:</span>
              <input
                type="text"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                placeholder="Ex: 2h, Insp, João, OK"
                className="flex-1 px-2.5 py-1 text-xs font-mono border border-slate-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Technician */}
          <div>
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Técnico / Responsável</span>
            </label>
            <input
              type="text"
              value={technician}
              onChange={(e) => setTechnician(e.target.value)}
              placeholder="Nome do executor da tarefa"
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* Notes / Observation */}
          <div>
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Observações / Relatório</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Parâmetros aferidos, peças trocadas, pendências..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpar Célula</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
