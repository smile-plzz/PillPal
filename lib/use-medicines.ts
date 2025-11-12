"use client"

import { useState, useEffect } from "react"
import type { Medicine } from "./types"
import { validateMedicine, sanitizeMedicine } from "./validation"

export function useMedicines() {
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem("medicines")
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          setMedicines(parsed)
        } else {
          throw new Error("Invalid medicines format")
        }
      }
    } catch (err) {
      console.error("[v0] Failed to load medicines:", err)
      setError(err instanceof Error ? err.message : "Failed to load medicines")
      // Reset to empty array if data is corrupted
      setMedicines([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const saveMedicines = (updatedMedicines: Medicine[]) => {
    try {
      setMedicines(updatedMedicines)
      localStorage.setItem("medicines", JSON.stringify(updatedMedicines))
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save medicines"
      console.error("[v0] Save error:", message)
      setError(message)
    }
  }

  const addMedicine = (medicineData: Partial<Medicine>) => {
    const validationErrors = validateMedicine(medicineData)
    if (validationErrors.length > 0) {
      throw new Error(validationErrors.map((e) => e.message).join(", "))
    }

    const sanitized = sanitizeMedicine(medicineData)
    const medicine: Medicine = {
      id: crypto.randomUUID(),
      name: sanitized.name || "",
      times: sanitized.times || [],
      dosage: sanitized.dosage,
      instructions: sanitized.instructions,
      duration: sanitized.duration,
      createdAt: new Date().toISOString(),
      taken: [],
      notes: sanitized.notes,
      sideEffects: sanitized.sideEffects,
      contraindications: sanitized.contraindications,
      tags: sanitized.tags,
    }

    const updated = [...medicines, medicine]
    saveMedicines(updated)
    return medicine
  }

  const updateMedicine = (medicineData: Medicine) => {
    const validationErrors = validateMedicine(medicineData)
    if (validationErrors.length > 0) {
      throw new Error(validationErrors.map((e) => e.message).join(", "))
    }

    const sanitized = sanitizeMedicine(medicineData)
    const updated = medicines.map((m) =>
      m.id === medicineData.id
        ? {
            ...m,
            ...sanitized,
            updatedAt: new Date().toISOString(),
          }
        : m,
    )
    saveMedicines(updated)
  }

  const deleteMedicine = (id: string) => {
    const updated = medicines.filter((m) => m.id !== id)
    saveMedicines(updated)
  }

  const markTaken = (medicineId: string, time: string, date?: string) => {
    const targetDate = date || new Date().toISOString().split("T")[0]
    const medicine = medicines.find((m) => m.id === medicineId)
    if (!medicine) throw new Error("Medicine not found")

    const hasTaken = medicine.taken?.some((t) => t.date === targetDate && t.time === time)
    if (hasTaken) {
      medicine.taken = medicine.taken.filter((t) => !(t.date === targetDate && t.time === time))
    } else {
      medicine.taken = [...(medicine.taken || []), { date: targetDate, time }]
    }

    updateMedicine(medicine)
  }

  return {
    medicines,
    isLoading,
    error,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    saveMedicines,
    markTaken,
  }
}
