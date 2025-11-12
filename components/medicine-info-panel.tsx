"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertTriangle, CheckCircle2, Info } from "lucide-react"

interface MedicineInfoPanelProps {
  medicineName: string
  details: any
  loading?: boolean
}

export function MedicineInfoPanel({ medicineName, details, loading = false }: MedicineInfoPanelProps) {
  const [educationalContent, setEducationalContent] = useState<any>(null)

  useEffect(() => {
    if (details) {
      setEducationalContent(details)
    }
  }, [details])

  if (!medicineName) return null

  if (loading) {
    return (
      <Card className="border-blue-200 dark:border-blue-900">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading medicine information...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!educationalContent) return null

  return (
    <Card className="border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Learn About {educationalContent.name || medicineName}
            </CardTitle>
            <CardDescription>Important information from FDA drug database</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="uses">Uses</TabsTrigger>
            <TabsTrigger value="safety">Safety</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-3 mt-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">Generic Name</h4>
              <p className="text-sm text-muted-foreground">
                {educationalContent.genericName || "Information not available"}
              </p>
            </div>

            {educationalContent.manufacturer && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Manufacturer</h4>
                <p className="text-sm text-muted-foreground">{educationalContent.manufacturer}</p>
              </div>
            )}

            {educationalContent.route && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Route of Administration</h4>
                <p className="text-sm text-muted-foreground">{educationalContent.route}</p>
              </div>
            )}

            {educationalContent.form && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Dosage Form</h4>
                <p className="text-sm text-muted-foreground">{educationalContent.form}</p>
              </div>
            )}

            {educationalContent.strength && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Strength</h4>
                <p className="text-sm text-muted-foreground">{educationalContent.strength}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="uses" className="space-y-3 mt-4">
            {educationalContent.uses && educationalContent.uses.length > 0 ? (
              <div>
                <h4 className="font-semibold text-sm mb-2">Common Uses</h4>
                <ul className="space-y-1">
                  {educationalContent.uses.map((use: string, idx: number) => (
                    <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5 text-green-600 dark:text-green-400" />
                      {use}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Uses information not available</p>
            )}
          </TabsContent>

          <TabsContent value="safety" className="space-y-3 mt-4">
            {educationalContent.contraindications && educationalContent.contraindications.length > 0 && (
              <Alert className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-900">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-800 dark:text-red-200 text-sm">
                  <h4 className="font-semibold mb-2">Contraindications (Do Not Use If):</h4>
                  <ul className="space-y-1 ml-4 list-disc">
                    {educationalContent.contraindications.slice(0, 5).map((contra: string, idx: number) => (
                      <li key={idx} className="text-xs">
                        {contra}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {educationalContent.warnings && educationalContent.warnings.length > 0 && (
              <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-900">
                <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <AlertDescription className="text-yellow-800 dark:text-yellow-200 text-sm">
                  <h4 className="font-semibold mb-2">Important Warnings:</h4>
                  <ul className="space-y-1 ml-4 list-disc">
                    {educationalContent.warnings.slice(0, 5).map((warning: string, idx: number) => (
                      <li key={idx} className="text-xs">
                        {warning}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {educationalContent.sideEffects && educationalContent.sideEffects.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Common Side Effects</h4>
                <div className="flex flex-wrap gap-2">
                  {educationalContent.sideEffects.slice(0, 8).map((effect: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {effect}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="details" className="space-y-3 mt-4">
            {educationalContent.ndc && (
              <div>
                <h4 className="font-semibold text-sm mb-1">NDC Code</h4>
                <code className="text-xs bg-muted px-2 py-1 rounded">{educationalContent.ndc}</code>
              </div>
            )}

            {educationalContent.dosageForm && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Dosage Form</h4>
                <p className="text-sm text-muted-foreground">{educationalContent.dosageForm}</p>
              </div>
            )}

            {educationalContent.adverseEvents !== undefined && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Reported Adverse Events</h4>
                <p className="text-sm text-muted-foreground">
                  {educationalContent.adverseEvents} events reported to FDA
                </p>
              </div>
            )}

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                This information is sourced from the FDA drug database. Always consult with your healthcare provider for
                medical advice.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
