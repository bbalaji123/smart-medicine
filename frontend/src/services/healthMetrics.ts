import apiClient from './api';

export interface HealthMetric {
  _id: string;
  userId: string;
  type: 'blood_pressure' | 'weight' | 'blood_sugar' | 'heart_rate' | 'temperature' | 'mood' | 'energy' | 'sleep';
  value: number | string | Record<string, any>;
  unit: string;
  notes?: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface HealthEntry {
  _id: string;
  userId: string;
  date: Date;
  mood: 'excellent' | 'good' | 'fair' | 'poor' | 'bad';
  symptoms: string[];
  notes: string;
  activities: string[];
  createdAt: Date;
  updatedAt: Date;
}

export const healthMetricsAPI = {
  // Get all health metrics for current user
  getMetrics: async (params?: {
    type?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<HealthMetric[]> => {
    try {
      const response = await apiClient.get('/health/metrics', { params });
      return response.data.metrics || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch health metrics');
    }
  },

  // Get single health metric
  getMetric: async (id: string): Promise<HealthMetric> => {
    try {
      const response = await apiClient.get(`/health/metrics/${id}`);
      return response.data.metric || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch metric');
    }
  },

  // Create new health metric
  createMetric: async (metricData: Omit<HealthMetric, '_id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<HealthMetric> => {
    try {
      const response = await apiClient.post('/health/metrics', metricData);
      return response.data.metric || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create metric');
    }
  },

  // Update health metric
  updateMetric: async (id: string, metricData: Partial<HealthMetric>): Promise<HealthMetric> => {
    try {
      const response = await apiClient.put(`/health/metrics/${id}`, metricData);
      return response.data.metric || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update metric');
    }
  },

  // Delete health metric
  deleteMetric: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/health/metrics/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete metric');
    }
  },

  // Get health journal entries
  getJournalEntries: async (params?: {
    type?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<HealthEntry[]> => {
    try {
      const response = await apiClient.get('/health/journal', { params });
      return response.data.entries || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch journal entries');
    }
  },

  // Create health journal entry
  createJournalEntry: async (entryData: Omit<HealthEntry, '_id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<HealthEntry> => {
    try {
      const response = await apiClient.post('/health/journal', entryData);
      return response.data.entry || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create journal entry');
    }
  },

  // Update journal entry
  updateJournalEntry: async (id: string, entryData: Partial<HealthEntry>): Promise<HealthEntry> => {
    try {
      const response = await apiClient.put(`/health/journal/${id}`, entryData);
      return response.data.entry || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update journal entry');
    }
  },

  // Delete journal entry
  deleteJournalEntry: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/health/journal/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete journal entry');
    }
  },

  // Get analytics data
  getAnalytics: async (params?: {
    period?: 'week' | 'month' | 'quarter' | 'year';
    metrics?: string[];
  }): Promise<any> => {
    try {
      const response = await apiClient.get('/health/analytics', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch analytics');
    }
  },
};

export default healthMetricsAPI;
