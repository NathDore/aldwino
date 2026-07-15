import { useCourseStore } from "../store/courseStore";
import { Button } from "./Button";

interface DeleteConfirmationProps {
  courseCode: string;
  courseTitle: string;
  isLoading: boolean;
  onConfirm: () => void;
}

export function DeleteConfirmation({
  courseCode,
  courseTitle,
  isLoading,
  onConfirm,
}: DeleteConfirmationProps) {
  const { setShowDeleteConfirm } = useCourseStore();

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Delete Course?</h3>
        <p className="text-slate-700">
          Are you sure you want to delete{" "}
          <span className="font-medium text-slate-900">
            {courseCode} - {courseTitle}
          </span>
          ? This action cannot be undone.
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-6">
        <Button
          variant="ghost"
          size="md"
          onClick={() => setShowDeleteConfirm(false)}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          variant="danger"
          size="md"
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? "Deleting..." : "Delete"}
        </Button>
      </div>
    </div>
  );
}
