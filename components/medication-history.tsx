"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"

interface MedicationHistoryProps {
  medicines: any[]
}

export function MedicationHistory({ medicines }: MedicationHistoryProps) {
  const history = medicines
    .map((medicine) => ({
      medicineName: medicine.name,
      createdAt: medicine.createdAt,
      updatedAt: medicine.updatedAt,
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <Card>
      <CardHeader>
        <CardTitle>Medication History</CardTitle>
        <CardDescription>Recent changes to your medications</CardDescription>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No medication history yet</div>
        ) : (
          <div className="space-y-4">
            {history.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Plus className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{item.medicineName}</p>
                    <p className="text-xs text-muted-foreground">
                      Added {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
