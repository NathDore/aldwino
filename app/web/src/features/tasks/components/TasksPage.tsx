import { DeleteConfirmation } from "@/shared/components/DeleteConfirmation";
import { useEventsQuery } from "@/features/events/queries/useEventsQuery";
import { useAssignmentsQuery } from "@/features/assignments/queries/useAssignmentsQuery";
import { useCoursesQuery } from "@/features/courses/queries/useCoursesQuery";
import { useTasksQuery } from "../queries/useTasksQuery";
import {
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} from "../queries/useTaskMutations";
import { useTaskStore } from "../store/taskStore";
import { TaskEventList } from "./TaskEventList";
import { TaskFormPanel } from "./TaskFormPanel";

export const TasksPage = () => {
  const { data: events = [], isLoading: eventsLoading } = useEventsQuery();
  const { data: assignments = [], isLoading: assignmentsLoading } =
    useAssignmentsQuery();
  const { data: courses = [], isLoading: coursesLoading } = useCoursesQuery();
  const { data: tasks = [], isLoading: tasksLoading } = useTasksQuery();

  const createTaskMutation = useCreateTaskMutation();
  const updateTaskMutation = useUpdateTaskMutation();
  const deleteTaskMutation = useDeleteTaskMutation();

  const {
    isFormOpen,
    editingTaskId,
    showDeleteConfirm,
    deleteTaskId,
    closeForm,
    setShowDeleteConfirm,
  } = useTaskStore();

  const editingTask = editingTaskId ? tasks.find((t) => t.id === editingTaskId) : undefined;

  const handleCreateTask = async (
    assignmentId: string,
    description: string,
    _isCompleted: boolean
  ) => {
    await createTaskMutation.mutateAsync({
      assignmentId,
      description,
      isCompleted: false,
    });
  };

  const handleUpdateTask = async (
    assignmentId: string,
    description: string,
    isCompleted: boolean
  ) => {
    if (!editingTask) return;
    await updateTaskMutation.mutateAsync({
      id: editingTask.id,
      data: {
        assignmentId,
        description,
        isCompleted,
      },
    });
  };

  const handleDeleteTask = async () => {
    if (!deleteTaskId) return;
    await deleteTaskMutation.mutateAsync(deleteTaskId);
    setShowDeleteConfirm(false);
  };

  const isLoading =
    eventsLoading || assignmentsLoading || coursesLoading || tasksLoading;
  const isMutationLoading =
    createTaskMutation.isPending ||
    updateTaskMutation.isPending ||
    deleteTaskMutation.isPending;

  return (
    <div className="h-full overflow-auto">
      <div className="space-y-1 p-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Tasks
        </h1>
        <p className="text-slate-700">
          Organize your work by breaking assignments into manageable tasks
        </p>
      </div>

      <div className="px-8 pb-8">
        {isLoading ? (
          <div className="flex items-center justify-center rounded border border-slate-200 bg-slate-50 py-12">
            <p className="text-slate-600">Loading tasks...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="flex items-center justify-center rounded border border-dashed border-slate-300 py-12">
            <p className="text-slate-600">
              No events created yet. Create an event to start adding tasks.
            </p>
          </div>
        ) : (
          <TaskEventList
            events={events}
            assignments={assignments}
            courses={courses}
            tasks={tasks}
          />
        )}
      </div>

      <TaskFormPanel
        isOpen={isFormOpen}
        editingTask={editingTask}
        assignments={assignments}
        courses={courses}
        events={events}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        isLoading={isMutationLoading}
      />

      {showDeleteConfirm && deleteTaskId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-lg p-8 w-full max-w-md shadow-lg">
            <DeleteConfirmation
              title="Delete Task"
              description="Are you sure you want to delete this task? This action cannot be undone."
              onConfirm={handleDeleteTask}
              onCancel={() => setShowDeleteConfirm(false)}
              isLoading={deleteTaskMutation.isPending}
            />
          </div>
        </div>
      )}
    </div>
  );
};
