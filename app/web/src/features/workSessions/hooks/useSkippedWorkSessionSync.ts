import { useEffect, useRef } from "react";
import type { WorkSessionDto, WorkSessionStateDto } from "../types/workSession.types";
import { useChangeWorkSessionStateMutation } from "../queries/useWorkSessionMutations";

const CHECK_INTERVAL_MS = 15_000;

export function useSkippedWorkSessionSync(
  workSessions: WorkSessionDto[],
  workSessionStates: WorkSessionStateDto[] | undefined
): void {
  const changeStateMutation = useChangeWorkSessionStateMutation();
  const pendingRef = useRef<Set<string>>(new Set());
  const workSessionsRef = useRef(workSessions);
  workSessionsRef.current = workSessions;

  useEffect(() => {
    const inProgressStateId = workSessionStates?.find((s) => s.state === "INPROGRESS")?.id;
    const skippedStateId = workSessionStates?.find((s) => s.state === "SKIPPED")?.id;
    if (!inProgressStateId || !skippedStateId) return;

    const runCheck = () => {
      const now = Date.now();
      for (const workSession of workSessionsRef.current) {
        if (
          workSession.workSessionStateId === inProgressStateId &&
          new Date(workSession.endTime).getTime() < now &&
          !pendingRef.current.has(workSession.id)
        ) {
          pendingRef.current.add(workSession.id);
          changeStateMutation
            .mutateAsync({ id: workSession.id, workSessionStateId: skippedStateId })
            .finally(() => {
              pendingRef.current.delete(workSession.id);
            });
        }
      }
    };

    runCheck();
    const interval = setInterval(runCheck, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [workSessionStates, changeStateMutation]);
}
