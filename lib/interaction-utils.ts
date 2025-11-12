import type { Medicine } from "./types"

// Common drug interactions database
const COMMON_INTERACTIONS: Record<
  string,
  Array<{ drug: string; severity: "mild" | "moderate" | "severe"; description: string }>
> = {
  warfarin: [
    { drug: "aspirin", severity: "severe", description: "Increased bleeding risk" },
    { drug: "ibuprofen", severity: "severe", description: "Increased bleeding risk" },
    { drug: "naproxen", severity: "severe", description: "Increased bleeding risk" },
    { drug: "vitamin k", severity: "severe", description: "May reduce warfarin effectiveness" },
  ],
  metformin: [
    { drug: "alcohol", severity: "moderate", description: "Increased risk of lactic acidosis" },
    { drug: "contrast dye", severity: "moderate", description: "May cause kidney problems" },
  ],
  lisinopril: [
    { drug: "potassium", severity: "moderate", description: "Increased potassium levels" },
    { drug: "spironolactone", severity: "moderate", description: "Increased potassium levels" },
    { drug: "nsaids", severity: "moderate", description: "Reduced blood pressure control" },
  ],
  metoprolol: [
    { drug: "calcium channel blockers", severity: "moderate", description: "Decreased heart rate" },
    { drug: "diabetes medications", severity: "mild", description: "May mask low blood sugar symptoms" },
  ],
  simvastatin: [
    { drug: "clarithromycin", severity: "severe", description: "Increased muscle breakdown risk" },
    { drug: "erythromycin", severity: "severe", description: "Increased muscle breakdown risk" },
    { drug: "grapefruit juice", severity: "moderate", description: "Increased drug levels" },
  ],
}

export function checkDrugInteractions(medicines: Medicine[]): Array<{
  medicine1: string
  medicine2: string
  severity: "mild" | "moderate" | "severe"
  description: string
}> {
  const interactions: Array<{
    medicine1: string
    medicine2: string
    severity: "mild" | "moderate" | "severe"
    description: string
  }> = []

  for (let i = 0; i < medicines.length; i++) {
    for (let j = i + 1; j < medicines.length; j++) {
      const med1Name = medicines[i].name.toLowerCase()
      const med2Name = medicines[j].name.toLowerCase()

      // Check if interactions exist
      const med1Interactions = COMMON_INTERACTIONS[med1Name] || []
      const med2Interactions = COMMON_INTERACTIONS[med2Name] || []

      // Check interactions from both directions
      med1Interactions.forEach((interaction) => {
        if (med2Name.includes(interaction.drug) || interaction.drug.includes(med2Name)) {
          interactions.push({
            medicine1: medicines[i].name,
            medicine2: medicines[j].name,
            severity: interaction.severity,
            description: interaction.description,
          })
        }
      })

      med2Interactions.forEach((interaction) => {
        if (med1Name.includes(interaction.drug) || interaction.drug.includes(med1Name)) {
          interactions.push({
            medicine1: medicines[i].name,
            medicine2: medicines[j].name,
            severity: interaction.severity,
            description: interaction.description,
          })
        }
      })
    }
  }

  return interactions
}

export function getInteractionSeverityColor(severity: "mild" | "moderate" | "severe"): string {
  switch (severity) {
    case "mild":
      return "bg-yellow-50 border-yellow-200"
    case "moderate":
      return "bg-orange-50 border-orange-200"
    case "severe":
      return "bg-red-50 border-red-200"
  }
}

export function getInteractionSeverityBadge(severity: "mild" | "moderate" | "severe"): string {
  switch (severity) {
    case "mild":
      return "bg-yellow-100 text-yellow-800"
    case "moderate":
      return "bg-orange-100 text-orange-800"
    case "severe":
      return "bg-red-100 text-red-800"
  }
}
