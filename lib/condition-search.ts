// Common conditions and their treatments (using OpenFDA data)
const CONDITION_TREATMENTS: Record<string, Array<{ medicine: string; dosage: string; indication: string }>> = {
  hypertension: [
    { medicine: "Lisinopril", dosage: "10-40 mg daily", indication: "ACE inhibitor for blood pressure control" },
    { medicine: "Metoprolol", dosage: "50-200 mg daily", indication: "Beta blocker for blood pressure control" },
    { medicine: "Amlodipine", dosage: "2.5-10 mg daily", indication: "Calcium channel blocker" },
  ],
  diabetes: [
    { medicine: "Metformin", dosage: "500-2000 mg daily", indication: "First-line diabetes treatment" },
    { medicine: "Glipizide", dosage: "5-20 mg daily", indication: "Sulfonylurea class" },
    { medicine: "Insulin", dosage: "Variable", indication: "For Type 1 or advanced Type 2" },
  ],
  cholesterol: [
    { medicine: "Simvastatin", dosage: "20-80 mg daily", indication: "Statin for cholesterol reduction" },
    { medicine: "Atorvastatin", dosage: "10-80 mg daily", indication: "Statin for cholesterol reduction" },
  ],
  depression: [
    { medicine: "Sertraline", dosage: "50-200 mg daily", indication: "SSRI antidepressant" },
    { medicine: "Fluoxetine", dosage: "20-80 mg daily", indication: "SSRI antidepressant" },
    { medicine: "Escitalopram", dosage: "10-20 mg daily", indication: "SSRI antidepressant" },
  ],
  anxiety: [
    { medicine: "Alprazolam", dosage: "0.5-4 mg daily", indication: "Benzodiazepine for anxiety" },
    { medicine: "Lorazepam", dosage: "0.5-4 mg daily", indication: "Benzodiazepine for anxiety" },
    { medicine: "Buspirone", dosage: "15-60 mg daily", indication: "Azapirone anxiolytic" },
  ],
  arthritis: [
    { medicine: "Ibuprofen", dosage: "200-800 mg 3-4 times daily", indication: "NSAID for pain and inflammation" },
    { medicine: "Naproxen", dosage: "250-500 mg twice daily", indication: "NSAID for pain and inflammation" },
    { medicine: "Methotrexate", dosage: "Variable", indication: "Disease-modifying antirheumatic drug" },
  ],
  asthma: [
    { medicine: "Albuterol", dosage: "90 mcg 1-2 puffs as needed", indication: "Rescue inhaler" },
    { medicine: "Fluticasone", dosage: "44-220 mcg twice daily", indication: "Inhaled corticosteroid" },
  ],
  infection: [
    { medicine: "Amoxicillin", dosage: "250-500 mg 3 times daily", indication: "Beta-lactam antibiotic" },
    { medicine: "Azithromycin", dosage: "500 mg day 1, then 250 mg daily", indication: "Macrolide antibiotic" },
    { medicine: "Ciprofloxacin", dosage: "250-750 mg twice daily", indication: "Fluoroquinolone antibiotic" },
  ],
  pain: [
    {
      medicine: "Acetaminophen",
      dosage: "325-650 mg every 4-6 hours",
      indication: "Analgesic for mild to moderate pain",
    },
    { medicine: "Ibuprofen", dosage: "200-800 mg every 4-6 hours", indication: "NSAID for pain" },
    { medicine: "Tramadol", dosage: "50-100 mg every 4-6 hours", indication: "Opioid analgesic" },
  ],
}

export function searchByCondition(condition: string): Array<{ medicine: string; dosage: string; indication: string }> {
  const normalizedCondition = condition.toLowerCase().trim()

  // Direct match
  if (CONDITION_TREATMENTS[normalizedCondition]) {
    return CONDITION_TREATMENTS[normalizedCondition]
  }

  // Partial match
  const matches: Array<{ medicine: string; dosage: string; indication: string }> = []
  Object.entries(CONDITION_TREATMENTS).forEach(([key, treatments]) => {
    if (key.includes(normalizedCondition) || normalizedCondition.includes(key)) {
      matches.push(...treatments)
    }
  })

  return matches
}

export function getAvailableConditions(): string[] {
  return Object.keys(CONDITION_TREATMENTS).sort()
}
