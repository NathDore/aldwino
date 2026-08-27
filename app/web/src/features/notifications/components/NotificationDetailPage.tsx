import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/shared/components/Button";
import { ArrowLeftIcon, CheckIcon } from "@/features/calendar/components/icons";
import { useAssignmentsQuery, isAssignmentOverdue, useConfirmCompleteAssignmentMutation, useWrapUpLateAssignmentMutation } from "@/features/assignments";
import { useCoursesQuery } from "@/features/courses";
import {
  useWorkSessionsQuery,
  useWorkSessionStatesQuery,
  useConfirmCompleteWorkSessionMutation,
  useConfirmSkipWorkSessionMutation,
} from "@/features/workSessions";
import { useNotificationQuery } from "../queries/useNotificationQuery";
import { buildNotificationView } from "../utils/formatNotificationMessage";

export function NotificationDetailPage() {
  const navigate = useNavigate();
  const { id = "" } = useParams<{ id: string }>();
  const { data: notification, isError } = useNotificationQuery(id);

  const { data: assignments = [], isLoading: isAssignmentsLoading } = useAssignmentsQuery();
  const { data: courses = [] } = useCoursesQuery();
  const { data: workSessions = [], isLoading: isWorkSessionsLoading } = useWorkSessionsQuery();
  const { data: workSessionStates } = useWorkSessionStatesQuery();

  const confirmCompleteWorkSession = useConfirmCompleteWorkSessionMutation();
  const confirmSkipWorkSession = useConfirmSkipWorkSessionMutation();
  const confirmCompleteAssignment = useConfirmCompleteAssignmentMutation();
  const wrapUpLateAssignment = useWrapUpLateAssignmentMutation();

  const view = notification
    ? buildNotificationView(notification, {
        assignments,
        courses,
        workSessions,
        isAssignmentsLoading,
        isWorkSessionsLoading,
      })
    : null;

  function renderActions() {
    if (!notification || view?.status !== "found" || notification.actionTaken) return null;

    if (notification.type === "WORK_SESSION_SKIPPED") {
      const workSession = workSessions.find((w) => w.id === notification.entityId);
      const stateName = workSessionStates?.find((s) => s.id === workSession?.workSessionStateId)?.state;
      if (!workSession || stateName !== "WAIT_CONFIRM") return null;

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => confirmCompleteWorkSession.mutate(workSession.id)}
            disabled={confirmCompleteWorkSession.isPending}
          >
            <span className="inline-flex items-center gap-1.5">
              <CheckIcon className="w-3 h-3" />
              Complete
            </span>
          </Button>
          <span className="text-sm text-slate-500">or</span>
          <Button
            variant="danger"
            size="sm"
            onClick={() => confirmSkipWorkSession.mutate(workSession.id)}
            disabled={confirmSkipWorkSession.isPending}
          >
            Confirm skipped
          </Button>
        </div>
      );
    }

    if (notification.type === "ASSIGNMENT_OVERDUE") {
      const assignment = assignments.find((a) => a.id === notification.entityId);
      if (!assignment || !isAssignmentOverdue(assignment)) return null;

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => confirmCompleteAssignment.mutate(assignment.id)}
            disabled={confirmCompleteAssignment.isPending}
          >
            <span className="inline-flex items-center gap-1.5">
              <CheckIcon className="w-3 h-3" />
              Complete
            </span>
          </Button>
          <span className="text-sm text-slate-500">or</span>
          <Button
            variant="warning"
            size="sm"
            onClick={() => wrapUpLateAssignment.mutate(assignment.id)}
            disabled={wrapUpLateAssignment.isPending}
          >
            Wrap up late
          </Button>
        </div>
      );
    }

    return null;
  }

  return (
    <div className="h-full flex flex-col pt-4 px-8 pb-8 max-w-[1200px] mx-auto">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="w-fit flex items-center gap-1.5">
        <ArrowLeftIcon />
        Back
      </Button>
      <h1 className="mt-6 text-2xl font-bold text-slate-900">Notification</h1>
      {isError ? (
        <p className="mt-4 text-sm text-slate-600">This notification could not be found.</p>
      ) : !view || view.status === "loading" ? (
        <p className="mt-4 text-sm text-slate-600">Loading…</p>
      ) : (
        <div className="mt-4 space-y-4">
          <p className="text-base text-slate-900">{view.message}</p>
          {renderActions()}
        </div>
      )}
    </div>
  );
}
