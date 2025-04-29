import { Suspense } from "react"
import { FileUpload } from "@/components/file-upload"
import { Dashboard } from "@/components/dashboard"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Let&apos;s Circle Back</h1>
        <p className="text-lg text-muted-foreground">Track ghosted, postponed and in-progress tasks</p>
      </div>

      <FileUpload />

      <Suspense fallback={<DashboardSkeleton />}>
        <Dashboard />
      </Suspense>
    </main>
  )
}
