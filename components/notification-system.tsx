"use client"

import { useEffect, useState } from "react"
import type { Medicine } from "@/lib/types"
import { getUpcomingReminders } from "@/lib/search-filters"
import { getRefillNotifications as getRefillAlerts } from "@/lib/refill-utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Bell, AlertTriangle } from "lucide-react"

interface NotificationSystemProps {
  medicines: Medicine[]
}

export function NotificationSystem({ medicines }: NotificationSystemProps) {
  const [reminders, setReminders] = useState<Array<{ medicine: Medicine; time: string; minutesUntil: number }>>([])
  const [refillAlerts, setRefillAlerts] = useState<any[]>([])

  useEffect(() => {
    const updateNotifications = () => {
      const upcomingReminders = getUpcomingReminders(medicines, 24)
      setReminders(upcomingReminders)

      const refills = getRefillAlerts(medicines)
      setRefillAlerts(refills)
    }

    updateNotifications()

    // Update every minute
    const interval = setInterval(updateNotifications, 60000)
    return () => clearInterval(interval)
  }, [medicines])

  const hasNotifications = reminders.length > 0 || refillAlerts.length > 0

  if (!hasNotifications) return null

  return (
    <div className="space-y-3">
      {refillAlerts.map((alert) => (
        <Alert key={alert.medicineId} variant={alert.urgent ? "destructive" : "default"}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <span className="font-medium">{alert.medicineName}</span> refill needed in{" "}
            <Badge variant="outline" className="ml-1">
              {alert.daysUntilRefill} days
            </Badge>
          </AlertDescription>
        </Alert>
      ))}

      {reminders.slice(0, 3).map((reminder, idx) => (
        <Alert key={idx}>
          <Bell className="h-4 w-4" />
          <AlertDescription>
            <span className="font-medium">{reminder.medicine.name}</span> at{" "}
            <Badge variant="outline">{reminder.time}</Badge> in{" "}
            <Badge variant="secondary">{Math.round(reminder.minutesUntil / 60)} hours</Badge>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  )
}
