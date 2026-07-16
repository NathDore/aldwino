import { createBrowserRouter } from "react-router-dom";
import { HomePage } from "@/pages/HomePage";
import { CoursesPage } from "@/features/courses";
import { EventsPage } from "@/features/events";
import { AssignmentsPage } from "@/features/assignments";
import { TasksPage } from "@/features/tasks";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/courses",
    element: <CoursesPage />,
  },
  {
    path: "/events",
    element: <EventsPage />,
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
