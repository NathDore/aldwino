import { useLinkAssignmentPicker } from "../hooks/useLinkAssignmentPicker";
import { AssignmentLinkSelector } from "@/features/assignments/components/AssignmentLinkSelector";
import { Button } from "@/shared/components/Button";

interface LinkAssignmentPickerProps {
  workSessionId: string;
  onRequestCreateAssignment: () => void;
  pendingAssignmentId?: string;
}

export function LinkAssignmentPicker({
  workSessionId,
  onRequestCreateAssignment,
  pendingAssignmentId,
}: LinkAssignmentPickerProps) {
  const { linkedIds, selectedIds, toggleAssignment, handleLink, isLinking } = useLinkAssignmentPicker(
    workSessionId,
    pendingAssignmentId
  );

  return (
    <div className="flex flex-col">
      <AssignmentLinkSelector
        selectedIds={selectedIds}
        onToggle={toggleAssignment}
        onRequestCreateAssignment={onRequestCreateAssignment}
        excludeIds={linkedIds}
        disabled={isLinking}
      />
      <div className="flex justify-end mt-2">
        <Button variant="secondary" size="sm" onClick={handleLink} disabled={selectedIds.size === 0 || isLinking}>
          {isLinking ? "Linking..." : "Link"}
        </Button>
      </div>
    </div>
  );
}
