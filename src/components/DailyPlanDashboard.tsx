import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Printer, 
  Clock, 
  User, 
  Wrench, 
  Edit3, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  FileText,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { 
  DailyActivity, 
  DailyActivityStatus, 
  DAILY_STATUS_CONFIG, 
  DAILY_ORIGINS 
} from '../types/dailyPlan';
import { DailyPlanModal } from './DailyPlanModal';
import { HummingbirdIcon } from './HummingbirdIcon';

interface DailyPlanDashboardProps {
  currentDate: string; // YYYY-MM-DD
  onDateChange: (newDate: string) => void;
  activities: DailyActivity[];
  onAddActivity: (activity: Omit<DailyActivity, 'id'>) => void;
  onUpdateActivity: (id: string, updated: Partial<DailyActivity>) => void;
  onDeleteActivity: (id: string) => void;
  onLoadSamples?: () => void;
  requireAdminPin?: (action: () => void) => void;
}

export const DailyPlanDashboard: React.FC<DailyPlanDashboardProps> = ({
  currentDate,
  onDateChange,
  activities,
  onAddActivity,
  onUpdateActivity,
  onDeleteActivity,
  onLoadSamples,
  requireAdminPin,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<DailyActivity | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const executeWithPin = (action: () => void) => {
    if (requireAdminPin) {
      requireAdminPin(action);
    } else {
      action();
    }
  };

  // Format display date in Portuguese (ex: "Quinta-feira, 02 de Outubro de 2026")
  const formattedDateTitle = useMemo(() => {
    try {
      const [y, m, d] = currentDate.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      return dateObj.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return currentDate;
    }
  }, [currentDate]);

  // KPIs
  const metrics = useMemo(() => {
    const total = activities.length;
    let emProgresso = 0;
    let suspenso = 0;
    let replanificado = 0;
    let continua = 0;
    let concluido = 0;

    activities.forEach((act) => {
      if (act.status === 'Em progresso') emProgresso++;
      else if (act.status === 'Suspenso') suspenso++;
      else if (act.status === 'Replanificado') replanificado++;
      else if (act.status === 'Continua') continua++;
      else if (act.status === 'Concluído') concluido++;
    });

    return { total, emProgresso, suspenso, replanificado, continua, concluido };
  }, [activities]);

  // Filtered activities
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      return statusFilter === 'all' || act.status === statusFilter;
    });
  }, [activities, statusFilter]);

  // Print/PDF Handler
  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Printable Sheet Header (Visible primarily during print / PDF generation) */}
      <div className="hidden print:block mb-6 p-4 border-b-2 border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white shadow-xs shrink-0 p-1.5 overflow-hidden print:bg-[#3884cb]"
              style={{ backgroundColor: '#3884cb' }}
            >
              <HummingbirdIcon className="w-full h-full text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold uppercase tracking-tight text-slate-900">
                Relatório Diário de Atividades de Manutenção
              </h1>
              <p className="text-xs text-slate-600 font-medium">
                Planta Industrial · Programação de Turno & Atividades Operacionais
              </p>
            </div>
          </div>
          <div className="text-right font-mono text-xs">
            <p className="font-bold text-slate-900">DATA: {currentDate}</p>
            <p className="text-slate-500">Emitido: {new Date().toLocaleTimeString('pt-BR')}</p>
          </div>
        </div>

        {/* Print KPIs strip */}
        <div className="grid grid-cols-5 gap-2 mt-4 pt-3 border-t border-slate-300 text-xs">
          <div className="p-1.5 bg-slate-100 rounded text-center">
            <span className="font-bold">Total:</span> {metrics.total}
          </div>
          <div className="p-1.5 bg-blue-100 rounded text-center">
            <span className="font-bold text-blue-800">Em Progresso:</span> {metrics.emProgresso}
          </div>
          <div className="p-1.5 bg-red-100 rounded text-center">
            <span className="font-bold text-red-800">Suspenso:</span> {metrics.suspenso}
          </div>
          <div className="p-1.5 bg-amber-100 rounded text-center">
            <span className="font-bold text-amber-800">Replanificado:</span> {metrics.replanificado}
          </div>
          <div className="p-1.5 bg-purple-100 rounded text-center">
            <span className="font-bold text-purple-800">Continua:</span> {metrics.continua}
          </div>
        </div>
      </div>

      {/* Main Screen Controls: Date Picker & Actions Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs no-print flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Date Selector */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="relative flex items-center">
            <input
              type="date"
              value={currentDate}
              onChange={(e) => e.target.value && onDateChange(e.target.value)}
              className="text-xs font-mono font-medium px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-blue-600 outline-hidden shadow-2xs"
            />
          </div>

          <div className="hidden sm:block text-xs font-medium text-slate-600 capitalize">
            {formattedDateTitle}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          {activities.length === 0 && onLoadSamples && (
            <button
              onClick={() => executeWithPin(onLoadSamples)}
              title="Preencher com exemplos de atividades diárias industriais"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Carregar Exemplos</span>
            </button>
          )}

          {/* Gerar PDF / Imprimir Relatório */}
          <button
            onClick={handlePrintPDF}
            title="Gerar PDF ou Imprimir Relatório do Plano do Dia"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 rounded-lg transition-all shadow-2xs whitespace-nowrap"
          >
            <Printer className="w-4 h-4 text-slate-700" />
            <span>Gerar Relatório PDF</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 no-print">
        {/* Total */}
        <div 
          onClick={() => setStatusFilter('all')}
          className={`cursor-pointer p-3 rounded-xl border transition-all ${
            statusFilter === 'all' 
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider opacity-80">
              Total do Dia
            </span>
            <FileText 
              size={10} 
              style={{ width: 10, height: 10, minWidth: 10, minHeight: 10 }} 
              className="opacity-40 shrink-0" 
            />
          </div>
          <div className="text-xl font-bold font-mono">{metrics.total}</div>
        </div>

        {/* Em Progresso */}
        <div 
          onClick={() => setStatusFilter('Em progresso')}
          className={`cursor-pointer p-3 rounded-xl border transition-all ${
            statusFilter === 'Em progresso'
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-white border-blue-200 text-blue-900 hover:bg-blue-50/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Em Progresso
            </span>
            <Clock 
              size={10} 
              style={{ width: 10, height: 10, minWidth: 10, minHeight: 10 }} 
              className="opacity-60 text-blue-600 shrink-0" 
            />
          </div>
          <div className="text-xl font-bold font-mono text-blue-700">
            {metrics.emProgresso}
          </div>
        </div>

        {/* Suspenso */}
        <div 
          onClick={() => setStatusFilter('Suspenso')}
          className={`cursor-pointer p-3 rounded-xl border transition-all ${
            statusFilter === 'Suspenso'
              ? 'bg-red-600 text-white border-red-600 shadow-sm'
              : 'bg-white border-red-200 text-red-900 hover:bg-red-50/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Suspenso
            </span>
            <AlertCircle 
              size={10} 
              style={{ width: 10, height: 10, minWidth: 10, minHeight: 10 }} 
              className="opacity-60 text-red-600 shrink-0" 
            />
          </div>
          <div className="text-xl font-bold font-mono text-red-700">
            {metrics.suspenso}
          </div>
        </div>

        {/* Replanificado */}
        <div 
          onClick={() => setStatusFilter('Replanificado')}
          className={`cursor-pointer p-3 rounded-xl border transition-all ${
            statusFilter === 'Replanificado'
              ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
              : 'bg-white border-amber-200 text-amber-900 hover:bg-amber-50/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Replanificado
            </span>
            <RotateCcw 
              size={10} 
              style={{ width: 10, height: 10, minWidth: 10, minHeight: 10 }} 
              className="opacity-60 text-amber-600 shrink-0" 
            />
          </div>
          <div className="text-xl font-bold font-mono text-amber-700">
            {metrics.replanificado}
          </div>
        </div>

        {/* Continua */}
        <div 
          onClick={() => setStatusFilter('Continua')}
          className={`cursor-pointer p-3 rounded-xl border transition-all ${
            statusFilter === 'Continua'
              ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
              : 'bg-white border-purple-200 text-purple-900 hover:bg-purple-50/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Continua
            </span>
            <Wrench 
              size={10} 
              style={{ width: 10, height: 10, minWidth: 10, minHeight: 10 }} 
              className="opacity-60 text-purple-600 shrink-0" 
            />
          </div>
          <div className="text-xl font-bold font-mono text-purple-700">
            {metrics.continua}
          </div>
        </div>

        {/* Concluído */}
        <div 
          onClick={() => setStatusFilter('Concluído')}
          className={`cursor-pointer p-3 rounded-xl border transition-all ${
            statusFilter === 'Concluído'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              : 'bg-white border-emerald-200 text-emerald-900 hover:bg-emerald-50/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Concluído
            </span>
            <CheckCircle2 
              size={10} 
              style={{ width: 10, height: 10, minWidth: 10, minHeight: 10 }} 
              className="opacity-60 text-emerald-600 shrink-0" 
            />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-700">
            {metrics.concluido}
          </div>
        </div>
      </div>

      {/* Main Activities Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3 w-48">Equipamento</th>
                <th className="py-3 px-3 min-w-[200px]">Descrição da Manutenção</th>
                <th className="py-3 px-2 w-32">Origem</th>
                <th className="py-3 px-3 w-44">Técnicos Alocados</th>
                <th className="py-3 px-2 w-28 text-center">Tempo Previsto</th>
                <th className="py-3 px-3 w-36 text-center">Estado</th>
                <th className="py-3 px-3 min-w-[160px]">Comentários</th>
                <th className="py-3 px-2 w-20 text-center no-print">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Wrench className="w-8 h-8 text-slate-300" />
                      <p className="font-semibold text-slate-700">
                        Nenhuma atividade cadastrada para {currentDate}
                      </p>
                      <p className="text-xs text-slate-400 max-w-sm">
                        Adicione os equipamentos e serviços programados para este dia de trabalho.
                      </p>
                      <button
                        onClick={() =>
                          executeWithPin(() => {
                            setEditingActivity(null);
                            setModalOpen(true);
                          })
                        }
                        className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors no-print"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Adicionar Primeira Atividade</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredActivities.map((act) => {
                  const statusConf = DAILY_STATUS_CONFIG[act.status] || DAILY_STATUS_CONFIG['Em progresso'];

                  return (
                    <tr 
                      key={act.id} 
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Equipamento */}
                      <td className="py-3 px-3 font-semibold text-slate-900 align-top">
                        <div className="flex items-start gap-1.5">
                          <Wrench className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                          <span className="leading-tight">{act.equipment}</span>
                        </div>
                      </td>

                      {/* Descrição */}
                      <td className="py-3 px-3 text-slate-800 leading-relaxed align-top">
                        <div className="font-normal whitespace-pre-wrap">{act.description}</div>
                      </td>

                      {/* Origem */}
                      <td className="py-3 px-2 align-top">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {act.origin}
                        </span>
                      </td>

                      {/* Técnicos Alocados */}
                      <td className="py-3 px-3 text-slate-700 align-top">
                        <div className="flex items-start gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                          <span className="font-medium text-slate-800 leading-tight">
                            {act.technicians || 'Não informado'}
                          </span>
                        </div>
                      </td>

                      {/* Tempo Previsto */}
                      <td className="py-3 px-2 text-center align-top font-mono text-slate-700">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 rounded text-[11px]">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{act.estimatedDuration}</span>
                        </span>
                      </td>

                      {/* Estado da Atividade */}
                      <td className="py-3 px-3 text-center align-top">
                        {/* Interactive Dropdown */}
                        <select
                          value={act.status}
                          onChange={(e) => {
                            const newStatus = e.target.value as DailyActivityStatus;
                            executeWithPin(() =>
                              onUpdateActivity(act.id, {
                                status: newStatus,
                              })
                            );
                          }}
                          className={`w-full text-xs font-semibold px-2 py-1 rounded-md border text-center transition-colors cursor-pointer outline-hidden ${statusConf.badge}`}
                        >
                          <option value="Em progresso">🔵 Em progresso</option>
                          <option value="Suspenso">🔴 Suspenso</option>
                          <option value="Replanificado">🟡 Replanificado</option>
                          <option value="Continua">🟣 Continua</option>
                          <option value="Concluído">🟢 Concluído</option>
                        </select>
                      </td>

                      {/* Comentários */}
                      <td className="py-3 px-3 text-slate-600 text-[11px] leading-snug align-top">
                        {act.comments ? (
                          <div className="bg-slate-50 p-1.5 rounded border border-slate-200/80 italic">
                            "{act.comments}"
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Sem comentários</span>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="py-3 px-2 text-center align-top no-print">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() =>
                              executeWithPin(() => {
                                setEditingActivity(act);
                                setModalOpen(true);
                              })
                            }
                            title="Editar esta atividade"
                            className="p-1 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => executeWithPin(() => onDeleteActivity(act.id))}
                            title="Excluir esta atividade"
                            className="p-1 text-slate-400 hover:text-red-700 rounded hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Quick Footer Add Button inside table */}
        <div className="p-3 bg-slate-50/70 border-t border-slate-200 flex items-center justify-between no-print">
          <button
            onClick={() =>
              executeWithPin(() => {
                setEditingActivity(null);
                setModalOpen(true);
              })
            }
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-white hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Adicionar Outra Atividade para {currentDate}</span>
          </button>

          <span className="text-[11px] text-slate-500">
            Total de {filteredActivities.length} {filteredActivities.length === 1 ? 'tarefa listada' : 'tarefas listadas'}
          </span>
        </div>
      </div>

      {/* Printable Sign-off Section (Visible on PDF/Print - Gerar Relatório) */}
      <div className="hidden print:block mt-12 pt-8 border-t-2 border-slate-700 text-xs">
        <div className="text-center font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-8">
          Validação e Aprovação do Relatório Diário de Manutenção
        </div>
        <div className="grid grid-cols-2 gap-16 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="border-b-2 border-slate-700 pb-10 mb-2 w-4/5 mx-auto"></div>
            <p className="font-bold text-slate-900 text-sm">Planificador de Manutenção</p>
            <p className="text-[11px] text-slate-600 mt-0.5">Programação e Controle Técnico</p>
            <p className="text-[10px] text-slate-400 mt-2">Data: ____ / ____ / ________</p>
          </div>
          <div className="text-center">
            <div className="border-b-2 border-slate-700 pb-10 mb-2 w-4/5 mx-auto"></div>
            <p className="font-bold text-slate-900 text-sm">Coordenador de Manutenção</p>
            <p className="text-[11px] text-slate-600 mt-0.5">Validação e Homologação Geral</p>
            <p className="text-[10px] text-slate-400 mt-2">Data: ____ / ____ / ________</p>
          </div>
        </div>
        <div className="text-center text-[10px] text-slate-400 mt-6 pt-4 border-t border-slate-200">
          Relatório Oficial de Manutenção Diária · Emissão em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
        </div>
      </div>

      {/* Modal to Add / Edit Daily Activity */}
      <DailyPlanModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingActivity(null);
        }}
        currentDate={currentDate}
        activityToEdit={editingActivity}
        onSave={(data, editId) => {
          if (editId) {
            onUpdateActivity(editId, data);
          } else {
            onAddActivity(data);
          }
        }}
      />
    </div>
  );
};
