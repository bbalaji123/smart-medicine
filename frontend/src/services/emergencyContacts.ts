import apiClient from './api';

export interface EmergencyContact {
  _id: string;
  userId: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
  isPrimary: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const emergencyContactsAPI = {
  // Get all emergency contacts for current user
  getContacts: async (): Promise<EmergencyContact[]> => {
    try {
      const response = await apiClient.get('/emergency-contacts');
      return response.data.contacts || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch emergency contacts');
    }
  },

  // Get single emergency contact
  getContact: async (id: string): Promise<EmergencyContact> => {
    try {
      const response = await apiClient.get(`/emergency-contacts/${id}`);
      return response.data.contact || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch contact');
    }
  },

  // Create new emergency contact
  createContact: async (contactData: Omit<EmergencyContact, '_id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<EmergencyContact> => {
    try {
      const response = await apiClient.post('/emergency-contacts', contactData);
      return response.data.contact || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create contact');
    }
  },

  // Update emergency contact
  updateContact: async (id: string, contactData: Partial<EmergencyContact>): Promise<EmergencyContact> => {
    try {
      const response = await apiClient.put(`/emergency-contacts/${id}`, contactData);
      return response.data.contact || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update contact');
    }
  },

  // Delete emergency contact
  deleteContact: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/emergency-contacts/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete contact');
    }
  },

  // Set primary contact
  setPrimaryContact: async (id: string): Promise<EmergencyContact> => {
    try {
      const response = await apiClient.put(`/emergency-contacts/${id}/set-primary`);
      return response.data.contact || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to set primary contact');
    }
  },

  // Quick call/message
  initiateContact: async (id: string, type: 'call' | 'sms' | 'email'): Promise<void> => {
    try {
      await apiClient.post(`/emergency-contacts/${id}/initiate`, { type });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to initiate contact');
    }
  },
};

export default emergencyContactsAPI;
