export interface AssignmentDto {
  id: string;
  courseId: string;
  assignmentStateId: string;
  name: string;
  dueDate: string;
  completedAt: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  wrapUpAt: string | null;
  createdAt: string;
}

export interface AssignmentEditData {
  courseId: string;
  name: string;
  dueDate: string;
  assignmentStateId: string;
}

export interface AssignmentCreateData {
  courseId: string;
  name: string;
  dueDate: string;
}
