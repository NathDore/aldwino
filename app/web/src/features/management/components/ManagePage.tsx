import { useState } from "react";
import { useCoursesQuery } from "@/features/courses";
import { useAssignmentsQuery } from "@/features/assignments";
import { CoursesTab } from "./CoursesTab";
import { AssignmentsTab } from "./AssignmentsTab";

type Tab = "courses" | "assignments";

export function ManagePage() {
  const [activeTab, setActiveTab] = useState<Tab>("courses");
  const { data: courses = [] } = useCoursesQuery();
  const { data: assignments = [] } = useAssignmentsQuery();

  return (
    <div className="h-full overflow-y-auto styled-scrollbar">
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex gap-6 border-b border-slate-200 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("courses")}
            className={`pb-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${activeTab === "courses"
                ? "text-emerald-700 border-emerald-600"
                : "text-slate-600 border-transparent hover:text-slate-900"
              }`}
          >
            Courses <span className="text-slate-500 font-medium">{courses.length}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("assignments")}
            className={`pb-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${activeTab === "assignments"
                ? "text-emerald-700 border-emerald-600"
                : "text-slate-600 border-transparent hover:text-slate-900"
              }`}
          >
            Assignments <span className="text-slate-500 font-medium">{assignments.length}</span>
          </button>
        </div>

        {activeTab === "courses" ? (
          <CoursesTab courses={courses} assignments={assignments} />
        ) : (
          <AssignmentsTab assignments={assignments} courses={courses} />
        )}
      </div>
    </div>
  );
}
