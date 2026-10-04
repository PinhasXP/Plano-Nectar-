export interface EquipmentCategory {
  id: string;
  name: string;
  subtitle: string;
  prefixes: string[];
  borderColor: string;
  tagBadge: string;
}

export const EQUIPMENT_CATEGORIES: EquipmentCategory[] = [
  {
    id: 'grabs',
    name: 'GRABS - GARRAS',
    subtitle: 'Equipamentos GA e GB',
    prefixes: ['GA', 'GB'],
    borderColor: 'border-l-amber-500',
    tagBadge: 'bg-amber-100 text-amber-900 border-amber-300',
  },
  {
    id: 'bagging',
    name: 'BAGGING UNITS - MÁQUINAS ENSACADORAS',
    subtitle: 'Equipamentos CDMU, FH7 e FH8',
    prefixes: ['CDMU', 'FH7', 'FH8'],
    borderColor: 'border-l-blue-500',
    tagBadge: 'bg-blue-100 text-blue-900 border-blue-300',
  },
  {
    id: 'conveyors',
    name: 'CONVEYORS - TAPETES',
    subtitle: 'Equipamentos C, SC, DC, LC, WH e DOH',
    prefixes: ['C', 'SC', 'DC', 'LC', 'WH', 'DOH'],
    borderColor: 'border-l-emerald-500',
    tagBadge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  },
  {
    id: 'hoppers',
    name: 'HOPPERS - FUNIS',
    subtitle: 'Equipamentos H e FH5',
    prefixes: ['H', 'FH5'],
    borderColor: 'border-l-purple-500',
    tagBadge: 'bg-purple-100 text-purple-900 border-purple-300',
  },
];

export function getEquipmentCategory(tag: string): EquipmentCategory {
  const t = (tag || '').trim().toUpperCase();

  // 1. GRABS - GARRAS (GA, GB)
  if (t.startsWith('GA') || t.startsWith('GB')) {
    return EQUIPMENT_CATEGORIES[0];
  }

  // 2. BAGGING UNITS - MÁQUINAS ENSACADORAS (CDMU, FH7, FH8)
  if (t.startsWith('CDMU') || t.startsWith('FH7') || t.startsWith('FH8')) {
    return EQUIPMENT_CATEGORIES[1];
  }

  // 3. CONVEYORS - TAPETES (C, SC, DC, LC, WH, DOH)
  if (
    t.startsWith('SC') ||
    t.startsWith('DC') ||
    t.startsWith('LC') ||
    t.startsWith('WH') ||
    t.startsWith('DOH') ||
    t === 'C' ||
    /^C\d/.test(t)
  ) {
    return EQUIPMENT_CATEGORIES[2];
  }

  // 4. HOPPERS - FUNIS (H, FH5)
  if (t.startsWith('FH5') || t.startsWith('H')) {
    return EQUIPMENT_CATEGORIES[3];
  }

  return {
    id: 'other',
    name: 'OUTROS EQUIPAMENTOS',
    subtitle: 'Diversos',
    prefixes: [],
    borderColor: 'border-l-slate-400',
    tagBadge: 'bg-slate-100 text-slate-800 border-slate-300',
  };
}
