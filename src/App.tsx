/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { 
  getInitialStorageData, 
  saveStorageData, 
  resetToDefaults, 
  exportBackupJSON, 
  parseImportJSON 
} from './utils/storage';
import { exportMonthToCSV } from './utils/exportUtils';
import { parseCSVToEquipments } from './utils/csvImportUtils';
import { getDaysInMonth, MONTH_NAMES } from './utils/dateUtils';
import { testFirestoreConnection } from './firebase/config';
import { subscribeToMonthlyPlan, saveMonthlyPlanToCloud } from './firebase/maintenanceService';
import { 
  StorageData, 
  Equipment, 
  Activity, 
  CellData, 
  YearData,
  MAINTENANCE_TYPES,
  MaintenanceType 
} from './types/maintenance';
import { DailyActivity } from './types/dailyPlan';
import { 
  subscribeToDailyPlan, 
  saveDailyPlanToCloud, 
  getInitialDailyActivities 
} from './firebase/dailyPlanService';
import { get2027Equipments, ensureTwoActivitiesPerEquipment } from './data/equipments2027';
import { getEquipmentCategory } from './utils/equipmentCategories';
import { HummingbirdIcon } from './components/HummingbirdIcon';
import { Header } from './components/Header';
import { MonthSelector } from './components/MonthSelector';
import { MetricsBar } from './components/MetricsBar';
import { Toolbar } from './components/Toolbar';
import { SpreadsheetGrid } from './components/SpreadsheetGrid';
import { CellModal } from './components/CellModal';
import { BatchPlanModal } from './components/BatchPlanModal';
import { EquipmentModal } from './components/EquipmentModal';
import { ActivityModal } from './components/ActivityModal';
import { DailyPlanDashboard } from './components/DailyPlanDashboard';
import { AdminPinModal } from './components/AdminPinModal';
import { ChangePinModal } from './components/ChangePinModal';
import { Clock, FileSpreadsheet, CalendarDays, Copy } from 'lucide-react';

export default function App() {
  const [data, setData] = useState<StorageData>(() => getInitialStorageData());
  const [isSaving, setIsSaving] = useState(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'saving' | 'offline'>('synced');

  // Navigation tab: 'daily' (Dashboard Inicial) | 'monthly' (Matriz Mensal)
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly'>('monthly');

  // Daily Plan State
  const [dailyDate, setDailyDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [dailyActivities, setDailyActivities] = useState<DailyActivity[]>(() => {
    const today = new Date().toISOString().split('T')[0];
    const cached = localStorage.getItem(`daily_plan_${today}`);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {}
    }
    return getInitialDailyActivities(today);
  });

  // Filters
  const [selectedMaintenanceType, setSelectedMaintenanceType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modals state
  const [cellModalState, setCellModalState] = useState<{
    isOpen: boolean;
    equipmentId: string;
    activityId: string;
    dayNumber: number;
    cellData: CellData;
    equipmentName: string;
    activityName: string;
  }>({
    isOpen: false,
    equipmentId: '',
    activityId: '',
    dayNumber: 1,
    cellData: { status: '' },
    equipmentName: '',
    activityName: '',
  });

  const [batchPlanModalOpen, setBatchPlanModalOpen] = useState(false);
  const [batchPlanTarget, setBatchPlanTarget] = useState<{
    equipmentId?: string;
    activityId?: string;
  }>({});

  const [equipmentModalState, setEquipmentModalState] = useState<{
    isOpen: boolean;
    equipmentToEdit: Equipment | null;
  }>({
    isOpen: false,
    equipmentToEdit: null,
  });

  const [activityModalState, setActivityModalState] = useState<{
    isOpen: boolean;
    equipmentId: string;
    equipmentName: string;
    activityToEdit: Activity | null;
  }>({
    isOpen: false,
    equipmentId: '',
    equipmentName: '',
    activityToEdit: null,
  });

  // Floating Toast Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4500);
  }, []);

  // Admin PIN Security State (4-digit code required for all edits)
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [changePinModalOpen, setChangePinModalOpen] = useState(false);
  const [currentAdminPin, setCurrentAdminPin] = useState<string>(() => {
    return localStorage.getItem('pcm_admin_pin') || '1234';
  });
  const [allowNonAdminEdit, setAllowNonAdminEdit] = useState<boolean>(() => {
    const stored = localStorage.getItem('pcm_allow_non_admin_edit');
    return stored !== null ? stored === 'true' : true;
  });

  const pendingActionRef = useRef<(() => void) | null>(null);

  const handleToggleNonAdminEdit = () => {
    // Para mudar entre 'Só Admin' e 'Liberado' deve pedir o PIN de acesso (4 dígitos)
    pendingActionRef.current = () => {
      setAllowNonAdminEdit((prev) => {
        const next = !prev;
        localStorage.setItem('pcm_allow_non_admin_edit', String(next));
        showToast(
          next
            ? 'Modo Liberado ativo: Usuários podem editar o Plano Anual!'
            : 'Modo Só Admin ativo: Toques de edição não terão nenhuma resposta!'
        );
        return next;
      });
    };
    setPinModalOpen(true);
  };

  const requireAdminPin = useCallback(
    (action: () => void) => {
      if (isAdminUnlocked) {
        action();
      } else {
        pendingActionRef.current = action;
        setPinModalOpen(true);
      }
    },
    [isAdminUnlocked]
  );

  const handlePinSuccess = () => {
    setIsAdminUnlocked(true);
    setPinModalOpen(false);
    if (pendingActionRef.current) {
      const act = pendingActionRef.current;
      pendingActionRef.current = null;
      act();
    }
  };

  const handleSaveNewPin = (newPin: string) => {
    setCurrentAdminPin(newPin);
    localStorage.setItem('pcm_admin_pin', newPin);
  };

  const handleLockAdmin = () => {
    setIsAdminUnlocked(false);
  };

  const currentYear = data.currentYear;
  const currentMonth = data.currentMonth;

  // Retrieve current year's month data
  const currentYearData: YearData = useMemo(() => {
    return data.years[currentYear] || {};
  }, [data.years, currentYear]);

  // Current month's equipments list (normalized so every equipment has two activity rows)
  const currentMonthEquipments: Equipment[] = useMemo(() => {
    const list = currentYearData[currentMonth];
    if (list && list.length > 0) return ensureTwoActivitiesPerEquipment(list);
    if (currentYear === 2027) {
      return get2027Equipments(currentMonth);
    }
    return [];
  }, [currentYearData, currentMonth, currentYear]);

  // Days in selected month
  const daysInCurrentMonth = useMemo(() => {
    return getDaysInMonth(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  // Validate connection to Firestore on mount as mandated by skill
  React.useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Real-time synchronization with Firebase Firestore for the selected month
  React.useEffect(() => {
    const unsubscribe = subscribeToMonthlyPlan(
      currentYear,
      currentMonth,
      (cloudEquipments) => {
        if (cloudEquipments !== null) {
          const normalized = ensureTwoActivitiesPerEquipment(cloudEquipments);
          setData((prev) => {
            const updatedYears = {
              ...prev.years,
              [currentYear]: {
                ...(prev.years[currentYear] || {}),
                [currentMonth]: normalized,
              },
            };
            const updated = { ...prev, years: updatedYears };
            saveStorageData(updated);
            return updated;
          });
          setCloudSyncStatus('synced');
        } else {
          // Document does not exist in cloud yet: seed with current month equipments
          if (currentMonthEquipments.length > 0) {
            saveMonthlyPlanToCloud(currentYear, currentMonth, currentMonthEquipments).catch(() => {});
          }
        }
      },
      () => {
        setCloudSyncStatus('offline');
      }
    );

    return () => unsubscribe();
  }, [currentYear, currentMonth]);

  // Real-time synchronization with Firebase Firestore for the selected daily plan
  React.useEffect(() => {
    const unsubscribe = subscribeToDailyPlan(
      dailyDate,
      (cloudActivities) => {
        if (cloudActivities !== null) {
          setDailyActivities(cloudActivities);
          localStorage.setItem(`daily_plan_${dailyDate}`, JSON.stringify(cloudActivities));
          setCloudSyncStatus('synced');
        } else {
          // If not in cloud, check localStorage or initialize
          const cached = localStorage.getItem(`daily_plan_${dailyDate}`);
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              setDailyActivities(parsed);
              if (parsed.length > 0) {
                saveDailyPlanToCloud(dailyDate, parsed).catch(() => {});
              }
            } catch (e) {}
          } else {
            const defaults = getInitialDailyActivities(dailyDate);
            setDailyActivities(defaults);
            saveDailyPlanToCloud(dailyDate, defaults).catch(() => {});
          }
        }
      },
      () => {
        setCloudSyncStatus('offline');
      }
    );

    return () => unsubscribe();
  }, [dailyDate]);

  // Handlers for Daily Activity Plan
  const handleAddDailyActivity = (activityData: Omit<DailyActivity, 'id'>) => {
    const newActivity: DailyActivity = {
      ...activityData,
      id: `daily-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newActivity, ...dailyActivities];
    setDailyActivities(updated);
    localStorage.setItem(`daily_plan_${dailyDate}`, JSON.stringify(updated));
    setCloudSyncStatus('saving');
    saveDailyPlanToCloud(dailyDate, updated)
      .then(() => setCloudSyncStatus('synced'))
      .catch(() => setCloudSyncStatus('offline'));
  };

  const handleUpdateDailyActivity = (id: string, updatedFields: Partial<DailyActivity>) => {
    const updated = dailyActivities.map((act) =>
      act.id === id ? { ...act, ...updatedFields, updatedAt: new Date().toISOString() } : act
    );
    setDailyActivities(updated);
    localStorage.setItem(`daily_plan_${dailyDate}`, JSON.stringify(updated));
    setCloudSyncStatus('saving');
    saveDailyPlanToCloud(dailyDate, updated)
      .then(() => setCloudSyncStatus('synced'))
      .catch(() => setCloudSyncStatus('offline'));
  };

  const handleDeleteDailyActivity = (id: string) => {
    if (!window.confirm('Deseja excluir esta atividade do plano do dia?')) return;
    const updated = dailyActivities.filter((act) => act.id !== id);
    setDailyActivities(updated);
    localStorage.setItem(`daily_plan_${dailyDate}`, JSON.stringify(updated));
    setCloudSyncStatus('saving');
    saveDailyPlanToCloud(dailyDate, updated)
      .then(() => setCloudSyncStatus('synced'))
      .catch(() => setCloudSyncStatus('offline'));
  };

  const handleLoadDailySamples = () => {
    const samples = getInitialDailyActivities(dailyDate);
    setDailyActivities(samples);
    localStorage.setItem(`daily_plan_${dailyDate}`, JSON.stringify(samples));
    setCloudSyncStatus('saving');
    saveDailyPlanToCloud(dailyDate, samples)
      .then(() => setCloudSyncStatus('synced'))
      .catch(() => setCloudSyncStatus('offline'));
  };

  // Persist to localStorage whenever data changes
  const persistData = useCallback((newData: StorageData) => {
    setIsSaving(true);
    setData(newData);
    saveStorageData(newData);
    setTimeout(() => {
      setIsSaving(false);
    }, 200);
  }, []);

  // Update current month equipments (saves locally and to Firebase Cloud)
  const updateCurrentMonthEquipments = useCallback(
    (newEquipments: Equipment[]) => {
      const normalized = ensureTwoActivitiesPerEquipment(newEquipments);
      const updatedYears = {
        ...data.years,
        [currentYear]: {
          ...(data.years[currentYear] || {}),
          [currentMonth]: normalized,
        },
      };

      const updatedData: StorageData = {
        ...data,
        years: updatedYears,
      };

      persistData(updatedData);

      // Real-time Cloud Save (Firebase Firestore)
      setCloudSyncStatus('saving');
      saveMonthlyPlanToCloud(currentYear, currentMonth, normalized)
        .then(() => {
          setCloudSyncStatus('synced');
        })
        .catch(() => {
          setCloudSyncStatus('offline');
        });
    },
    [data, currentYear, currentMonth, persistData]
  );

  // Switch month
  const handleSelectMonth = (monthIndex: number) => {
    const updatedData: StorageData = {
      ...data,
      currentMonth: monthIndex,
    };
    persistData(updatedData);
  };

  // Switch year
  const handleChangeYear = (newYear: number) => {
    const updatedData: StorageData = {
      ...data,
      currentYear: newYear,
    };
    persistData(updatedData);
  };

  // Replicate structure from current month to next month
  const handleCopyMonthToNext = () => {
    const nextMonth = (currentMonth + 1) % 12;
    const targetYear = nextMonth === 0 ? currentYear + 1 : currentYear;
    const nextMonthName = MONTH_NAMES[nextMonth];

    const confirmCopy = window.confirm(
      `Deseja replicar a lista de equipamentos e atividades de ${MONTH_NAMES[currentMonth]} para ${nextMonthName} de ${targetYear}? (Os dias do novo mês iniciarão limpos para novo planejamento)`
    );

    if (!confirmCopy) return;

    // Create a clean copy of the structure without day checkmarks
    const clonedEquipments: Equipment[] = currentMonthEquipments.map((eq) => ({
      ...eq,
      id: `eq-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      activities: eq.activities.map((act) => ({
        ...act,
        id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        days: {}, // reset days
      })),
    }));

    const targetYearData = data.years[targetYear] || {};
    const updatedYears = {
      ...data.years,
      [targetYear]: {
        ...targetYearData,
        [nextMonth]: clonedEquipments,
      },
    };

    const updatedData: StorageData = {
      ...data,
      currentYear: targetYear,
      currentMonth: nextMonth,
      years: updatedYears,
    };

    persistData(updatedData);
  };

  // Cell Update
  const handleUpdateCell = (
    equipmentId: string,
    activityId: string,
    day: number,
    cellData: CellData
  ) => {
    const updated = currentMonthEquipments.map((eq) => {
      if (eq.id !== equipmentId) return eq;
      return {
        ...eq,
        activities: eq.activities.map((act) => {
          if (act.id !== activityId) return act;
          const newDays = { ...act.days };
          if (!cellData.status && !cellData.notes && !cellData.technician) {
            delete newDays[day];
          } else {
            newDays[day] = cellData;
          }
          return {
            ...act,
            days: newDays,
          };
        }),
      };
    });

    updateCurrentMonthEquipments(updated);
  };

  // Open Cell Detail Modal
  const handleOpenCellDetails = (
    equipmentId: string,
    activityId: string,
    dayNumber: number,
    currentData: CellData
  ) => {
    const eq = currentMonthEquipments.find((e) => e.id === equipmentId);
    const act = eq?.activities.find((a) => a.id === activityId);

    setCellModalState({
      isOpen: true,
      equipmentId,
      activityId,
      dayNumber,
      cellData: currentData,
      equipmentName: eq ? `[${eq.tag}] ${eq.name}` : '',
      activityName: act?.name || '',
    });
  };

  // Equipment actions
  const handleSaveEquipment = (eqData: { name: string; tag: string; sector: string }) => {
    if (equipmentModalState.equipmentToEdit) {
      // Edit existing
      const updated = currentMonthEquipments.map((eq) => {
        if (eq.id !== equipmentModalState.equipmentToEdit?.id) return eq;
        return {
          ...eq,
          name: eqData.name,
          tag: eqData.tag,
          sector: eqData.sector,
        };
      });
      updateCurrentMonthEquipments(updated);
    } else {
      // Create new
      const newEquipment: Equipment = {
        id: `eq-${Date.now()}`,
        name: eqData.name,
        tag: eqData.tag,
        sector: eqData.sector,
        activities: [],
      };
      updateCurrentMonthEquipments([...currentMonthEquipments, newEquipment]);
    }
  };

  const handleDeleteEquipment = (equipmentId: string) => {
    const eq = currentMonthEquipments.find((e) => e.id === equipmentId);
    if (!eq) return;

    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o equipamento "${eq.tag} - ${eq.name}" e todas as suas atividades?`
    );
    if (confirmed) {
      const filtered = currentMonthEquipments.filter((e) => e.id !== equipmentId);
      updateCurrentMonthEquipments(filtered);
    }
  };

  // Activity actions
  const handleSaveActivity = (actData: {
    name: string;
    maintenanceType: string;
    frequency: string;
    responsible: string;
  }) => {
    const { equipmentId, activityToEdit } = activityModalState;

    const updated = currentMonthEquipments.map((eq) => {
      if (eq.id !== equipmentId) return eq;

      if (activityToEdit) {
        // Edit existing
        return {
          ...eq,
          activities: eq.activities.map((a) => {
            if (a.id !== activityToEdit.id) return a;
            return {
              ...a,
              name: actData.name,
              maintenanceType: actData.maintenanceType,
              frequency: actData.frequency,
              responsible: actData.responsible,
            };
          }),
        };
      } else {
        // Add new
        const newAct: Activity = {
          id: `act-${Date.now()}`,
          name: actData.name,
          maintenanceType: actData.maintenanceType,
          frequency: actData.frequency,
          responsible: actData.responsible,
          days: {},
        };
        return {
          ...eq,
          activities: [...eq.activities, newAct],
        };
      }
    });

    updateCurrentMonthEquipments(updated);
  };

  const handleDeleteActivity = (equipmentId: string, activityId: string) => {
    const confirmed = window.confirm('Deseja excluir esta atividade de manutenção?');
    if (confirmed) {
      const updated = currentMonthEquipments.map((eq) => {
        if (eq.id !== equipmentId) return eq;
        return {
          ...eq,
          activities: eq.activities.filter((a) => a.id !== activityId),
        };
      });
      updateCurrentMonthEquipments(updated);
    }
  };

  // Duplicate horizontal row for equipment to allow planning 2 different activities on different days
  const handleDuplicateActivity = (equipmentId: string, activityId?: string) => {
    const eq = currentMonthEquipments.find((e) => e.id === equipmentId);
    if (!eq) return;

    let baseAct: Activity | undefined = undefined;
    if (activityId) {
      baseAct = eq.activities.find((a) => a.id === activityId);
    }
    if (!baseAct && eq.activities.length > 0) {
      baseAct = eq.activities[0];
    }

    const nextActivityNumber = eq.activities.length + 1;
    const defaultName = baseAct 
      ? `${baseAct.name} (Atividade ${nextActivityNumber})`
      : 'Nova Atividade de Manutenção';

    const newActivity: Activity = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: defaultName,
      maintenanceType: baseAct?.maintenanceType || 'Manutenção Preventiva Mensal',
      frequency: baseAct?.frequency || 'Mensal',
      responsible: baseAct?.responsible || 'Equipe de Manutenção',
      days: {}, // Fresh empty days so the user can schedule different days for this 2nd activity
    };

    const updated = currentMonthEquipments.map((item) => {
      if (item.id !== equipmentId) return item;

      const newActivities = [...item.activities];
      if (activityId) {
        const index = newActivities.findIndex((a) => a.id === activityId);
        if (index !== -1) {
          newActivities.splice(index + 1, 0, newActivity);
        } else {
          newActivities.push(newActivity);
        }
      } else {
        newActivities.push(newActivity);
      }

      return {
        ...item,
        activities: newActivities,
      };
    });

    updateCurrentMonthEquipments(updated);
    showToast(`Linha duplicada para [${eq.tag}]! Agora você pode definir a 2ª atividade e dias diferentes.`);
  };

  // Eliminate additional activity from equipment
  const handleDeleteLastActivity = (equipmentId: string) => {
    const eq = currentMonthEquipments.find((e) => e.id === equipmentId);
    if (!eq) return;
    if (eq.activities.length <= 1) {
      alert(`O equipamento [${eq.tag}] possui apenas 1 atividade.`);
      return;
    }

    const lastAct = eq.activities[eq.activities.length - 1];
    const confirmed = window.confirm(
      `Deseja eliminar a atividade adicional "${lastAct.name}" do equipamento [${eq.tag}]?`
    );
    if (!confirmed) return;

    const updated = currentMonthEquipments.map((item) => {
      if (item.id !== equipmentId) return item;
      return {
        ...item,
        activities: item.activities.slice(0, -1),
      };
    });

    updateCurrentMonthEquipments(updated);
    showToast(`Atividade eliminada com sucesso de [${eq.tag}].`);
  };

  // Batch Plan Action
  const handleApplyBatchPlan = (
    equipmentId: string,
    activityId: string,
    dayNumbers: number[],
    statusToApply: string
  ) => {
    const updated = currentMonthEquipments.map((eq) => {
      if (eq.id !== equipmentId) return eq;
      return {
        ...eq,
        activities: eq.activities.map((act) => {
          if (act.id !== activityId) return act;
          const newDays = { ...act.days };

          dayNumbers.forEach((d) => {
            if (!statusToApply) {
              delete newDays[d];
            } else {
              newDays[d] = {
                ...(newDays[d] || {}),
                status: statusToApply,
                updatedAt: new Date().toISOString(),
              };
            }
          });

          return {
            ...act,
            days: newDays,
          };
        }),
      };
    });

    updateCurrentMonthEquipments(updated);
  };

  // Export handlers
  const handleExportCSV = () => {
    exportMonthToCSV(currentMonthEquipments, daysInCurrentMonth, currentMonth, currentYear);
  };

  const handleExportJSON = () => {
    exportBackupJSON(data);
  };

  const handleImportCSV = (csvContent: string) => {
    try {
      const imported = parseCSVToEquipments(csvContent);
      if (imported.length === 0) {
        alert('Nenhum equipamento válido foi encontrado na planilha.');
        return;
      }
      const confirmAdd = window.confirm(
        `Foram identificados ${imported.length} equipamentos no arquivo CSV/Excel.\nDeseja adicionar estes dados ao mês de ${MONTH_NAMES[currentMonth]}?`
      );
      if (confirmAdd) {
        updateCurrentMonthEquipments([...currentMonthEquipments, ...imported]);
        alert('Equipamentos e atividades importados com sucesso!');
      }
    } catch (err: any) {
      alert(`Falha ao importar planilha: ${err.message || 'Formato de arquivo incompatível'}`);
    }
  };

  const handleImportJSON = (jsonString: string) => {
    try {
      const parsed = parseImportJSON(jsonString);
      persistData(parsed);
      alert('Dados importados com sucesso!');
    } catch (err: any) {
      alert(`Falha ao importar backup: ${err.message || 'Arquivo corrompido'}`);
    }
  };

  const handleResetDefaults = () => {
    const confirmed = window.confirm(
      'Atenção: Isso redefinirá os dados locais para o plano industrial padrão de fábrica. Deseja continuar?'
    );
    if (confirmed) {
      const freshData = resetToDefaults();
      setData(freshData);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Maintenance Type counts in current month
  const maintenanceTypeCounts = useMemo(() => {
    const counts: Record<string, number> = {
      'Manutenção Preventiva Mensal': 0,
      'Manutenção Preventiva Anual': 0,
      'Testes Operacionais': 0,
      'Revisão do Sistema Hidráulico - Troca de Óleo': 0,
      'Grandes Intervenções': 0,
    };

    currentMonthEquipments.forEach((eq) => {
      eq.activities.forEach((act) => {
        if (act.maintenanceType && counts[act.maintenanceType] !== undefined) {
          counts[act.maintenanceType]++;
        }
      });
    });

    return counts;
  }, [currentMonthEquipments]);

  // Filtered equipments
  const filteredEquipments = useMemo(() => {
    return currentMonthEquipments
      .map((eq) => {
        const matchingActivities = eq.activities.filter((act) => {
          const matchType =
            selectedMaintenanceType === 'all' || act.maintenanceType === selectedMaintenanceType;
          const matchSearch =
            searchTerm === '' ||
            eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            eq.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
            eq.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
            act.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            act.responsible.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (act.maintenanceType && act.maintenanceType.toLowerCase().includes(searchTerm.toLowerCase()));

          return matchType && matchSearch;
        });

        const matchSector = sectorFilter === 'all' || eq.sector === sectorFilter;
        const matchCategory = categoryFilter === 'all' || getEquipmentCategory(eq.tag).id === categoryFilter;

        return {
          ...eq,
          activities: matchingActivities,
          isVisible: matchSector && matchCategory && (matchingActivities.length > 0 || (searchTerm === '' && selectedMaintenanceType === 'all')),
        };
      })
      .filter((eq) => eq.isVisible);
  }, [currentMonthEquipments, searchTerm, selectedMaintenanceType, sectorFilter, categoryFilter]);

  // Available unique sectors
  const availableSectors = useMemo(() => {
    const set = new Set<string>();
    currentMonthEquipments.forEach((e) => {
      if (e.sector) set.add(e.sector);
    });
    return Array.from(set).sort();
  }, [currentMonthEquipments]);

  // Total activities across all equipments in this month
  const totalActivitiesCount = useMemo(() => {
    return currentMonthEquipments.reduce((acc, eq) => acc + eq.activities.length, 0);
  }, [currentMonthEquipments]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Print header (only visible when printing) */}
      <div className="hidden print:block p-4 border-b-2 border-black text-black">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-3.5">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white shadow-xs shrink-0 p-1.5 overflow-hidden print:bg-[#3884cb]"
              style={{ backgroundColor: '#3884cb' }}
            >
              <HummingbirdIcon className="w-full h-full text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold uppercase tracking-tight text-slate-900">
                Relatório do Plano de Manutenção Industrial
              </h1>
              <p className="text-xs text-slate-600 font-medium">
                BULK HANDLING EQUIPMENT · {MONTH_NAMES[currentMonth].toUpperCase()} / {currentYear}
              </p>
            </div>
          </div>
          <div className="text-right text-xs font-mono">
            <p className="font-bold text-slate-900">DOC: REL-MAN-{currentYear}-{String(currentMonth + 1).padStart(2, '0')}</p>
            <p className="text-slate-500">Emitido: {new Date().toLocaleDateString('pt-BR')} {new Date().toLocaleTimeString('pt-BR')}</p>
          </div>
        </div>
        <div className="text-xs flex gap-6 text-slate-700 pt-1 border-t border-slate-300">
          <span>Legenda: [P] Planificado · [OK] Realizado · [SUSP] Suspenso</span>
          <span>Equipamentos: {currentMonthEquipments.length}</span>
          <span>Atividades: {totalActivitiesCount}</span>
        </div>
      </div>

      {/* Main Top Header */}
      <Header
        currentYear={currentYear}
        currentMonth={currentMonth}
        equipmentsCount={currentMonthEquipments.length}
        activitiesCount={totalActivitiesCount}
        lastSaved={data.lastSaved}
        isSaving={isSaving}
        cloudSyncStatus={cloudSyncStatus}
        isAdminUnlocked={isAdminUnlocked}
        allowNonAdminEdit={allowNonAdminEdit}
        onToggleNonAdminEdit={handleToggleNonAdminEdit}
        onOpenPinModal={() => {
          pendingActionRef.current = null;
          setPinModalOpen(true);
        }}
        onLockAdmin={handleLockAdmin}
        onOpenChangePinModal={() => setChangePinModalOpen(true)}
        onResetDefaults={() => requireAdminPin(handleResetDefaults)}
        onPrint={handlePrint}
      />

      {/* View Switcher: Plano de Atividade do Dia (Dashboard Inicial) vs Plano Mensal & Anual */}
      <nav aria-label="Navegação de Módulos" className="bg-slate-100 border-b border-slate-200 px-4 sm:px-6 py-2 no-print shadow-2xs">
        <div className="max-w-[1920px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('daily')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'daily'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Plano Diário</span>
              {dailyActivities.length > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                  activeTab === 'daily' ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-800'
                }`}>
                  {dailyActivities.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('monthly')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'monthly'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>Plano Anual 2027</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Visão atual: <strong className="text-slate-800">{activeTab === 'daily' ? 'Plano Diário' : 'Plano Anual 2027'}</strong></span>
          </div>
        </div>
      </nav>

      {/* Conditional View: Daily Activity Plan vs Monthly Maintenance Matrix */}
      {activeTab === 'daily' ? (
        <main className="flex-1 p-3 sm:p-6 max-w-[1920px] w-full mx-auto">
          <DailyPlanDashboard
            currentDate={dailyDate}
            onDateChange={setDailyDate}
            activities={dailyActivities}
            onAddActivity={handleAddDailyActivity}
            onUpdateActivity={handleUpdateDailyActivity}
            onDeleteActivity={handleDeleteDailyActivity}
            onLoadSamples={handleLoadDailySamples}
            requireAdminPin={requireAdminPin}
          />
        </main>
      ) : (
        <>
          {/* Monthly Sheets Tabs */}
          <MonthSelector
            currentYear={currentYear}
            currentMonth={currentMonth}
            yearData={currentYearData}
            onSelectMonth={handleSelectMonth}
            onChangeYear={handleChangeYear}
            onCopyMonthToNext={handleCopyMonthToNext}
          />

          {/* Metrics / KPI Bar */}
          <MetricsBar
            equipments={currentMonthEquipments}
            currentMonthName={MONTH_NAMES[currentMonth]}
            currentYear={currentYear}
          />

          {/* Toolbar: Maintenance Type Filter Points & Search */}
          <Toolbar
            selectedMaintenanceType={selectedMaintenanceType}
            onSelectMaintenanceType={setSelectedMaintenanceType}
            maintenanceTypeCounts={maintenanceTypeCounts}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            sectorFilter={sectorFilter}
            setSectorFilter={setSectorFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            availableSectors={availableSectors}
            onOpenNewEquipment={() =>
              requireAdminPin(() =>
                setEquipmentModalState({ isOpen: true, equipmentToEdit: null })
              )
            }
            onOpenBatchPlan={() => {
              requireAdminPin(() => {
                setBatchPlanTarget({});
                setBatchPlanModalOpen(true);
              });
            }}
          />

          {/* Main Spreadsheet Grid */}
          <main className="flex-1 p-2 sm:p-4 max-w-[1920px] w-full mx-auto">
            <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
              <SpreadsheetGrid
                equipments={filteredEquipments}
                days={daysInCurrentMonth}
                isAdminUnlocked={isAdminUnlocked}
                canEdit={isAdminUnlocked || allowNonAdminEdit}
                onUpdateCell={(equipmentId, activityId, day, cellData) => {
                  if (isAdminUnlocked || allowNonAdminEdit) {
                    handleUpdateCell(equipmentId, activityId, day, cellData);
                  }
                  // Quando no modo só admin, o toque para edição não tem nenhuma resposta
                }}
                onOpenCellDetails={(equipmentId, activityId, day, currentData) => {
                  if (isAdminUnlocked || allowNonAdminEdit) {
                    handleOpenCellDetails(equipmentId, activityId, day, currentData);
                  }
                  // Quando no modo só admin, o toque para edição não tem nenhuma resposta
                }}
                onEditActivity={(eqId, activity) => {
                  if (isAdminUnlocked || allowNonAdminEdit) {
                    const eq = currentMonthEquipments.find((e) => e.id === eqId);
                    setActivityModalState({
                      isOpen: true,
                      equipmentId: eqId,
                      equipmentName: eq ? `[${eq.tag}] ${eq.name}` : '',
                      activityToEdit: activity,
                    });
                  }
                  // Quando no modo só admin, o toque para edição não tem nenhuma resposta
                }}
                onEditEquipment={(eq) =>
                  requireAdminPin(() =>
                    setEquipmentModalState({ isOpen: true, equipmentToEdit: eq })
                  )
                }
                onDeleteEquipment={(equipmentId) =>
                  requireAdminPin(() => handleDeleteEquipment(equipmentId))
                }
                onBatchPlanActivity={(eqId, actId) => {
                  if (isAdminUnlocked || allowNonAdminEdit) {
                    setBatchPlanTarget({ equipmentId: eqId, activityId: actId });
                    setBatchPlanModalOpen(true);
                  }
                  // Quando no modo só admin, o toque para edição não tem nenhuma resposta
                }}
                onOpenNewEquipment={() =>
                  requireAdminPin(() =>
                    setEquipmentModalState({ isOpen: true, equipmentToEdit: null })
                  )
                }
              />
            </div>

            {/* Quiet footer notes */}
            <div className="mt-3 flex flex-wrap items-center justify-between text-[11px] text-slate-500 px-2 no-print gap-2">
              <div className="flex items-center gap-3">
                <span>Dica: Clique na célula para alternar o status ([P] Planificado → [OK] Realizado → [SUSP] Suspenso).</span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span>Duplo-clique para abrir detalhes e observações técnicas.</span>
              </div>
              <div className="text-slate-400">
                Sincronizado na Nuvem (Firebase) e Armazenamento Local
              </div>
            </div>

            {/* Printable Sign-off Section (Visible on PDF/Print - Gerar Relatório) */}
            <div className="hidden print:block mt-8 pt-6 border-t-2 border-slate-700 text-xs">
              <div className="text-center font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-8">
                Validação e Aprovação do Plano de Manutenção
              </div>
              <div className="grid grid-cols-2 gap-16 max-w-3xl mx-auto">
                <div className="text-center">
                  <div className="border-b-2 border-slate-700 pb-12 mb-2 w-4/5 mx-auto"></div>
                  <p className="font-bold text-slate-900 text-sm">Planificador de Manutenção</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">Elaboração e Programação Técnica</p>
                  <p className="text-[10px] text-slate-400 mt-2">Data: ____ / ____ / ________</p>
                </div>
                <div className="text-center">
                  <div className="border-b-2 border-slate-700 pb-12 mb-2 w-4/5 mx-auto"></div>
                  <p className="font-bold text-slate-900 text-sm">Coordenador de Manutenção</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">Validação e Homologação Geral</p>
                  <p className="text-[10px] text-slate-400 mt-2">Data: ____ / ____ / ________</p>
                </div>
              </div>
              <div className="text-center text-[10px] text-slate-400 mt-6 pt-4 border-t border-slate-200">
                Sistema de Planejamento e Controle de Manutenção · Documento emitido em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
              </div>
            </div>
          </main>
        </>
      )}

      {/* Cell Detail Modal */}
      <CellModal
        isOpen={cellModalState.isOpen}
        onClose={() => setCellModalState((prev) => ({ ...prev, isOpen: false }))}
        dayInfo={daysInCurrentMonth.find((d) => d.dayNumber === cellModalState.dayNumber)}
        equipmentName={cellModalState.equipmentName}
        activityName={cellModalState.activityName}
        cellData={cellModalState.cellData}
        onSave={(newData) => {
          handleUpdateCell(
            cellModalState.equipmentId,
            cellModalState.activityId,
            cellModalState.dayNumber,
            newData
          );
        }}
      />

      {/* Batch Plan Modal */}
      <BatchPlanModal
        isOpen={batchPlanModalOpen}
        onClose={() => setBatchPlanModalOpen(false)}
        equipments={currentMonthEquipments}
        days={daysInCurrentMonth}
        preSelectedEquipmentId={batchPlanTarget.equipmentId}
        preSelectedActivityId={batchPlanTarget.activityId}
        onApplyBatch={handleApplyBatchPlan}
      />

      {/* Equipment Modal */}
      <EquipmentModal
        isOpen={equipmentModalState.isOpen}
        onClose={() => setEquipmentModalState((prev) => ({ ...prev, isOpen: false }))}
        equipmentToEdit={equipmentModalState.equipmentToEdit}
        onSave={handleSaveEquipment}
      />

      {/* Activity Modal */}
      <ActivityModal
        isOpen={activityModalState.isOpen}
        onClose={() => setActivityModalState((prev) => ({ ...prev, isOpen: false }))}
        equipmentName={activityModalState.equipmentName}
        activityToEdit={activityModalState.activityToEdit}
        onSave={handleSaveActivity}
      />

      {/* Admin 4-Digit Security PIN Modal */}
      <AdminPinModal
        isOpen={pinModalOpen}
        onClose={() => {
          setPinModalOpen(false);
          pendingActionRef.current = null;
        }}
        onSuccess={handlePinSuccess}
        currentPin={currentAdminPin}
      />

      {/* Change Admin PIN Modal */}
      <ChangePinModal
        isOpen={changePinModalOpen}
        onClose={() => setChangePinModalOpen(false)}
        currentPin={currentAdminPin}
        onSaveNewPin={handleSaveNewPin}
      />

      {/* Floating Action Feedback Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-700 backdrop-blur-xs transition-all animate-in fade-in slide-in-from-bottom-3 max-w-md">
          <div className="w-7 h-7 rounded-lg bg-blue-600/30 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/40">
            <Copy className="w-4 h-4" />
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-100 flex-1 leading-snug">
            {toastMessage}
          </p>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white text-lg font-bold leading-none p-1 rounded hover:bg-slate-800 transition-colors"
            title="Fechar aviso"
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
}
