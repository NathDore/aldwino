export type NotificationDto =
  | { id: string; type: "OVERDUE_ASSIGNMENT"; assignmentName: string; courseCode: string; courseColor: string; dueDate: string }
  | { id: string; type: "UPCOMING_DEADLINE"; assignmentName: string; courseCode: string; courseColor: string; dueDate: string }
  | { id: string; type: "SKIPPED_WORK_SESSION"; startTime: string; endTime: string };
