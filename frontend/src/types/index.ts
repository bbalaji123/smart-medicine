export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
  startDate: Date;
  endDate?: Date;
  reminderTimes: string[];
  refillReminder: boolean;
  stockCount: number;
  imageUrl?: string;
  sideEffects?: string[];
  interactions?: string[];
  category: MedicationCategory;
  prescribedBy?: string;
  isActive: boolean;
}

export interface Reminder {
  id: string;
  medicationId: string;
  time: string;
  days: DayOfWeek[];
  isActive: boolean;
  snoozeEnabled: boolean;
  skipEnabled: boolean;
  timezone: string;
  notificationChannels: NotificationChannel[];
}

export interface DoseRecord {
  id: string;
  medicationId: string;
  scheduledTime: Date;
  takenTime?: Date;
  status: DoseStatus;
  notes?: string;
  sideEffectsReported?: string[];
}

export interface HealthMetric {
  id: string;
  type: HealthMetricType;
  value: number;
  unit: string;
  timestamp: Date;
  notes?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  dateOfBirth: Date;
  avatar?: string;
  emergencyContacts: EmergencyContact[];
  caregivers: CaregiverInfo[];
  preferences: UserPreferences;
  medicalConditions: string[];
  allergies: string[];
  insuranceInfo?: InsuranceInfo;
}

export interface CaregiverInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  permissions: CaregiverPermission[];
  isActive: boolean;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface UserPreferences {
  reminderSound: string;
  notificationChannels: NotificationChannel[];
  timezone: string;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  privacySettings: PrivacySettings;
}

export interface PrivacySettings {
  shareDataWithCaregivers: boolean;
  shareHealthMetrics: boolean;
  allowEmergencyAccess: boolean;
}

export interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  groupNumber?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  progress: number;
  target: number;
}

export interface AdherenceReport {
  period: 'daily' | 'weekly' | 'monthly';
  adherenceRate: number;
  totalDoses: number;
  takenDoses: number;
  missedDoses: number;
  trends: AdherenceTrend[];
}

export interface AdherenceTrend {
  date: Date;
  rate: number;
}

export interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
  recommendation: string;
}

export type MedicationCategory = 
  | 'prescription'
  | 'over-the-counter'
  | 'supplement'
  | 'vitamin'
  | 'injection'
  | 'topical'
  | 'other';

export type DoseStatus = 
  | 'scheduled'
  | 'taken'
  | 'missed'
  | 'skipped'
  | 'delayed';

export type DayOfWeek = 
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type NotificationChannel = 
  | 'push'
  | 'email'
  | 'sms'
  | 'smartwatch';

export type HealthMetricType =
  | 'blood_pressure_systolic'
  | 'blood_pressure_diastolic'
  | 'heart_rate'
  | 'weight'
  | 'blood_sugar'
  | 'temperature'
  | 'mood'
  | 'pain_level'
  | 'energy_level'
  | 'sleep_hours';

export type CaregiverPermission =
  | 'view_medications'
  | 'edit_reminders'
  | 'view_adherence'
  | 'view_health_metrics'
  | 'emergency_access'
  | 'manage_profile';