export type AssignmentStateName = "UNCOMPLETED" | "COMPLETED" | "SKIPPED";

export interface AssignmentStateDto {
  id: string;
  state: AssignmentStateName;
}
