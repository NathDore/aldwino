import { createBrowserRouter } from "react-router-dom";
import { HomePage } from "@/pages/HomePage";
import { CoursesPage } from "@/features/courses";
import { AssignmentsPage } from "@/features/assignments";
import { TasksPage } from "@/features/tasks";
import { CalendarPage } from "@/features/calendar";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/calendar",
    element: <CalendarPage />,
  },
  {
    path: "/courses",
    element: <CoursesPage />,
  },
  {
    path: "/assignments",
    element: <AssignmentsPage />,
  },
  {
    path: "/tasks",
    element: <TasksPage />,
  },
]);
