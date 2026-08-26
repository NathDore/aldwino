import { useState } from "react";
import { Popover } from "@/shared/components/Popover";
import { WorkSessionFormPanel } from "./WorkSessionFormPanel";
import { CreateAssignmentForm } from "@/features/assignments/components/CreateAssignmentForm";
import { parseISODate } from "@/features/calendar/hooks/useWeekDays";
import type { AssignmentDto } from "@/features/assignments";
import { MODAL_HEIGHT, MODAL_WIDTH } from "@/shared/lib/formConstants";

interface CreateWorkSessionPopoverProps {
  date: string;
  hour: number;
  useCurrentTimeAsStart?: boolean;
  onClose: () => void;
}

function formatHourLabel(hour: number): string {
  const period = hour < 12 ? "AM" : "PM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour} ${period}`;
}

function formatHeading(date: string): { weekday: string; dateLabel: string } {
  const d = parseISODate(date);
  return {
    weekday: d.toLocaleDateString(undefined, { weekday: "long" }),
    dateLabel: d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }),
  };
}

type Mode = "session" | "create-assignment";

export function CreateWorkSessionPopover({ date, hour, useCurrentTimeAsStart, onClose }: CreateWorkSessionPopoverProps) {
  const { weekday, dateLabel } = formatHeading(date);
  const [mode, setMode] = useState<Mode>("session");
  const [pendingAssignmentId, setPendingAssignmentId] = useState<string | undefined>(undefined);

  const handleAssignmentCreated = (assignment: AssignmentDto) => {
    setPendingAssignmentId(assignment.id);
    setMode("session");
  };

  return (
    <Popover
      onClose={onClose}
      panelClassName="max-w-full max-h-full"
      panelStyle={{ width: MODAL_WIDTH, height: MODAL_HEIGHT }}
      headerClassName="px-10 py-3"
      header={
        <div className="min-w-0 flex items-baseline gap-2">
          <p className="text-sm font-bold text-slate-900 truncate">{weekday}</p>
          <p className="text-xs text-slate-600 truncate">{dateLabel}</p>
          <p className="text-xs font-semibold text-slate-900 shrink-0">{formatHourLabel(hour)}</p>
        </div>
      }
    >
      {(handleClose) => (
        <div className="px-10 py-4 overflow-hidden min-h-0 flex-1">
          <div className="grid h-full">
            <div className={`col-start-1 row-start-1 h-full ${mode === "create-assignment" ? "invisible" : ""}`}>
              <WorkSessionFormPanel
                date={date}
                hour={hour}
                useCurrentTimeAsStart={useCurrentTimeAsStart}
                onClose={handleClose}
                onRequestCreateAssignment={() => setMode("create-assignment")}
                pendingAssignmentId={pendingAssignmentId}
              />
            </div>
            {mode === "create-assignment" && (
              <div className="col-start-1 row-start-1 h-full">
                <CreateAssignmentForm onCreated={handleAssignmentCreated} onBack={() => setMode("session")} />
              </div>
            )}
          </div>
        </div>
      )}
    </Popover>
  );
}
