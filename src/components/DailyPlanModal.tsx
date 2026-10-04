import React, { useState, useEffect } from 'react';
import { X, Save, Clock, User, AlertCircle, Wrench, FileText, CheckCircle2 } from 'lucide-react';
import { 
  DailyActivity, 
  DailyActivityStatus, 
  DAILY_ORIGINS, 
  DAILY_STATUS_CONFIG 
} from '../types/dailyPlan';

interface DailyPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activity: Omit<DailyActivity, 'id'>, editId?: string) => void;
  activityToEdit?: DailyActivity | null;
  currentDate: string;
}

export const DailyPlanModal: React.FC<DailyPlanModalProps> = ({
  isOpen,
  onClose,
  onSave,
  activityToEdit,
  currentDate,
}) => {
  const [equipment, setEquipment] = useState('');
  const [description, setDescription] = useState('');
  const [origin, setOrigin] = useState<string>(DAILY_ORIGINS[0]);
  const [technicians, setTechnicians] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('02h 00m');
  const [estimatedCompletion, setEstimatedCompletion] = useState('16:00');
  const [status, setStatus] = useState<DailyActivityStatus>('Em progresso');
  const [comments, setComments] = useState('');

  useEffect(() => {
    if (activityToEdit) {
      setEquipment(activityToEdit.equipment);
      setDescription(activityToEdit.description);
      setOrigin(activityToEdit.origin);
      setTechnicians(activityToEdit.technicians);
      setEstimatedDuration(activityToEdit.estimatedDuration);
      setEstimatedCompletion(activityToEdit.estimatedCompletion);
      setStatus(activityToEdit.status);
      setComments(activityToEdit.comments || '');
    } else {
      setEquipment('');
      setDescription('');
      setOrigin(DAILY_ORIGINS[0]);
      setTechnicians('');
      setEstimatedDuration('02h 00m');
      setEstimatedCompletion('16:00');
      setStatus('Em progresso');
      setComments('');
    }
  }, [activityToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipment.trim() || !description.trim()) {
      alert('Por favor, informe o Equipamento e a Descrição da Manutenção.');
      return;
    }

    onSave(
      {
        equipment: equipment.trim(),
        description: description.trim(),
        origin,
        technicians: technicians.trim() || 'Equipe Geral',
        estimatedDuration: estimatedDuration.trim() || 'Não especificado',
        estimatedCompletion: estimatedCompletion.trim() || 'Até fim do turno',
        status,
        comments: comments.trim(),
        updatedAt: new Date().toISOString(),
      },
      activityToEdit ? activityToEdit.id : undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-600 rounded-lg">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                {activityToEdit ? 'Editar Atividade do Dia' : 'Nova Atividade no Plano do Dia'}
              </h2>
              <p className="text-xs text-slate-300">
                Programação diária de manutenção para {currentDate}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Equipamento */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Equipamento <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              placeholder="Ex: CP-01 - Compressor de Ar Parafuso"
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-hidden transition-all font-medium"
            />
          </div>

          {/* Descrição da Manutenção */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Descrição da Manutenção <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o procedimento técnico a ser executado na intervenção..."
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-hidden transition-all"
            />
          </div>

          {/* Origem & Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Origem da Manutenção
              </label>
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-hidden transition-all bg-white"
              >
                {DAILY_ORIGINS.map((orig) => (
                  <option key={orig} value={orig}>
                    {orig}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Estado da Atividade
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as DailyActivityStatus)}
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-hidden transition-all bg-white font-medium"
              >
                <option value="Em progresso">🔵 Em progresso</option>
                <option value="Suspenso">🔴 Suspenso</option>
                <option value="Replanificado">🟡 Replanificado</option>
                <option value="Continua">🟣 Continua</option>
                <option value="Concluído">🟢 Concluído</option>
              </select>
            </div>
          </div>

          {/* Técnicos Alocados */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Técnicos Alocados na Manutenção
            </label>
            <div className="relative">
              <input
                type="text"
                value={technicians}
                onChange={(e) => setTechnicians(e.target.value)}
                placeholder="Ex: Carlos Silva (Mecânica), Roberto Lima (Elétrica)"
                className="w-full text-sm pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-hidden transition-all"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Tempo Previsto & Previsão de Finalização */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Tempo Previsto da Atividade
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value)}
                  placeholder="Ex: 02h 30m, 4 horas, 45 min"
                  className="w-full text-sm pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-hidden transition-all"
                />
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Previsão de Finalização
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={estimatedCompletion}
                  onChange={(e) => setEstimatedCompletion(e.target.value)}
                  placeholder="Ex: 16:30, 18:00, Turno 2"
                  className="w-full text-sm pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-hidden transition-all font-mono"
                />
                <CheckCircle2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>

          {/* Comentários Adicionais */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Comentários Adicionais / Observações
            </label>
            <textarea
              rows={2}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Peças pendentes, permissões de trabalho (PT/APR), restrições de produção, etc..."
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-hidden transition-all"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{activityToEdit ? 'Atualizar Atividade' : 'Salvar no Plano do Dia'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
