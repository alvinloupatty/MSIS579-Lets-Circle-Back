export interface TaskItem {
  Project: string
  Task_Description: string
  Owner: string
  Status: string
  Mentioned_in_Meeting: string
  Original_Due_Date: string
  Last_Mentioned: string
  Follow_Up_Scheduled: string
  Final_Resolution: string
}

export interface UploadedFile {
  name: string
  data: TaskItem[]
}
