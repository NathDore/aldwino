import type { AssignmentDto } from "@/features/assignments";
import { CreateAssignmentForm } from "@/features/assignments/components/CreateAssignmentForm";
import { AssignmentFormPanel } from "@/features/assignments/components/AssignmentFormPanel";
import { Popover } from "@/shared/components/Popover";
import { Modal } from "@/shared/components/Modal";
import { DeleteConfirmation } from "@/shared/components/DeleteConfirmation";
import { MODAL_HEIGHT, MODAL_WIDTH } from "@/shared/lib/formConstants";

interface AssignmentDialogsProps {
  isAdding: boolean;
  onCloseAdding: () => void;
  editingAssignment: AssignmentDto | null;
  onCloseEditing: () => void;
  reschedulingAssignment: AssignmentDto | null;
  onCloseRescheduling: () => void;
  deletingAssignment: AssignmentDto | null;
  onCloseDeleting: () => void;
  onConfirmDelete: () => Promise<void>;
  isDeletePending: boolean;
}

export function AssignmentDialogs({
  isAdding,
  onCloseAdding,
  editingAssignment,
  onCloseEditing,
  reschedulingAssignment,
  onCloseRescheduling,
  deletingAssignment,
  onCloseDeleting,
  onConfirmDelete,
  isDeletePending,
}: AssignmentDialogsProps) {
  return (
    <>
      {isAdding && (
        <Popover
          onClose={onCloseAdding}
          panelClassName="max-w-full max-h-full"
          panelStyle={{ width: MODAL_WIDTH, height: MODAL_HEIGHT }}
          headerClassName="px-10 py-3"
          header={<p className="text-sm font-bold text-slate-900">Add assignment</p>}
        >
          {(handleClose) => (
            <div className="px-10 py-4 overflow-hidden min-h-0 flex-1">
              <CreateAssignmentForm onCreated={handleClose} onBack={handleClose} />
            </div>
          )}
        </Popover>
      )}

      {editingAssignment && (
        <Popover
          onClose={onCloseEditing}
          panelClassName="max-w-full max-h-full"
          panelStyle={{ width: MODAL_WIDTH, height: MODAL_HEIGHT }}
          headerClassName="px-10 py-3"
          header={<p className="text-sm font-bold text-slate-900">Edit assignment</p>}
        >
          {(handleClose) => (
            <div className="px-10 py-4 overflow-hidden min-h-0 flex-1">
              <AssignmentFormPanel assignmentToEdit={editingAssignment} onClose={handleClose} />
            </div>
          )}
        </Popover>
      )}

      {reschedulingAssignment && (
        <Popover
          onClose={onCloseRescheduling}
          panelClassName="max-w-full max-h-full"
          panelStyle={{ width: MODAL_WIDTH, height: MODAL_HEIGHT }}
          headerClassName="px-10 py-3"
          header={<p className="text-sm font-bold text-slate-900">Reschedule assignment</p>}
        >
          {(handleClose) => (
            <div className="px-10 py-4 overflow-hidden min-h-0 flex-1">
              <AssignmentFormPanel
                assignmentToEdit={reschedulingAssignment}
                onClose={handleClose}
                intent="reschedule"
              />
            </div>
          )}
        </Popover>
      )}

      {deletingAssignment && (
        <Modal maxWidth="max-w-md">
          <DeleteConfirmation
            title="Delete assignment?"
            description={`"${deletingAssignment.name}" will be removed. This can't be undone.`}
            isLoading={isDeletePending}
            onConfirm={onConfirmDelete}
            onCancel={onCloseDeleting}
          />
        </Modal>
      )}
    </>
  );
}
