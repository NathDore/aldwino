export interface TaskDto {
  id: string;
  assignmentId: string;
  description: string;
  isCompleted: boolean;
  createdAt: string;
}

export interface TaskFormData {
  assignmentId: string;
  description: string;
  isCompleted: boolean;
}

export interface TaskFormState {
  assignmentId: string;
  description: string;
  isCompleted: boolean;
  errors: Record<string, string>;
}
