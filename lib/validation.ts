import type { Medicine, ValidationError } from "./types"

export function validateMedicine(data: Partial<Medicine>): ValidationError[] {
  const errors: ValidationError[] = []

  if (!data.name?.trim()) {
    errors.push({ field: "name", message: "Medicine name is required" })
  }

  if (!data.times || data.times.length === 0) {
    errors.push({ field: "times", message: "At least one time is required" })
  }

  const invalidTimes = data.times?.filter((t) => !/^\d{2}:\d{2}$/.test(t)) || []
  if (invalidTimes.length > 0) {
    errors.push({ field: "times", message: "Invalid time format" })
  }

  if (data.dosage && data.dosage.length > 100) {
    errors.push({ field: "dosage", message: "Dosage description too long" })
  }

  if (data.duration && (data.duration < 0 || data.duration > 3650)) {
    errors.push({ field: "duration", message: "Duration must be between 0 and 3650 days" })
  }

  if (data.remindBefore && (data.remindBefore < 0 || data.remindBefore > 24)) {
    errors.push({ field: "remindBefore", message: "Reminder must be 0-24 hours before" })
  }

  return errors
}

export function sanitizeMedicine(data: any): Partial<Medicine> {
  return {
    name: String(data.name || "")
      .trim()
      .substring(0, 100),
    times: Array.isArray(data.times)
      ? data.times.map((t: string) => String(t).trim()).filter((t: string) => /^\d{2}:\d{2}$/.test(t))
      : [],
    dosage: String(data.dosage || "")
      .trim()
      .substring(0, 100),
    instructions: String(data.instructions || "")
      .trim()
      .substring(0, 500),
    duration: data.duration ? Math.max(0, Math.min(3650, Number(data.duration))) : null,
    notes: String(data.notes || "")
      .trim()
      .substring(0, 500),
    sideEffects: String(data.sideEffects || "")
      .trim()
      .substring(0, 500),
    contraindications: String(data.contraindications || "")
      .trim()
      .substring(0, 500),
    tags: Array.isArray(data.tags)
      ? data.tags.map((t: string) => String(t).trim()).filter((t: string) => t.length > 0)
      : [],
  }
}
