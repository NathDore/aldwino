import type { CourseDto } from "../types/course.types";
import { useCourseStore } from "../store/courseStore";
import { Button } from "./Button";

interface CourseListProps {
  courses: CourseDto[];
  isLoading: boolean;
  onDelete: (id: string, code: string, title: string) => void;
}

export function CourseList({ courses, isLoading, onDelete }: CourseListProps) {
  const { openFormForEdit } = useCourseStore();

  if (isLoading) {
    return <div className="text-slate-400">Loading courses...</div>;
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-600 text-sm">No courses yet. Create one to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-slate-300 rounded">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-300 bg-slate-100">
            <th className="text-left text-slate-900 font-semibold p-4">Code</th>
            <th className="text-left text-slate-900 font-semibold p-4">Title</th>
            <th className="text-left text-slate-900 font-semibold p-4">Color</th>
            <th className="text-left text-slate-900 font-semibold p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr
              key={course.id}
              className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <td className="p-4 text-slate-900">{course.code}</td>
              <td className="p-4 text-slate-900">{course.title}</td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 border border-slate-400"
                    style={{ backgroundColor: course.color }}
                  />
                  <span className="text-xs text-slate-600">{course.color}</span>
                </div>
              </td>
              <td className="p-4 space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => openFormForEdit(course.id)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDelete(course.id, course.code, course.title)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
