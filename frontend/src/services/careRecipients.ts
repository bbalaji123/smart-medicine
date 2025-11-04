import api from './api';

export interface CareRecipient {
  _id: string;
  caregiverId: string;
  name: string;
  email?: string;
  phone?: string;
  relationship: string;
  dateOfBirth?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  medicalConditions?: string[];
  allergies?: string[];
  currentMedications?: {
    name: string;
    dosage: string;
    frequency: string;
  }[];
  primaryPhysician?: {
    name?: string;
    phone?: string;
    clinic?: string;
  };
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  notes?: string;
  permissions: {
    viewMedications: boolean;
    editReminders: boolean;
    viewAdherence: boolean;
    viewHealthMetrics: boolean;
    emergencyAccess: boolean;
    manageProfile: boolean;
  };
  isActive: boolean;
  invitationStatus: 'pending' | 'accepted' | 'declined';
  linkedUserId?: string;
  age?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCareRecipientData {
  name: string;
  relationship: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  medicalConditions?: string[];
  allergies?: string[];
  currentMedications?: {
    name: string;
    dosage: string;
    frequency: string;
  }[];
  primaryPhysician?: {
    name?: string;
    phone?: string;
    clinic?: string;
  };
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  notes?: string;
  permissions?: {
    viewMedications?: boolean;
    editReminders?: boolean;
    viewAdherence?: boolean;
    viewHealthMetrics?: boolean;
    emergencyAccess?: boolean;
    manageProfile?: boolean;
  };
}

export const careRecipientsService = {
  // Get all care recipients
  getCareRecipients: async (): Promise<CareRecipient[]> => {
    const response = await api.get('/care-recipients');
    return response.data.data;
  },

  // Get a specific care recipient
  getCareRecipient: async (id: string): Promise<CareRecipient> => {
    const response = await api.get(`/care-recipients/${id}`);
    return response.data.data;
  },

  // Create a new care recipient
  createCareRecipient: async (data: CreateCareRecipientData): Promise<CareRecipient> => {
    const response = await api.post('/care-recipients', data);
    return response.data.data;
  },

  // Update a care recipient
  updateCareRecipient: async (id: string, data: Partial<CreateCareRecipientData>): Promise<CareRecipient> => {
    const response = await api.put(`/care-recipients/${id}`, data);
    return response.data.data;
  },

  // Delete (deactivate) a care recipient
  deleteCareRecipient: async (id: string): Promise<void> => {
    await api.delete(`/care-recipients/${id}`);
  },

  // Update permissions
  updatePermissions: async (
    id: string,
    permissions: Partial<CareRecipient['permissions']>
  ): Promise<CareRecipient> => {
    const response = await api.patch(`/care-recipients/${id}/permissions`, { permissions });
    return response.data.data;
  },
};
