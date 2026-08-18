import { useLinkAssignmentPicker } from "../hooks/useLinkAssignmentPicker";
import { AssignmentLinkSelector } from "@/features/assignments/components/AssignmentLinkSelector";
import { Button } from "@/shared/components/Button";
import { ArrowLeftIcon } from "@/features/calendar/components/icons";

interface LinkAssignmentPickerProps {
  workSessionId: string;
  onRequestCreateAssignment: () => void;
  onBack: () => void;
  pendingAssignmentId?: string;
}

export function LinkAssignmentPicker({
  workSessionId,
  onRequestCreateAssignment,
  onBack,
  pendingAssignmentId,
}: LinkAssignmentPickerProps) {
  const { linkedIds, selectedIds, toggleAssignment, handleLink, isLinking } = useLinkAssignmentPicker(
    workSessionId,
    pendingAssignmentId
  );

  const handleAdd = async () => {
    await handleLink();
    onBack();
  };

  return (
    <div className="flex h-full flex-col">
      <button
        type="button"
        onClick={onBack}
        disabled={isLinking}
        className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-emerald-700 disabled:opacity-50 mb-4 shrink-0"
      >
        <ArrowLeftIcon className="w-3 h-3" />
        Back
      </button>
      <AssignmentLinkSelector
        selectedIds={selectedIds}
        onToggle={toggleAssignment}
        onRequestCreateAssignment={onRequestCreateAssignment}
        excludeIds={linkedIds}
        disabled={isLinking}
      />
      <div className="flex justify-end mt-2 shrink-0">
        <Button variant="secondary" size="sm" onClick={handleAdd} disabled={selectedIds.size === 0 || isLinking}>
          {isLinking ? "Adding..." : "Add"}
        </Button>
      </div>
    </div>
  );
}
