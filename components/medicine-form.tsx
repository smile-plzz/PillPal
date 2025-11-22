"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Plus, X, Loader2 } from "lucide-react"
import { useMedicines } from "@/lib/use-medicines"
import { searchMedicines, getMedicineDetails, checkInteractions } from "@/lib/medicine-api"
import { Checkbox } from "@/components/ui/checkbox"
import { MedicineInfoPanel } from "./medicine-info-panel"

interface MedicineFormProps {
  onSave?: () => void
}

export function MedicineForm({ onSave }: MedicineFormProps) {
  const { toast } = useToast()
  const { addMedicine, medicines } = useMedicines()
  const [name, setName] = useState("")
  const [times, setTimes] = useState([""])
  const [dosage, setDosage] = useState("")
  const [instructions, setInstructions] = useState("")
  const [duration, setDuration] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState("")
  const [sideEffects, setSideEffects] = useState("")
  const [contraindications, setContraindications] = useState("")
  const [refillReminder, setRefillReminder] = useState(false)
  const [remindBefore, setRemindBefore] = useState("3")
  const [tags, setTags] = useState("")
  const [fetchingDetails, setFetchingDetails] = useState(false)
  const [showInteractions, setShowInteractions] = useState(false)
  const [interactionWarning, setInteractionWarning] = useState<string | null>(null)
  const [medicineDetails, setMedicineDetails] = useState<any>(null)

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([])
      return
    }

    try {
      const results = await searchMedicines(query)
      setSuggestions(results)
    } catch (error) {
      console.error("Failed to fetch suggestions:", error)
    }
  }, [])

  const handleSelectMedicine = async (selectedName: string) => {
    setName(selectedName)
    setSuggestions([])
    setFetchingDetails(true)

    try {
      const details = await getMedicineDetails(selectedName)

      if (details) {
        setMedicineDetails(details)

        if (details.sideEffects && details.sideEffects.length > 0) {
          setSideEffects(details.sideEffects.join(", "))
        }
        if (details.contraindications && details.contraindications.length > 0) {
          setContraindications(details.contraindications.join(", "))
        }
        if (details.form) {
          setDosage(`${details.form}${details.strength ? " - " + details.strength : ""}`)
        }

        toast({
          title: "Success",
          description: `Loaded details for ${details.name}`,
        })
      }

      if (showInteractions) {
        const existingMedicineNames = medicines.map((m) => m.name)
        if (existingMedicineNames.length > 0) {
          try {
            const interactions = await checkInteractions([selectedName, ...existingMedicineNames])
            if (interactions.length > 0) {
              setInteractionWarning(`⚠️ Potential interactions detected:\n${interactions.slice(0, 3).join("\n")}`)
              toast({
                title: "Drug Interaction Warning",
                description: "Potential interactions found. Check details.",
                variant: "destructive",
              })
            } else {
              setInteractionWarning(null)
            }
          } catch (error) {
            console.error("Failed to check interactions:", error)
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch medicine details:", error)
    } finally {
      setFetchingDetails(false)
    }
  }

  const handleNameChange = (value: string) => {
    setName(value)
    fetchSuggestions(value)
  }

  const handleAddTime = () => {
    setTimes([...times, ""])
  }

  const handleRemoveTime = (index: number) => {
    setTimes(times.filter((_, i) => i !== index))
  }

  const handleTimeChange = (index: number, value: string) => {
    const newTimes = [...times]
    newTimes[index] = value
    setTimes(newTimes)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Medicine name is required",
        variant: "destructive",
      })
      return
    }

    const validTimes = times.filter((t) => t.trim())
    if (validTimes.length === 0) {
      toast({
        title: "Error",
        description: "At least one time is required",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const medicine = addMedicine({
        id: crypto.randomUUID(),
        name: name.trim(),
        times: validTimes,
        dosage,
        instructions,
        duration: duration ? Number.parseInt(duration) : null,
        notes,
        sideEffects,
        contraindications,
        refillReminder,
        remindBefore: remindBefore ? Number.parseInt(remindBefore) : undefined,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t.length > 0),
        createdAt: new Date().toISOString(),
        taken: [],
      })

      setName("")
      setTimes([""])
      setDosage("")
      setInstructions("")
      setDuration("")
      setNotes("")
      setSideEffects("")
      setContraindications("")
      setRefillReminder(false)
      setRemindBefore("3")
      setTags("")
      setSuggestions([])
      setInteractionWarning(null)
      setMedicineDetails(null)

      toast({
        title: "Success",
        description: "Medicine added successfully",
      })

      onSave?.()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to add medicine"
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Medicine</CardTitle>
        <CardDescription>Track a new medication in your schedule</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Medicine Name</Label>
            <div className="relative">
              <Input
                id="name"
                placeholder="Enter medicine name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-input rounded-md shadow-md z-10">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-muted text-sm"
                      onClick={() => handleSelectMedicine(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {fetchingDetails && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" /> Fetching details from OpenFDA...
              </p>
            )}
          </div>

          {medicineDetails && (
            <MedicineInfoPanel medicineName={name} details={medicineDetails} loading={fetchingDetails} />
          )}

          {interactionWarning && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 whitespace-pre-line">{interactionWarning}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Times</Label>
            <div className="space-y-2">
              {times.map((time, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => handleTimeChange(index, e.target.value)}
                    className="flex-1"
                  />
                  {times.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveTime(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" size="sm" onClick={handleAddTime} className="gap-2 bg-transparent">
              <Plus className="h-4 w-4" />
              Add Time
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dosage">Dosage</Label>
              <Input id="dosage" placeholder="e.g., 500mg" value={dosage} onChange={(e) => setDosage(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (days)</Label>
              <Input
                id="duration"
                type="number"
                placeholder="Leave empty for indefinite"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              placeholder="e.g., Take with food"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="min-h-20"
            />
          </div>

          <div className="border-t pt-4 space-y-4">
            <h3 className="font-semibold text-sm">Advanced Options</h3>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes about this medicine"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-16"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sideEffects">Common Side Effects</Label>
              <Textarea
                id="sideEffects"
                placeholder="List any known side effects"
                value={sideEffects}
                onChange={(e) => setSideEffects(e.target.value)}
                className="min-h-16"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contraindications">Contraindications</Label>
              <Textarea
                id="contraindications"
                placeholder="Important warnings and contraindications"
                value={contraindications}
                onChange={(e) => setContraindications(e.target.value)}
                className="min-h-16"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                placeholder="e.g., antibiotic, pain-relief, daily"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="refillReminder"
                checked={refillReminder}
                onCheckedChange={(checked) => setRefillReminder(checked as boolean)}
              />
              <Label htmlFor="refillReminder" className="font-normal">
                Enable refill reminders
              </Label>
            </div>

            {refillReminder && (
              <div className="space-y-2">
                <Label htmlFor="remindBefore">Remind before (days)</Label>
                <Input
                  id="remindBefore"
                  type="number"
                  min="1"
                  max="24"
                  value={remindBefore}
                  onChange={(e) => setRemindBefore(e.target.value)}
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <Checkbox
                id="showInteractions"
                checked={showInteractions}
                onCheckedChange={(checked) => setShowInteractions(checked as boolean)}
              />
              <Label htmlFor="showInteractions" className="font-normal">
                Check for drug interactions
              </Label>
            </div>
          </div>

          <Button type="submit" disabled={loading || fetchingDetails} className="w-full">
            {loading ? "Adding..." : "Add Medicine"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
