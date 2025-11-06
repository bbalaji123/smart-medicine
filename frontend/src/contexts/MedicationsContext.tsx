import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import medicationsAPI, { Medication, MedicationInput } from '../services/medications';
import toast from 'react-hot-toast';

interface MedicationsContextType {
  medications: Medication[];
  loading: boolean;
  error: string | null;
  fetchMedications: () => Promise<void>;
  createMedication: (data: MedicationInput) => Promise<void>;
  updateMedication: (id: string, data: Partial<MedicationInput>) => Promise<void>;
  deleteMedication: (id: string) => Promise<void>;
  markDoseTaken: (medicationId: string, scheduleIndex: number) => Promise<void>;
  markDoseSkipped: (medicationId: string, scheduleIndex: number, reason?: string) => Promise<void>;
  recordRefill: (medicationId: string, refillData: any) => Promise<void>;
  refreshMedications: () => Promise<void>;
}

const MedicationsContext = createContext<MedicationsContextType | undefined>(undefined);

export const MedicationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  const fetchMedications = useCallback(async () => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('Skipping medications fetch - user not authenticated');
      return;
    }
    
    // Debounce: Prevent fetching more than once per 2 seconds
    const now = Date.now();
    if (now - lastFetchTime < 2000) {
      console.log('Skipping medications fetch - too soon since last fetch');
      return;
    }
    
    setLoading(true);
    setError(null);
    setLastFetchTime(now);
    
    try {
      const data = await medicationsAPI.getMedications();
      setMedications(data);
    } catch (err: any) {
      // Only log error, don't show to user if it's authentication related
      if (err.response?.status === 401) {
        console.log('Authentication required - redirecting to login');
      } else {
        const errorMessage = err.message || 'Failed to fetch medications';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [lastFetchTime]);

  const createMedication = useCallback(async (data: MedicationInput) => {
    setLoading(true);
    setError(null);
    try {
      const newMedication = await medicationsAPI.createMedication(data);
      setMedications(prev => [...prev, newMedication]);
      toast.success('Medication added successfully!');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create medication';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMedication = useCallback(async (id: string, data: Partial<MedicationInput>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedMedication = await medicationsAPI.updateMedication(id, data);
      setMedications(prev =>
        prev.map(med => (med._id === id ? updatedMedication : med))
      );
      toast.success('Medication updated successfully!');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update medication';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMedication = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await medicationsAPI.deleteMedication(id);
      setMedications(prev => prev.filter(med => med._id !== id));
      toast.success('Medication deleted successfully!');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete medication';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const markDoseTaken = useCallback(async (medicationId: string, scheduleIndex: number) => {
    setError(null);
    try {
      const updatedMedication = await medicationsAPI.markDoseTaken(medicationId, scheduleIndex);
      setMedications(prev =>
        prev.map(med => (med._id === medicationId ? updatedMedication : med))
      );
      toast.success('Dose marked as taken!');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to mark dose as taken';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const markDoseSkipped = useCallback(async (medicationId: string, scheduleIndex: number, reason?: string) => {
    setError(null);
    try {
      const updatedMedication = await medicationsAPI.markDoseSkipped(medicationId, scheduleIndex, reason);
      setMedications(prev =>
        prev.map(med => (med._id === medicationId ? updatedMedication : med))
      );
      toast.success('Dose marked as skipped');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to mark dose as skipped';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const recordRefill = useCallback(async (medicationId: string, refillData: any) => {
    setError(null);
    try {
      const updatedMedication = await medicationsAPI.recordRefill(medicationId, refillData);
      setMedications(prev =>
        prev.map(med => (med._id === medicationId ? updatedMedication : med))
      );
      toast.success('Refill recorded successfully!');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to record refill';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const refreshMedications = useCallback(async () => {
    await fetchMedications();
  }, [fetchMedications]);

  useEffect(() => {
    // Only fetch if user is authenticated (token exists)
    const token = localStorage.getItem('token');
    if (token) {
      fetchMedications();
    }
  }, [fetchMedications]);

  const value: MedicationsContextType = {
    medications,
    loading,
    error,
    fetchMedications,
    createMedication,
    updateMedication,
    deleteMedication,
    markDoseTaken,
    markDoseSkipped,
    recordRefill,
    refreshMedications,
  };

  return (
    <MedicationsContext.Provider value={value}>
      {children}
    </MedicationsContext.Provider>
  );
};

export const useMedications = (): MedicationsContextType => {
  const context = useContext(MedicationsContext);
  if (!context) {
    throw new Error('useMedications must be used within a MedicationsProvider');
  }
  return context;
};
