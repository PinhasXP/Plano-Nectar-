import React from 'react';
import { 
  X,
  Layers
} from 'lucide-react';
import { MAINTENANCE_TYPES, MaintenanceType } from '../types/maintenance';

interface ToolbarProps {
  selectedMaintenanceType: string; // 'all' or one of MAINTENANCE_TYPES
  onSelectMaintenanceType: (type: string) => void;
  maintenanceTypeCounts: Record<string, number>;
  searchTerm?: string;
  setSearchTerm?: (term: string) => void;
  sectorFilter: string;
  setSectorFilter: (sec: string) => void;
  availableSectors: string[];
  categoryFilter?: string;
  setCategoryFilter?: (cat: string) => void;
  onOpenNewEquipment?: () => void;
  onOpenBatchPlan?: () => void;
}

// Aesthetic color accents for the 5 maintenance types
export const MAINTENANCE_TYPE_COLORS: Record<string, { dot: string; border: string; text: string; bgActive: string }> = {
  'Manutenção Preventiva Mensal': {
    dot: 'bg-blue-600',
    border: 'border-blue-300',
    text: 'text-blue-800',
    bgActive: 'bg-blue-50 text-blue-900 border-blue-400 font-semibold',
  },
  'Manutenção Preventiva Anual': {
    dot: 'bg-indigo-600',
    border: 'border-indigo-300',
    text: 'text-indigo-800',
    bgActive: 'bg-indigo-50 text-indigo-900 border-indigo-400 font-semibold',
  },
  'Testes Operacionais': {
    dot: 'bg-emerald-600',
    border: 'border-emerald-300',
    text: 'text-emerald-800',
    bgActive: 'bg-emerald-50 text-emerald-900 border-emerald-400 font-semibold',
  },
  'Revisão do Sistema Hidráulico - Troca de Óleo': {
    dot: 'bg-amber-500',
    border: 'border-amber-300',
    text: 'text-amber-800',
    bgActive: 'bg-amber-50 text-amber-900 border-amber-400 font-semibold',
  },
  'Grandes Intervenções': {
    dot: 'bg-rose-600',
    border: 'border-rose-300',
    text: 'text-rose-800',
    bgActive: 'bg-rose-50 text-rose-900 border-rose-400 font-semibold',
  },
};

export const Toolbar: React.FC<ToolbarProps> = ({
  selectedMaintenanceType,
  onSelectMaintenanceType,
  maintenanceTypeCounts,
  searchTerm,
  setSearchTerm,
  sectorFilter,
  setSectorFilter,
  availableSectors,
  categoryFilter = 'all',
  setCategoryFilter,
  onOpenNewEquipment,
  onOpenBatchPlan,
}) => {
  const isFiltered = sectorFilter !== 'all' || selectedMaintenanceType !== 'all' || categoryFilter !== 'all';

  const clearFilters = () => {
    if (setSearchTerm) setSearchTerm('');
    setSectorFilter('all');
    if (setCategoryFilter) setCategoryFilter('all');
    onSelectMaintenanceType('all');
  };

  const totalActivities = Object.values(maintenanceTypeCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-2.5 space-y-2.5 no-print">
      {/* Top row of Toolbar: Sector Filter, New Equipment */}
      <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Left: Section Indicator */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <Layers className="w-4 h-4 text-blue-600" />
          <span>Filtro por Tipo de Manutenção:</span>
        </div>

        {/* Right: Sector Filter and Action Button */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Equipment Category Group Filter */}
          {setCategoryFilter && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-1.5 px-2.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-600 max-w-[210px] truncate font-medium"
              title="Filtrar por Grupo de Equipamento"
            >
              <option value="all">Todos os Grupos (69)</option>
              <option value="grabs">GRABS - GARRAS (GA, GB)</option>
              <option value="bagging">BAGGING UNITS (CDMU, FH7, FH8)</option>
              <option value="conveyors">CONVEYORS (C, SC, DC, LC, WH, DOH)</option>
              <option value="hoppers">HOPPERS - FUNIS (H, FH5)</option>
            </select>
          )}

          {/* Sector Filter */}
          {availableSectors.length > 0 && (
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="py-1.5 px-2.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-600 max-w-[160px] truncate"
            >
              <option value="all">Todos Fabricantes / Setores</option>
              {availableSectors.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          )}

          {isFiltered && (
            <button
              onClick={clearFilters}
              title="Limpar todos os filtros"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Second row of Toolbar: Clickable Filter Points for Maintenance Types */}
      <div className="max-w-[1920px] mx-auto flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {/* Filter point: Todos */}
        <button
          onClick={() => onSelectMaintenanceType('all')}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all shrink-0 whitespace-nowrap border ${
            selectedMaintenanceType === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-2xs font-semibold'
              : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-slate-400" />
          <span>Todos os Tipos</span>
          <span className={`text-[10px] font-mono px-1 rounded ${
            selectedMaintenanceType === 'all' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
          }`}>
            {totalActivities}
          </span>
        </button>

        {/* Filter points for the 5 specific maintenance types */}
        {MAINTENANCE_TYPES.map((type) => {
          const isSelected = selectedMaintenanceType === type;
          const color = MAINTENANCE_TYPE_COLORS[type] || {
            dot: 'bg-blue-500',
            border: 'border-slate-300',
            text: 'text-slate-800',
            bgActive: 'bg-blue-50 text-blue-900 border-blue-400 font-semibold',
          };
          const count = maintenanceTypeCounts[type] || 0;

          return (
            <button
              key={type}
              onClick={() => onSelectMaintenanceType(isSelected ? 'all' : type)}
              title={`Filtrar por: ${type} (${count} tarefas)`}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all shrink-0 whitespace-nowrap border ${
                isSelected
                  ? `${color.bgActive} shadow-xs ring-1 ring-blue-500/20`
                  : 'bg-white text-slate-700 hover:bg-slate-100/90 border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${color.dot} shrink-0`} />
              <span>{type}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                  isSelected ? 'bg-white/80 font-bold' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
