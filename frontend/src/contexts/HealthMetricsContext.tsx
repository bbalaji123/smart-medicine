import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { healthMetricsAPI, HealthMetric, HealthEntry } from '../services/healthMetrics';
import { toast } from 'react-hot-toast';

interface HealthMetricsContextType {
  metrics: HealthMetric[];
  journalEntries: HealthEntry[];
  isLoading: boolean;
  error: string | null;
  fetchMetrics: (params?: any) => Promise<void>;
  fetchJournalEntries: (params?: any) => Promise<void>;
  addMetric: (metric: Omit<HealthMetric, '_id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateMetric: (id: string, metric: Partial<HealthMetric>) => Promise<void>;
  deleteMetric: (id: string) => Promise<void>;
  addJournalEntry: (entry: Omit<HealthEntry, '_id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateJournalEntry: (id: string, entry: Partial<HealthEntry>) => Promise<void>;
  deleteJournalEntry: (id: string) => Promise<void>;
  getAnalytics: (params?: any) => Promise<any>;
}

const HealthMetricsContext = createContext<HealthMetricsContextType | undefined>(undefined);

export const HealthMetricsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [journalEntries, setJournalEntries] = useState<HealthEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async (params?: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await healthMetricsAPI.getMetrics(params);
      setMetrics(data);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchJournalEntries = useCallback(async (params?: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await healthMetricsAPI.getJournalEntries(params);
      setJournalEntries(data);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addMetric = useCallback(async (metric: Omit<HealthMetric, '_id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    try {
      const newMetric = await healthMetricsAPI.createMetric(metric);
      setMetrics(prev => [newMetric, ...prev]);
      toast.success('Health metric added successfully!');
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateMetric = useCallback(async (id: string, metric: Partial<HealthMetric>) => {
    setIsLoading(true);
    try {
      const updatedMetric = await healthMetricsAPI.updateMetric(id, metric);
      setMetrics(prev => prev.map(m => m._id === id ? updatedMetric : m));
      toast.success('Metric updated successfully!');
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteMetric = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      await healthMetricsAPI.deleteMetric(id);
      setMetrics(prev => prev.filter(m => m._id !== id));
      toast.success('Metric deleted successfully!');
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addJournalEntry = useCallback(async (entry: Omit<HealthEntry, '_id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    try {
      const newEntry = await healthMetricsAPI.createJournalEntry(entry);
      setJournalEntries(prev => [newEntry, ...prev]);
      toast.success('Journal entry added successfully!');
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateJournalEntry = useCallback(async (id: string, entry: Partial<HealthEntry>) => {
    setIsLoading(true);
    try {
      const updatedEntry = await healthMetricsAPI.updateJournalEntry(id, entry);
      setJournalEntries(prev => prev.map(e => e._id === id ? updatedEntry : e));
      toast.success('Entry updated successfully!');
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteJournalEntry = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      await healthMetricsAPI.deleteJournalEntry(id);
      setJournalEntries(prev => prev.filter(e => e._id !== id));
      toast.success('Entry deleted successfully!');
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAnalytics = useCallback(async (params?: any) => {
    setIsLoading(true);
    setError(null);
    try {
      return await healthMetricsAPI.getAnalytics(params);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = {
    metrics,
    journalEntries,
    isLoading,
    error,
    fetchMetrics,
    fetchJournalEntries,
    addMetric,
    updateMetric,
    deleteMetric,
    addJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    getAnalytics,
  };

  return (
    <HealthMetricsContext.Provider value={value}>
      {children}
    </HealthMetricsContext.Provider>
  );
};

export const useHealthMetrics = (): HealthMetricsContextType => {
  const context = useContext(HealthMetricsContext);
  if (context === undefined) {
    throw new Error('useHealthMetrics must be used within a HealthMetricsProvider');
  }
  return context;
};
