import api from './api';

export interface MedicationSearchResult {
  brandName: string;
  genericName: string;
  manufacturer: string;
  route: string;
  dosageInfo: string;
  warnings: string[];
  sideEffects: string[];
  productType: string;
  substanceNames: string[];
}

export interface MedicationDetails {
  brandName: string;
  genericName: string;
  manufacturer: string;
  route: string;
  dosageInfo: string;
  sideEffects: string[];
  productType: string;
  substanceNames: string[];
  indications: string;
  dosageAndAdministration: string;
  contraindications: string;
  warnings: string;
  adverseReactions: string;
  drugInteractions: string;
  description: string;
  activeIngredients: string[];
}

export const searchMedications = async (query: string, limit: number = 10): Promise<MedicationSearchResult[]> => {
  try {
    const response = await api.get('/medication-search', {
      params: { query, limit }
    });
    return response.data.medications || [];
  } catch (error: any) {
    console.error('Error searching medications:', error);
    throw new Error(error.response?.data?.message || 'Failed to search medications');
  }
};

export const getMedicationDetails = async (name: string): Promise<MedicationDetails> => {
  try {
    const response = await api.get(`/medication-search/details/${encodeURIComponent(name)}`);
    return response.data.medication;
  } catch (error: any) {
    console.error('Error fetching medication details:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch medication details');
  }
};
