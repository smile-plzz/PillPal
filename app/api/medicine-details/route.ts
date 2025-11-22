import { getMedicineDetails, checkInteractions, getAdverseEvents } from "@/lib/medicine-api"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get("action")
    const medicineName = searchParams.get("medicine")
    const medicines = searchParams.getAll("medicines")

    if (!action || !medicineName) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
    }

    if (action === "details") {
      const details = await getMedicineDetails(medicineName)
      return NextResponse.json({ success: true, data: details })
    }

    if (action === "interactions") {
      if (medicines.length < 2) {
        return NextResponse.json({ error: "Need at least 2 medicines" }, { status: 400 })
      }
      const interactions = await checkInteractions(medicines)
      return NextResponse.json({ success: true, data: interactions })
    }

    if (action === "adverse-events") {
      const count = await getAdverseEvents(medicineName)
      return NextResponse.json({ success: true, data: count })
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
