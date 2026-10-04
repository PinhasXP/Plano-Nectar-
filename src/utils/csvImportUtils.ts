import { Equipment, Activity, CellData, MAINTENANCE_TYPES, MaintenanceType } from '../types/maintenance';

export function parseCSVToEquipments(csvContent: string): Equipment[] {
  // Normalize lines
  const lines = csvContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    throw new Error('O arquivo CSV deve conter um cabeçalho e pelo menos uma linha de dados.');
  }

  // Detect separator: ';' or ','
  const firstLine = lines[0];
  const separator = firstLine.includes(';') ? ';' : ',';

  // Helper to split row handling quotes
  const parseRow = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === separator && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const header = parseRow(lines[0]).map((h) => h.toLowerCase());

  // Find column indices
  let sectorIdx = header.findIndex((h) => h.includes('setor') || h.includes('área') || h.includes('area'));
  let tagIdx = header.findIndex((h) => h.includes('tag') || h.includes('código') || h.includes('codigo') || h.includes('id'));
  let eqIdx = header.findIndex((h) => h.includes('equipamento') || h.includes('máquina') || h.includes('maquina'));
  let actIdx = header.findIndex((h) => h.includes('atividade') || h.includes('tarefa') || h.includes('descrição') || h.includes('descricao'));
  let typeIdx = header.findIndex((h) => h.includes('tipo') || h.includes('manutenção') || h.includes('manutencao'));
  let freqIdx = header.findIndex((h) => h.includes('frequência') || h.includes('frequencia') || h.includes('periodicidade'));
  let respIdx = header.findIndex((h) => h.includes('responsável') || h.includes('responsavel') || h.includes('técnico') || h.includes('tecnico'));

  // Fallbacks if header is not exact
  if (tagIdx === -1 && header.length > 1) tagIdx = 1;
  if (eqIdx === -1 && header.length > 2) eqIdx = 2;
  if (actIdx === -1 && header.length > 3) actIdx = 3;

  const equipmentsMap = new Map<string, Equipment>();

  for (let i = 1; i < lines.length; i++) {
    const row = parseRow(lines[i]);
    if (row.length === 0 || row.every((c) => !c)) continue;

    const sector = sectorIdx >= 0 ? row[sectorIdx] || 'Geral' : 'Geral';
    const tag = tagIdx >= 0 ? row[tagIdx] || `EQ-${i}` : `EQ-${i}`;
    const eqName = eqIdx >= 0 ? row[eqIdx] || `Equipamento ${tag}` : `Equipamento ${tag}`;
    const actName = actIdx >= 0 ? row[actIdx] : '';

    if (!actName && !tag) continue;

    const rawType = typeIdx >= 0 ? row[typeIdx] : '';
    // Match with one of the 5 official types if possible
    let matchedType: string = MAINTENANCE_TYPES[0];
    const foundType = MAINTENANCE_TYPES.find(
      (t) => rawType && t.toLowerCase().includes(rawType.toLowerCase())
    );
    if (foundType) {
      matchedType = foundType;
    } else if (rawType) {
      matchedType = rawType;
    }

    const frequency = freqIdx >= 0 ? row[freqIdx] || 'Mensal' : 'Mensal';
    const responsible = respIdx >= 0 ? row[respIdx] || 'Equipe Manutenção' : 'Equipe Manutenção';

    // Parse days if present (columns starting with "dia" or numbered)
    const days: Record<number, CellData> = {};
    header.forEach((h, colIndex) => {
      const dayMatch = h.match(/dia\s*(\d+)/i) || h.match(/^(\d{1,2})$/);
      if (dayMatch && colIndex < row.length) {
        const dayNum = parseInt(dayMatch[1], 10);
        const cellVal = (row[colIndex] || '').trim().toUpperCase();
        if (cellVal) {
          days[dayNum] = { status: cellVal };
        }
      }
    });

    let existingEq = equipmentsMap.get(tag);
    if (!existingEq) {
      existingEq = {
        id: `eq-import-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: eqName,
        tag: tag.toUpperCase(),
        sector,
        activities: [],
      };
      equipmentsMap.set(tag, existingEq);
    }

    if (actName) {
      const newAct: Activity = {
        id: `act-import-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: actName,
        maintenanceType: matchedType,
        frequency,
        responsible,
        days,
      };
      existingEq.activities.push(newAct);
    }
  }

  return Array.from(equipmentsMap.values());
}
