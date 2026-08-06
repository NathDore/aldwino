import { useState } from "react";
import { useWorkSessionAssignmentLinksQuery } from "../queries/useAssignmentWorkSessionsQuery";
import { useLinkAssignmentMutation } from "../queries/useAssignmentWorkSessionMutations";
import { useAssignmentsQuery } from "@/features/assignments";
import { Button } from "@/shared/components/Button";

interface LinkAssignmentPickerProps {
  workSessionId: string;
}

export function LinkAssignmentPicker({ workSessionId }: LinkAssignmentPickerProps) {
  const { data: links = [] } = useWorkSessionAssignmentLinksQuery(workSessionId);
  const { data: assignments = [] } = useAssignmentsQuery();
  const linkMutation = useLinkAssignmentMutation();
  const [selectedId, setSelectedId] = useState("");

  const linkedIds = new Set(links.map((link) => link.assignmentId));
  const available = assignments.filter((assignment) => !linkedIds.has(assignment.id));

  const handleLink = async () => {
    if (!selectedId) return;
    await linkMutation.mutateAsync({ assignmentId: selectedId, workSessionId });
    setSelectedId("");
  };

  if (available.length === 0) {
    return <p className="text-xs text-slate-500">No more assignments to link.</p>;
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        className="flex-1 px-3 py-2 text-sm rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-emerald-600"
        disabled={linkMutation.isPending}
      >
        <option value="">Link an assignment…</option>
        {available.map((assignment) => (
          <option key={assignment.id} value={assignment.id}>
            {assignment.name}
          </option>
        ))}
      </select>
      <Button variant="secondary" size="sm" onClick={handleLink} disabled={!selectedId || linkMutation.isPending}>
        Link
      </Button>
    </div>
  );
}
