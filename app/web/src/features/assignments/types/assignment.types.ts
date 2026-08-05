export interface AssignmentDto {
  id: string;
  courseId: string;
  eventId: string;
  description: string;
  dueDate: string;
  startTime: string;
  expectedDurationMinutes: number;
  isCompleted: boolean;
  completedAt: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  isReschedule: boolean;
  rescheduleAt: string | null;
  createdAt: string;
}

export interface AssignmentFormData {
  courseId: string;
  description: string;
  dueDate: string;
  startTime: string;
  expectedDurationMinutes: number;
}
