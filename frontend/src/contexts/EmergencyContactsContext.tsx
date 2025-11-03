import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { emergencyContactsAPI, EmergencyContact } from '../services/emergencyContacts';
import { toast } from 'react-hot-toast';

interface EmergencyContactsContextType {
  contacts: EmergencyContact[];
  isLoading: boolean;
  error: string | null;
  fetchContacts: () => Promise<void>;
  addContact: (contact: Omit<EmergencyContact, '_id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateContact: (id: string, contact: Partial<EmergencyContact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  setPrimaryContact: (id: string) => Promise<void>;
  initiateContact: (id: string, type: 'call' | 'sms' | 'email') => Promise<void>;
}

const EmergencyContactsContext = createContext<EmergencyContactsContextType | undefined>(undefined);

export const EmergencyContactsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await emergencyContactsAPI.getContacts();
      setContacts(data);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addContact = useCallback(async (contact: Omit<EmergencyContact, '_id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    try {
      const newContact = await emergencyContactsAPI.createContact(contact);
      setContacts(prev => [newContact, ...prev]);
      toast.success('Emergency contact added successfully!');
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateContact = useCallback(async (id: string, contact: Partial<EmergencyContact>) => {
    setIsLoading(true);
    try {
      const updatedContact = await emergencyContactsAPI.updateContact(id, contact);
      setContacts(prev => prev.map(c => c._id === id ? updatedContact : c));
      toast.success('Contact updated successfully!');
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteContact = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      await emergencyContactsAPI.deleteContact(id);
      setContacts(prev => prev.filter(c => c._id !== id));
      toast.success('Contact deleted successfully!');
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setPrimaryContact = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      await emergencyContactsAPI.setPrimaryContact(id);
      setContacts(prev => prev.map(c => ({
        ...c,
        isPrimary: c._id === id
      })));
      toast.success('Primary contact updated!');
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const initiateContact = useCallback(async (id: string, type: 'call' | 'sms' | 'email') => {
    const contact = contacts.find(c => c._id === id);
    if (!contact) {
      toast.error('Contact not found');
      return;
    }

    try {
      // For call and SMS, use tel: and sms: protocols
      if (type === 'call') {
        window.location.href = `tel:${contact.phone}`;
        toast.success(`Calling ${contact.name}...`);
      } else if (type === 'sms') {
        window.location.href = `sms:${contact.phone}`;
        toast.success(`Opening SMS to ${contact.name}...`);
      } else if (type === 'email' && contact.email) {
        window.location.href = `mailto:${contact.email}`;
        toast.success(`Opening email to ${contact.name}...`);
      } else {
        toast.error('Contact method not available');
      }

      // Also log to backend
      await emergencyContactsAPI.initiateContact(id, type);
    } catch (err: any) {
      console.error('Failed to initiate contact:', err);
    }
  }, [contacts]);

  const value = {
    contacts,
    isLoading,
    error,
    fetchContacts,
    addContact,
    updateContact,
    deleteContact,
    setPrimaryContact,
    initiateContact,
  };

  return (
    <EmergencyContactsContext.Provider value={value}>
      {children}
    </EmergencyContactsContext.Provider>
  );
};

export const useEmergencyContacts = (): EmergencyContactsContextType => {
  const context = useContext(EmergencyContactsContext);
  if (context === undefined) {
    throw new Error('useEmergencyContacts must be used within an EmergencyContactsProvider');
  }
  return context;
};
