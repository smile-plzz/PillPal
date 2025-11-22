import type { Medicine } from "./types"

export function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    console.log("Notifications not supported")
    return Promise.resolve(false)
  }

  if (Notification.permission === "granted") {
    return Promise.resolve(true)
  }

  if (Notification.permission !== "denied") {
    return Notification.requestPermission().then((permission) => permission === "granted")
  }

  return Promise.resolve(false)
}

export function sendNotification(title: string, options?: NotificationOptions) {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return
  }

  if (Notification.permission === "granted") {
    const notification = new Notification(title, {
      icon: "/favicon.svg",
      badge: "/favicon.svg",
      ...options,
    })

    // Auto-close after 10 seconds
    setTimeout(() => {
      notification.close()
    }, 10000)

    return notification
  }
}

export function getUpcomingReminders(
  medicines: Medicine[],
  minutesBefore = 30,
): Array<{ medicine: Medicine; time: string; minutesUntil: number }> {
  const reminders: Array<{ medicine: Medicine; time: string; minutesUntil: number }> = []
  const now = new Date()
  const todayStr = now.toISOString().split("T")[0]

  medicines.forEach((medicine) => {
    if (!medicine.times) return

    medicine.times.forEach((time) => {
      const [hours, minutes] = time.split(":").map(Number)
      const reminderTime = new Date()
      reminderTime.setHours(hours, minutes, 0, 0)

      const timeUntilReminder = (reminderTime.getTime() - now.getTime()) / (1000 * 60)

      if (timeUntilReminder > 0 && timeUntilReminder <= minutesBefore) {
        const alreadyTaken = medicine.taken?.some((t) => t.date === todayStr && t.time === time)

        if (!alreadyTaken) {
          reminders.push({
            medicine,
            time,
            minutesUntil: Math.round(timeUntilReminder),
          })
        }
      }
    })
  })

  return reminders.sort((a, b) => a.minutesUntil - b.minutesUntil)
}

export function scheduleReminders(medicines: Medicine[], minutesBefore = 30) {
  // Check for reminders every minute
  const interval = setInterval(() => {
    const reminders = getUpcomingReminders(medicines, minutesBefore)

    reminders.forEach((reminder) => {
      sendNotification(`Time to take ${reminder.medicine.name}`, {
        body: `Dosage: ${reminder.medicine.dosage || "As prescribed"}\nTime: ${reminder.time}`,
        tag: `medicine-${reminder.medicine.id}-${reminder.time}`,
        requireInteraction: false,
      })
    })
  }, 60000) // Check every minute

  return () => clearInterval(interval)
}

export function getNextDoses(medicines: Medicine[], hoursAhead = 24) {
  const doses: Array<{
    medicineId: string
    medicineName: string
    time: string
    dosage?: string
    minutesUntil: number
  }> = []

  const now = new Date()
  const maxTime = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000)

  medicines.forEach((medicine) => {
    if (!medicine.times) return

    medicine.times.forEach((time) => {
      const [hours, minutes] = time.split(":").map(Number)
      const doseTime = new Date()
      doseTime.setHours(hours, minutes, 0, 0)

      if (doseTime < now) {
        doseTime.setDate(doseTime.getDate() + 1)
      }

      if (doseTime >= now && doseTime <= maxTime) {
        const minutesUntil = Math.round((doseTime.getTime() - now.getTime()) / (1000 * 60))

        doses.push({
          medicineId: medicine.id,
          medicineName: medicine.name,
          time,
          dosage: medicine.dosage,
          minutesUntil,
        })
      }
    })
  })

  return doses.sort((a, b) => a.minutesUntil - b.minutesUntil)
}
