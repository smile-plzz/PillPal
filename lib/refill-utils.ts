import type { Medicine } from "./types"

export interface RefillNotification {
  medicineId: string
  medicineName: string
  refillDate: string
  daysUntilRefill: number
  urgent: boolean
}

export function getRefillNotifications(medicines: Medicine[]): RefillNotification[] {
  const today = new Date()
  const notifications: RefillNotification[] = []

  medicines.forEach((medicine) => {
    if (!medicine.refillDate || !medicine.refillReminder) return

    const refillDate = new Date(medicine.refillDate)
    const daysUntilRefill = Math.ceil((refillDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilRefill <= (medicine.remindBefore || 3)) {
      notifications.push({
        medicineId: medicine.id,
        medicineName: medicine.name,
        refillDate: medicine.refillDate,
        daysUntilRefill,
        urgent: daysUntilRefill <= 1,
      })
    }
  })

  return notifications.sort((a, b) => a.daysUntilRefill - b.daysUntilRefill)
}

export function scheduleNextRefill(medicine: Medicine, daysSupply: number): string {
  const lastTaken = medicine.taken?.[medicine.taken.length - 1]?.date
  const baseDate = lastTaken ? new Date(lastTaken) : new Date()
  const nextRefillDate = new Date(baseDate.getTime() + daysSupply * 24 * 60 * 60 * 1000)
  return nextRefillDate.toISOString().split("T")[0]
}

export function calculateNextRefillDate(medicine: Medicine, dailyDoses = 1): { date: string; daysSupply: number } {
  const today = new Date()
  const lastRefillDate = medicine.refillDate ? new Date(medicine.refillDate) : today
  const daysSinceRefill = Math.ceil((today.getTime() - lastRefillDate.getTime()) / (1000 * 60 * 60 * 24))

  // Estimate typical supply duration (can be customized)
  const estimatedSupplyDays = 30
  const daysUntilNextRefill = Math.max(0, estimatedSupplyDays - daysSinceRefill)
  const nextRefillDate = new Date(today.getTime() + daysUntilNextRefill * 24 * 60 * 60 * 1000)

  return {
    date: nextRefillDate.toISOString().split("T")[0],
    daysSupply: estimatedSupplyDays,
  }
}
