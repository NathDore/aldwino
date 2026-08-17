import { useEffect, useMemo, useState } from "react";
import { useWorkSessionAssignmentLinksQuery } from "../queries/useAssignmentWorkSessionsQuery";
import { useLinkAssignmentMutation } from "../queries/useAssignmentWorkSessionMutations";
import { useAssignmentsQuery } from "@/features/assignments";
import { showToast } from "@/shared/store/toastStore";

export function useLinkAssignmentPicker(workSessionId: string, pendingAssignmentId?: string) {
  const { data: links = [] } = useWorkSessionAssignmentLinksQuery(workSessionId);
  const { data: assignments = [] } = useAssignmentsQuery();
  const linkMutation = useLinkAssignmentMutation();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const linkedIds = useMemo(() => new Set(links.map((link) => link.assignmentId)), [links]);

  const toggleAssignment = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    if (!pendingAssignmentId) return;
    setSelectedIds((prev) => {
      if (prev.has(pendingAssignmentId)) return prev;
      const next = new Set(prev);
      next.add(pendingAssignmentId);
      return next;
    });
  }, [pendingAssignmentId]);

  const handleLink = async () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    const results = await Promise.allSettled(
      ids.map((assignmentId) => linkMutation.mutateAsync({ assignmentId, workSessionId }))
    );
    const failedIds = ids.filter((_, i) => results[i].status === "rejected");
    if (failedIds.length > 0) {
      const names = failedIds.map((id) => assignments.find((a) => a.id === id)?.name ?? id);
      showToast(`Failed to link: ${names.join(", ")}`, "warning");
    }
    setSelectedIds(new Set());
  };

  return {
    linkedIds,
    selectedIds,
    toggleAssignment,
    handleLink,
    isLinking: linkMutation.isPending,
  };
}
