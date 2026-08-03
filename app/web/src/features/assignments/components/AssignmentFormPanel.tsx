import { useState } from "react";
import type { AssignmentDto } from "../types/assignment.types";
import type { CourseDto } from "@/features/courses";
import { QuickAssignmentForm } from "./QuickAssignmentForm";
import { InlineCourseForm } from "@/features/courses/components/InlineCourseForm";

interface AssignmentFormPanelProps {
  onClose: () => void;
  assignmentToEdit?: AssignmentDto | null;
  date?: string;
  hour?: number;
}

type Mode = "assignment" | "create-course";

export function AssignmentFormPanel({ date, hour, onClose, assignmentToEdit }: AssignmentFormPanelProps) {
  const [mode, setMode] = useState<Mode>("assignment");
  const [pendingCourseId, setPendingCourseId] = useState<string | undefined>(undefined);

  const handleCourseCreated = (course: CourseDto) => {
    setPendingCourseId(course.id);
    setMode("assignment");
  };

  return (
    <div className="grid">
      <div className={`col-start-1 row-start-1 ${mode === "create-course" ? "invisible" : ""}`}>
        <QuickAssignmentForm
          date={date}
          hour={hour}
          onClose={onClose}
          assignmentToEdit={assignmentToEdit}
          onRequestCreateCourse={() => setMode("create-course")}
          pendingCourseId={pendingCourseId}
        />
      </div>
      {mode === "create-course" && (
        <div className="col-start-1 row-start-1">
          <InlineCourseForm onCreated={handleCourseCreated} onBack={() => setMode("assignment")} />
        </div>
      )}
    </div>
  );
}
