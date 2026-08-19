import { createBrowserRouter } from "react-router-dom";
import { HomePage } from "@/pages/HomePage";
import { CalendarPage } from "@/features/calendar";
import { ManagePage } from "@/features/management";
import { AppLayout } from "@/shared/components/AppLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    element: <AppLayout />,
    children: [
      {
        path: "/calendar",
        element: <CalendarPage />,
      },
      {
        path: "/manage",
        element: <ManagePage />,
      },
    ],
  },
]);
