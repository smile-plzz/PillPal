const OPENFDA_API_KEY = "OAWlYa2jA94hagvjmbelqccEChE1ewTL2KzhIvvK"
const OPENFDA_BASE_URL = "https://api.fda.gov/drug"
const RXNAV_BASE_URL = "https://rxnav.nlm.nih.gov/REST"

export interface MedicineInfo {
  id: string
  name: string
  genericName?: string
  strength?: string
  form?: string
  manufacturer?: string
  sideEffects?: string[]
  contraindications?: string[]
  interactions?: string[]
  uses?: string[]
  ndc?: string
  dosageForm?: string
  route?: string
  labeling?: string
  warnings?: string[]
  adverseEvents?: number
}

interface NDCResult {
  results?: Array<{
    openfda?: {
      brand_name?: string[]
      generic_name?: string[]
      manufacturer_name?: string[]
      route?: string[]
      dosage_form?: string[]
      strength?: string[]
    }
    package_ndc?: string
  }>
}

interface LabelingResult {
  results?: Array<{
    openfda?: {
      brand_name?: string[]
      generic_name?: string[]
      manufacturer_name?: string[]
      route?: string[]
      dosage_form?: string[]
      strength?: string[]
      adverse_reactions?: string[]
      contraindications?: string[]
      warnings?: string[]
    }
  }>
}

/**
 * Search medicines using both RxNav (for suggestions) and OpenFDA (for detailed data)
 */
export async function searchMedicines(query: string): Promise<string[]> {
  if (query.length < 2) return []

  try {
    // Use RxNav for real-time suggestions as it's faster
    const response = await fetch(`${RXNAV_BASE_URL}/drugs.json?name=${encodeURIComponent(query)}`)

    if (!response.ok) {
      throw new Error(`RxNav API error: ${response.status}`)
    }

    const data = await response.json()
    const drugs = data.drugGroup?.drugList?.drug || []

    // Return top 10 suggestions
    return drugs.slice(0, 10).map((d: any) => d.drugName || d.name)
  } catch (error) {
    console.error("[v0] Failed to fetch medicine suggestions:", error)
    return []
  }
}

/**
 * Get detailed medicine information from OpenFDA NDC Directory
 */
export async function getMedicineDetails(medicineName: string): Promise<MedicineInfo | null> {
  try {
    // First try NDC Directory API for comprehensive drug data
    const searchQuery = encodeURIComponent(
      `openfda.brand_name:"${medicineName}" OR openfda.generic_name:"${medicineName}"`,
    )
    const ndcUrl = `${OPENFDA_BASE_URL}/ndc.json?search=${searchQuery}&api_key=${OPENFDA_API_KEY}&limit=1`

    const ndcResponse = await fetch(ndcUrl)
    if (!ndcResponse.ok && ndcResponse.status !== 404) {
      throw new Error(`NDC API error: ${ndcResponse.status}`)
    }

    const ndcData = (await ndcResponse.json()) as NDCResult

    if (ndcData.results && ndcData.results.length > 0) {
      const drug = ndcData.results[0]
      const openfda = drug.openfda

      return {
        id: drug.package_ndc || medicineName,
        name: openfda?.brand_name?.[0] || medicineName,
        genericName: openfda?.generic_name?.[0],
        manufacturer: openfda?.manufacturer_name?.[0],
        form: openfda?.dosage_form?.[0],
        strength: openfda?.strength?.[0],
        route: openfda?.route?.[0],
        ndc: drug.package_ndc,
        dosageForm: openfda?.dosage_form?.[0],
      }
    }

    // If NDC search fails, try labeling API for more detailed information
    return await getMedicineDetailsByLabeling(medicineName)
  } catch (error) {
    console.error("[v0] Failed to fetch medicine details from NDC:", error)
    // Fallback to labeling API
    return getMedicineDetailsByLabeling(medicineName)
  }
}

/**
 * Get medicine details from OpenFDA drug labeling endpoint
 */
async function getMedicineDetailsByLabeling(medicineName: string): Promise<MedicineInfo | null> {
  try {
    const searchQuery = encodeURIComponent(
      `openfda.brand_name:"${medicineName}" OR openfda.generic_name:"${medicineName}"`,
    )
    const labelUrl = `${OPENFDA_BASE_URL}/label.json?search=${searchQuery}&api_key=${OPENFDA_API_KEY}&limit=1`

    const labelResponse = await fetch(labelUrl)
    if (!labelResponse.ok && labelResponse.status !== 404) {
      throw new Error(`Label API error: ${labelResponse.status}`)
    }

    const labelData = (await labelResponse.json()) as LabelingResult

    if (labelData.results && labelData.results.length > 0) {
      const drug = labelData.results[0]
      const openfda = drug.openfda

      return {
        id: medicineName,
        name: openfda?.brand_name?.[0] || medicineName,
        genericName: openfda?.generic_name?.[0],
        manufacturer: openfda?.manufacturer_name?.[0],
        form: openfda?.dosage_form?.[0],
        strength: openfda?.strength?.[0],
        route: openfda?.route?.[0],
        dosageForm: openfda?.dosage_form?.[0],
        sideEffects: openfda?.adverse_reactions || [],
        contraindications: openfda?.contraindications || [],
        warnings: openfda?.warnings || [],
      }
    }

    return null
  } catch (error) {
    console.error("[v0] Failed to fetch medicine details from labeling:", error)
    return null
  }
}

/**
 * Get adverse events for a medicine from OpenFDA
 */
export async function getAdverseEvents(medicineName: string): Promise<number> {
  try {
    const searchQuery = encodeURIComponent(
      `openfda.brand_name:"${medicineName}" OR openfda.generic_name:"${medicineName}"`,
    )
    const eventUrl = `${OPENFDA_BASE_URL}/event.json?search=${searchQuery}&api_key=${OPENFDA_API_KEY}&limit=1`

    const response = await fetch(eventUrl)
    if (!response.ok) {
      return 0
    }

    const data = await response.json()
    return data.meta?.results?.total || 0
  } catch (error) {
    console.error("[v0] Failed to fetch adverse events:", error)
    return 0
  }
}

/**
 * Check for medicine interactions using RxNav
 */
export async function checkInteractions(medicineNames: string[]): Promise<string[]> {
  if (medicineNames.length < 2) return []

  try {
    const interactions: string[] = []

    // Check pairwise interactions
    for (let i = 0; i < medicineNames.length; i++) {
      for (let j = i + 1; j < medicineNames.length; j++) {
        try {
          const rxcui1 = await getRxCui(medicineNames[i])
          const rxcui2 = await getRxCui(medicineNames[j])

          if (!rxcui1 || !rxcui2) continue

          const interactionUrl = `${RXNAV_BASE_URL}/interaction.json?rxcui=${rxcui1}&interact_with=${rxcui2}`
          const response = await fetch(interactionUrl)

          if (response.ok) {
            const data = await response.json()
            if (data.interactionTypeGroup?.[0]?.interactionType) {
              data.interactionTypeGroup[0].interactionType.forEach((type: any) => {
                type.interactionPair?.forEach((pair: any) => {
                  if (pair.description) {
                    interactions.push(pair.description)
                  }
                })
              })
            }
          }
        } catch (error) {
          console.error("[v0] Error checking pair interaction:", error)
          continue
        }
      }
    }

    return [...new Set(interactions)] // Remove duplicates
  } catch (error) {
    console.error("[v0] Failed to check interactions:", error)
    return []
  }
}

/**
 * Helper function to get RxCui from medicine name
 */
async function getRxCui(medicineName: string): Promise<string | null> {
  try {
    const response = await fetch(`${RXNAV_BASE_URL}/drugs.json?name=${encodeURIComponent(medicineName)}`)
    if (!response.ok) return null

    const data = await response.json()
    return data.drugGroup?.drugList?.drug?.[0]?.rxcui || null
  } catch (error) {
    console.error("[v0] Failed to get RxCui:", error)
    return null
  }
}

/**
 * Add external API ID to medicine for tracking
 */
export function addExternalId(medicine: any, apiId: string) {
  return {
    ...medicine,
    externalId: apiId,
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Validate medicine data using OpenFDA
 */
export async function validateMedicineExists(medicineName: string): Promise<boolean> {
  try {
    const details = await getMedicineDetails(medicineName)
    return details !== null
  } catch (error) {
    console.error("[v0] Failed to validate medicine:", error)
    return false
  }
}
