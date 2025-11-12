"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Pill, Clock, TrendingUp, AlertCircle } from "lucide-react"

interface DashboardProps {
  medicines: any[]
}

export function Dashboard({ medicines }: DashboardProps) {
  const totalMedicines = medicines.length

  const todayDoses = medicines.reduce((sum, medicine) => {
    return sum + medicine.times.length
  }, 0)

  const adherenceRate = (() => {
    if (todayDoses === 0) return 0
    const today = new Date().toDateString()
    const takenDoses = medicines.reduce((sum, medicine) => {
      return sum + (medicine.taken?.filter((t: any) => new Date(t.date).toDateString() === today).length || 0)
    }, 0)
    return Math.round((takenDoses / todayDoses) * 100)
  })()

  const getNextDoseTime = () => {
    const now = new Date()
    const today = now.toDateString()

    let nextDose: Date | null = null
    medicines.forEach((medicine) => {
      medicine.times.forEach((time: string) => {
        const doseTime = new Date()
        const [hours, minutes] = time.split(":")
        doseTime.setHours(Number.parseInt(hours), Number.parseInt(minutes), 0, 0)

        const takenToday = medicine.taken?.some(
          (t: any) => new Date(t.date).toDateString() === today && t.time === time,
        )

        if (!takenToday && doseTime > now && (!nextDose || doseTime < nextDose)) {
          nextDose = doseTime
        }
      })
    })

    return nextDose ? nextDose.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--"
  }

  const stats = [
    {
      title: "Total Medicines",
      value: totalMedicines,
      icon: Pill,
      description: "Active medications",
    },
    {
      title: "Today's Doses",
      value: todayDoses,
      icon: Clock,
      description: "Scheduled for today",
    },
    {
      title: "Adherence Rate",
      value: `${adherenceRate}%`,
      icon: TrendingUp,
      description: "Today's completion",
    },
    {
      title: "Next Dose",
      value: getNextDoseTime(),
      icon: AlertCircle,
      description: "Upcoming time",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
