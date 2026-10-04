import React from 'react';
import { 
  Printer, 
  RotateCcw, 
  Calendar,
  Layers,
  Cloud,
  Lock,
  Unlock,
  KeyRound,
  UserCheck,
  ShieldAlert
} from 'lucide-react';
import { MONTH_NAMES } from '../utils/dateUtils';
import { HummingbirdIcon } from './HummingbirdIcon';

interface HeaderProps {
  currentYear: number;
  currentMonth: number;
  equipmentsCount: number;
  activitiesCount: number;
  lastSaved?: string;
  isSaving: boolean;
  cloudSyncStatus?: 'synced' | 'saving' | 'offline';
  isAdminUnlocked?: boolean;
  allowNonAdminEdit?: boolean;
  onToggleNonAdminEdit?: () => void;
  onOpenPinModal?: () => void;
  onLockAdmin?: () => void;
  onOpenChangePinModal?: () => void;
  onResetDefaults: () => void;
  onPrint: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentYear,
  currentMonth,
  equipmentsCount,
  activitiesCount,
  lastSaved,
  isSaving,
  cloudSyncStatus = 'synced',
  isAdminUnlocked = false,
  allowNonAdminEdit = true,
  onToggleNonAdminEdit,
  onOpenPinModal,
  onLockAdmin,
  onOpenChangePinModal,
  onResetDefaults,
  onPrint,
}) => {
  const formattedSavedTime = lastSaved
    ? new Date(lastSaved).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '';

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-40 shadow-xs no-print">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Zone 1: Brand Title */}
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-xs shrink-0 p-1 overflow-hidden"
            style={{ backgroundColor: '#3884cb' }}
            title="Logotipo Oficial Beija-Flor"
          >
            <HummingbirdIcon className="w-full h-full text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-tight">
              Plano de Manutenção - BULK HANDLING EQUIPMENT
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Sistema de Planejamento e Controle de Manutenção.
            </p>
          </div>
        </div>

        {/* Zone 2: Informational Context & Cloud-sync status */}
        <div className="hidden lg:flex items-center gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 font-medium text-slate-700 bg-slate-100/80 px-2.5 py-1 rounded-md">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>{MONTH_NAMES[currentMonth]} {currentYear}</span>
          </div>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>{equipmentsCount} equipamentos</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>{activitiesCount} atividades</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Cloud className={`w-3.5 h-3.5 ${cloudSyncStatus === 'saving' || isSaving ? 'animate-pulse text-blue-600' : 'text-emerald-600'}`} />
            <span className="font-medium">
              {cloudSyncStatus === 'saving' || isSaving
                ? 'Sincronizando na Nuvem...'
                : `Nuvem Online (Firebase) ${formattedSavedTime ? `· ${formattedSavedTime}` : ''}`}
            </span>
          </div>
        </div>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2">
          {/* User Permission Mode (Alternar entre 'Só Admin' e 'Liberado' - requer PIN de 4 dígitos) */}
          {onToggleNonAdminEdit && (
            <button
              onClick={onToggleNonAdminEdit}
              title={
                allowNonAdminEdit
                  ? "Modo Atual: Liberado. Clique para mudar para 'Só Admin' (requer PIN de 4 dígitos)."
                  : "Modo Atual: Só Admin. Clique para mudar para 'Liberado' (requer PIN de 4 dígitos)."
              }
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer ${
                allowNonAdminEdit
                  ? "bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100"
                  : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
              }`}
            >
              {allowNonAdminEdit ? (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="hidden sm:inline text-[11px] text-slate-600">Modo:</span>
                  <span className="font-bold text-blue-900 text-xs">Liberado</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="hidden sm:inline text-[11px] text-slate-500">Modo:</span>
                  <span className="font-bold text-slate-800 text-xs">Só Admin</span>
                </>
              )}
            </button>
          )}

          {/* Admin Lock / Unlock Status */}
          {isAdminUnlocked ? (
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 rounded-lg p-1 shadow-2xs">
              <span 
                className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-bold text-emerald-800"
                title="Modo Administrador ativo: todas as edições estão liberadas"
              >
                <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Admin Ativo</span>
              </span>
              {onOpenChangePinModal && (
                <button
                  onClick={onOpenChangePinModal}
                  title="Alterar PIN de administrador"
                  className="px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:text-slate-900 hover:bg-emerald-100 rounded transition-colors"
                >
                  <span>Mudar PIN</span>
                </button>
              )}
              {onLockAdmin && (
                <button
                  onClick={onLockAdmin}
                  title="Bloquear edições agora e retornar ao modo somente leitura"
                  className="px-2.5 py-0.5 text-[11px] font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded border border-red-200 transition-colors"
                >
                  Bloquear Edições
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenPinModal}
              title="O sistema está em modo somente leitura. Clique para inserir o PIN de Administrador e liberar edições."
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-50 border border-amber-300 rounded-lg hover:bg-amber-100 transition-colors shadow-2xs"
            >
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Somente Leitura (Entrar como Admin)</span>
            </button>
          )}

          {/* Gerar Relatório / Imprimir */}
          <button
            onClick={onPrint}
            title="Gerar Relatório Oficial / Imprimir PDF com Termo de Assinaturas"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Gerar Relatório</span>
          </button>

          {/* Reset Defaults */}
          <button
            onClick={onResetDefaults}
            title="Redefinir para o plano de manutenção industrial padrão"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Padrão</span>
          </button>
        </div>
      </div>
    </header>
  );
};
