import { format, differenceInDays } from "date-fns"
import type { TaskItem } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, Calendar, Clock, User, MessageSquare, CheckCircle2, XCircle, Activity } from "lucide-react"

interface TaskDetailProps {
  task: TaskItem
  type: "ghosted" | "postponed" | "inprogress" | "completed"
}

export function TaskDetail({ task, type }: TaskDetailProps) {
  const daysOverdue = differenceInDays(new Date(), new Date(task.Original_Due_Date))
  const daysSinceLastMention = differenceInDays(new Date(), new Date(task.Last_Mentioned))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-2">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h3 className="font-semibold">Owner</h3>
                <p>{task.Owner}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h3 className="font-semibold">Due Date</h3>
                <p>{format(new Date(task.Original_Due_Date), "MMMM d, yyyy")}</p>
                {daysOverdue > 0 && task.Status !== "Completed" && (
                  <Badge variant="destructive" className="mt-1">
                    {daysOverdue} days overdue
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{task.Project}</h3>
              <Badge
                className="mt-1"
                variant={
                  type === "ghosted"
                    ? "destructive"
                    : type === "postponed"
                      ? "warning"
                      : type === "inprogress"
                        ? "secondary"
                        : "success"
                }
              >
                {type === "ghosted"
                  ? "Ghosted"
                  : type === "postponed"
                    ? "Postponed"
                    : type === "inprogress"
                      ? "In-Progress"
                      : "Completed"}
              </Badge>
            </div>

            <div>
              <h4 className="font-medium text-muted-foreground mb-1">Task Description</h4>
              <p className="text-lg">{task.Task_Description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span>
                  Mentioned in Meeting: <span className="font-medium">{task.Mentioned_in_Meeting}</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  Last Mentioned:{" "}
                  <span className="font-medium">{format(new Date(task.Last_Mentioned), "MMM d, yyyy")}</span>
                  {daysSinceLastMention > 14 && task.Status !== "Completed" && (
                    <Badge variant="outline" className="ml-2">
                      {daysSinceLastMention} days ago
                    </Badge>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  Follow-up Scheduled: <span className="font-medium">{task.Follow_Up_Scheduled}</span>
                </span>
              </div>

              {task.Final_Resolution && (
                <div className="flex items-center gap-2">
                  {task.Status === "Completed" ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span>
                    Resolution: <span className="font-medium">{task.Final_Resolution}</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {type !== "completed" && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              {type === "ghosted" && <AlertTriangle className="h-5 w-5 text-red-500" />}
              {type === "postponed" && <Clock className="h-5 w-5 text-yellow-500" />}
              {type === "inprogress" && <Activity className="h-5 w-5 text-gray-500" />}
              <div>
                <h3 className="font-semibold">
                  {type === "ghosted"
                    ? "Ghosted Task Alert"
                    : type === "postponed"
                      ? "Postponed Task Alert"
                      : "In-Progress Task Status"}
                </h3>
                <p className="text-muted-foreground">
                  {type === "ghosted" &&
                    `This task was assigned ${format(new Date(task.Original_Due_Date), "MMMM d, yyyy")} but has not been completed or followed up on. It's now ${daysOverdue} days overdue.`}
                  {type === "postponed" &&
                    `This task was postponed and last mentioned ${format(new Date(task.Last_Mentioned), "MMMM d, yyyy")}. It's been ${daysSinceLastMention} days without resolution.`}
                  {type === "inprogress" &&
                    `This task is currently in progress. It was last mentioned ${format(new Date(task.Last_Mentioned), "MMMM d, yyyy")} and may need follow-up.`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
