import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { careRecipientsService, CareRecipient, CreateCareRecipientData } from '../services/careRecipients';
import toast from 'react-hot-toast';

interface CareRecipientsContextType {
  careRecipients: CareRecipient[];
  loading: boolean;
  error: string | null;
  fetchCareRecipients: () => Promise<void>;
  addCareRecipient: (data: CreateCareRecipientData) => Promise<void>;
  updateCareRecipient: (id: string, data: Partial<CreateCareRecipientData>) => Promise<void>;
  deleteCareRecipient: (id: string) => Promise<void>;
  updatePermissions: (id: string, permissions: Partial<CareRecipient['permissions']>) => Promise<void>;
}

const CareRecipientsContext = createContext<CareRecipientsContextType | undefined>(undefined);

export const useCareRecipients = () => {
  const context = useContext(CareRecipientsContext);
  if (!context) {
    throw new Error('useCareRecipients must be used within a CareRecipientsProvider');
  }
  return context;
};

interface CareRecipientsProviderProps {
  children: ReactNode;
}

export const CareRecipientsProvider: React.FC<CareRecipientsProviderProps> = ({ children }) => {
  const [careRecipients, setCareRecipients] = useState<CareRecipient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  const fetchCareRecipients = async () => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('Skipping fetch - user not authenticated');
      return;
    }
    
    // Debounce: Prevent fetching more than once per 2 seconds
    const now = Date.now();
    if (now - lastFetchTime < 2000) {
      console.log('Skipping fetch - too soon since last fetch');
      return;
    }
    
    setLoading(true);
    setError(null);
    setLastFetchTime(now);
    
    try {
      const data = await careRecipientsService.getCareRecipients();
      setCareRecipients(data);
    } catch (err: any) {
      // Only log error, don't show to user if it's authentication related
      if (err.response?.status === 401) {
        console.log('Authentication required - redirecting to login');
      } else {
        const errorMessage = err.response?.data?.message || 'Failed to fetch care recipients';
        setError(errorMessage);
        console.error('Error fetching care recipients:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const addCareRecipient = async (data: CreateCareRecipientData) => {
    try {
      const newRecipient = await careRecipientsService.createCareRecipient(data);
      setCareRecipients(prev => [newRecipient, ...prev]);
      toast.success('Care recipient added successfully!');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to add care recipient';
      toast.error(errorMessage);
      throw err;
    }
  };

  const updateCareRecipient = async (id: string, data: Partial<CreateCareRecipientData>) => {
    try {
      const updatedRecipient = await careRecipientsService.updateCareRecipient(id, data);
      setCareRecipients(prev =>
        prev.map(recipient =>
          recipient._id === id ? updatedRecipient : recipient
        )
      );
      toast.success('Care recipient updated successfully!');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update care recipient';
      toast.error(errorMessage);
      throw err;
    }
  };

  const deleteCareRecipient = async (id: string) => {
    try {
      await careRecipientsService.deleteCareRecipient(id);
      setCareRecipients(prev => prev.filter(recipient => recipient._id !== id));
      toast.success('Care recipient removed successfully!');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to remove care recipient';
      toast.error(errorMessage);
      throw err;
    }
  };

  const updatePermissions = async (
    id: string,
    permissions: Partial<CareRecipient['permissions']>
  ) => {
    try {
      const updatedRecipient = await careRecipientsService.updatePermissions(id, permissions);
      setCareRecipients(prev =>
        prev.map(recipient =>
          recipient._id === id ? updatedRecipient : recipient
        )
      );
      toast.success('Permissions updated successfully!');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update permissions';
      toast.error(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    // Only fetch if user is authenticated (token exists)
    const token = localStorage.getItem('token');
    if (token) {
      fetchCareRecipients();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    careRecipients,
    loading,
    error,
    fetchCareRecipients,
    addCareRecipient,
    updateCareRecipient,
    deleteCareRecipient,
    updatePermissions,
  };

  return (
    <CareRecipientsContext.Provider value={value}>
      {children}
    </CareRecipientsContext.Provider>
  );
};
