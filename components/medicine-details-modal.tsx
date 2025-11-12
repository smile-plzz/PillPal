"use client"
import type { Medicine } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, AlertTriangle, Lightbulb, Activity } from "lucide-react"
import { useState, useEffect } from "react"
import { getAdverseEvents } from "@/lib/medicine-api"

interface MedicineDetailsModalProps {
  medicine: Medicine | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (medicine: Medicine) => void
}

export function MedicineDetailsModal({ medicine, open, onOpenChange, onEdit }: MedicineDetailsModalProps) {
  const [adverseEvents, setAdverseEvents] = useState<number | null>(null)
  const [loadingEvents, setLoadingEvents] = useState(false)

  useEffect(() => {
    if (open && medicine) {
      setLoadingEvents(true)
      getAdverseEvents(medicine.name)
        .then((count) => setAdverseEvents(count))
        .catch((error) => {
          console.error("[v0] Failed to fetch adverse events:", error)
          setAdverseEvents(0)
        })
        .finally(() => setLoadingEvents(false))
    }
  }, [open, medicine])

  if (!medicine) return null

  const getDoseCount = (medicine: Medicine) => {
    return medicine.times.length
  }

  const getDosesTaken = (medicine: Medicine) => {
    const today = new Date().toDateString()
    return medicine.taken?.filter((t) => new Date(t.date).toDateString() === today).length || 0
  }

  const getDaysActive = (medicine: Medicine) => {
    const createdDate = new Date(medicine.createdAt)
    const today = new Date()
    return Math.ceil((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{medicine.name}</DialogTitle>
          <DialogDescription>Medication Details & Information</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Dosage</label>
                <p className="text-lg font-semibold">{medicine.dosage || "Not specified"}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Doses per Day</label>
                <p className="text-lg font-semibold">{getDoseCount(medicine)}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Duration</label>
                <p className="text-lg font-semibold">
                  {medicine.duration ? `${medicine.duration} days` : "Indefinite"}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Days Active</label>
                <p className="text-lg font-semibold">{getDaysActive(medicine)} days</p>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <label className="text-sm font-medium text-muted-foreground">FDA Adverse Events</label>
                </div>
                {loadingEvents ? (
                  <span className="text-xs text-muted-foreground">Loading...</span>
                ) : (
                  <span className="text-lg font-semibold">{adverseEvents || 0}</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Reports from FDA FAERS database</p>
            </div>

            {medicine.instructions && (
              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertDescription>
                  <span className="font-medium">Instructions:</span> {medicine.instructions}
                </AlertDescription>
              </Alert>
            )}

            {medicine.contraindications && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <span className="font-medium">Contraindications:</span> {medicine.contraindications}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="flex gap-2">
                <Badge variant="outline">
                  {getDosesTaken(medicine)} of {getDoseCount(medicine)} doses today
                </Badge>
                {medicine.refillReminder && <Badge variant="secondary">Refill Reminder Enabled</Badge>}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Daily Schedule</h4>
              <div className="space-y-2">
                {medicine.times.map((time) => (
                  <div key={time} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{time}</span>
                    </div>
                    <Badge variant={medicine.taken?.some((t) => t.time === time) ? "default" : "secondary"}>
                      {medicine.taken?.some((t) => t.time === time) ? "Taken" : "Pending"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            {medicine.notes && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Notes</label>
                <p className="p-3 bg-muted rounded-lg">{medicine.notes}</p>
              </div>
            )}

            {medicine.sideEffects && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Side Effects</label>
                <p className="p-3 bg-muted rounded-lg">{medicine.sideEffects}</p>
              </div>
            )}

            {medicine.tags && medicine.tags.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {medicine.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Recent History</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {medicine.taken && medicine.taken.length > 0 ? (
                  medicine.taken
                    .slice()
                    .reverse()
                    .slice(0, 20)
                    .map((entry, idx) => (
                      <div key={idx} className="flex justify-between p-2 border-b text-sm">
                        <span>{entry.date}</span>
                        <span className="font-medium">{entry.time}</span>
                      </div>
                    ))
                ) : (
                  <p className="text-sm text-muted-foreground">No history yet</p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {onEdit && <Button onClick={() => onEdit(medicine)}>Edit Medicine</Button>}
        </div>
      </DialogContent>
    </Dialog>
  )
}
