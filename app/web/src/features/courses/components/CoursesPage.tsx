import { useQueryClient } from "@tanstack/react-query";
import { useCoursesQuery } from "../queries/useCoursesQuery";
import { useDeleteCourseMutation } from "../queries/useMutations";
import { useCourseStore } from "../store/courseStore";
import { CourseList } from "./CourseList";
import { CourseForm } from "./CourseForm";
import { DeleteConfirmation } from "@/shared/components/DeleteConfirmation";
import { Button } from "@/shared/components/Button";

export function CoursesPage() {
  const queryClient = useQueryClient();
  const { data: courses = [], isLoading } = useCoursesQuery();
  const deleteMutation = useDeleteCourseMutation();
  const {
    isFormOpen,
    selectedCourseId,
    showDeleteConfirm,
    openFormForNew,
    setShowDeleteConfirm,
    closeForm,
  } = useCourseStore();

  const courseToEdit = selectedCourseId ? courses.find((c) => c.id === selectedCourseId) : null;
  const courseToDelete = selectedCourseId ? courses.find((c) => c.id === selectedCourseId) : null;

  const handleDeleteClick = (id: string, code: string, title: string) => {
    useCourseStore.setState({
      selectedCourseId: id,
      showDeleteConfirm: true,
    });
  };

  const handleConfirmDelete = async () => {
    if (selectedCourseId) {
      try {
        await deleteMutation.mutateAsync(selectedCourseId);
        await queryClient.refetchQueries({ queryKey: ["courses"], type: "active" });
        setShowDeleteConfirm(false);
        useCourseStore.setState({ selectedCourseId: null });
      } catch (error) {
        console.error("Failed to delete course:", error);
      }
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Course Management</h1>
        <Button variant="primary" size="md" onClick={openFormForNew}>
          + Create Course
        </Button>
      </div>

      <CourseList
        courses={courses}
        isLoading={isLoading}
        onDelete={handleDeleteClick}
      />

      {isFormOpen && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-lg p-8 w-full max-w-2xl shadow-lg max-h-[90vh] overflow-y-auto">
            <CourseForm courseToEdit={courseToEdit} />
          </div>
        </div>
      )}

      {showDeleteConfirm && courseToDelete && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-lg p-8 w-full max-w-md shadow-lg">
            <DeleteConfirmation
              title="Delete Course?"
              description={
                <>
                  Are you sure you want to delete{" "}
                  <span className="font-medium text-slate-900">
                    {courseToDelete.code} - {courseToDelete.title}
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
