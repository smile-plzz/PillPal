import type { SymptomLog } from "./types"

const COMMON_SIDE_EFFECTS = [
  "Headache",
  "Nausea",
  "Dizziness",
  "Fatigue",
  "Insomnia",
  "Dry mouth",
  "Loss of appetite",
  "Stomach pain",
  "Constipation",
  "Diarrhea",
  "Rash",
  "Muscle pain",
  "Joint pain",
  "Mood changes",
  "Tremor",
]

export function getCommonSideEffects(): string[] {
  return COMMON_SIDE_EFFECTS
}

export function logSymptom(
  symptom: string,
  severity: "mild" | "moderate" | "severe",
  medicineId: string,
  notes?: string,
): SymptomLog {
  return {
    id: crypto.randomUUID(),
    medicineId,
    date: new Date().toISOString().split("T")[0],
    symptom,
    severity,
    notes,
  }
}

export function correlateSymptomWithMedicine(symptomLogs: SymptomLog[], medicines: any[]) {
  const correlations: Array<{
    medicine: string
    symptom: string
    frequency: number
    avgSeverity: "mild" | "moderate" | "severe"
    possibleCause: boolean
  }> = []

  symptomLogs.forEach((log) => {
    const medicine = medicines.find((m) => m.id === log.medicineId)
    if (!medicine) return

    const existingCorrelation = correlations.find((c) => c.medicine === medicine.name && c.symptom === log.symptom)

    if (existingCorrelation) {
      existingCorrelation.frequency++
    } else {
      // Check if symptom appears in medicine's known side effects
      const possibleCause = medicine.sideEffects?.toLowerCase().includes(log.symptom.toLowerCase()) ?? false

      correlations.push({
        medicine: medicine.name,
        symptom: log.symptom,
        frequency: 1,
        avgSeverity: log.severity,
        possibleCause,
      })
    }
  })

  return correlations.filter((c) => c.frequency > 1 || c.possibleCause).sort((a, b) => b.frequency - a.frequency)
}
