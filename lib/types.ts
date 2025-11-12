export interface Medicine {
  id: string
  name: string
  times: string[]
  dosage?: string
  instructions?: string
  duration?: number | null
  createdAt: string
  updatedAt?: string
  taken: Array<{ date: string; time: string }>
  refillDate?: string
  refillReminder?: boolean
  remindBefore?: number // days before
  notes?: string
  sideEffects?: string
  contraindications?: string
  externalId?: string // for API integration
  tags?: string[]
}

export interface MedicineNotification {
  id: string
  medicineId: string
  time: string
  date: string
  status: "pending" | "sent" | "dismissed"
  createdAt: string
}

export interface AppSettings {
  patientName?: string
  patientDob?: string
  patientContact?: string
  doctorName?: string
  doctorContact?: string
  notificationsEnabled?: boolean
  notificationTime?: number // minutes before dose
  theme?: "light" | "dark" | "system"
  autoBackup?: boolean
}

export interface DataBackup {
  medicines: Medicine[]
  settings: AppSettings
  notifications: MedicineNotification[]
  exportDate: string
  version: string
}

export type ValidationError = {
  field: string
  message: string
}

export interface AdherenceRecord {
  date: string
  medicineId: string
  time: string
  taken: boolean
}

export interface SymptomLog {
  id: string
  medicineId: string
  date: string
  symptom: string
  severity: "mild" | "moderate" | "severe"
  notes?: string
  resolvedAt?: string
}

export interface DrugInteraction {
  medicineId1: string
  medicineId2: string
  severity: "mild" | "moderate" | "severe"
  description: string
  recommendation?: string
}

export interface EmergencyCard {
  id: string
  patientName: string
  bloodType?: string
  allergies: string[]
  emergencyContact: string
  emergencyContactPhone: string
  medicines: Array<{
    name: string
    dosage: string
    frequency: string
  }>
  medicalConditions?: string
  lastUpdated: string
}

export interface MedicineSearchResult {
  name: string
  conditions: string[]
  dosageForm: string
  strength: string
}
