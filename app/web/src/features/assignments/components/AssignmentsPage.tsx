import { useQueryClient } from "@tanstack/react-query";
import { useAssignmentsQuery } from "../queries/useAssignmentsQuery";
import { useDeleteAssignmentMutation } from "../queries/useMutations";
import { useAssignmentStore } from "../store/assignmentStore";
import { AssignmentEventList } from "./AssignmentEventList";
import { AssignmentForm } from "./AssignmentForm";
import { useCoursesQuery } from "@/features/courses";
import { useEventsQuery } from "@/features/events";
import { DeleteConfirmation } from "@/shared/components/DeleteConfirmation";
import { Button } from "@/shared/components/Button";

export function AssignmentsPage() {
  const queryClient = useQueryClient();
  const { data: assignments = [], isLoading: assignmentsLoading } = useAssignmentsQuery();
  const { data: events = [], isLoading: eventsLoading } = useEventsQuery();
  const { data: courses = [] } = useCoursesQuery();
  const deleteMutation = useDeleteAssignmentMutation();
  const {
    isFormOpen,
    selectedAssignmentId,
    showDeleteConfirm,
    openFormForNew,
    setShowDeleteConfirm,
    closeForm,
  } = useAssignmentStore();

  const assignmentToEdit = selectedAssignmentId
    ? assignments.find((a) => a.id === selectedAssignmentId)
    : null;
  const assignmentToDelete = selectedAssignmentId
    ? assignments.find((a) => a.id === selectedAssignmentId)
    : null;

  const handleDeleteClick = (id: string) => {
    useAssignmentStore.setState({
      selectedAssignmentId: id,
      showDeleteConfirm: true,
    });
  };

  const handleConfirmDelete = async () => {
    if (selectedAssignmentId) {
      try {
        await deleteMutation.mutateAsync(selectedAssignmentId);
        await queryClient.refetchQueries({ queryKey: ["assignments"], type: "active" });
        setShowDeleteConfirm(false);
        useAssignmentStore.setState({ selectedAssignmentId: null });
      } catch (error) {
        console.error("Failed to delete assignment:", error);
      }
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Assignment Management</h1>
        <Button variant="primary" size="md" onClick={openFormForNew}>
          + Create Assignment
        </Button>
      </div>

      <AssignmentEventList
        events={events}
        assignments={assignments}
        courses={courses}
        isLoading={assignmentsLoading || eventsLoading}
        onDeleteAssignment={handleDeleteClick}
      />

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-lg p-8 w-full max-w-2xl shadow-lg max-h-[90vh] overflow-y-auto">
            <AssignmentForm assignmentToEdit={assignmentToEdit} />
          </div>
        </div>
      )}

      {showDeleteConfirm && assignmentToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-lg p-8 w-full max-w-md shadow-lg">
            <DeleteConfirmation
              title="Delete Assignment?"
              description={
                <>
                  Are you sure you want to delete{" "}
                  <span className="font-medium text-slate-900">
                    {assignmentToDelete.description}
                  </span>
                  ? This action cannot be undone.
                </>
              }
              isLoading={deleteMutation.isPending}
              onConfirm={handleConfirmDelete}
              onCancel={() => setShowDeleteConfirm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
