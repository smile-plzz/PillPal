
"use client"

import { useState, useEffect } from "react"
import { MedicineForm } from "@/components/medicine-form"
import { ScheduleTable } from "@/components/schedule-table"
import { Dashboard } from "@/components/dashboard"
import { NotificationSystem } from "@/components/notification-system"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Settings, RotateCcw, Upload } from "lucide-react"
import { SettingsDialog } from "@/components/settings-dialog"
import { exportData, resetSchedule, generatePDF } from "@/lib/data-utils"
import { useMedicines } from "@/lib/use-medicines"
import { autoBackup, exportBackupAsJSON, importBackupFromJSON, restoreFromBackup } from "@/lib/backup-utils"
import { AdherenceAnalytics } from "@/components/adherence-analytics"
import { SmartReminders } from "@/components/smart-reminders"
import { DrugInteractionChecker } from "@/components/drug-interaction-checker"
import { EmergencyCard } from "@/components/emergency-card"
import { SymptomTracker } from "@/components/symptom-tracker"
import { MedicineConditionSearch } from "@/components/medicine-condition-search"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"

export default function Home() {
  const { toast } = useToast()
  const { medicines, saveMedicines } = useMedicines()
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState<any>({})

  useEffect(() => {
    const appSettings = localStorage.getItem("app-settings")
    setSettings(appSettings ? JSON.parse(appSettings) : {})

    // Backup every 5 minutes
    const interval = setInterval(
      () => {
        autoBackup(medicines, settings)
      },
      5 * 60 * 1000,
    )

    return () => clearInterval(interval)
  }, [medicines])

  const handleExport = async () => {
    try {
      await exportData(medicines)
      toast({
        title: "Success",
        description: "Data exported successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      })
    }
  }

  const handleGeneratePDF = async () => {
    try {
      await generatePDF(medicines)
      toast({
        title: "Success",
        description: "PDF generated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      })
    }
  }

  const handleBackupExport = async () => {
    try {
      const backup = {
        medicines,
        settings,
        notifications: [],
        exportDate: new Date().toISOString(),
        version: "1.0.0",
      }
      await exportBackupAsJSON(backup)
      toast({
        title: "Success",
        description: "Backup exported successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export backup",
        variant: "destructive",
      })
    }
  }

  const handleBackupImport = async () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const backup = await importBackupFromJSON(file)
        restoreFromBackup(backup)
        saveMedicines(backup.medicines)
        toast({
          title: "Success",
          description: "Backup restored successfully",
        })
        window.location.reload()
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to import backup",
          variant: "destructive",
        })
      }
    }
    input.click()
  }

  const handleReset = () => {
    if (confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
      resetSchedule()
      toast({
        title: "Success",
        description: "All data cleared",
      })
    }
  }

  return (
    <main className="min-h-screen bg-background/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto py-8 px-4"
      >
        <div className="flex flex-col items-start justify-between mb-8 space-y-4 md:flex-row md:items-center md:space-y-0">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
              Medicine Tracker
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">Manage your daily medication schedule with ease.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => setShowSettings(true)} className="rounded-full hover:bg-primary/10">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <NotificationSystem medicines={medicines} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2">
            <SmartReminders medicines={medicines} />
          </div>
          <div>
            <EmergencyCard
              medicines={medicines}
              patientName={settings.patientName || "Patient"}
              emergencyContact={settings.doctorName || "Doctor"}
              emergencyContactPhone={settings.doctorContact || "Phone"}
            />
          </div>
        </div>

        {medicines.length > 0 && <DrugInteractionChecker medicines={medicines} />}

        <Tabs defaultValue="dashboard" className="space-y-6 mt-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="medicines">Medicines</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <Dashboard medicines={medicines} />
          </TabsContent>

          <TabsContent value="medicines" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <MedicineForm onSave={() => saveMedicines(medicines)} />
              </div>
              <div className="lg:col-span-2">
                <ScheduleTable medicines={medicines} onUpdate={() => saveMedicines(medicines)} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AdherenceAnalytics medicines={medicines} />
          </TabsContent>

          <TabsContent value="symptoms" className="space-y-6">
            <SymptomTracker medicines={medicines} />
          </TabsContent>

          <TabsContent value="search" className="space-y-6">
            <MedicineConditionSearch />
          </TabsContent>
        </Tabs>

        <div className="mt-8 flex gap-2 flex-wrap">
          <Button onClick={handleGeneratePDF} variant="outline" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Generate PDF
          </Button>
          <Button onClick={handleExport} variant="outline" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
          <Button onClick={handleBackupExport} variant="outline" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Backup
          </Button>
          <Button onClick={handleBackupImport} variant="outline" className="gap-2 bg-transparent">
            <Upload className="h-4 w-4" />
            Restore
          </Button>
          <Button onClick={handleReset} variant="destructive" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset Schedule
          </Button>
        </div>
      </motion.div>

      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
    </main>
  )
}
