import apiClient from './api';

export interface Medication {
  _id: string;
  user: string;
  name: string;
  dosage: {
    amount: number;
    unit: string;
  };
  frequency: string;
  customFrequency?: {
    times: number;
    period: string;
  };
  schedule: Array<{
    time: string;
    taken: boolean;
    takenAt?: Date;
    skipped: boolean;
    reason?: string;
  }>;
  startDate: Date;
  endDate?: Date;
  prescribedBy?: {
    name: string;
    contact: string;
  };
  instructions?: string;
  sideEffects?: string[];
  interactions?: Array<{
    medication: string;
    severity: string;
    description: string;
  }>;
  refillReminder: {
    enabled: boolean;
    daysBeforeEmpty: number;
    currentSupply?: number;
    lastRefillDate?: Date;
  };
  adherenceData: Array<{
    date: Date;
    taken: boolean;
    timesTaken: number;
    timesScheduled: number;
    adherenceRate: number;
  }>;
  isActive: boolean;
  color: string;
  notes: Array<{
    content: string;
    createdAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicationInput {
  name: string;
  dosage: {
    amount: number;
    unit: string;
  };
  frequency: string;
  customFrequency?: {
    times: number;
    period: string;
  };
  schedule: Array<{
    time: string;
  }>;
  startDate: Date;
  endDate?: Date;
  prescribedBy?: {
    name: string;
    contact: string;
  };
  instructions?: string;
  sideEffects?: string[];
  interactions?: Array<{
    medication: string;
    severity: string;
    description: string;
  }>;
  refillReminder?: {
    enabled: boolean;
    daysBeforeEmpty: number;
    currentSupply?: number;
  };
  color?: string;
}

export const medicationsAPI = {
  // Get all medications
  getMedications: async (): Promise<Medication[]> => {
    try {
      const response = await apiClient.get('/medications');
      return response.data.medications || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch medications');
    }
  },

  // Get single medication
  getMedication: async (id: string): Promise<Medication> => {
    try {
      const response = await apiClient.get(`/medications/${id}`);
      return response.data.medication || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch medication');
    }
  },

  // Create medication
  createMedication: async (medicationData: MedicationInput): Promise<Medication> => {
    try {
      const response = await apiClient.post('/medications', medicationData);
      return response.data.medication || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create medication');
    }
  },

  // Update medication
  updateMedication: async (id: string, medicationData: Partial<MedicationInput>): Promise<Medication> => {
    try {
      const response = await apiClient.put(`/medications/${id}`, medicationData);
      return response.data.medication || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update medication');
    }
  },

  // Delete medication
  deleteMedication: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/medications/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete medication');
    }
  },

  // Record dose taken
  recordDose: async (id: string, data: { takenAt?: Date; notes?: string }): Promise<Medication> => {
    try {
      const response = await apiClient.post(`/medications/${id}/dose`, data);
      return response.data.medication || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to record dose');
    }
  },

  // Get adherence statistics
  getAdherence: async (id: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/medications/${id}/adherence`);
      return response.data.adherence || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch adherence data');
    }
  },

  // Get today's schedule
  getTodaySchedule: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/medications/schedule/today');
      return response.data.schedule || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch schedule');
    }
  },

  // Mark dose as taken
  markDoseTaken: async (medicationId: string, scheduleIndex: number, takenAt?: Date): Promise<Medication> => {
    try {
      const response = await apiClient.post(`/medications/${medicationId}/dose`, {
        scheduleIndex,
        takenAt: takenAt || new Date()
      });
      return response.data.medication || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to mark dose as taken');
    }
  },

  // Mark dose as skipped
  markDoseSkipped: async (medicationId: string, scheduleIndex: number, reason?: string): Promise<Medication> => {
    try {
      const response = await apiClient.post(`/medications/${medicationId}/skip`, {
        scheduleIndex,
        reason
      });
      return response.data.medication || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to mark dose as skipped');
    }
  },
};

export default medicationsAPI;
