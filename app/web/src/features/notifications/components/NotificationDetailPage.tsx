import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/Button";
import { ArrowLeftIcon } from "@/features/calendar/components/icons";

export function NotificationDetailPage() {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col pt-4 px-8 pb-8 max-w-[1200px] mx-auto">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="w-fit flex items-center gap-1.5">
        <ArrowLeftIcon />
        Back
      </Button>
      <h1 className="mt-6 text-2xl font-bold text-slate-900">Notification</h1>
    </div>
  );
}
