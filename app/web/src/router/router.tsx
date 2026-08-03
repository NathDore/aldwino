import { createBrowserRouter } from "react-router-dom";
import { HomePage } from "@/pages/HomePage";
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
    path: "/assignments",
    element: <AssignmentsPage />,
  },
  {
    path: "/tasks",
    element: <TasksPage />,
  },
]);
