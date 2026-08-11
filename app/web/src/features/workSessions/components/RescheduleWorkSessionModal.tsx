import { Popover } from "@/shared/components/Popover";
import { RescheduleWorkSessionForm } from "./RescheduleWorkSessionForm";
import type { WorkSessionDto } from "../types/workSession.types";

interface RescheduleWorkSessionModalProps {
  workSession: WorkSessionDto;
  onClose: () => void;
}

export function RescheduleWorkSessionModal({ workSession, onClose }: RescheduleWorkSessionModalProps) {
  return (
    <Popover
      onClose={onClose}
      panelClassName="w-[34rem] max-w-full max-h-[80vh]"
      headerClassName="px-10 py-3"
      header={<p className="text-sm font-bold text-slate-900 shrink-0">Reschedule Work Session</p>}
    >
      {(handleClose) => (
        <div className="px-10 py-4 overflow-hidden min-h-0">
          <RescheduleWorkSessionForm workSession={workSession} onClose={handleClose} />
        </div>
      )}
    </Popover>
  );
}
