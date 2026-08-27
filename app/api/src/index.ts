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
import { migrate as migrateAssignmentWorkSessionDetachReason } from "./infrastructure/database/migrations/022_add_assignment_work_session_detach_reason_column";
import { migrate as migrateNotificationTable } from "./infrastructure/database/migrations/023_create_notification_table";
import { migrate as migrateWorkSessionWaitConfirmAt } from "./infrastructure/database/migrations/024_add_work_session_wait_confirm_at_column";
import { migrate as migrateWorkSessionSkippedAt } from "./infrastructure/database/migrations/025_add_work_session_skipped_at_column";
import { migrate as migrateNotificationActionTaken } from "./infrastructure/database/migrations/026_add_notification_action_taken_column";
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
import { ConfirmCompleteAssignmentUseCase } from "./application/assignment/ConfirmCompleteAssignmentUseCase";
import { UncompleteAssignmentUseCase } from "./application/assignment/UncompleteAssignmentUseCase";
import { RescheduleAssignmentUseCase } from "./application/assignment/RescheduleAssignmentUseCase";
import { WrapUpAssignmentUseCase } from "./application/assignment/WrapUpAssignmentUseCase";
import { WrapUpLateAssignmentUseCase } from "./application/assignment/WrapUpLateAssignmentUseCase";
import { PurgeDeletedAssignmentsUseCase } from "./application/assignment/PurgeDeletedAssignmentsUseCase";
import { PurgeDeletedCoursesUseCase } from "./application/course/PurgeDeletedCoursesUseCase";
import { PurgeDeletedWorkSessionsUseCase } from "./application/workSession/PurgeDeletedWorkSessionsUseCase";
import { PurgeDeletedAssignmentWorkSessionsUseCase } from "./application/assignmentWorkSession/PurgeDeletedAssignmentWorkSessionsUseCase";
import { ListAssignmentStatesUseCase } from "./application/assignmentState/ListAssignmentStatesUseCase";
import { WorkSessionRepository } from "./infrastructure/database/repositories/WorkSessionRepository";
import { WorkSessionStateRepository } from "./infrastructure/database/repositories/WorkSessionStateRepository";
import { CreateWorkSessionUseCase } from "./application/workSession/CreateWorkSessionUseCase";
import { GetWorkSessionByIdUseCase } from "./application/workSession/GetWorkSessionByIdUseCase";
import { ListWorkSessionsUseCase } from "./application/workSession/ListWorkSessionsUseCase";
import { CompleteWorkSessionUseCase } from "./application/workSession/CompleteWorkSessionUseCase";
import { ConfirmCompleteWorkSessionUseCase } from "./application/workSession/ConfirmCompleteWorkSessionUseCase";
import { ConfirmSkipWorkSessionUseCase } from "./application/workSession/ConfirmSkipWorkSessionUseCase";
import { UncompleteWorkSessionUseCase } from "./application/workSession/UncompleteWorkSessionUseCase";
import { GetRandomWorkSessionCompletionMessageUseCase } from "./application/workSession/GetRandomWorkSessionCompletionMessageUseCase";
import { DeleteWorkSessionUseCase } from "./application/workSession/DeleteWorkSessionUseCase";
import { WrapUpLateWorkSessionUseCase } from "./application/workSession/WrapUpLateWorkSessionUseCase";
import { AutoSkipStaleWorkSessionsUseCase } from "./application/workSession/AutoSkipStaleWorkSessionsUseCase";
import { AutoWrapUpLateStaleWorkSessionsUseCase } from "./application/workSession/AutoWrapUpLateStaleWorkSessionsUseCase";
import { RescheduleWorkSessionUseCase } from "./application/workSession/RescheduleWorkSessionUseCase";
import { EditWorkSessionUseCase } from "./application/workSession/EditWorkSessionUseCase";
import { CloseWorkSessionUseCase } from "./application/workSession/CloseWorkSessionUseCase";
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
import { NotificationRepository } from "./infrastructure/database/repositories/NotificationRepository";
import { ListNotificationsUseCase } from "./application/notification/ListNotificationsUseCase";
import { MarkNotificationReadUseCase } from "./application/notification/MarkNotificationReadUseCase";
import { GetNotificationByIdUseCase } from "./application/notification/GetNotificationByIdUseCase";
import { CheckOverdueAssignmentsUseCase } from "./application/notification/CheckOverdueAssignmentsUseCase";
import { CheckMissedWorkSessionsUseCase } from "./application/notification/CheckMissedWorkSessionsUseCase";
import { CheckUpcomingAssignmentsUseCase } from "./application/notification/CheckUpcomingAssignmentsUseCase";
import { PurgeDeletedNotificationsUseCase } from "./application/notification/PurgeDeletedNotificationsUseCase";

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
migrateAssignmentWorkSessionDetachReason(db);
migrateNotificationTable(db);
migrateWorkSessionWaitConfirmAt(db);
migrateWorkSessionSkippedAt(db);
migrateNotificationActionTaken(db);

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
const notificationRepository = new NotificationRepository(db);
const workSessionMergeService = new WorkSessionMergeService(
  workSessionRepository,
  assignmentWorkSessionRepository,
  workSessionStateRepository,
  clock,
);

const purgeDeletedAssignmentsUseCase = new PurgeDeletedAssignmentsUseCase(assignmentRepository, clock);
const purgeDeletedCoursesUseCase = new PurgeDeletedCoursesUseCase(courseRepository, clock);
const purgeDeletedWorkSessionsUseCase = new PurgeDeletedWorkSessionsUseCase(workSessionRepository, clock);
const purgeDeletedAssignmentWorkSessionsUseCase = new PurgeDeletedAssignmentWorkSessionsUseCase(
  assignmentWorkSessionRepository,
  clock,
);
const purgeDeletedNotificationsUseCase = new PurgeDeletedNotificationsUseCase(notificationRepository, clock);
const runPurge = () => {
  const purgedAssignments = purgeDeletedAssignmentsUseCase.execute();
  if (purgedAssignments > 0) {
    console.log(`[app-api] purged ${purgedAssignments} expired soft-deleted assignment(s)`);
  }
  const purgedCourses = purgeDeletedCoursesUseCase.execute();
  if (purgedCourses > 0) {
    console.log(`[app-api] purged ${purgedCourses} expired soft-deleted course(s)`);
  }
  const purgedWorkSessions = purgeDeletedWorkSessionsUseCase.execute();
  if (purgedWorkSessions > 0) {
    console.log(`[app-api] purged ${purgedWorkSessions} expired soft-deleted work session(s)`);
  }
  const purgedAssignmentWorkSessions = purgeDeletedAssignmentWorkSessionsUseCase.execute();
  if (purgedAssignmentWorkSessions > 0) {
    console.log(`[app-api] purged ${purgedAssignmentWorkSessions} expired soft-deleted assignment-work-session link(s)`);
  }
  const purgedNotifications = purgeDeletedNotificationsUseCase.execute();
  if (purgedNotifications > 0) {
    console.log(`[app-api] purged ${purgedNotifications} expired soft-deleted notification(s)`);
  }
};
runPurge();
const PURGE_INTERVAL_MS = 24 * 60 * 60 * 1000;
setInterval(runPurge, PURGE_INTERVAL_MS).unref();

// Notification checks: run once at every launch, then every 60s while the app is open
const checkOverdueAssignmentsUseCase = new CheckOverdueAssignmentsUseCase(
  assignmentRepository,
  assignmentStateRepository,
  notificationRepository,
  clock,
);
const checkMissedWorkSessionsUseCase = new CheckMissedWorkSessionsUseCase(
  workSessionRepository,
  workSessionStateRepository,
  notificationRepository,
  clock,
);
const checkUpcomingAssignmentsUseCase = new CheckUpcomingAssignmentsUseCase(
  assignmentRepository,
  notificationRepository,
  clock,
);
const autoSkipStaleWorkSessionsUseCase = new AutoSkipStaleWorkSessionsUseCase(
  workSessionRepository,
  workSessionStateRepository,
  clock,
);
const autoWrapUpLateStaleWorkSessionsUseCase = new AutoWrapUpLateStaleWorkSessionsUseCase(
  workSessionRepository,
  workSessionStateRepository,
  assignmentWorkSessionRepository,
  notificationRepository,
  clock,
);
const runNotificationChecks = () => {
  const overdueCount = checkOverdueAssignmentsUseCase.execute();
  if (overdueCount > 0) {
    console.log(`[app-api] flagged ${overdueCount} overdue assignment(s) as WAIT_CONFIRM`);
  }
  const missedCount = checkMissedWorkSessionsUseCase.execute();
  if (missedCount > 0) {
    console.log(`[app-api] flagged ${missedCount} missed work session(s) as WAIT_CONFIRM`);
  }
  const dueSoonCount = checkUpcomingAssignmentsUseCase.execute();
  if (dueSoonCount > 0) {
    console.log(`[app-api] created ${dueSoonCount} due-soon assignment notification(s)`);
  }
  const autoSkippedCount = autoSkipStaleWorkSessionsUseCase.execute();
  if (autoSkippedCount > 0) {
    console.log(`[app-api] auto-skipped ${autoSkippedCount} stale WAIT_CONFIRM work session(s)`);
  }
  const autoWrappedUpCount = autoWrapUpLateStaleWorkSessionsUseCase.execute();
  if (autoWrappedUpCount > 0) {
    console.log(`[app-api] auto-wrapped-up ${autoWrappedUpCount} stale SKIPPED work session(s)`);
  }
};
runNotificationChecks();
const NOTIFICATION_CHECK_INTERVAL_MS = 60 * 1000;
setInterval(runNotificationChecks, NOTIFICATION_CHECK_INTERVAL_MS).unref();

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
  completeAssignmentUseCase: new CompleteAssignmentUseCase(
    assignmentRepository,
    assignmentStateRepository,
    assignmentWorkSessionRepository,
    workSessionRepository,
    notificationRepository,
    clock,
    db,
  ),
  confirmCompleteAssignmentUseCase: new ConfirmCompleteAssignmentUseCase(
    assignmentRepository,
    assignmentStateRepository,
    assignmentWorkSessionRepository,
    workSessionRepository,
    notificationRepository,
    clock,
    db,
  ),
  uncompleteAssignmentUseCase: new UncompleteAssignmentUseCase(
    assignmentRepository,
    assignmentStateRepository,
    assignmentWorkSessionRepository,
    workSessionRepository,
    clock,
    db,
  ),
  rescheduleAssignmentUseCase: new RescheduleAssignmentUseCase(
    assignmentRepository,
    assignmentStateRepository,
    notificationRepository,
    clock,
    db,
  ),
  wrapUpAssignmentUseCase: new WrapUpAssignmentUseCase(assignmentRepository, assignmentWorkSessionRepository, clock, db),
  wrapUpLateAssignmentUseCase: new WrapUpLateAssignmentUseCase(assignmentRepository, notificationRepository, clock, db),
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
  completeWorkSessionUseCase: new CompleteWorkSessionUseCase(
    workSessionRepository,
    workSessionStateRepository,
    clock,
    db,
  ),
  confirmCompleteWorkSessionUseCase: new ConfirmCompleteWorkSessionUseCase(
    workSessionRepository,
    workSessionStateRepository,
    notificationRepository,
    clock,
    db,
  ),
  confirmSkipWorkSessionUseCase: new ConfirmSkipWorkSessionUseCase(
    workSessionRepository,
    workSessionStateRepository,
    notificationRepository,
    clock,
    db,
  ),
  uncompleteWorkSessionUseCase: new UncompleteWorkSessionUseCase(
    workSessionRepository,
    workSessionStateRepository,
    workSessionMergeService,
    clock,
    db,
  ),
  deleteWorkSessionUseCase: new DeleteWorkSessionUseCase(
    workSessionRepository,
    workSessionStateRepository,
    assignmentWorkSessionRepository,
    notificationRepository,
    clock,
    db,
  ),
  wrapUpLateWorkSessionUseCase: new WrapUpLateWorkSessionUseCase(
    workSessionRepository,
    workSessionStateRepository,
    assignmentWorkSessionRepository,
    notificationRepository,
    clock,
    db,
  ),
  rescheduleWorkSessionUseCase: new RescheduleWorkSessionUseCase(
    workSessionRepository,
    workSessionStateRepository,
    notificationRepository,
    clock,
    db,
  ),
  editWorkSessionUseCase: new EditWorkSessionUseCase(workSessionRepository, workSessionStateRepository, clock, db),
  closeWorkSessionUseCase: new CloseWorkSessionUseCase(workSessionRepository, clock, db),
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
  listNotificationsUseCase: new ListNotificationsUseCase(notificationRepository),
  markNotificationReadUseCase: new MarkNotificationReadUseCase(notificationRepository),
  getNotificationByIdUseCase: new GetNotificationByIdUseCase(notificationRepository),
  allowedOrigins: ["http://localhost:1420", "tauri://localhost", "https://tauri.localhost"],
});

console.log(`[app-api] listening on http://127.0.0.1:${PORT}`);

export default { port: PORT, hostname: "127.0.0.1", fetch: app.fetch };
