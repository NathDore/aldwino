export interface AssignmentDto {
  id: string;
  courseId: string;
  eventId: string;
  description: string;
  dueDate: string;
  isCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
}

export interface AssignmentFormData {
  courseId: string;
  eventId: string;
  description: string;
  dueDate: string;
}
