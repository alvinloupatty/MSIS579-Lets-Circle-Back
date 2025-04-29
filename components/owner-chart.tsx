"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { TaskItem } from "@/lib/types"

interface OwnerChartProps {
  ghostedTasks: TaskItem[]
  postponedTasks: TaskItem[]
  inProgressTasks: TaskItem[]
}

export function OwnerChart({ ghostedTasks, postponedTasks, inProgressTasks }: OwnerChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    // Get all unique owners
    const allTasks = [...ghostedTasks, ...postponedTasks, ...inProgressTasks]
    const uniqueOwners = Array.from(new Set(allTasks.map((task) => task.Owner)))

    // Count tasks by owner
    const ownerData = uniqueOwners.map((owner) => {
      const ghosted = ghostedTasks.filter((task) => task.Owner === owner).length
      const postponed = postponedTasks.filter((task) => task.Owner === owner).length
      const inProgress = inProgressTasks.filter((task) => task.Owner === owner).length
      return { owner, ghosted, postponed, inProgress }
    })

    // Sort by total tasks (descending)
    ownerData.sort((a, b) => b.ghosted + b.postponed + b.inProgress - (a.ghosted + a.postponed + a.inProgress))

    // Limit to top 8 owners for readability
    const topOwners = ownerData.slice(0, 8)

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    if (!ctx) return

    // Set canvas dimensions for higher resolution
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Chart dimensions
    const chartWidth = rect.width - 100
    const chartHeight = rect.height - 80
    const barWidth = chartWidth / topOwners.length / 4
    const spacing = barWidth / 2

    // Find max value for scaling
    const maxValue = Math.max(...topOwners.map((o) => o.ghosted + o.postponed + o.inProgress))
    const scale = chartHeight / (maxValue || 1)

    // Draw axes
    ctx.beginPath()
    ctx.moveTo(50, 40)
    ctx.lineTo(50, chartHeight + 40)
    ctx.lineTo(chartWidth + 50, chartHeight + 40)
    ctx.strokeStyle = "#ccc"
    ctx.lineWidth = 1
    ctx.stroke()

    // Y-axis labels
    ctx.textAlign = "right"
    ctx.textBaseline = "middle"
    ctx.fillStyle = "#666"
    ctx.font = "12px sans-serif"

    for (let i = 0; i <= 5; i++) {
      const value = Math.round((maxValue * i) / 5)
      const y = chartHeight + 40 - value * scale
      ctx.fillText(value.toString(), 45, y)

      // Grid line
      ctx.beginPath()
      ctx.moveTo(50, y)
      ctx.lineTo(chartWidth + 50, y)
      ctx.strokeStyle = "#eee"
      ctx.stroke()
    }

    // Draw bars
    topOwners.forEach((data, index) => {
      const x = 50 + index * 4 * barWidth + spacing

      // Ghosted tasks (red)
      const ghostedHeight = data.ghosted * scale
      ctx.fillStyle = "rgba(239, 68, 68, 0.8)"
      ctx.fillRect(x, chartHeight + 40 - ghostedHeight, barWidth, ghostedHeight)

      // Postponed tasks (yellow)
      const postponedHeight = data.postponed * scale
      ctx.fillStyle = "rgba(234, 179, 8, 0.8)"
      ctx.fillRect(x + barWidth, chartHeight + 40 - postponedHeight, barWidth, postponedHeight)

      // In-Progress tasks (grey)
      const inProgressHeight = data.inProgress * scale
      ctx.fillStyle = "rgba(107, 114, 128, 0.8)"
      ctx.fillRect(x + barWidth * 2, chartHeight + 40 - inProgressHeight, barWidth, inProgressHeight)

      // X-axis labels (owner names)
      ctx.textAlign = "center"
      ctx.textBaseline = "top"
      ctx.fillStyle = "#666"
      ctx.font = "12px sans-serif"

      // Display full owner name
      ctx.fillText(data.owner, x + barWidth * 1.5, chartHeight + 45)
    })

    // Legend
    ctx.fillStyle = "rgba(239, 68, 68, 0.8)"
    ctx.fillRect(chartWidth - 120, 15, 15, 15)
    ctx.fillStyle = "rgba(234, 179, 8, 0.8)"
    ctx.fillRect(chartWidth - 120, 35, 15, 15)
    ctx.fillStyle = "rgba(107, 114, 128, 0.8)"
    ctx.fillRect(chartWidth - 120, 55, 15, 15)

    ctx.textAlign = "left"
    ctx.textBaseline = "middle"
    ctx.fillStyle = "#666"
    ctx.font = "12px sans-serif"
    ctx.fillText("Ghosted", chartWidth - 100, 22)
    ctx.fillText("Postponed", chartWidth - 100, 42)
    ctx.fillText("In-Progress", chartWidth - 100, 62)
  }, [ghostedTasks, postponedTasks, inProgressTasks])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Tasks by Owner</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[300px]">
          <canvas ref={canvasRef} width={800} height={300} className="w-full h-full" />
        </div>
      </CardContent>
    </Card>
  )
}
