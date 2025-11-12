"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { toast } = useToast()
  const [enableNotifications, setEnableNotifications] = useState(false)
  const [patientName, setPatientName] = useState("")
  const [patientDob, setPatientDob] = useState("")
  const [patientContact, setPatientContact] = useState("")
  const [doctorName, setDoctorName] = useState("")
  const [doctorContact, setDoctorContact] = useState("")

  useEffect(() => {
    const settings = localStorage.getItem("app-settings")
    if (settings) {
      const parsed = JSON.parse(settings)
      setEnableNotifications(parsed.enableNotifications || false)
      setPatientName(parsed.patientName || "")
      setPatientDob(parsed.patientDob || "")
      setPatientContact(parsed.patientContact || "")
      setDoctorName(parsed.doctorName || "")
      setDoctorContact(parsed.doctorContact || "")
    }
  }, [open])

  const handleSave = () => {
    const settings = {
      enableNotifications,
      patientName,
      patientDob,
      patientContact,
      doctorName,
      doctorContact,
    }
    localStorage.setItem("app-settings", JSON.stringify(settings))
    onOpenChange(false)
    toast({
      title: "Success",
      description: "Settings saved successfully",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Manage your preferences and personal information</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-base font-semibold">Patient Information</Label>
            <div className="space-y-3">
              <div>
                <Label htmlFor="patient-name" className="text-sm">
                  Name
                </Label>
                <Input
                  id="patient-name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div>
                <Label htmlFor="patient-dob" className="text-sm">
                  Date of Birth
                </Label>
                <Input
                  id="patient-dob"
                  type="date"
                  value={patientDob}
                  onChange={(e) => setPatientDob(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="patient-contact" className="text-sm">
                  Contact
                </Label>
                <Input
                  id="patient-contact"
                  value={patientContact}
                  onChange={(e) => setPatientContact(e.target.value)}
                  placeholder="Your contact number"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-base font-semibold">Doctor Information</Label>
            <div className="space-y-3">
              <div>
                <Label htmlFor="doctor-name" className="text-sm">
                  Doctor Name
                </Label>
                <Input
                  id="doctor-name"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="Your doctor's name"
                />
              </div>
              <div>
                <Label htmlFor="doctor-contact" className="text-sm">
                  Doctor Contact
                </Label>
                <Input
                  id="doctor-contact"
                  value={doctorContact}
                  onChange={(e) => setDoctorContact(e.target.value)}
                  placeholder="Doctor's contact number"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Checkbox
                checked={enableNotifications}
                onCheckedChange={(checked) => setEnableNotifications(checked as boolean)}
              />
              <span className="text-sm">Enable notifications</span>
            </Label>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Settings</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
