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
  refreshMedications: () => Promise<void>;
}

const MedicationsContext = createContext<MedicationsContextType | undefined>(undefined);

export const MedicationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMedications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await medicationsAPI.getMedications();
      setMedications(data);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch medications';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

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

  const refreshMedications = useCallback(async () => {
    await fetchMedications();
  }, [fetchMedications]);

  useEffect(() => {
    fetchMedications();
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
