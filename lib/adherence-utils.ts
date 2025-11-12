import type { Medicine } from "./types"

export interface AdherenceStats {
  date: string
  adherenceRate: number
  scheduledDoses: number
  takenDoses: number
  missedDoses: number
}

export interface AdherenceMetrics {
  overall: number
  week: number
  month: number
  byMedicine: Array<{
    medicineId: string
    medicineName: string
    adherenceRate: number
  }>
  trends: AdherenceStats[]
}

export function calculateAdherence(medicines: Medicine[]): AdherenceMetrics {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const allTaken = medicines.flatMap((m) => m.taken || [])

  // Filter by date ranges
  const lastMonthTaken = allTaken.filter((t) => new Date(t.date) >= thirtyDaysAgo)
  const lastWeekTaken = allTaken.filter((t) => new Date(t.date) >= sevenDaysAgo)

  // Calculate scheduled doses
  const getDosesInRange = (startDate: Date, endDate: Date, meds: Medicine[]) => {
    let total = 0
    const current = new Date(startDate)

    while (current <= endDate) {
      const dateStr = current.toISOString().split("T")[0]
      meds.forEach((med) => {
        const createdDate = new Date(med.createdAt)
        const endDateMed = med.duration ? new Date(createdDate.getTime() + med.duration * 24 * 60 * 60 * 1000) : null

        if (current >= createdDate && (!endDateMed || current <= endDateMed)) {
          total += med.times?.length || 0
        }
      })
      current.setDate(current.getDate() + 1)
    }
    return total
  }

  const monthlyScheduled = getDosesInRange(thirtyDaysAgo, now, medicines)
  const weeklyScheduled = getDosesInRange(sevenDaysAgo, now, medicines)

  const monthlyAdherence = monthlyScheduled > 0 ? Math.round((lastMonthTaken.length / monthlyScheduled) * 100) : 100
  const weeklyAdherence = weeklyScheduled > 0 ? Math.round((lastWeekTaken.length / weeklyScheduled) * 100) : 100
  const overallAdherence = monthlyAdherence

  // Calculate by medicine
  const byMedicine = medicines.map((med) => {
    const medTaken = lastMonthTaken.filter(
      (t) => t.date && med.taken?.some((mt) => mt.date === t.date && mt.time === t.time),
    )
    const medScheduled = getDosesInRange(thirtyDaysAgo, now, [med])
    const rate = medScheduled > 0 ? Math.round((medTaken.length / medScheduled) * 100) : 100

    return {
      medicineId: med.id,
      medicineName: med.name,
      adherenceRate: rate,
    }
  })

  // Generate daily trends
  const trends: AdherenceStats[] = []
  const current = new Date(thirtyDaysAgo)

  while (current <= now) {
    const dateStr = current.toISOString().split("T")[0]
    const dayTaken = lastMonthTaken.filter((t) => t.date === dateStr).length
    const dayScheduled = getDosesInRange(current, current, medicines)

    trends.push({
      date: dateStr,
      scheduledDoses: dayScheduled,
      takenDoses: dayTaken,
      missedDoses: Math.max(0, dayScheduled - dayTaken),
      adherenceRate: dayScheduled > 0 ? Math.round((dayTaken / dayScheduled) * 100) : 100,
    })

    current.setDate(current.getDate() + 1)
  }

  return {
    overall: overallAdherence,
    week: weeklyAdherence,
    month: monthlyAdherence,
    byMedicine,
    trends,
  }
}
