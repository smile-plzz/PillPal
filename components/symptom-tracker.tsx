"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Trash2, AlertCircle } from "lucide-react"
import type { Medicine, SymptomLog } from "@/lib/types"
import { getCommonSideEffects, correlateSymptomWithMedicine } from "@/lib/symptom-utils"

interface SymptomTrackerProps {
  medicines: Medicine[]
}

export function SymptomTracker({ medicines }: SymptomTrackerProps) {
  const [symptoms, setSymptoms] = useState<SymptomLog[]>([])
  const [open, setOpen] = useState(false)
  const [selectedMedicine, setSelectedMedicine] = useState("")
  const [selectedSymptom, setSelectedSymptom] = useState("")
  const [severity, setSeverity] = useState<"mild" | "moderate" | "severe">("mild")
  const [notes, setNotes] = useState("")

  // Load symptoms from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("symptom-logs")
    if (saved) {
      try {
        setSymptoms(JSON.parse(saved))
      } catch (e) {
        console.error("[v0] Failed to load symptoms:", e)
      }
    }
  }, [])

  // Save symptoms to localStorage
  useEffect(() => {
    localStorage.setItem("symptom-logs", JSON.stringify(symptoms))
  }, [symptoms])

  const handleLogSymptom = () => {
    if (!selectedMedicine || !selectedSymptom) return

    const newLog: SymptomLog = {
      id: crypto.randomUUID(),
      medicineId: selectedMedicine,
      date: new Date().toISOString().split("T")[0],
      symptom: selectedSymptom,
      severity,
      notes: notes || undefined,
    }

    setSymptoms([...symptoms, newLog])
    setSelectedSymptom("")
    setSeverity("mild")
    setNotes("")
    setOpen(false)
  }

  const handleDeleteSymptom = (id: string) => {
    setSymptoms(symptoms.filter((s) => s.id !== id))
  }

  const correlations = correlateSymptomWithMedicine(symptoms, medicines)
  const recentSymptoms = symptoms.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Symptom Tracker
              </CardTitle>
              <CardDescription>Track and correlate symptoms with medications</CardDescription>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Log Symptom
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log a Symptom</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Medicine</label>
                    <Select value={selectedMedicine} onValueChange={setSelectedMedicine}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a medicine" />
                      </SelectTrigger>
                      <SelectContent>
                        {medicines.map((med) => (
                          <SelectItem key={med.id} value={med.id}>
                            {med.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Symptom</label>
                    <Select value={selectedSymptom} onValueChange={setSelectedSymptom}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select or type symptom" />
                      </SelectTrigger>
                      <SelectContent>
                        {getCommonSideEffects().map((effect) => (
                          <SelectItem key={effect} value={effect}>
                            {effect}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Severity</label>
                    <Select value={severity} onValueChange={(v) => setSeverity(v as "mild" | "moderate" | "severe")}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mild">Mild</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="severe">Severe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Notes (Optional)</label>
                    <Input
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any additional details..."
                    />
                  </div>

                  <Button onClick={handleLogSymptom} className="w-full">
                    Log Symptom
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {correlations.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-sm">Symptom Correlations</CardTitle>
            <CardDescription>Symptoms that may be related to your medications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {correlations.slice(0, 5).map((corr, index) => (
              <div key={index} className="p-3 rounded-lg bg-white border border-yellow-200">
                <p className="font-medium">
                  {corr.symptom} → {corr.medicine}
                </p>
                <p className="text-sm text-muted-foreground">
                  Logged {corr.frequency} times • Severity: {corr.avgSeverity}
                  {corr.possibleCause && " • Known side effect"}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {recentSymptoms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Symptoms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentSymptoms.map((symptom) => {
                const med = medicines.find((m) => m.id === symptom.medicineId)
                return (
                  <div key={symptom.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium text-sm">{symptom.symptom}</p>
                      <p className="text-xs text-muted-foreground">
                        {med?.name} • {symptom.date} • {symptom.severity}
                      </p>
                      {symptom.notes && <p className="text-xs mt-1">{symptom.notes}</p>}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteSymptom(symptom.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
