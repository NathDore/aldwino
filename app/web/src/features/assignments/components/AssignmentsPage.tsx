import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAssignmentsQuery } from "../queries/useAssignmentsQuery";
import { useDeleteAssignmentMutation } from "../queries/useMutations";
import { useAssignmentStore } from "../store/assignmentStore";
import { StudyTimeWeekGrid } from "./StudyTimeWeekGrid";
import { AssignmentForm } from "./AssignmentForm";
import { ScoreStreakPlaceholder } from "./ScoreStreakPlaceholder";
import { useCoursesQuery } from "@/features/courses";
import { DeleteConfirmation } from "@/shared/components/DeleteConfirmation";
import { Modal } from "@/shared/components/Modal";

export function AssignmentsPage() {
  const queryClient = useQueryClient();
  const { data: assignments = [] } = useAssignmentsQuery();
  const { data: courses = [] } = useCoursesQuery();
  const deleteMutation = useDeleteAssignmentMutation();
  const { selectedAssignmentId, assignmentIdPendingDelete, cancelDelete } = useAssignmentStore();
  const formSectionRef = useRef<HTMLDivElement>(null);

  const assignmentToEdit = selectedAssignmentId
    ? assignments.find((a) => a.id === selectedAssignmentId) ?? null
    : null;
  const assignmentToDelete = assignmentIdPendingDelete
    ? assignments.find((a) => a.id === assignmentIdPendingDelete) ?? null
    : null;

  useEffect(() => {
    if (selectedAssignmentId) {
      formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedAssignmentId]);

  const handleConfirmDelete = async () => {
    if (!assignmentIdPendingDelete) return;
    try {
      await deleteMutation.mutateAsync(assignmentIdPendingDelete);
      await queryClient.refetchQueries({ queryKey: ["assignments"], type: "active" });
      cancelDelete();
    } catch (error) {
      console.error("Failed to delete assignment:", error);
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <StudyTimeWeekGrid assignments={assignments} courses={courses} />

      <div className="flex gap-6 mt-3">
        <div ref={formSectionRef} className="w-3/4">
          <AssignmentForm assignmentToEdit={assignmentToEdit} />
        </div>
        <div className="flex-1">
          <ScoreStreakPlaceholder />
        </div>
      </div>

      {assignmentToDelete && (
        <Modal maxWidth="max-w-md">
          <DeleteConfirmation
            title="Delete Assignment?"
            description={
              <>
                Are you sure you want to delete{" "}
                <span className="font-medium text-slate-900">{assignmentToDelete.description}</span>? This
                action cannot be undone.
              </>
            }
            isLoading={deleteMutation.isPending}
            onConfirm={handleConfirmDelete}
            onCancel={cancelDelete}
          />
        </Modal>
      )}
    </div>
  );
}
