import jsPDF from "jspdf"
import "jspdf-autotable"

export async function exportData(medicines: any[]) {
  const settings = localStorage.getItem("app-settings")
  const data = {
    medicines,
    settings: settings ? JSON.parse(settings) : {},
    exportDate: new Date().toISOString(),
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `medicine-tracker-export-${new Date().toISOString().split("T")[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export async function generatePDF(medicines: any[]) {
  const settings = localStorage.getItem("app-settings")
  const appSettings = settings ? JSON.parse(settings) : {}

  const doc = new jsPDF()
  let yOffset = 20

  // Title
  doc.setFontSize(24)
  doc.setFont("helvetica", "bold")
  doc.text("Medication Schedule", 105, yOffset, { align: "center" })

  yOffset += 10
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, yOffset, { align: "center" })

  yOffset += 15

  // Patient Information
  if (appSettings.patientName || appSettings.patientDob) {
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Patient Information", 20, yOffset)

    yOffset += 7
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")

    if (appSettings.patientName) doc.text(`Name: ${appSettings.patientName}`, 20, yOffset)
    yOffset += 5
    if (appSettings.patientDob) doc.text(`DOB: ${appSettings.patientDob}`, 20, yOffset)
    yOffset += 5
    if (appSettings.patientContact) doc.text(`Contact: ${appSettings.patientContact}`, 20, yOffset)

    yOffset += 10
  }

  // Doctor Information
  if (appSettings.doctorName) {
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Doctor Information", 20, yOffset)

    yOffset += 7
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`Name: ${appSettings.doctorName}`, 20, yOffset)
    yOffset += 5
    if (appSettings.doctorContact) doc.text(`Contact: ${appSettings.doctorContact}`, 20, yOffset)

    yOffset += 10
  }

  // Medicine Schedule Table
  if (medicines.length > 0) {
    const scheduleItems = medicines
      .flatMap((medicine) =>
        medicine.times.map((time: string) => ({
          ...medicine,
          time,
        })),
      )
      .sort((a, b) => a.time.localeCompare(b.time))

    const tableData = scheduleItems.map((item) => [
      item.time,
      item.name,
      item.dosage || "N/A",
      item.instructions || "N/A",
      item.duration ? `${item.duration} days` : "Indefinite",
    ])
    ;(doc as any).autoTable({
      head: [["Time", "Medicine", "Dosage", "Instructions", "Duration"]],
      body: tableData,
      startY: yOffset,
      margin: { top: 10, right: 10, bottom: 20, left: 10 },
      theme: "striped",
      headStyles: { fillColor: [30, 30, 30], textColor: [255, 255, 255] },
      bodyStyles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 40 },
        2: { cellWidth: 30 },
        3: { cellWidth: 50 },
        4: { cellWidth: 25 },
      },
      didDrawPage: (data: any) => {
        const pageHeight = doc.internal.pageSize.height
        const footerY = pageHeight - 10
        doc.setFontSize(8)
        doc.setFont("helvetica", "normal")
        doc.text("Disclaimer: Consult your doctor before making changes to your medication schedule.", 10, footerY)
      },
    })
  }

  doc.save(`medication_schedule_${new Date().toISOString().split("T")[0]}.pdf`)
}

export function resetSchedule() {
  localStorage.removeItem("medicines")
  window.location.reload()
}
