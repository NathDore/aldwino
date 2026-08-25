import {
  type AssignmentDto,
  useCompleteAssignmentMutation,
  useUncompleteAssignmentMutation,
  useWrapUpAssignmentMutation,
  useWrapUpLateAssignmentMutation,
  useDeleteAssignmentMutation,
} from "@/features/assignments";
import { showToast } from "@/shared/store/toastStore";

export function useAssignmentActions() {
  const completeMutation = useCompleteAssignmentMutation();
  const uncompleteMutation = useUncompleteAssignmentMutation();
  const wrapUpMutation = useWrapUpAssignmentMutation();
  const wrapUpLateMutation = useWrapUpLateAssignmentMutation();
  const deleteMutation = useDeleteAssignmentMutation();

  const complete = async (assignment: AssignmentDto) => {
    try {
      await completeMutation.mutateAsync(assignment.id);
    } catch (error) {
      if (error instanceof Error) showToast(error.message, "error");
    }
  };

  const uncomplete = async (assignment: AssignmentDto) => {
    try {
      await uncompleteMutation.mutateAsync(assignment.id);
    } catch (error) {
      if (error instanceof Error) showToast(error.message, "error");
    }
  };

  const wrapUp = async (assignment: AssignmentDto) => {
    try {
      await wrapUpMutation.mutateAsync(assignment.id);
    } catch (error) {
      if (error instanceof Error) showToast(error.message, "error");
    }
  };

  const wrapUpLate = async (assignment: AssignmentDto) => {
    try {
      await wrapUpLateMutation.mutateAsync(assignment.id);
    } catch (error) {
      if (error instanceof Error) showToast(error.message, "error");
    }
  };

  const deleteAssignment = async (assignment: AssignmentDto) => {
    await deleteMutation.mutateAsync(assignment.id);
  };

  return {
    complete,
    uncomplete,
    wrapUp,
    wrapUpLate,
    delete: deleteAssignment,
    isCompletePending: completeMutation.isPending,
    isUncompletePending: uncompleteMutation.isPending,
    isWrapUpPending: wrapUpMutation.isPending,
    isWrapUpLatePending: wrapUpLateMutation.isPending,
    isDeletePending: deleteMutation.isPending,
  };
}
