"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Trash2, Check, Eye } from "lucide-react"
import { useMedicines } from "@/lib/use-medicines"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MedicineDetailsModal } from "./medicine-details-modal"
import type { Medicine } from "@/lib/types"

interface ScheduleTableProps {
  medicines: any[]
  onUpdate?: () => void
}

export function ScheduleTable({ medicines, onUpdate }: ScheduleTableProps) {
  const { toast } = useToast()
  const { updateMedicine, deleteMedicine } = useMedicines()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null)

  const scheduleItems = medicines
    .flatMap((medicine) =>
      medicine.times.map((time) => ({
        ...medicine,
        time,
      })),
    )
    .sort((a, b) => a.time.localeCompare(b.time))

  const filteredItems = scheduleItems.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const getDoseStatus = (medicine: any, time: string) => {
    const today = new Date().toDateString()
    const doseTime = new Date()
    const [hours, minutes] = time.split(":")
    doseTime.setHours(Number.parseInt(hours), Number.parseInt(minutes), 0, 0)

    const takenToday = medicine.taken?.some((t: any) => new Date(t.date).toDateString() === today && t.time === time)

    if (takenToday) return "taken"
    if (doseTime < new Date()) return "overdue"
    return "pending"
  }

  const handleMarkTaken = (medicine: any, time: string) => {
    const today = new Date().toISOString().split("T")[0]
    const updated = {
      ...medicine,
      taken: medicine.taken?.filter((t: any) => !(t.date === today && t.time === time)) || [],
    }
    updated.taken.push({ date: today, time })
    updateMedicine(updated)
    onUpdate?.()

    toast({
      title: "Success",
      description: "Dose marked as taken",
    })
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this medicine?")) {
      deleteMedicine(id)
      onUpdate?.()
      toast({
        title: "Success",
        description: "Medicine deleted",
      })
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Schedule</CardTitle>
          <CardDescription>Your medication schedule for today</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Search medicines..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

          {filteredItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No medicines added yet</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Medicine</TableHead>
                    <TableHead>Dosage</TableHead>
                    <TableHead>Instructions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => {
                    const status = getDoseStatus(item, item.time)
                    return (
                      <TableRow key={`${item.id}-${item.time}`}>
                        <TableCell className="font-medium">{item.time}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.dosage || "N/A"}</TableCell>
                        <TableCell>{item.instructions || "N/A"}</TableCell>
                        <TableCell>
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full ${
                              status === "taken"
                                ? "bg-green-100 text-green-800"
                                : status === "overdue"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedMedicine(item)}
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {status !== "taken" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkTaken(item, item.time)}
                                title="Mark taken"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} title="Delete">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <MedicineDetailsModal
        medicine={selectedMedicine}
        open={!!selectedMedicine}
        onOpenChange={(open) => !open && setSelectedMedicine(null)}
      />
    </>
  )
}
