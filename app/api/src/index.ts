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
import { migrate as migrateDropEventAndTask } from "./infrastructure/database/migrations/009_drop_event_and_task_tables";
import { migrate as migrateCourseDeleted } from "./infrastructure/database/migrations/010_add_course_deleted_columns";
import { migrate as migrateAssignmentStateTable } from "./infrastructure/database/migrations/011_create_assignment_state_table";
import { migrate as migrateWorkSessionStateTable } from "./infrastructure/database/migrations/012_create_work_session_state_table";
import { migrate as migrateRecreateAssignment } from "./infrastructure/database/migrations/013_recreate_assignment_table";
import { migrate as migrateWorkSessionTable } from "./infrastructure/database/migrations/014_create_work_session_table";
import { migrate as migrateAssignmentWorkSessionTable } from "./infrastructure/database/migrations/015_create_assignment_work_session_table";
import { migrate as migrateWorkSessionOverlapIndex } from "./infrastructure/database/migrations/016_add_work_session_overlap_index";
import { migrate as migrateAssignmentWrapUpAt } from "./infrastructure/database/migrations/017_add_assignment_wrap_up_at_column";
import { migrate as migrateWorkSessionWrapUpAt } from "./infrastructure/database/migrations/018_add_work_session_wrap_up_at_column";
import { migrate as migrateAssignmentRescheduleAt } from "./infrastructure/database/migrations/019_add_assignment_reschedule_at_column";
import { migrate as migrateWorkSessionRescheduleAt } from "./infrastructure/database/migrations/020_add_work_session_reschedule_at_column";
import { migrate as migrateAssignmentWorkSessionWorkedOn } from "./infrastructure/database/migrations/021_add_assignment_work_session_worked_on_column";
import { seedAssignmentStates } from "./infrastructure/database/seeds/seedAssignmentStates";
import { seedWorkSessionStates } from "./infrastructure/database/seeds/seedWorkSessionStates";
import { CourseRepository } from "./infrastructure/database/repositories/CourseRepository";
import { CreateCourseUseCase } from "./application/course/CreateCourseUseCase";
import { GetCourseByIdUseCase } from "./application/course/GetCourseByIdUseCase";
import { ListCoursesUseCase } from "./application/course/ListCoursesUseCase";
import { UpdateCourseUseCase } from "./application/course/UpdateCourseUseCase";
import { DeleteCourseUseCase } from "./application/course/DeleteCourseUseCase";
import { AssignmentRepository } from "./infrastructure/database/repositories/AssignmentRepository";
import { AssignmentStateRepository } from "./infrastructure/database/repositories/AssignmentStateRepository";
import { CreateAssignmentUseCase } from "./application/assignment/CreateAssignmentUseCase";
import { GetAssignmentByIdUseCase } from "./application/assignment/GetAssignmentByIdUseCase";
import { ListAssignmentsUseCase } from "./application/assignment/ListAssignmentsUseCase";
import { UpdateAssignmentUseCase } from "./application/assignment/UpdateAssignmentUseCase";
import { DeleteAssignmentUseCase } from "./application/assignment/DeleteAssignmentUseCase";
import { CompleteAssignmentUseCase } from "./application/assignment/CompleteAssignmentUseCase";
import { UncompleteAssignmentUseCase } from "./application/assignment/UncompleteAssignmentUseCase";
import { RescheduleAssignmentUseCase } from "./application/assignment/RescheduleAssignmentUseCase";
import { WrapUpAssignmentUseCase } from "./application/assignment/WrapUpAssignmentUseCase";
import { WrapUpLateAssignmentUseCase } from "./application/assignment/WrapUpLateAssignmentUseCase";
import { PurgeDeletedAssignmentsUseCase } from "./application/assignment/PurgeDeletedAssignmentsUseCase";
import { ListAssignmentStatesUseCase } from "./application/assignmentState/ListAssignmentStatesUseCase";
import { WorkSessionRepository } from "./infrastructure/database/repositories/WorkSessionRepository";
import { WorkSessionStateRepository } from "./infrastructure/database/repositories/WorkSessionStateRepository";
import { CreateWorkSessionUseCase } from "./application/workSession/CreateWorkSessionUseCase";
import { GetWorkSessionByIdUseCase } from "./application/workSession/GetWorkSessionByIdUseCase";
import { ListWorkSessionsUseCase } from "./application/workSession/ListWorkSessionsUseCase";
import { ChangeWorkSessionStateUseCase } from "./application/workSession/ChangeWorkSessionStateUseCase";
import { GetRandomWorkSessionCompletionMessageUseCase } from "./application/workSession/GetRandomWorkSessionCompletionMessageUseCase";
import { DeleteWorkSessionUseCase } from "./application/workSession/DeleteWorkSessionUseCase";
import { RescheduleWorkSessionUseCase } from "./application/workSession/RescheduleWorkSessionUseCase";
import { WrapUpWorkSessionUseCase } from "./application/workSession/WrapUpWorkSessionUseCase";
import { WorkSessionMergeService } from "./application/workSession/WorkSessionMergeService";
import { ListWorkSessionStatesUseCase } from "./application/workSessionState/ListWorkSessionStatesUseCase";
import { AssignmentWorkSessionRepository } from "./infrastructure/database/repositories/AssignmentWorkSessionRepository";
import { CreateAssignmentWorkSessionUseCase } from "./application/assignmentWorkSession/CreateAssignmentWorkSessionUseCase";
import { GetAssignmentWorkSessionByIdUseCase } from "./application/assignmentWorkSession/GetAssignmentWorkSessionByIdUseCase";
import { ListAssignmentWorkSessionsUseCase } from "./application/assignmentWorkSession/ListAssignmentWorkSessionsUseCase";
import { UpdateAssignmentWorkSessionUseCase } from "./application/assignmentWorkSession/UpdateAssignmentWorkSessionUseCase";
import { DeleteAssignmentWorkSessionUseCase } from "./application/assignmentWorkSession/DeleteAssignmentWorkSessionUseCase";
import { MarkAssignmentWorkedOnUseCase } from "./application/assignmentWorkSession/MarkAssignmentWorkedOnUseCase";
import { UnmarkAssignmentWorkedOnUseCase } from "./application/assignmentWorkSession/UnmarkAssignmentWorkedOnUseCase";

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
migrateDropEventAndTask(db);
migrateCourseDeleted(db);
migrateAssignmentStateTable(db);
migrateWorkSessionStateTable(db);
migrateRecreateAssignment(db);
migrateWorkSessionTable(db);
migrateAssignmentWorkSessionTable(db);
migrateWorkSessionOverlapIndex(db);
migrateAssignmentWrapUpAt(db);
migrateWorkSessionWrapUpAt(db);
migrateAssignmentRescheduleAt(db);
migrateWorkSessionRescheduleAt(db);
migrateAssignmentWorkSessionWorkedOn(db);

// Seed lookup tables (idempotent, runs every startup)
seedAssignmentStates(db);
seedWorkSessionStates(db);

// Create repositories
const courseRepository = new CourseRepository(db);
const assignmentRepository = new AssignmentRepository(db);
const assignmentStateRepository = new AssignmentStateRepository(db);
const workSessionRepository = new WorkSessionRepository(db);
const workSessionStateRepository = new WorkSessionStateRepository(db);
const assignmentWorkSessionRepository = new AssignmentWorkSessionRepository(db);
const workSessionMergeService = new WorkSessionMergeService(
  workSessionRepository,
  assignmentWorkSessionRepository,
  workSessionStateRepository,
  clock,
);

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
  createCourseUseCase: new CreateCourseUseCase(courseRepository, clock),
  getCourseByIdUseCase: new GetCourseByIdUseCase(courseRepository),
  listCoursesUseCase: new ListCoursesUseCase(courseRepository),
  updateCourseUseCase: new UpdateCourseUseCase(courseRepository),
  deleteCourseUseCase: new DeleteCourseUseCase(courseRepository, assignmentRepository, clock, db),
  createAssignmentUseCase: new CreateAssignmentUseCase(
    assignmentRepository,
    courseRepository,
    assignmentStateRepository,
    clock,
    db,
  ),
  getAssignmentByIdUseCase: new GetAssignmentByIdUseCase(assignmentRepository),
  listAssignmentsUseCase: new ListAssignmentsUseCase(assignmentRepository),
  updateAssignmentUseCase: new UpdateAssignmentUseCase(assignmentRepository, courseRepository, clock, db),
  deleteAssignmentUseCase: new DeleteAssignmentUseCase(assignmentRepository, assignmentWorkSessionRepository, clock, db),
  completeAssignmentUseCase: new CompleteAssignmentUseCase(assignmentRepository, assignmentStateRepository, clock, db),
  uncompleteAssignmentUseCase: new UncompleteAssignmentUseCase(
    assignmentRepository,
    assignmentStateRepository,
    clock,
    db,
  ),
  rescheduleAssignmentUseCase: new RescheduleAssignmentUseCase(assignmentRepository, clock, db),
  wrapUpAssignmentUseCase: new WrapUpAssignmentUseCase(assignmentRepository, clock, db),
  wrapUpLateAssignmentUseCase: new WrapUpLateAssignmentUseCase(assignmentRepository, clock, db),
  listAssignmentStatesUseCase: new ListAssignmentStatesUseCase(assignmentStateRepository),
  createWorkSessionUseCase: new CreateWorkSessionUseCase(
    workSessionRepository,
    workSessionStateRepository,
    workSessionMergeService,
    clock,
    db,
  ),
  getWorkSessionByIdUseCase: new GetWorkSessionByIdUseCase(workSessionRepository),
  listWorkSessionsUseCase: new ListWorkSessionsUseCase(workSessionRepository),
  changeWorkSessionStateUseCase: new ChangeWorkSessionStateUseCase(
    workSessionRepository,
    workSessionStateRepository,
    workSessionMergeService,
    clock,
    db,
  ),
  deleteWorkSessionUseCase: new DeleteWorkSessionUseCase(
    workSessionRepository,
    assignmentWorkSessionRepository,
    clock,
    db,
  ),
  rescheduleWorkSessionUseCase: new RescheduleWorkSessionUseCase(
    workSessionRepository,
    workSessionStateRepository,
    clock,
    db,
  ),
  wrapUpWorkSessionUseCase: new WrapUpWorkSessionUseCase(workSessionRepository, clock, db),
  getRandomWorkSessionCompletionMessageUseCase: new GetRandomWorkSessionCompletionMessageUseCase(),
  listWorkSessionStatesUseCase: new ListWorkSessionStatesUseCase(workSessionStateRepository),
  createAssignmentWorkSessionUseCase: new CreateAssignmentWorkSessionUseCase(
    assignmentWorkSessionRepository,
    assignmentRepository,
    workSessionRepository,
    clock,
    db,
  ),
  getAssignmentWorkSessionByIdUseCase: new GetAssignmentWorkSessionByIdUseCase(assignmentWorkSessionRepository),
  listAssignmentWorkSessionsUseCase: new ListAssignmentWorkSessionsUseCase(assignmentWorkSessionRepository),
  updateAssignmentWorkSessionUseCase: new UpdateAssignmentWorkSessionUseCase(
    assignmentWorkSessionRepository,
    assignmentRepository,
    workSessionRepository,
    db,
  ),
  deleteAssignmentWorkSessionUseCase: new DeleteAssignmentWorkSessionUseCase(
    assignmentWorkSessionRepository,
    assignmentRepository,
    workSessionRepository,
    clock,
    db,
  ),
  markAssignmentWorkedOnUseCase: new MarkAssignmentWorkedOnUseCase(
    assignmentWorkSessionRepository,
    workSessionRepository,
    db,
  ),
  unmarkAssignmentWorkedOnUseCase: new UnmarkAssignmentWorkedOnUseCase(
    assignmentWorkSessionRepository,
    workSessionRepository,
    db,
  ),
  allowedOrigins: ["http://localhost:1420", "tauri://localhost", "https://tauri.localhost"],
});

console.log(`[app-api] listening on http://127.0.0.1:${PORT}`);

export default { port: PORT, hostname: "127.0.0.1", fetch: app.fetch };
