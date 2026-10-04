import React, { useState, useEffect } from 'react';
import { X, Wrench } from 'lucide-react';
import { Equipment } from '../types/maintenance';

interface EquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipmentToEdit?: Equipment | null;
  onSave: (equipmentData: { name: string; tag: string; sector: string }) => void;
}

export const EquipmentModal: React.FC<EquipmentModalProps> = ({
  isOpen,
  onClose,
  equipmentToEdit,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [sector, setSector] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (equipmentToEdit) {
        setName(equipmentToEdit.name);
        setTag(equipmentToEdit.tag);
        setSector(equipmentToEdit.sector);
      } else {
        setName('');
        setTag('');
        setSector('');
      }
    }
  }, [isOpen, equipmentToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !tag.trim()) return;

    onSave({
      name: name.trim(),
      tag: tag.trim().toUpperCase(),
      sector: sector.trim() || 'Geral',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/70">
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                {equipmentToEdit ? 'Editar Equipamento' : 'Novo Equipamento'}
              </h3>
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
                TAG / Identificador do Equipamento *
              </label>
              <input
                type="text"
                required
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="Ex: CP-01, G-100, BC-02, PR-01"
                className="w-full px-3 py-1.5 text-xs font-mono font-semibold border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-600 uppercase"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Nome do Equipamento / Descrição *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Compressor de Ar Parafuso Atlas Copco"
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Setor / Área de Instalação
              </label>
              <input
                type="text"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                placeholder="Ex: Casa de Força, Linha 1, ETA, Subestação"
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-600"
              />
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
              {equipmentToEdit ? 'Atualizar' : 'Adicionar Equipamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
