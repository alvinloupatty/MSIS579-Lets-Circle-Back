"use client"

import { useState } from "react"
import { format } from "date-fns"
import type { TaskItem } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TaskDetail } from "@/components/task-detail"
import { ChevronDown, ChevronUp, Send } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

interface TaskListProps {
  tasks: TaskItem[]
  type: "ghosted" | "postponed" | "inprogress" | "completed"
  groupBy: "owner" | "project"
}

export function TaskList({ tasks, type, groupBy }: TaskListProps) {
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [comments, setComments] = useState<Record<string, string>>({})

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No{" "}
        {type === "ghosted"
          ? "ghosted tasks"
          : type === "postponed"
            ? "postponed tasks"
            : type === "inprogress"
              ? "in-progress tasks"
              : "completed tasks"}{" "}
        found
      </div>
    )
  }

  // Group tasks by owner or project
  const tasksByGroup: Record<string, TaskItem[]> = {}
  tasks.forEach((task) => {
    const groupKey = groupBy === "owner" ? task.Owner : task.Project
    if (!tasksByGroup[groupKey]) {
      tasksByGroup[groupKey] = []
    }
    tasksByGroup[groupKey].push(task)
  })

  // Sort groups alphabetically
  const sortedGroups = Object.keys(tasksByGroup).sort()

  const toggleGroup = (group: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(group)) {
      newExpanded.delete(group)
    } else {
      newExpanded.add(group)
    }
    setExpandedGroups(newExpanded)
  }

  // Get badge variant based on task type
  const getBadgeVariant = (status: string, type: string) => {
    if (type === "postponed") return "warning"
    if (type === "inprogress") return "secondary"
    if (type === "completed") return "success"

    // Use default variant for all statuses in ghosted tasks
    return "default"
  }

  // Generate a unique ID for each task
  const getTaskId = (task: TaskItem) => `${task.Project}-${task.Task_Description}`

  const handleCommentChange = (taskId: string, value: string) => {
    setComments({
      ...comments,
      [taskId]: value,
    })
  }

  const handleCommentSubmit = (taskId: string) => {
    // Here you would typically save the comment to your backend
    console.log(`Comment for task ${taskId}:`, comments[taskId])
    // Clear the comment field after submission
    setComments({
      ...comments,
      [taskId]: "",
    })
    // Show a success message or notification
    alert(`Comment submitted successfully!`)
  }

  return (
    <>
      <div className="space-y-4">
        {sortedGroups.map((group) => (
          <div key={group} className="border rounded-md overflow-hidden">
            <div
              className="flex justify-between items-center p-4 bg-muted cursor-pointer"
              onClick={() => toggleGroup(group)}
            >
              <h3 className="font-medium">
                {group} ({tasksByGroup[group].length})
              </h3>
              {expandedGroups.has(group) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>

            {expandedGroups.has(group) && (
              <div>
                {/* Headers */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-3 bg-gray-100 font-medium text-sm">
                  <div>{groupBy === "owner" ? "Project" : "Task"}</div>
                  <div>{groupBy === "owner" ? "Task" : "Owner"}</div>
                  <div>Due Date</div>
                  <div className="flex justify-between">
                    <span>Status</span>
                    <span>Action</span>
                  </div>
                </div>

                {/* Tasks */}
                <div className="divide-y">
                  {tasksByGroup[group].map((task) => {
                    const taskId = getTaskId(task)
                    return (
                      <div key={taskId} className="bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
                          <div className="font-medium">
                            {groupBy === "owner" ? task.Project : task.Task_Description}
                          </div>
                          <div className="max-w-[300px] truncate">
                            {groupBy === "owner" ? task.Task_Description : task.Owner}
                          </div>
                          <div>{format(new Date(task.Original_Due_Date), "MMM d, yyyy")}</div>
                          <div className="flex justify-between items-center">
                            <Badge variant={getBadgeVariant(task.Status, type)}>{task.Status}</Badge>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedTask(task)}>
                              View Details
                            </Button>
                          </div>
                        </div>

                        {/* Comment box for each task (except completed tasks) */}
                        {type !== "completed" && (
                          <div className="p-4 bg-gray-50">
                            <div className="flex gap-2">
                              <Textarea
                                placeholder="Add a comment..."
                                className="min-h-[60px]"
                                value={comments[taskId] || ""}
                                onChange={(e) => handleCommentChange(taskId, e.target.value)}
                              />
                              <Button
                                className="self-end"
                                onClick={() => handleCommentSubmit(taskId)}
                                disabled={!comments[taskId]}
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Send
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
            <DialogDescription>Detailed information about this task</DialogDescription>
          </DialogHeader>
          {selectedTask && <TaskDetail task={selectedTask} type={type} />}
        </DialogContent>
      </Dialog>
    </>
  )
}
