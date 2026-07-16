import { createBrowserRouter } from "react-router-dom";
import { HomePage } from "@/pages/HomePage";
import { CoursesPage } from "@/features/courses";
import { EventsPage } from "@/features/events";

export const router = createBrowserRouter([
  {
    path: "/health",
    element: <HomePage />,
  },
  {
    path: "/",
    element: <CoursesPage />,
  },
  {
    path: "/events",
    element: <EventsPage />,
  },
]);
