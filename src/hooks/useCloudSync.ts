import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';
import { Service, Barber, Appointment, CutRecord, Transaction, Bill, Fiado, MonthlyPlan } from '@/types/barber';
import { Json } from '@/integrations/supabase/types';

interface UserData {
  services: Service[];
  barbers: Barber[];
  appointments: Appointment[];
  cuts: CutRecord[];
  transactions: Transaction[];
  bills: Bill[];
  fiados: Fiado[];
  monthlyPlans: MonthlyPlan[];
}

interface UseCloudSyncProps {
  user: User | null;
  data: UserData;
  setServices: (value: Service[] | ((prev: Service[]) => Service[])) => void;
  setBarbers: (value: Barber[] | ((prev: Barber[]) => Barber[])) => void;
  setAppointments: (value: Appointment[] | ((prev: Appointment[]) => Appointment[])) => void;
  setCuts: (value: CutRecord[] | ((prev: CutRecord[]) => CutRecord[])) => void;
  setTransactions: (value: Transaction[] | ((prev: Transaction[]) => Transaction[])) => void;
  setBills: (value: Bill[] | ((prev: Bill[]) => Bill[])) => void;
  setFiados: (value: Fiado[] | ((prev: Fiado[]) => Fiado[])) => void;
  setMonthlyPlans: (value: MonthlyPlan[] | ((prev: MonthlyPlan[]) => MonthlyPlan[])) => void;
}

const SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
const LAST_SYNC_KEY = 'barber-last-cloud-sync';

export function useCloudSync({
  user,
  data,
  setServices,
  setBarbers,
  setAppointments,
  setCuts,
  setTransactions,
  setBills,
  setFiados,
  setMonthlyPlans,
}: UseCloudSyncProps) {
  const hasLoadedFromCloud = useRef(false);
  const lastSyncTime = useRef<number>(0);

  // Load data from cloud on login
  const loadFromCloud = useCallback(async () => {
    if (!user || hasLoadedFromCloud.current) return;

    try {
      const { data: cloudData, error } = await supabase
        .from('user_data')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading from cloud:', error);
        return;
      }

      if (cloudData) {
        // Import cloud data - cast through unknown for JSONB types
        if (cloudData.services && Array.isArray(cloudData.services)) {
          setServices(cloudData.services as unknown as Service[]);
        }
        if (cloudData.barbers && Array.isArray(cloudData.barbers)) {
          setBarbers(cloudData.barbers as unknown as Barber[]);
        }
        if (cloudData.appointments && Array.isArray(cloudData.appointments)) {
          setAppointments(cloudData.appointments as unknown as Appointment[]);
        }
        if (cloudData.cuts && Array.isArray(cloudData.cuts)) {
          setCuts(cloudData.cuts as unknown as CutRecord[]);
        }
        if (cloudData.transactions && Array.isArray(cloudData.transactions)) {
          setTransactions(cloudData.transactions as unknown as Transaction[]);
        }
        if (cloudData.bills && Array.isArray(cloudData.bills)) {
          setBills(cloudData.bills as unknown as Bill[]);
        }
        if (cloudData.fiados && Array.isArray(cloudData.fiados)) {
          setFiados(cloudData.fiados as unknown as Fiado[]);
        }
        if (cloudData.monthly_plans && Array.isArray(cloudData.monthly_plans)) {
          setMonthlyPlans(cloudData.monthly_plans as unknown as MonthlyPlan[]);
        }

        toast({
          title: "Dados sincronizados!",
          description: "Seus dados foram carregados da nuvem.",
        });
      }

      hasLoadedFromCloud.current = true;
    } catch (err) {
      console.error('Error in loadFromCloud:', err);
    }
  }, [user, setServices, setBarbers, setAppointments, setCuts, setTransactions, setBills, setFiados, setMonthlyPlans]);

  // Save data to cloud
  const saveToCloud = useCallback(async (forceSync = false) => {
    if (!user) return;

    const now = Date.now();
    const lastSync = parseInt(localStorage.getItem(LAST_SYNC_KEY) || '0', 10);

    // Only sync if forced or 24h have passed
    if (!forceSync && now - lastSync < SYNC_INTERVAL_MS) {
      return;
    }

    try {
      const payload = {
        user_id: user.id,
        services: data.services as unknown as Json,
        barbers: data.barbers as unknown as Json,
        appointments: data.appointments as unknown as Json,
        cuts: data.cuts as unknown as Json,
        transactions: data.transactions as unknown as Json,
        bills: data.bills as unknown as Json,
        fiados: data.fiados as unknown as Json,
        monthly_plans: data.monthlyPlans as unknown as Json,
      };

      const { error } = await supabase
        .from('user_data')
        .upsert(payload, { onConflict: 'user_id' });

      if (error) {
        console.error('Error saving to cloud:', error);
        return;
      }

      localStorage.setItem(LAST_SYNC_KEY, now.toString());
      lastSyncTime.current = now;

      if (forceSync) {
        toast({
          title: "Dados salvos!",
          description: "Seus dados foram salvos na nuvem.",
        });
      }
    } catch (err) {
      console.error('Error in saveToCloud:', err);
    }
  }, [user, data]);

  // Delete cloud data (for reset)
  const deleteCloudData = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_data')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting cloud data:', error);
        return;
      }

      localStorage.removeItem(LAST_SYNC_KEY);
    } catch (err) {
      console.error('Error in deleteCloudData:', err);
    }
  }, [user]);

  // Load from cloud on mount/login
  useEffect(() => {
    if (user && !hasLoadedFromCloud.current) {
      loadFromCloud();
    }
  }, [user, loadFromCloud]);

  // Reset flag when user logs out
  useEffect(() => {
    if (!user) {
      hasLoadedFromCloud.current = false;
    }
  }, [user]);

  // Auto-save check on data changes (respects 24h interval)
  useEffect(() => {
    if (user && hasLoadedFromCloud.current) {
      saveToCloud(false);
    }
  }, [user, data, saveToCloud]);

  // Check for daily sync on visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        saveToCloud(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, saveToCloud]);

  return {
    saveToCloud: () => saveToCloud(true),
    deleteCloudData,
    loadFromCloud,
  };
}
