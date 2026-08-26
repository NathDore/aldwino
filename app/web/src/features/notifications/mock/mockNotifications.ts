import type { NotificationDto } from "../types/notification.types";

function daysFromNow(days: number, hour: number, minute: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export const mockNotifications: NotificationDto[] = [
  {
    id: "mock-1",
    type: "OVERDUE_ASSIGNMENT",
    assignmentName: "Physics Lab Report",
    courseCode: "PHYS 201",
    courseColor: "#f97316",
    dueDate: daysFromNow(-2, 23, 59),
  },
  {
    id: "mock-2",
    type: "OVERDUE_ASSIGNMENT",
    assignmentName: "Essay Draft",
    courseCode: "ENGL 110",
    courseColor: "#a855f7",
    dueDate: daysFromNow(-1, 23, 59),
  },
  {
    id: "mock-3",
    type: "SKIPPED_WORK_SESSION",
    startTime: daysFromNow(-1, 14, 0),
    endTime: daysFromNow(-1, 15, 30),
  },
  {
    id: "mock-4",
    type: "UPCOMING_DEADLINE",
    assignmentName: "Linear Algebra Problem Set",
    courseCode: "MATH 210",
    courseColor: "#3b82f6",
    dueDate: daysFromNow(2, 23, 59),
  },
  {
    id: "mock-5",
    type: "UPCOMING_DEADLINE",
    assignmentName: "Chem Lab Prequiz",
    courseCode: "CHEM 150",
    courseColor: "#10b981",
    dueDate: daysFromNow(1, 9, 0),
  },
];
