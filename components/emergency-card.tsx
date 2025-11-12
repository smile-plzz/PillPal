"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Download, QrCode, Copy } from "lucide-react"
import type { Medicine } from "@/lib/types"
import { generateQRCode, formatEmergencyCardData } from "@/lib/qr-utils"

interface EmergencyCardProps {
  medicines: Medicine[]
  patientName?: string
  emergencyContact?: string
  emergencyContactPhone?: string
}

export function EmergencyCard({
  medicines,
  patientName = "Patient",
  emergencyContact = "Contact",
  emergencyContactPhone = "Phone",
}: EmergencyCardProps) {
  const [open, setOpen] = useState(false)
  const [qrUrl, setQrUrl] = useState("")

  const handleOpenCard = async () => {
    const cardData = formatEmergencyCardData(patientName, medicines, emergencyContact, emergencyContactPhone)
    const url = await generateQRCode(cardData)
    setQrUrl(url)
    setOpen(true)
  }

  const handleDownloadCard = () => {
    const element = document.getElementById("emergency-card-content")
    if (!element) return

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = 800
    canvas.height = 600

    // White background
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Red stripe on top
    ctx.fillStyle = "#DC2626"
    ctx.fillRect(0, 0, canvas.width, 60)

    // Title
    ctx.fillStyle = "white"
    ctx.font = "bold 32px Arial"
    ctx.fillText("EMERGENCY MEDICAL CARD", 40, 40)

    // Reset to black text
    ctx.fillStyle = "black"
    ctx.font = "bold 18px Arial"

    let yPos = 100

    // Patient info
    ctx.fillText(`Patient: ${patientName}`, 40, yPos)
    yPos += 40

    ctx.fillText(`Emergency Contact: ${emergencyContact}`, 40, yPos)
    yPos += 40

    ctx.fillText(`Phone: ${emergencyContactPhone}`, 40, yPos)
    yPos += 60

    // Medications
    ctx.font = "bold 16px Arial"
    ctx.fillText("CURRENT MEDICATIONS:", 40, yPos)
    yPos += 30

    ctx.font = "14px Arial"
    medicines.forEach((med) => {
      const text = `• ${med.name} - ${med.dosage || "As prescribed"} - ${med.times?.join(", ") || "N/A"}`
      ctx.fillText(text, 60, yPos)
      yPos += 25
    })

    // Download
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `emergency-card-${patientName.replace(/\s+/g, "-")}.png`
      a.click()
      URL.revokeObjectURL(url)
    })
  }

  const handleCopyCardData = () => {
    const cardData = formatEmergencyCardData(patientName, medicines, emergencyContact, emergencyContactPhone)
    navigator.clipboard.writeText(cardData)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Emergency Medical Card
          </CardTitle>
          <CardDescription>Quick access to your critical medical information</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleOpenCard} className="w-full gap-2">
            <QrCode className="h-4 w-4" />
            View Emergency Card
          </Button>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Emergency Medical Card</DialogTitle>
            <DialogDescription>Share this QR code with emergency services or caregivers</DialogDescription>
          </DialogHeader>

          <div id="emergency-card-content" className="space-y-6 p-6 border rounded-lg bg-red-50">
            <div className="text-center border-b-4 border-red-600 pb-4">
              <h1 className="text-3xl font-bold text-red-600">EMERGENCY MEDICAL CARD</h1>
            </div>

            <div className="space-y-2">
              <p className="text-lg">
                <strong>Patient:</strong> {patientName}
              </p>
              <p className="text-lg">
                <strong>Emergency Contact:</strong> {emergencyContact}
              </p>
              <p className="text-lg">
                <strong>Phone:</strong> {emergencyContactPhone}
              </p>
            </div>

            <div>
              <h2 className="font-bold text-lg mb-3">Current Medications:</h2>
              <ul className="space-y-2">
                {medicines.map((med) => (
                  <li key={med.id} className="text-sm p-2 bg-white rounded border">
                    {med.name} - {med.dosage || "As prescribed"} - {med.times?.join(", ") || "N/A"}
                  </li>
                ))}
              </ul>
            </div>

            {qrUrl && (
              <div className="flex justify-center py-4">
                <img
                  src={qrUrl || "/placeholder.svg"}
                  alt="Emergency card QR code"
                  className="border-4 border-red-600"
                />
              </div>
            )}

            <p className="text-xs text-gray-600 border-t pt-4">
              Always inform emergency services of all medications and allergies.
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleDownloadCard} variant="outline" className="gap-2 flex-1 bg-transparent">
              <Download className="h-4 w-4" />
              Download Card
            </Button>
            <Button onClick={handleCopyCardData} variant="outline" className="gap-2 flex-1 bg-transparent">
              <Copy className="h-4 w-4" />
              Copy Info
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
