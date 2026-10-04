import React, { useState, useEffect } from 'react';
import { X, CheckSquare } from 'lucide-react';
import { Activity, MAINTENANCE_TYPES, MaintenanceType } from '../types/maintenance';
import { MAINTENANCE_TYPE_COLORS } from './Toolbar';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipmentName?: string;
  activityToEdit?: Activity | null;
  onSave: (activityData: {
    name: string;
    maintenanceType: MaintenanceType | string;
    frequency: string;
    responsible: string;
  }) => void;
}

export const ActivityModal: React.FC<ActivityModalProps> = ({
  isOpen,
  onClose,
  equipmentName,
  activityToEdit,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [maintenanceType, setMaintenanceType] = useState<string>(MAINTENANCE_TYPES[0]);
  const [frequency, setFrequency] = useState('Mensal');
  const [responsible, setResponsible] = useState('Equipe Manutenção');

  useEffect(() => {
    if (isOpen) {
      if (activityToEdit) {
        setName(activityToEdit.name);
        setMaintenanceType(activityToEdit.maintenanceType || MAINTENANCE_TYPES[0]);
        setFrequency(activityToEdit.frequency || 'Mensal');
        setResponsible(activityToEdit.responsible || 'Equipe Manutenção');
      } else {
        setName('');
        setMaintenanceType(MAINTENANCE_TYPES[0]);
        setFrequency('Mensal');
        setResponsible('Equipe Manutenção');
      }
    }
  }, [isOpen, activityToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      maintenanceType,
      frequency,
      responsible: responsible.trim() || 'Equipe Geral',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/70">
            <div>
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  {activityToEdit ? 'Editar Atividade' : 'Nova Atividade'}
                </h3>
              </div>
              {equipmentName && (
                <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[340px]">
                  Equipamento: {equipmentName}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Fields */}
          <div className="p-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Tipo de Manutenção *
              </label>
              <div className="space-y-1.5">
                {MAINTENANCE_TYPES.map((type) => {
                  const isSelected = maintenanceType === type;
                  const color = MAINTENANCE_TYPE_COLORS[type];

                  return (
                    <label
                      key={type}
                      className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer text-xs transition-all ${
                        isSelected
                          ? `${color.bgActive} ring-1 ring-blue-500/20`
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="maintenanceType"
                        value={type}
                        checked={isSelected}
                        onChange={(e) => setMaintenanceType(e.target.value)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className={`w-2 h-2 rounded-full ${color.dot} shrink-0`} />
                      <span className="font-medium">{type}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Descrição da Actividade planificada *
              </label>
              <textarea
                rows={3}
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Inspeção de pressão, troca de filtros, lubrificação de mancais..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Frequência Prevista
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-600 text-slate-800"
                >
                  <option value="Diária">Diária</option>
                  <option value="Semanal">Semanal</option>
                  <option value="Quinzenal">Quinzenal</option>
                  <option value="Mensal">Mensal</option>
                  <option value="Bimestral">Bimestral</option>
                  <option value="Trimestral">Trimestral</option>
                  <option value="Semestral">Semestral</option>
                  <option value="Anual">Anual</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Responsável / Especialidade
                </label>
                <input
                  type="text"
                  value={responsible}
                  onChange={(e) => setResponsible(e.target.value)}
                  placeholder="Ex: Mecânica, Elétrica, Lubrificador"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                />
              </div>
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
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
            >
              {activityToEdit ? 'Atualizar' : 'Adicionar Atividade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
