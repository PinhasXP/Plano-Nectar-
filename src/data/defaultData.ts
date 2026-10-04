import { Equipment } from '../types/maintenance';

export function getDefaultEquipments(): Equipment[] {
  return [
    {
      id: 'eq-cp-01',
      name: 'Compressor de Ar Parafuso Atlas Copco',
      tag: 'CP-01',
      sector: 'Casa de Força / Utilidades',
      activities: [
        {
          id: 'act-cp-1',
          name: 'Inspeção de pressão, temperatura de descarga e estanqueidade dos purgadores',
          maintenanceType: 'Manutenção Preventiva Mensal',
          frequency: 'Mensal',
          responsible: 'Equipe Mecânica',
          days: {
            1: { status: 'OK', notes: 'Pressão 7.2 bar, temp 82°C, nível OK', technician: 'Carlos M.' },
            2: { status: 'OK', notes: 'Pressão 7.1 bar, temp 81°C', technician: 'Carlos M.' },
            3: { status: 'OK', notes: 'Operação estável', technician: 'Carlos M.' },
            4: { status: 'OK', notes: 'Verificado', technician: 'Roberto S.' },
            5: { status: 'OK', notes: 'Parâmetros normais', technician: 'Roberto S.' },
            8: { status: 'P' },
            15: { status: 'P' },
            22: { status: 'P' },
          },
        },
        {
          id: 'act-cp-2',
          name: 'Revisão do circuito de óleo, substituição do elemento filtrante e troca de óleo sintético ISO VG 46',
          maintenanceType: 'Revisão do Sistema Hidráulico - Troca de Óleo',
          frequency: 'Semestral',
          responsible: 'Lubrificador / Mecânica',
          days: {
            12: { status: 'P', notes: 'Drenagem de 20L de óleo e troca do filtro separador' },
          },
        },
        {
          id: 'act-cp-3',
          name: 'Teste operacional de alívio da válvula de segurança e desligamento de emergência',
          maintenanceType: 'Testes Operacionais',
          frequency: 'Mensal',
          responsible: 'Técnico de Segurança / Mecânica',
          days: {
            5: { status: 'OK', notes: 'Válvula disparou exatamente a 8.5 bar', technician: 'Carlos M.' },
            25: { status: 'P' },
          },
        },
        {
          id: 'act-cp-4',
          name: 'Revisão geral anual com calibração de instrumentos de pressão e alinhamento do acoplamento',
          maintenanceType: 'Manutenção Preventiva Anual',
          frequency: 'Anual',
          responsible: 'Engenharia / Especialista',
          days: {
            28: { status: 'P', notes: 'Calibração RBC com emissão de laudo' },
          },
        },
        {
          id: 'act-cp-5',
          name: 'Revisão completa da unidade compressora de parafuso e substituição de rolamentos principais',
          maintenanceType: 'Grandes Intervenções',
          frequency: 'Anual',
          responsible: 'Assistência Técnica Especializada',
          days: {
            30: { status: 'P', notes: 'Parada programada de 24h para overhaul da unidade' },
          },
        },
      ],
    },
    {
      id: 'eq-ger-100',
      name: 'Grupo Gerador Diesel Stemac 500kVA',
      tag: 'G-100',
      sector: 'Subestação Principal',
      activities: [
        {
          id: 'act-ger-1',
          name: 'Inspeção preventiva mensal de baterias, fiação do alternador e nível do fluido radiador',
          maintenanceType: 'Manutenção Preventiva Mensal',
          frequency: 'Mensal',
          responsible: 'Equipe Elétrica',
          days: {
            4: { status: 'OK', notes: 'Baterias 27.4V, nível de água do radiador OK', technician: 'Marcos E.' },
            18: { status: 'P' },
          },
        },
        {
          id: 'act-ger-2',
          name: 'Teste de partida em vazio por 15 minutos e simulação de transferência com carga no QTA',
          maintenanceType: 'Testes Operacionais',
          frequency: 'Semanal',
          responsible: 'Equipe Elétrica',
          days: {
            3: { status: 'OK', notes: 'Partida em 4.2s, 380V, 60.1Hz', technician: 'Marcos E.' },
            10: { status: 'P' },
            17: { status: 'P' },
            24: { status: 'P' },
          },
        },
        {
          id: 'act-ger-3',
          name: 'Drenagem do cárter, substituição dos filtros de óleo lubrificante 15W40 e filtro separador racor',
          maintenanceType: 'Revisão do Sistema Hidráulico - Troca de Óleo',
          frequency: 'Semestral',
          responsible: 'Mecânica Diesel',
          days: {
            14: { status: 'P', notes: 'Abastecer 38L de óleo 15W40 CI-4' },
          },
        },
        {
          id: 'act-ger-4',
          name: 'Manutenção preventiva anual com limpeza química do radiador e reaperto do gerador',
          maintenanceType: 'Manutenção Preventiva Anual',
          frequency: 'Anual',
          responsible: 'Engenharia de Manutenção',
          days: {
            26: { status: 'P', notes: 'Inspeção com laudo termográfico e resistências' },
          },
        },
        {
          id: 'act-ger-5',
          name: 'Overhaul de cabeçotes do motor diesel, teste de bicos injetores e bomba injetora',
          maintenanceType: 'Grandes Intervenções',
          frequency: 'Anual',
          responsible: 'Oficina Especializada Diesel',
          days: {
            29: { status: 'P', notes: 'Retífica programada a cada 5.000 horas' },
          },
        },
      ],
    },
    {
      id: 'eq-bc-02',
      name: 'Bomba Centrífuga de Recalque de Água Bruta KSB',
      tag: 'BC-02',
      sector: 'Casa de Bombas / ETA',
      activities: [
        {
          id: 'act-bc-1',
          name: 'Inspeção preventiva mensal de gaxeta/selo mecânico e vibração dos mancais',
          maintenanceType: 'Manutenção Preventiva Mensal',
          frequency: 'Mensal',
          responsible: 'Operação / Manutenção',
          days: {
            1: { status: 'OK', technician: 'Jorge L.' },
            2: { status: 'OK', technician: 'Jorge L.' },
            3: { status: 'OK', technician: 'Jorge L.' },
            8: { status: 'P' },
            15: { status: 'P' },
            22: { status: 'P' },
          },
        },
        {
          id: 'act-bc-2',
          name: 'Teste operacional de pressão de sucção, recalque e teste de vazão da linha',
          maintenanceType: 'Testes Operacionais',
          frequency: 'Quinzenal',
          responsible: 'Técnico de Processos',
          days: {
            4: { status: 'OK', notes: 'Pressão 6.5 bar, vazão 120 m³/h', technician: 'Luiz F.' },
            18: { status: 'P' },
          },
        },
        {
          id: 'act-bc-3',
          name: 'Substituição do óleo lubrificante da caixa de mancais e limpeza do reservatório',
          maintenanceType: 'Revisão do Sistema Hidráulico - Troca de Óleo',
          frequency: 'Trimestral',
          responsible: 'Lubrificador',
          days: {
            16: { status: 'P', notes: 'Óleo mineral ISO VG 68' },
          },
        },
        {
          id: 'act-bc-4',
          name: 'Alinhamento a laser entre eixos da bomba e motor e verificação de pés-mancos',
          maintenanceType: 'Manutenção Preventiva Anual',
          frequency: 'Anual',
          responsible: 'Técnico Preditiva',
          days: {
            27: { status: 'P' },
          },
        },
        {
          id: 'act-bc-5',
          name: 'Substituição do rotor em bronze, eixo e carcaça por desgaste de abrasão',
          maintenanceType: 'Grandes Intervenções',
          frequency: 'Anual',
          responsible: 'Caldeiraria & Mecânica Pesada',
          days: {
            31: { status: 'P' },
          },
        },
      ],
    },
    {
      id: 'eq-ch-01',
      name: 'Unidade Hidráulica Central de Prensa 200T',
      tag: 'UH-01',
      sector: 'Estamparia / Linha 2',
      activities: [
        {
          id: 'act-uh-1',
          name: 'Inspeção mensal de temperatura do óleo no trocador de calor e vazamentos em mangueiras',
          maintenanceType: 'Manutenção Preventiva Mensal',
          frequency: 'Mensal',
          responsible: 'Mecânico Hidráulico',
          days: {
            2: { status: 'OK', notes: 'Temp estável em 46°C', technician: 'André T.' },
            9: { status: 'P' },
            16: { status: 'P' },
          },
        },
        {
          id: 'act-uh-2',
          name: 'Filtragem contínua, análise de contaminação NAS e troca completa de 350L de óleo hidráulico ISO 68',
          maintenanceType: 'Revisão do Sistema Hidráulico - Troca de Óleo',
          frequency: 'Semestral',
          responsible: 'Equipe de Lubrificação & Hidráulica',
          days: {
            11: { status: 'OK', notes: 'Classe NAS 6 atingida, óleo novo HLP 68', technician: 'André T.' },
            25: { status: 'P' },
          },
        },
        {
          id: 'act-uh-3',
          name: 'Teste operacional de pressão de trabalho das válvulas proporcionais e tempo de ciclo',
          maintenanceType: 'Testes Operacionais',
          frequency: 'Quinzenal',
          responsible: 'Automação & Hidráulica',
          days: {
            6: { status: 'OK', notes: 'Pressão ajustada em 210 bar', technician: 'André T.' },
            20: { status: 'P' },
          },
        },
        {
          id: 'act-uh-4',
          name: 'Revisão anual do bloco manifold, limpeza ultra-sônica das servoválvulas e troca dos acumuladores',
          maintenanceType: 'Manutenção Preventiva Anual',
          frequency: 'Anual',
          responsible: 'Especialista em Sistemas Hidráulicos',
          days: {
            21: { status: 'P', notes: 'Pressurização com nitrogênio seco nos acumuladores' },
          },
        },
        {
          id: 'act-uh-5',
          name: 'Reforma geral dos cilindros hidráulicos principais e retífica da haste cromada',
          maintenanceType: 'Grandes Intervenções',
          frequency: 'Anual',
          responsible: 'Usinagem & Hidráulica Pesada',
          days: {
            28: { status: 'P', notes: 'Troca do kit completo de vedação Chevron' },
          },
        },
      ],
    },
    {
      id: 'eq-pr-01',
      name: 'Ponte Rolante Biviga 10T Demag',
      tag: 'PR-01',
      sector: 'Galpão Fabril - Linha 1',
      activities: [
        {
          id: 'act-pr-1',
          name: 'Inspeção mensal visual de cabos de aço, polias e desgaste das sapatas de freio',
          maintenanceType: 'Manutenção Preventiva Mensal',
          frequency: 'Mensal',
          responsible: 'Técnico de Segurança / Mecânica',
          days: {
            2: { status: 'OK', notes: 'Cabos sem arames rompidos', technician: 'Vitor H.' },
            9: { status: 'P' },
            16: { status: 'P' },
            23: { status: 'P' },
          },
        },
        {
          id: 'act-pr-2',
          name: 'Teste de carga, atuação dos fins de curso elétricos e freios eletromagnéticos de elevação',
          maintenanceType: 'Testes Operacionais',
          frequency: 'Mensal',
          responsible: 'Equipe Elétrica',
          days: {
            5: { status: 'OK', notes: 'Fins de curso e freios testados a 100% da capacidade', technician: 'Vitor H.' },
            19: { status: 'P' },
          },
        },
        {
          id: 'act-pr-3',
          name: 'Drenagem e troca de óleo lubrificante sintético nos redutores de elevação e translação',
          maintenanceType: 'Revisão do Sistema Hidráulico - Troca de Óleo',
          frequency: 'Semestral',
          responsible: 'Lubrificador',
          days: {
            17: { status: 'P', notes: 'Óleo de engrenagens ISO VG 320' },
          },
        },
        {
          id: 'act-pr-4',
          name: 'Inspeção anual com ultrassom nas soldas estruturais da viga principal e trilhos',
          maintenanceType: 'Manutenção Preventiva Anual',
          frequency: 'Anual',
          responsible: 'Engenharia de Soldagem / END',
          days: {
            24: { status: 'P', notes: 'Emissão de laudo estrutural NR-11' },
          },
        },
        {
          id: 'act-pr-5',
          name: 'Substituição completa do tambor de elevação, redutor planetário e cabo de aço',
          maintenanceType: 'Grandes Intervenções',
          frequency: 'Anual',
          responsible: 'Montagem Industrial & Demag',
          days: {
            29: { status: 'P', notes: 'Intervenção crítica com guindaste móvel' },
          },
        },
      ],
    },
  ];
}
