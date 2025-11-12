export function generateQRCode(text: string): Promise<string> {
  // Using QR Server API - no external library needed
  const encodedText = encodeURIComponent(text)
  return Promise.resolve(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedText}`)
}

export function formatEmergencyCardData(
  patientName: string,
  medicines: any[],
  emergencyContact: string,
  emergencyPhone: string,
): string {
  const medicinesList = medicines
    .map((m) => `${m.name} - ${m.dosage || "As prescribed"} - ${m.times?.join(", ") || "N/A"}`)
    .join("\n")

  return `EMERGENCY MEDICAL CARD\nPatient: ${patientName}\nEmergency Contact: ${emergencyContact}\nPhone: ${emergencyPhone}\n\nCurrent Medications:\n${medicinesList}\n\nAlways inform emergency services of all medications and allergies.`
}
