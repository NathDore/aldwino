import { createServer } from "./infrastructure/http/server";
import { GetHealthUseCase } from "./application/health/GetHealthUseCase";
import { SystemClock } from "./infrastructure/system/SystemClock";
import { getDatabase } from "./infrastructure/database/sqlite/database";
import { migrate as migrateEvents } from "./infrastructure/database/migrations/001_create_event_table";
import { migrate as migrateCourses } from "./infrastructure/database/migrations/002_create_course_table";
import { migrate as migrateAssignments } from "./infrastructure/database/migrations/003_create_assignment_table";
import { migrate as migrateTasks } from "./infrastructure/database/migrations/004_create_task_table";
import { migrate as migrateAssignmentScheduling } from "./infrastructure/database/migrations/005_add_assignment_scheduling_columns";
import { migrate as migrateAssignmentDeleted } from "./infrastructure/database/migrations/006_add_assignment_deleted_columns";
import { migrate as migrateEventStatus } from "./infrastructure/database/migrations/007_add_event_status_column";
import { migrate as migrateAssignmentReschedule } from "./infrastructure/database/migrations/008_add_assignment_reschedule_columns";
import { EventRepository } from "./infrastructure/database/repositories/EventRepository";
import { CreateEventUseCase } from "./application/event/CreateEventUseCase";
import { GetEventByIdUseCase } from "./application/event/GetEventByIdUseCase";
import { ListEventsUseCase } from "./application/event/ListEventsUseCase";
import { UpdateEventUseCase } from "./application/event/UpdateEventUseCase";
import { DeleteEventUseCase } from "./application/event/DeleteEventUseCase";
import { CourseRepository } from "./infrastructure/database/repositories/CourseRepository";
import { CreateCourseUseCase } from "./application/course/CreateCourseUseCase";
import { GetCourseByIdUseCase } from "./application/course/GetCourseByIdUseCase";
import { ListCoursesUseCase } from "./application/course/ListCoursesUseCase";
import { UpdateCourseUseCase } from "./application/course/UpdateCourseUseCase";
import { DeleteCourseUseCase } from "./application/course/DeleteCourseUseCase";
import { AssignmentRepository } from "./infrastructure/database/repositories/AssignmentRepository";
import { CreateAssignmentUseCase } from "./application/assignment/CreateAssignmentUseCase";
import { GetAssignmentByIdUseCase } from "./application/assignment/GetAssignmentByIdUseCase";
import { ListAssignmentsUseCase } from "./application/assignment/ListAssignmentsUseCase";
import { UpdateAssignmentUseCase } from "./application/assignment/UpdateAssignmentUseCase";
import { DeleteAssignmentUseCase } from "./application/assignment/DeleteAssignmentUseCase";
import { CompleteAssignmentUseCase } from "./application/assignment/CompleteAssignmentUseCase";
import { RescheduleAssignmentUseCase } from "./application/assignment/RescheduleAssignmentUseCase";
import { PurgeDeletedAssignmentsUseCase } from "./application/assignment/PurgeDeletedAssignmentsUseCase";
import { AssignmentSchedulingService } from "./application/assignment/AssignmentSchedulingService";
import { TaskRepository } from "./infrastructure/database/repositories/TaskRepository";
import { CreateTaskUseCase } from "./application/task/CreateTaskUseCase";
import { GetTaskByIdUseCase } from "./application/task/GetTaskByIdUseCase";
import { ListTasksUseCase } from "./application/task/ListTasksUseCase";
import { UpdateTaskUseCase } from "./application/task/UpdateTaskUseCase";
import { DeleteTaskUseCase } from "./application/task/DeleteTaskUseCase";

const PORT = Number(process.env.API_PORT ?? 4287);
const clock = new SystemClock();

// Initialize database and run migrations
const db = getDatabase();
migrateEvents(db);
migrateCourses(db);
migrateAssignments(db);
migrateTasks(db);
migrateAssignmentScheduling(db);
migrateAssignmentDeleted(db);
migrateEventStatus(db);
migrateAssignmentReschedule(db);

// Create repositories
const eventRepository = new EventRepository(db);
const courseRepository = new CourseRepository(db);
const assignmentRepository = new AssignmentRepository(db);
const taskRepository = new TaskRepository(db);
const assignmentSchedulingService = new AssignmentSchedulingService(eventRepository, assignmentRepository, clock);

// Purge assignments soft-deleted more than a week ago, on startup and then daily
const purgeDeletedAssignmentsUseCase = new PurgeDeletedAssignmentsUseCase(assignmentRepository, clock);
const runPurge = () => {
  const purged = purgeDeletedAssignmentsUseCase.execute();
  if (purged > 0) {
    console.log(`[app-api] purged ${purged} expired soft-deleted assignment(s)`);
  }
};
runPurge();
const PURGE_INTERVAL_MS = 24 * 60 * 60 * 1000;
setInterval(runPurge, PURGE_INTERVAL_MS).unref();

// Create app with all dependencies
const app = createServer({
  getHealthUseCase: new GetHealthUseCase(clock),
  createEventUseCase: new CreateEventUseCase(eventRepository, clock),
  getEventByIdUseCase: new GetEventByIdUseCase(eventRepository, assignmentRepository, clock),
  listEventsUseCase: new ListEventsUseCase(eventRepository, assignmentRepository, clock),
  updateEventUseCase: new UpdateEventUseCase(eventRepository),
  deleteEventUseCase: new DeleteEventUseCase(eventRepository),
  createCourseUseCase: new CreateCourseUseCase(courseRepository, clock),
  getCourseByIdUseCase: new GetCourseByIdUseCase(courseRepository),
  listCoursesUseCase: new ListCoursesUseCase(courseRepository),
  updateCourseUseCase: new UpdateCourseUseCase(courseRepository),
  deleteCourseUseCase: new DeleteCourseUseCase(courseRepository),
  createAssignmentUseCase: new CreateAssignmentUseCase(assignmentRepository, courseRepository, assignmentSchedulingService, clock, db),
  getAssignmentByIdUseCase: new GetAssignmentByIdUseCase(assignmentRepository),
  listAssignmentsUseCase: new ListAssignmentsUseCase(assignmentRepository),
  updateAssignmentUseCase: new UpdateAssignmentUseCase(assignmentRepository, courseRepository, assignmentSchedulingService, clock, db),
  deleteAssignmentUseCase: new DeleteAssignmentUseCase(assignmentRepository, assignmentSchedulingService, clock, db),
  completeAssignmentUseCase: new CompleteAssignmentUseCase(assignmentRepository, clock, db),
  rescheduleAssignmentUseCase: new RescheduleAssignmentUseCase(assignmentRepository, assignmentSchedulingService, clock, db),
  createTaskUseCase: new CreateTaskUseCase(taskRepository, assignmentRepository, clock),
  getTaskByIdUseCase: new GetTaskByIdUseCase(taskRepository),
  listTasksUseCase: new ListTasksUseCase(taskRepository),
  updateTaskUseCase: new UpdateTaskUseCase(taskRepository, assignmentRepository),
  deleteTaskUseCase: new DeleteTaskUseCase(taskRepository),
  allowedOrigins: ["http://localhost:1420", "tauri://localhost", "https://tauri.localhost"],
});

console.log(`[app-api] listening on http://127.0.0.1:${PORT}`);

export default { port: PORT, hostname: "127.0.0.1", fetch: app.fetch };
