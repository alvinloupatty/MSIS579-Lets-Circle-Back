"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TaskList } from "@/components/task-list"
import { TaskStats } from "@/components/task-stats"
import { OwnerChart } from "@/components/owner-chart"
import { getData } from "@/lib/actions"
import type { TaskItem } from "@/lib/types"

export function Dashboard() {
  const [data, setData] = useState<TaskItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const result = await getData()
        setData(result)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Update the categorization logic to follow the exact rules provided
  // Replace the existing categorization code with this more precise implementation

  // First, let's make sure we're working with the correct field names from the dataset
  // In the current code, we're using:
  // - Final_Resolution for "final resolution"
  // - Follow_Up_Scheduled for "follow-up done"

  // Categorize tasks based on the provided rules
  const categorizedTasks = {
    ghosted: [] as TaskItem[],
    postponed: [] as TaskItem[],
    inProgress: [] as TaskItem[],
    completed: [] as TaskItem[],
  }

  // Process each task exactly once according to the rules
  data.forEach((task) => {
    const finalResolution = (task.Final_Resolution || "").toLowerCase()
    const followUpDone = task.Follow_Up_Scheduled
    const taskDescription = (task.Task_Description || "").toLowerCase()

    // Rule 1: If final resolution = "Never Resolved"
    if (finalResolution.includes("never resolved")) {
      if (followUpDone === "No") {
        categorizedTasks.ghosted.push(task)
      } else if (followUpDone === "Yes") {
        categorizedTasks.postponed.push(task)
      }
    }
    // Rule 2: If final resolution = "Escalated"
    else if (finalResolution.includes("escalated")) {
      if (followUpDone === "Yes") {
        categorizedTasks.inProgress.push(task)
      } else if (followUpDone === "No") {
        // Check if prompt hints at future actions
        if (
          taskDescription.includes("later") ||
          taskDescription.includes("schedule") ||
          taskDescription.includes("next") ||
          taskDescription.includes("future") ||
          taskDescription.includes("postpone")
        ) {
          categorizedTasks.postponed.push(task)
        } else {
          categorizedTasks.ghosted.push(task)
        }
      }
    }
    // Rule 3: If final resolution indicates completion
    else if (
      finalResolution.includes("completed") ||
      finalResolution.includes("resolved") ||
      finalResolution.includes("approved") ||
      finalResolution.includes("finalized") ||
      finalResolution.includes("done") ||
      finalResolution.includes("finished")
    ) {
      categorizedTasks.completed.push(task)
    }
    // Rule 4: If final resolution indicates pending status
    else if (
      finalResolution.includes("pending") ||
      finalResolution.includes("deferred") ||
      finalResolution.includes("waiting")
    ) {
      if (followUpDone === "Yes") {
        categorizedTasks.postponed.push(task)
      } else if (followUpDone === "No") {
        categorizedTasks.ghosted.push(task)
      }
    }
    // Rule 5: If final resolution is blank or unclear
    else {
      // Check prompt language
      if (
        taskDescription.includes("delay") ||
        taskDescription.includes("schedule later") ||
        taskDescription.includes("postpone") ||
        taskDescription.includes("next meeting") ||
        taskDescription.includes("next week") ||
        taskDescription.includes("next month")
      ) {
        categorizedTasks.postponed.push(task)
      } else if (
        taskDescription.includes("working on") ||
        taskDescription.includes("draft in review") ||
        taskDescription.includes("in progress") ||
        taskDescription.includes("ongoing") ||
        taskDescription.includes("reviewing")
      ) {
        categorizedTasks.inProgress.push(task)
      }
      // If status is explicitly "Completed"
      else if (task.Status === "Completed") {
        categorizedTasks.completed.push(task)
      }
      // Default case - if no clear activity is happening
      else {
        categorizedTasks.ghosted.push(task)
      }
    }
  })

  // Replace the existing task arrays with our newly categorized ones
  const ghostedTasks = categorizedTasks.ghosted
  const postponedTasks = categorizedTasks.postponed
  const inProgressTasks = categorizedTasks.inProgress
  const completedTasks = categorizedTasks.completed

  // Verify the total count matches the dataset size
  console.log("Total tasks:", data.length)
  console.log(
    "Sum of categorized tasks:",
    ghostedTasks.length + postponedTasks.length + inProgressTasks.length + completedTasks.length,
  )

  // Remove the otherTasks section since we're ensuring every task is categorized
  // const otherTasks = [];

  if (isLoading) {
    return <p className="text-center py-8">Loading data...</p>
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p>No data available. Please upload a CSV file.</p>
        </CardContent>
      </Card>
    )
  }

  // Get the active tasks based on the selected tab
  const getActiveTasks = () => {
    switch (activeTab) {
      case "ghosted":
        return ghostedTasks
      case "postponed":
        return postponedTasks
      case "inprogress":
        return inProgressTasks
      case "completed":
        return completedTasks
      default:
        return []
    }
  }

  return (
    <div className="space-y-8">
      <OwnerChart ghostedTasks={ghostedTasks} postponedTasks={postponedTasks} inProgressTasks={inProgressTasks} />

      <TaskStats
        ghostedCount={ghostedTasks.length}
        postponedCount={postponedTasks.length}
        inProgressCount={inProgressTasks.length}
        completedCount={completedTasks.length}
        totalCount={data.length}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {activeTab && (
        <Card>
          <CardContent className="pt-6">
            <TaskList
              tasks={getActiveTasks()}
              type={activeTab as "ghosted" | "postponed" | "inprogress" | "completed"}
              groupBy="owner"
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
