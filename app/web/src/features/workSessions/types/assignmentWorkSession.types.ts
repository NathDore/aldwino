export interface AssignmentWorkSessionDto {
  id: string;
  assignmentId: string;
  workSessionId: string;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
}
