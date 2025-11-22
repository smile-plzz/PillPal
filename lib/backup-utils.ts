import type { Medicine, DataBackup, AppSettings } from "./types"

const BACKUP_KEY = "medicine-tracker-backups"
const MAX_BACKUPS = 10
const VERSION = "1.0.0"

export function createBackup(medicines: Medicine[], settings?: AppSettings): DataBackup {
  return {
    medicines,
    settings: settings || {},
    notifications: [],
    exportDate: new Date().toISOString(),
    version: VERSION,
  }
}

export function saveBackup(backup: DataBackup): void {
  try {
    const backups = getBackupHistory()
    backups.unshift(backup)

    // Keep only the most recent backups
    if (backups.length > MAX_BACKUPS) {
      backups.splice(MAX_BACKUPS)
    }

    localStorage.setItem(BACKUP_KEY, JSON.stringify(backups))
  } catch (err) {
    console.error("Failed to save backup:", err)
    throw new Error("Failed to save backup to local storage")
  }
}

export function getBackupHistory(): DataBackup[] {
  try {
    const backups = localStorage.getItem(BACKUP_KEY)
    return backups ? JSON.parse(backups) : []
  } catch (err) {
    console.error("Failed to load backup history:", err)
    return []
  }
}

export function restoreFromBackup(backup: DataBackup): void {
  try {
    localStorage.setItem("medicines", JSON.stringify(backup.medicines))
    if (backup.settings) {
      localStorage.setItem("app-settings", JSON.stringify(backup.settings))
    }
  } catch (err) {
    console.error("Failed to restore backup:", err)
    throw new Error("Failed to restore backup")
  }
}

export async function exportBackupAsJSON(backup: DataBackup): Promise<void> {
  try {
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `medicine-tracker-backup-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error("Failed to export backup:", err)
    throw new Error("Failed to export backup")
  }
}

export async function importBackupFromJSON(file: File): Promise<DataBackup> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string
        const backup = JSON.parse(content) as DataBackup

        // Validate backup structure
        if (!backup.medicines || !Array.isArray(backup.medicines)) {
          throw new Error("Invalid backup file format")
        }

        resolve(backup)
      } catch (err) {
        reject(new Error("Failed to parse backup file"))
      }
    }

    reader.onerror = () => {
      reject(new Error("Failed to read file"))
    }

    reader.readAsText(file)
  })
}

export function autoBackup(medicines: Medicine[], settings?: AppSettings): void {
  try {
    const backup = createBackup(medicines, settings)
    saveBackup(backup)
  } catch (err) {
    console.error("Auto backup failed:", err)
    // Don't throw - auto backup should fail silently
  }
}
