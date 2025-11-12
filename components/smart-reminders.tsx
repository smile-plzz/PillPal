"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Bell } from "lucide-react"
import type { Medicine } from "@/lib/types"
import { getNextDoses, requestNotificationPermission, sendNotification } from "@/lib/reminders-utils"

interface SmartRemindersProps {
  medicines: Medicine[]
}

export function SmartReminders({ medicines }: SmartRemindersProps) {
  const [nextDoses, setNextDoses] = useState<ReturnType<typeof getNextDoses>>([])
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

  useEffect(() => {
    setNextDoses(getNextDoses(medicines, 24))

    const interval = setInterval(() => {
      setNextDoses(getNextDoses(medicines, 24))
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [medicines])

  const handleEnableNotifications = async () => {
    const enabled = await requestNotificationPermission()
    setNotificationsEnabled(enabled)

    if (enabled) {
      sendNotification("Reminders Enabled", {
        body: "You will receive notifications for your medications",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Doses
            </CardTitle>
            <CardDescription>Next 24 hours</CardDescription>
          </div>
          <Button
            onClick={handleEnableNotifications}
            variant={notificationsEnabled ? "default" : "outline"}
            size="sm"
            className="gap-2"
          >
            <Bell className="h-4 w-4" />
            {notificationsEnabled ? "Enabled" : "Enable Notifications"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {nextDoses.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming doses</p>
        ) : (
          <div className="space-y-3">
            {nextDoses.slice(0, 5).map((dose, index) => (
              <div
                key={`${dose.medicineId}-${dose.time}-${index}`}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex-1">
                  <p className="font-medium">{dose.medicineName}</p>
                  <p className="text-sm text-muted-foreground">{dose.dosage || "As prescribed"}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary">{dose.time}</p>
                  <p className="text-xs text-muted-foreground">
                    {dose.minutesUntil < 60 ? `${dose.minutesUntil}m` : `${Math.round(dose.minutesUntil / 60)}h`} away
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
