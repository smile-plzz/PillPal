"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, AlertTriangle, AlertOctagon } from "lucide-react"
import type { Medicine } from "@/lib/types"
import { checkDrugInteractions, getInteractionSeverityBadge } from "@/lib/interaction-utils"

interface DrugInteractionCheckerProps {
  medicines: Medicine[]
}

export function DrugInteractionChecker({ medicines }: DrugInteractionCheckerProps) {
  const interactions = useMemo(() => checkDrugInteractions(medicines), [medicines])

  if (medicines.length < 2 || interactions.length === 0) {
    return null
  }

  const severeCount = interactions.filter((i) => i.severity === "severe").length
  const moderateCount = interactions.filter((i) => i.severity === "moderate").length

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "severe":
        return <AlertOctagon className="h-4 w-4 text-red-600" />
      case "moderate":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
    }
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Drug Interactions Found
        </CardTitle>
        <CardDescription>
          {severeCount} severe, {moderateCount} moderate interactions detected
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {interactions.map((interaction, index) => (
          <div key={index} className="p-4 rounded-lg border border-orange-200 bg-white">
            <div className="flex items-start gap-3">
              {getSeverityIcon(interaction.severity)}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold">
                    {interaction.medicine1} + {interaction.medicine2}
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getInteractionSeverityBadge(interaction.severity)}`}
                  >
                    {interaction.severity.charAt(0).toUpperCase() + interaction.severity.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{interaction.description}</p>
              </div>
            </div>
          </div>
        ))}
        <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> This is a basic interaction checker. Always consult with your healthcare provider
            about potential drug interactions.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
