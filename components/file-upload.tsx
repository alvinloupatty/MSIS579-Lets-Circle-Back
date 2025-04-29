"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FileUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { uploadFile } from "@/lib/actions"

export function FileUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive",
      })
      return
    }

    try {
      setIsUploading(true)
      await uploadFile(file)
      setFileName(file.name)
      toast({
        title: "File uploaded successfully",
        description: "Your data is now being analyzed",
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="mb-8">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="relative">
            <input
              type="file"
              id="file-upload"
              className="sr-only"
              accept=".csv"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            <Label
              htmlFor="file-upload"
              className="cursor-pointer flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md"
            >
              <FileUp className="h-4 w-4" />
              Upload CSV File
            </Label>
          </div>

          <div className="text-sm">
            {fileName ? (
              <span className="font-medium text-green-600">{fileName}</span>
            ) : (
              <span className="text-muted-foreground">No file chosen</span>
            )}
          </div>
        </div>

        {isUploading && (
          <div className="mt-4 text-center text-sm text-muted-foreground">Uploading and analyzing data...</div>
        )}
      </CardContent>
    </Card>
  )
}
