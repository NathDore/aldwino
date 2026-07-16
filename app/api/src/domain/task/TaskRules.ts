import {
  AssignmentIdRequiredError,
  DescriptionEmptyError,
  DescriptionTooLongError,
} from "./TaskError";

const DESCRIPTION_MAX_LENGTH = 250;

export function validateAssignmentId(assignmentId: string): void {
  if (assignmentId.length === 0) {
    throw new AssignmentIdRequiredError();
  }
}

export function validateDescription(description: string): void {
  if (description.length === 0) {
    throw new DescriptionEmptyError();
  }
  if (description.length > DESCRIPTION_MAX_LENGTH) {
    throw new DescriptionTooLongError();
  }
}
