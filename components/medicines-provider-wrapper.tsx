"use client"

import { MedicinesProvider } from "@/lib/medicines-context"

export function MedicinesProviderWrapper({ children }: { children: React.ReactNode }) {
    return <MedicinesProvider>{children}</MedicinesProvider>
}
