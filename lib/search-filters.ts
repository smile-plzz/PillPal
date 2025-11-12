import type { Medicine } from "./types"

export interface FilterOptions {
  searchTerm?: string
  status?: "pending" | "taken" | "overdue" | "all"
  tags?: string[]
  hasRefillReminder?: boolean
  durationRange?: [number, number]
}

export function filterMedicines(medicines: Medicine[], options: FilterOptions): Medicine[] {
  return medicines.filter((medicine) => {
    // Search term filter
    if (options.searchTerm) {
      const term = options.searchTerm.toLowerCase()
      const matches =
        medicine.name.toLowerCase().includes(term) ||
        medicine.dosage?.toLowerCase().includes(term) ||
        medicine.instructions?.toLowerCase().includes(term) ||
        medicine.notes?.toLowerCase().includes(term)

      if (!matches) return false
    }

    // Tags filter
    if (options.tags && options.tags.length > 0) {
      const hasTags = options.tags.some((tag) => medicine.tags?.includes(tag))
      if (!hasTags) return false
    }

    // Refill reminder filter
    if (options.hasRefillReminder !== undefined && medicine.refillReminder !== options.hasRefillReminder) {
      return false
    }

    // Duration range filter
    if (options.durationRange) {
      const duration = medicine.duration || 0
      if (duration < options.durationRange[0] || duration > options.durationRange[1]) {
        return false
      }
    }

    return true
  })
}

export function getMedicinesByStatus(
  medicines: Medicine[],
  time: string,
  status: "pending" | "taken" | "overdue",
): Medicine[] {
  const today = new Date().toDateString()
  const doseTime = new Date()
  const [hours, minutes] = time.split(":")
  doseTime.setHours(Number.parseInt(hours), Number.parseInt(minutes), 0, 0)
  const now = new Date()

  return medicines.filter((medicine) => {
    const isTaken = medicine.taken?.some((t) => new Date(t.date).toDateString() === today && t.time === time)

    if (status === "taken") return isTaken
    if (status === "overdue") return !isTaken && doseTime < now
    if (status === "pending") return !isTaken && doseTime >= now

    return false
  })
}

export function getUpcomingReminders(
  medicines: Medicine[],
  hoursAhead = 24,
): Array<{
  medicine: Medicine
  time: string
  minutesUntil: number
}> {
  const now = new Date()
  const reminders: Array<{ medicine: Medicine; time: string; minutesUntil: number }> = []

  medicines.forEach((medicine) => {
    medicine.times.forEach((time) => {
      const [hours, minutes] = time.split(":")
      const reminderTime = new Date()
      reminderTime.setHours(Number.parseInt(hours), Number.parseInt(minutes), 0, 0)

      // Apply reminder offset if set
      if (medicine.remindBefore) {
        reminderTime.setHours(reminderTime.getHours() - medicine.remindBefore)
      }

      const minutesUntil = Math.floor((reminderTime.getTime() - now.getTime()) / 60000)

      if (minutesUntil >= 0 && minutesUntil <= hoursAhead * 60) {
        reminders.push({ medicine, time, minutesUntil })
      }
    })
  })

  return reminders.sort((a, b) => a.minutesUntil - b.minutesUntil)
}

export function getAdhereanceRate(medicines: Medicine[], days = 7): number {
  if (medicines.length === 0) return 0

  const now = new Date()
  const pastDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  let totalExpected = 0
  let totalTaken = 0

  medicines.forEach((medicine) => {
    for (let i = 0; i < days; i++) {
      const checkDate = new Date(pastDate.getTime() + i * 24 * 60 * 60 * 1000)
      const dateStr = checkDate.toISOString().split("T")[0]

      medicine.times.forEach(() => {
        totalExpected++
      })

      medicine.taken?.forEach((t) => {
        if (t.date === dateStr) {
          totalTaken++
        }
      })
    }
  })

  return totalExpected > 0 ? Math.round((totalTaken / totalExpected) * 100) : 0
}

export function searchMedicinesGlobal(medicines: Medicine[], query: string): Medicine[] {
  if (!query.trim()) return medicines

  const term = query.toLowerCase()
  return medicines.filter(
    (medicine) =>
      medicine.name.toLowerCase().includes(term) ||
      medicine.dosage?.toLowerCase().includes(term) ||
      medicine.instructions?.toLowerCase().includes(term) ||
      medicine.notes?.toLowerCase().includes(term) ||
      medicine.sideEffects?.toLowerCase().includes(term) ||
      medicine.tags?.some((tag) => tag.toLowerCase().includes(term)),
  )
}
