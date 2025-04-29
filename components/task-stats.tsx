"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Ghost, Clock, CheckCircle2, Activity } from "lucide-react"

interface TaskStatsProps {
  ghostedCount: number
  postponedCount: number
  inProgressCount: number
  completedCount: number
  totalCount: number
  activeTab: string | null
  setActiveTab: (tab: string | null) => void
}

export function TaskStats({
  ghostedCount,
  postponedCount,
  inProgressCount,
  completedCount,
  totalCount,
  activeTab,
  setActiveTab,
}: TaskStatsProps) {
  const handleCardClick = (tab: string) => {
    if (activeTab === tab) {
      setActiveTab(null)
    } else {
      setActiveTab(tab)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card
        className={`cursor-pointer border-red-500 bg-red-50 transition-colors ${
          activeTab === "ghosted" ? "ring-2 ring-red-500" : ""
        }`}
        onClick={() => handleCardClick("ghosted")}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ghosted Tasks</CardTitle>
          <Ghost className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-500">{ghostedCount}</div>
          <p className="text-xs text-muted-foreground">
            {((ghostedCount / totalCount) * 100).toFixed(1)}% of total tasks
          </p>
        </CardContent>
      </Card>

      <Card
        className={`cursor-pointer border-yellow-500 bg-yellow-50 transition-colors ${
          activeTab === "postponed" ? "ring-2 ring-yellow-500" : ""
        }`}
        onClick={() => handleCardClick("postponed")}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Postponed Tasks</CardTitle>
          <Clock className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-500">{postponedCount}</div>
          <p className="text-xs text-muted-foreground">
            {((postponedCount / totalCount) * 100).toFixed(1)}% of total tasks
          </p>
        </CardContent>
      </Card>

      <Card
        className={`cursor-pointer border-gray-500 bg-gray-50 transition-colors ${
          activeTab === "inprogress" ? "ring-2 ring-gray-500" : ""
        }`}
        onClick={() => handleCardClick("inprogress")}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">In-Progress Tasks</CardTitle>
          <Activity className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-500">{inProgressCount}</div>
          <p className="text-xs text-muted-foreground">
            {((inProgressCount / totalCount) * 100).toFixed(1)}% of total tasks
          </p>
        </CardContent>
      </Card>

      <Card
        className={`cursor-pointer border-green-500 bg-green-50 transition-colors ${
          activeTab === "completed" ? "ring-2 ring-green-500" : ""
        }`}
        onClick={() => handleCardClick("completed")}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-500">{completedCount}</div>
          <p className="text-xs text-muted-foreground">
            {((completedCount / totalCount) * 100).toFixed(1)}% of total tasks
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
