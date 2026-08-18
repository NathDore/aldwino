import { useLinkAssignmentPicker } from "../hooks/useLinkAssignmentPicker";
import { AssignmentLinkSelector } from "@/features/assignments/components/AssignmentLinkSelector";
import { Button } from "@/shared/components/Button";

interface LinkAssignmentPickerProps {
  workSessionId: string;
  onRequestCreateAssignment: () => void;
  pendingAssignmentId?: string;
  disabled?: boolean;
}

export function LinkAssignmentPicker({
  workSessionId,
  onRequestCreateAssignment,
  pendingAssignmentId,
  disabled = false,
}: LinkAssignmentPickerProps) {
  const { linkedIds, selectedIds, toggleAssignment, handleLink, isLinking } = useLinkAssignmentPicker(
    workSessionId,
    pendingAssignmentId
  );

  return (
    <div className="flex flex-col">
      {disabled && (
        <p className="text-xs text-slate-500 mb-1.5">Reopen this session to add more assignments.</p>
      )}
      <AssignmentLinkSelector
        selectedIds={selectedIds}
        onToggle={toggleAssignment}
        onRequestCreateAssignment={onRequestCreateAssignment}
        excludeIds={linkedIds}
        disabled={isLinking || disabled}
      />
      <div className="flex justify-end mt-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleLink}
          disabled={selectedIds.size === 0 || isLinking || disabled}
        >
          {isLinking ? "Adding..." : "Add"}
        </Button>
      </div>
    </div>
  );
}
