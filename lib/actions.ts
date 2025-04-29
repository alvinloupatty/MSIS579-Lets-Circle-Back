"use server"

import { revalidatePath } from "next/cache"
import type { TaskItem } from "./types"

// In-memory storage for the current dataset
let currentData: TaskItem[] = []

// Default dataset URL
const DEFAULT_DATASET_URL =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/week%202%20-%20Problem_5_-_Follow-Up_Vortex_Tracker-VPtyeFWfeKfjS2RATvBRR879WGfEKC.csv"

export async function uploadFile(file: File | null): Promise<void> {
  try {
    let csvData: string

    if (file) {
      // Read the uploaded file
      csvData = await file.text()
    } else {
      // Use the default dataset
      const response = await fetch(DEFAULT_DATASET_URL)
      if (!response.ok) {
        throw new Error("Failed to fetch default dataset")
      }
      csvData = await response.text()
    }

    // Parse the CSV data
    const parsedData = parseCSV(csvData)

    // Store the data in memory
    currentData = parsedData

    // Revalidate the path to refresh the UI
    revalidatePath("/")
  } catch (error) {
    console.error("Error uploading file:", error)
    throw error
  }
}

export async function getData(): Promise<TaskItem[]> {
  // If no data is loaded yet, try to load the default dataset
  if (currentData.length === 0) {
    try {
      await uploadFile(null)
    } catch (error) {
      console.error("Failed to load default dataset:", error)
    }
  }

  return currentData
}

// Helper function to parse CSV data
function parseCSV(csvData: string): TaskItem[] {
  const lines = csvData.split("\n")
  const headers = lines[0].split(",").map((header) => header.trim())

  const result: TaskItem[] = []

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue

    const values = parseCSVLine(lines[i])

    if (values.length !== headers.length) {
      console.warn(`Skipping line ${i + 1}: column count mismatch`)
      continue
    }

    const item: any = {}

    headers.forEach((header, index) => {
      item[header] = values[index]
    })

    // Ensure all required fields are present
    const taskItem: TaskItem = {
      Project: item.Project || "",
      Task_Description: item.Task_Description || "",
      Owner: item.Owner || "",
      Status: item.Status || "",
      Mentioned_in_Meeting: item.Mentioned_in_Meeting || "",
      Original_Due_Date: item.Original_Due_Date || new Date().toISOString().split("T")[0],
      Last_Mentioned: item.Last_Mentioned || new Date().toISOString().split("T")[0],
      Follow_Up_Scheduled: item.Follow_Up_Scheduled || "",
      Final_Resolution: item.Final_Resolution || "",
    }

    result.push(taskItem)
  }

  return result
}

// Helper function to handle CSV line parsing with quotes
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      result.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }

  result.push(current.trim())
  return result
}
