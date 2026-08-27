import { beforeEach, describe, expect, test } from "bun:test";
import type { Database } from "bun:sqlite";
import { AssignmentRepository } from "../src/infrastructure/database/repositories/AssignmentRepository";
import { AssignmentStateRepository } from "../src/infrastructure/database/repositories/AssignmentStateRepository";
import { AssignmentWorkSessionRepository } from "../src/infrastructure/database/repositories/AssignmentWorkSessionRepository";
import { WorkSessionRepository } from "../src/infrastructure/database/repositories/WorkSessionRepository";
import { WorkSessionStateRepository } from "../src/infrastructure/database/repositories/WorkSessionStateRepository";
import { NotificationRepository } from "../src/infrastructure/database/repositories/NotificationRepository";
import { CheckOverdueAssignmentsUseCase } from "../src/application/notification/CheckOverdueAssignmentsUseCase";
import { CheckMissedWorkSessionsUseCase } from "../src/application/notification/CheckMissedWorkSessionsUseCase";
import { CheckUpcomingAssignmentsUseCase } from "../src/application/notification/CheckUpcomingAssignmentsUseCase";
import { ListNotificationsUseCase } from "../src/application/notification/ListNotificationsUseCase";
import { PurgeDeletedNotificationsUseCase } from "../src/application/notification/PurgeDeletedNotificationsUseCase";
import { MarkNotificationReadUseCase } from "../src/application/notification/MarkNotificationReadUseCase";
import { GetNotificationByIdUseCase } from "../src/application/notification/GetNotificationByIdUseCase";
import { ConfirmCompleteAssignmentUseCase } from "../src/application/assignment/ConfirmCompleteAssignmentUseCase";
import { RescheduleAssignmentUseCase } from "../src/application/assignment/RescheduleAssignmentUseCase";
import { WrapUpLateAssignmentUseCase } from "../src/application/assignment/WrapUpLateAssignmentUseCase";
import { RescheduleWorkSessionUseCase } from "../src/application/workSession/RescheduleWorkSessionUseCase";
import { DeleteWorkSessionUseCase } from "../src/application/workSession/DeleteWorkSessionUseCase";
import { WrapUpLateWorkSessionUseCase } from "../src/application/workSession/WrapUpLateWorkSessionUseCase";
import { CompleteWorkSessionUseCase } from "../src/application/workSession/CompleteWorkSessionUseCase";
import { ConfirmCompleteWorkSessionUseCase } from "../src/application/workSession/ConfirmCompleteWorkSessionUseCase";
import { ConfirmSkipWorkSessionUseCase } from "../src/application/workSession/ConfirmSkipWorkSessionUseCase";
import { UncompleteWorkSessionUseCase } from "../src/application/workSession/UncompleteWorkSessionUseCase";
import { AutoSkipStaleWorkSessionsUseCase } from "../src/application/workSession/AutoSkipStaleWorkSessionsUseCase";
import { AutoWrapUpLateStaleWorkSessionsUseCase } from "../src/application/workSession/AutoWrapUpLateStaleWorkSessionsUseCase";
import { CreateWorkSessionUseCase } from "../src/application/workSession/CreateWorkSessionUseCase";
import { WorkSessionMergeService } from "../src/application/workSession/WorkSessionMergeService";
import {
  CannotCompleteNonInProgressWorkSessionError,
  CannotUncompleteNonCompletedWorkSessionError,
  CannotDeleteNonInProgressWorkSessionError,
  CannotConfirmSkipNonWaitConfirmWorkSessionError,
  CannotConfirmCompleteNonWaitConfirmWorkSessionError,
  CannotWrapUpLateNonSkippedWorkSessionError,
} from "../src/domain/workSession/WorkSessionError";
import { WorkSession } from "../src/domain/workSession/WorkSession";
import {
  createTestDatabase,
  makeCourse,
  makeAssignment,
  makeNotification,
  FixedClock,
  NOW,
  PAST,
  FUTURE,
  stateIdFor,
  workSessionStateIdFor,
} from "./support/fixtures";

let db: Database;
let clock: FixedClock;
let assignmentRepository: AssignmentRepository;
let assignmentStateRepository: AssignmentStateRepository;
let linkRepository: AssignmentWorkSessionRepository;
let workSessionRepository: WorkSessionRepository;
let workSessionStateRepository: WorkSessionStateRepository;
let notificationRepository: NotificationRepository;

let checkOverdueAssignments: CheckOverdueAssignmentsUseCase;
let checkMissedWorkSessions: CheckMissedWorkSessionsUseCase;
let checkUpcomingAssignments: CheckUpcomingAssignmentsUseCase;
let listNotifications: ListNotificationsUseCase;
let purgeNotifications: PurgeDeletedNotificationsUseCase;
let markNotificationRead: MarkNotificationReadUseCase;
let getNotificationById: GetNotificationByIdUseCase;
let confirmCompleteAssignment: ConfirmCompleteAssignmentUseCase;
let rescheduleAssignment: RescheduleAssignmentUseCase;
let wrapUpLateAssignment: WrapUpLateAssignmentUseCase;
let rescheduleWorkSession: RescheduleWorkSessionUseCase;
let deleteWorkSession: DeleteWorkSessionUseCase;
let wrapUpLateWorkSession: WrapUpLateWorkSessionUseCase;
let completeWorkSession: CompleteWorkSessionUseCase;
let confirmCompleteWorkSession: ConfirmCompleteWorkSessionUseCase;
let confirmSkipWorkSession: ConfirmSkipWorkSessionUseCase;
let uncompleteWorkSession: UncompleteWorkSessionUseCase;
let autoSkipStaleWorkSessions: AutoSkipStaleWorkSessionsUseCase;
let autoWrapUpLateStaleWorkSessions: AutoWrapUpLateStaleWorkSessionsUseCase;
let createWorkSession: CreateWorkSessionUseCase;

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

beforeEach(() => {
  db = createTestDatabase();
  clock = new FixedClock(NOW);
  assignmentRepository = new AssignmentRepository(db);
  assignmentStateRepository = new AssignmentStateRepository(db);
  linkRepository = new AssignmentWorkSessionRepository(db);
  workSessionRepository = new WorkSessionRepository(db);
  workSessionStateRepository = new WorkSessionStateRepository(db);
  notificationRepository = new NotificationRepository(db);
  makeCourse(db);

  checkOverdueAssignments = new CheckOverdueAssignmentsUseCase(
    assignmentRepository,
    assignmentStateRepository,
    notificationRepository,
    clock,
  );
  checkMissedWorkSessions = new CheckMissedWorkSessionsUseCase(
    workSessionRepository,
    workSessionStateRepository,
    notificationRepository,
    clock,
  );
  checkUpcomingAssignments = new CheckUpcomingAssignmentsUseCase(assignmentRepository, notificationRepository, clock);
  listNotifications = new ListNotificationsUseCase(notificationRepository);
  purgeNotifications = new PurgeDeletedNotificationsUseCase(notificationRepository, clock);
  markNotificationRead = new MarkNotificationReadUseCase(notificationRepository);
  getNotificationById = new GetNotificationByIdUseCase(notificationRepository);
  confirmCompleteAssignment = new ConfirmCompleteAssignmentUseCase(
    assignmentRepository,
    assignmentStateRepository,
    linkRepository,
    workSessionRepository,
    notificationRepository,
    clock,
    db,
  );
  rescheduleAssignment = new RescheduleAssignmentUseCase(
    assignmentRepository,
    assignmentStateRepository,
    notificationRepository,
    clock,
    db,
  );
  wrapUpLateAssignment = new WrapUpLateAssignmentUseCase(assignmentRepository, notificationRepository, clock, db);
  rescheduleWorkSession = new RescheduleWorkSessionUseCase(
    workSessionRepository,
    workSessionStateRepository,
    notificationRepository,
    clock,
    db,
  );
  deleteWorkSession = new DeleteWorkSessionUseCase(
    workSessionRepository,
    workSessionStateRepository,
    linkRepository,
    notificationRepository,
    clock,
    db,
  );
  wrapUpLateWorkSession = new WrapUpLateWorkSessionUseCase(
    workSessionRepository,
    workSessionStateRepository,
    linkRepository,
    notificationRepository,
    clock,
    db,
  );
  completeWorkSession = new CompleteWorkSessionUseCase(workSessionRepository, workSessionStateRepository, clock, db);
  confirmCompleteWorkSession = new ConfirmCompleteWorkSessionUseCase(
    workSessionRepository,
    workSessionStateRepository,
    notificationRepository,
    clock,
    db,
  );
  confirmSkipWorkSession = new ConfirmSkipWorkSessionUseCase(
    workSessionRepository,
    workSessionStateRepository,
    notificationRepository,
    clock,
    db,
  );
  uncompleteWorkSession = new UncompleteWorkSessionUseCase(
    workSessionRepository,
    workSessionStateRepository,
    new WorkSessionMergeService(workSessionRepository, linkRepository, workSessionStateRepository, clock),
    clock,
    db,
  );
  autoSkipStaleWorkSessions = new AutoSkipStaleWorkSessionsUseCase(
    workSessionRepository,
    workSessionStateRepository,
    clock,
  );
  autoWrapUpLateStaleWorkSessions = new AutoWrapUpLateStaleWorkSessionsUseCase(
    workSessionRepository,
    workSessionStateRepository,
    linkRepository,
    notificationRepository,
    clock,
  );
  createWorkSession = new CreateWorkSessionUseCase(
    workSessionRepository,
    workSessionStateRepository,
    new WorkSessionMergeService(workSessionRepository, linkRepository, workSessionStateRepository, clock),
    clock,
    db,
  );
});

function createOverdueAssignment(id = "assignment-overdue") {
  return assignmentRepository.create(
    makeAssignment({ id, dueDate: PAST, assignmentStateId: stateIdFor(db, "UNCOMPLETED") }),
  );
}

function createMissedWorkSession(id = "session-missed") {
  return workSessionRepository.create(
    WorkSession.create({
      id,
      workSessionStateId: workSessionStateIdFor(db, "INPROGRESS"),
      startTime: new Date(PAST.getTime() - 60 * 60 * 1000),
      endTime: PAST,
      completedAt: null,
      createdAt: PAST,
    }),
  );
}

describe("CheckOverdueAssignmentsUseCase", () => {
  test("flags an overdue, uncompleted assignment as WAIT_CONFIRM and creates a notification", () => {
    const assignment = createOverdueAssignment();

    const flagged = checkOverdueAssignments.execute();

    expect(flagged).toBe(1);
    expect(assignmentRepository.getById(assignment.id)?.assignmentStateId).toBe(stateIdFor(db, "WAIT_CONFIRM"));
    const notifications = listNotifications.execute({ limit: 20, offset: 0 }).items;
    expect(notifications).toHaveLength(1);
    expect(notifications[0].type).toBe("ASSIGNMENT_OVERDUE");
    expect(notifications[0].entityType).toBe("ASSIGNMENT");
    expect(notifications[0].entityId).toBe(assignment.id);
  });

  test("is a no-op on a second run (already WAIT_CONFIRM)", () => {
    createOverdueAssignment();
    checkOverdueAssignments.execute();

    const flaggedAgain = checkOverdueAssignments.execute();

    expect(flaggedAgain).toBe(0);
    expect(listNotifications.execute({ limit: 20, offset: 0 }).items).toHaveLength(1);
  });

  test("ignores an upcoming assignment", () => {
    assignmentRepository.create(
      makeAssignment({ id: "assignment-upcoming", dueDate: FUTURE, assignmentStateId: stateIdFor(db, "UNCOMPLETED") }),
    );

    expect(checkOverdueAssignments.execute()).toBe(0);
    expect(listNotifications.execute({ limit: 20, offset: 0 }).items).toHaveLength(0);
  });

  test("ignores an already-completed assignment even if its due date has passed", () => {
    assignmentRepository.create(
      makeAssignment({
        id: "assignment-done",
        dueDate: PAST,
        completedAt: NOW,
        assignmentStateId: stateIdFor(db, "COMPLETED"),
      }),
    );

    expect(checkOverdueAssignments.execute()).toBe(0);
    expect(listNotifications.execute({ limit: 20, offset: 0 }).items).toHaveLength(0);
  });
});

describe("CheckMissedWorkSessionsUseCase", () => {
  test("flags a missed session as WAIT_CONFIRM and creates a notification", () => {
    const session = createMissedWorkSession();

    const flagged = checkMissedWorkSessions.execute();

    expect(flagged).toBe(1);
    expect(workSessionRepository.getById(session.id)?.workSessionStateId).toBe(workSessionStateIdFor(db, "WAIT_CONFIRM"));
    const notifications = listNotifications.execute({ limit: 20, offset: 0 }).items;
    expect(notifications).toHaveLength(1);
    expect(notifications[0].type).toBe("WORK_SESSION_SKIPPED");
    expect(notifications[0].entityType).toBe("WORK_SESSION");
    expect(notifications[0].entityId).toBe(session.id);
  });

  test("is a no-op on a second run (already WAIT_CONFIRM)", () => {
    createMissedWorkSession();
    checkMissedWorkSessions.execute();

    expect(checkMissedWorkSessions.execute()).toBe(0);
    expect(listNotifications.execute({ limit: 20, offset: 0 }).items).toHaveLength(1);
  });

  test("leaves a SKIPPED session alone (does not re-flag an already-confirmed skip)", () => {
    const session = workSessionRepository.create(
      WorkSession.create({
        id: "session-already-skipped",
        workSessionStateId: workSessionStateIdFor(db, "SKIPPED"),
        startTime: new Date(PAST.getTime() - 60 * 60 * 1000),
        endTime: PAST,
        completedAt: null,
        skippedAt: PAST,
        createdAt: PAST,
      }),
    );

    expect(checkMissedWorkSessions.execute()).toBe(0);
    expect(workSessionRepository.getById(session.id)?.workSessionStateId).toBe(workSessionStateIdFor(db, "SKIPPED"));
    expect(listNotifications.execute({ limit: 20, offset: 0 }).items).toHaveLength(0);
  });

  test("ignores a future session", () => {
    workSessionRepository.create(
      WorkSession.create({
        id: "session-future",
        workSessionStateId: workSessionStateIdFor(db, "INPROGRESS"),
        startTime: FUTURE,
        endTime: new Date(FUTURE.getTime() + 60 * 60 * 1000),
        completedAt: null,
        createdAt: NOW,
      }),
    );

    expect(checkMissedWorkSessions.execute()).toBe(0);
  });

  test("ignores a completed session even if its end time has passed", () => {
    workSessionRepository.create(
      WorkSession.create({
        id: "session-completed",
        workSessionStateId: workSessionStateIdFor(db, "COMPLETED"),
        startTime: new Date(PAST.getTime() - 60 * 60 * 1000),
        endTime: PAST,
        completedAt: PAST,
        createdAt: PAST,
      }),
    );

    expect(checkMissedWorkSessions.execute()).toBe(0);
  });
});

describe("CheckUpcomingAssignmentsUseCase", () => {
  test("creates ASSIGNMENT_DUE_SOON for an assignment due within 2 days", () => {
    const assignment = assignmentRepository.create(
      makeAssignment({
        id: "assignment-due-soon",
        dueDate: new Date(NOW.getTime() + ONE_DAY_MS),
        assignmentStateId: stateIdFor(db, "UNCOMPLETED"),
      }),
    );

    const created = checkUpcomingAssignments.execute();

    expect(created).toBe(1);
    const notifications = listNotifications.execute({ limit: 20, offset: 0 }).items;
    expect(notifications).toHaveLength(1);
    expect(notifications[0].type).toBe("ASSIGNMENT_DUE_SOON");
    expect(notifications[0].entityId).toBe(assignment.id);
  });

  test("ignores an assignment due more than 2 days out", () => {
    assignmentRepository.create(
      makeAssignment({
        id: "assignment-far",
        dueDate: new Date(NOW.getTime() + 3 * ONE_DAY_MS),
        assignmentStateId: stateIdFor(db, "UNCOMPLETED"),
      }),
    );

    expect(checkUpcomingAssignments.execute()).toBe(0);
  });

  test("ignores an already-overdue assignment", () => {
    createOverdueAssignment();

    expect(checkUpcomingAssignments.execute()).toBe(0);
  });

  test("does not duplicate while the prior notification is unread", () => {
    assignmentRepository.create(
      makeAssignment({
        id: "assignment-due-soon",
        dueDate: new Date(NOW.getTime() + ONE_DAY_MS),
        assignmentStateId: stateIdFor(db, "UNCOMPLETED"),
      }),
    );
    checkUpcomingAssignments.execute();

    expect(checkUpcomingAssignments.execute()).toBe(0);
    expect(listNotifications.execute({ limit: 20, offset: 0 }).items).toHaveLength(1);
  });

  test("creates a new notification once the prior one has been read", () => {
    assignmentRepository.create(
      makeAssignment({
        id: "assignment-due-soon",
        dueDate: new Date(NOW.getTime() + ONE_DAY_MS),
        assignmentStateId: stateIdFor(db, "UNCOMPLETED"),
      }),
    );
    checkUpcomingAssignments.execute();
    const [existing] = listNotifications.execute({ limit: 20, offset: 0 }).items;
    notificationRepository.markAsRead(existing.id);

    const created = checkUpcomingAssignments.execute();

    expect(created).toBe(1);
    const items = listNotifications.execute({ limit: 20, offset: 0 }).items;
    expect(items).toHaveLength(2);
    expect(items.filter((n) => n.isRead)).toHaveLength(1);
    expect(items.filter((n) => !n.isRead)).toHaveLength(1);
  });
});

describe("auto-resolve on assignment resolution", () => {
  test("confirm-completing an overdue assignment marks its notification as read", () => {
    const assignment = createOverdueAssignment();
    checkOverdueAssignments.execute();
    expect(listNotifications.execute({ limit: 20, offset: 0 }).items).toHaveLength(1);

    confirmCompleteAssignment.execute(assignment.id);

    const items = listNotifications.execute({ limit: 20, offset: 0 }).items;
    expect(items).toHaveLength(1);
    expect(items[0].isRead).toBe(true);
    expect(items[0].actionTaken).toBe(true);
  });

  test("rescheduling an overdue assignment marks its notification as read and resets state", () => {
    const assignment = createOverdueAssignment();
    checkOverdueAssignments.execute();

    const rescheduled = rescheduleAssignment.execute({ id: assignment.id, dueDate: FUTURE });

    expect(rescheduled.assignmentStateId).toBe(stateIdFor(db, "UNCOMPLETED"));
    const items = listNotifications.execute({ limit: 20, offset: 0 }).items;
    expect(items).toHaveLength(1);
    expect(items[0].isRead).toBe(true);
    expect(items[0].actionTaken).toBe(true);
  });

  test("wrapping up late an overdue assignment marks its notification as read", () => {
    const assignment = createOverdueAssignment();
    checkOverdueAssignments.execute();

    wrapUpLateAssignment.execute(assignment.id);

    const items = listNotifications.execute({ limit: 20, offset: 0 }).items;
    expect(items).toHaveLength(1);
    expect(items[0].isRead).toBe(true);
    expect(items[0].actionTaken).toBe(true);
  });
});

describe("auto-resolve on work session resolution", () => {
  test("rescheduling a skipped session marks its notification as read", () => {
    const session = createMissedWorkSession();
    checkMissedWorkSessions.execute();
    confirmSkipWorkSession.execute(session.id);
    // Confirming skip already marks the notification read; simulate a fresh unread one to prove reschedule also marks it read.
    notificationRepository.create(makeNotification({ id: "notification-skip-3", entityType: "WORK_SESSION", entityId: session.id, type: "WORK_SESSION_SKIPPED" }));

    rescheduleWorkSession.execute({
      id: session.id,
      startTime: FUTURE,
      endTime: new Date(FUTURE.getTime() + 60 * 60 * 1000),
    });

    const items = listNotifications.execute({ limit: 20, offset: 0 }).items;
    expect(items.every((n) => n.isRead)).toBe(true);
    expect(items.every((n) => n.actionTaken)).toBe(true);
  });

  test("confirm-skipping a missed session marks its notification as read", () => {
    const session = createMissedWorkSession();
    checkMissedWorkSessions.execute();

    confirmSkipWorkSession.execute(session.id);

    const items = listNotifications.execute({ limit: 20, offset: 0 }).items;
    expect(items).toHaveLength(1);
    expect(items[0].isRead).toBe(true);
    expect(items[0].actionTaken).toBe(true);
  });

  test("wrapping up late a skipped session marks its notification as read", () => {
    const session = createMissedWorkSession();
    checkMissedWorkSessions.execute();
    confirmSkipWorkSession.execute(session.id);
    // Confirming skip already marks the notification read; simulate a fresh unread one to prove wrap-up-late also marks it read.
    notificationRepository.create(makeNotification({ id: "notification-skip-2", entityType: "WORK_SESSION", entityId: session.id, type: "WORK_SESSION_SKIPPED" }));

    wrapUpLateWorkSession.execute(session.id);

    const items = listNotifications.execute({ limit: 20, offset: 0 }).items;
    expect(items.every((n) => n.isRead)).toBe(true);
    expect(items.every((n) => n.actionTaken)).toBe(true);
  });
});

describe("CompleteWorkSessionUseCase / UncompleteWorkSessionUseCase WAIT_CONFIRM guards", () => {
  test("CompleteWorkSessionUseCase rejects a WAIT_CONFIRM session", () => {
    const session = createMissedWorkSession();
    checkMissedWorkSessions.execute();

    expect(() => completeWorkSession.execute(session.id)).toThrow(CannotCompleteNonInProgressWorkSessionError);
  });

  test("UncompleteWorkSessionUseCase rejects a WAIT_CONFIRM session", () => {
    const session = createMissedWorkSession();
    checkMissedWorkSessions.execute();

    expect(() => uncompleteWorkSession.execute(session.id)).toThrow(CannotUncompleteNonCompletedWorkSessionError);
  });
});

describe("ConfirmCompleteWorkSessionUseCase", () => {
  test("completes a WAIT_CONFIRM session and marks its notification as read", () => {
    const session = createMissedWorkSession();
    checkMissedWorkSessions.execute();

    const result = confirmCompleteWorkSession.execute(session.id);

    expect(result.workSessionStateId).toBe(workSessionStateIdFor(db, "COMPLETED"));
    expect(result.completedAt).toEqual(NOW);
    expect(result.waitConfirmAt).toBeNull();
    const items = listNotifications.execute({ limit: 20, offset: 0 }).items;
    expect(items).toHaveLength(1);
    expect(items[0].isRead).toBe(true);
    expect(items[0].actionTaken).toBe(true);
  });

  test("rejects an in-progress session", () => {
    const session = createMissedWorkSession();

    expect(() => confirmCompleteWorkSession.execute(session.id)).toThrow(
      CannotConfirmCompleteNonWaitConfirmWorkSessionError,
    );
  });
});

describe("ConfirmSkipWorkSessionUseCase", () => {
  test("marks a WAIT_CONFIRM session as SKIPPED, stamps skippedAt, and marks its notification as read", () => {
    const session = createMissedWorkSession();
    checkMissedWorkSessions.execute();

    const result = confirmSkipWorkSession.execute(session.id);

    expect(result.workSessionStateId).toBe(workSessionStateIdFor(db, "SKIPPED"));
    expect(result.skippedAt).toEqual(NOW);
    expect(result.waitConfirmAt).toBeNull();
    const items = listNotifications.execute({ limit: 20, offset: 0 }).items;
    expect(items).toHaveLength(1);
    expect(items[0].isRead).toBe(true);
    expect(items[0].actionTaken).toBe(true);
  });

  test("rejects an in-progress session", () => {
    const session = createMissedWorkSession();

    expect(() => confirmSkipWorkSession.execute(session.id)).toThrow(
      CannotConfirmSkipNonWaitConfirmWorkSessionError,
    );
  });
});

describe("DeleteWorkSessionUseCase / WrapUpLateWorkSessionUseCase guards", () => {
  test("DeleteWorkSessionUseCase allows an in-progress session", () => {
    const session = createMissedWorkSession();

    expect(() => deleteWorkSession.execute(session.id)).not.toThrow();
  });

  test("DeleteWorkSessionUseCase rejects a WAIT_CONFIRM session", () => {
    const session = createMissedWorkSession();
    checkMissedWorkSessions.execute();

    expect(() => deleteWorkSession.execute(session.id)).toThrow(CannotDeleteNonInProgressWorkSessionError);
  });

  test("DeleteWorkSessionUseCase rejects a SKIPPED session", () => {
    const session = createMissedWorkSession();
    checkMissedWorkSessions.execute();
    confirmSkipWorkSession.execute(session.id);

    expect(() => deleteWorkSession.execute(session.id)).toThrow(CannotDeleteNonInProgressWorkSessionError);
  });

  test("WrapUpLateWorkSessionUseCase rejects an in-progress session", () => {
    const session = createMissedWorkSession();

    expect(() => wrapUpLateWorkSession.execute(session.id)).toThrow(CannotWrapUpLateNonSkippedWorkSessionError);
  });

  test("WrapUpLateWorkSessionUseCase rejects a WAIT_CONFIRM session", () => {
    const session = createMissedWorkSession();
    checkMissedWorkSessions.execute();

    expect(() => wrapUpLateWorkSession.execute(session.id)).toThrow(CannotWrapUpLateNonSkippedWorkSessionError);
  });

  test("WrapUpLateWorkSessionUseCase soft-deletes a skipped session", () => {
    const session = createMissedWorkSession();
    checkMissedWorkSessions.execute();
    confirmSkipWorkSession.execute(session.id);

    const result = wrapUpLateWorkSession.execute(session.id);

    expect(result.isDeleted).toBe(true);
    expect(workSessionRepository.getById(session.id)).toBeNull();
  });
});

describe("CreateWorkSessionUseCase", () => {
  test("always creates a session in the INPROGRESS state", () => {
    const result = createWorkSession.execute({ startTime: FUTURE, endTime: new Date(FUTURE.getTime() + 60 * 60 * 1000) });

    expect(result.session.workSessionStateId).toBe(workSessionStateIdFor(db, "INPROGRESS"));
    expect(result.session.completedAt).toBeNull();
  });
});

describe("AutoSkipStaleWorkSessionsUseCase", () => {
  test("skips a WAIT_CONFIRM session stale for more than a week", () => {
    const session = createMissedWorkSession();
    checkMissedWorkSessions.execute();
    clock.set(new Date(NOW.getTime() + 8 * ONE_DAY_MS));

    const count = autoSkipStaleWorkSessions.execute();

    expect(count).toBe(1);
    const updated = workSessionRepository.getById(session.id);
    expect(updated?.workSessionStateId).toBe(workSessionStateIdFor(db, "SKIPPED"));
    expect(updated?.skippedAt).toEqual(new Date(NOW.getTime() + 8 * ONE_DAY_MS));
    expect(updated?.waitConfirmAt).toBeNull();
  });

  test("leaves a WAIT_CONFIRM session under a week old untouched", () => {
    createMissedWorkSession();
    checkMissedWorkSessions.execute();
    clock.set(new Date(NOW.getTime() + 6 * ONE_DAY_MS));

    expect(autoSkipStaleWorkSessions.execute()).toBe(0);
  });
});

describe("AutoWrapUpLateStaleWorkSessionsUseCase", () => {
  test("wraps up a SKIPPED session stale for more than a week", () => {
    const session = createMissedWorkSession();
    checkMissedWorkSessions.execute();
    confirmSkipWorkSession.execute(session.id);
    clock.set(new Date(NOW.getTime() + 8 * ONE_DAY_MS));

    const count = autoWrapUpLateStaleWorkSessions.execute();

    expect(count).toBe(1);
    expect(workSessionRepository.getById(session.id)).toBeNull();
  });

  test("leaves a SKIPPED session under a week old untouched", () => {
    const session = createMissedWorkSession();
    checkMissedWorkSessions.execute();
    confirmSkipWorkSession.execute(session.id);
    clock.set(new Date(NOW.getTime() + 6 * ONE_DAY_MS));

    expect(autoWrapUpLateStaleWorkSessions.execute()).toBe(0);
    expect(workSessionRepository.getById(session.id)).not.toBeNull();
  });
});

describe("PurgeDeletedNotificationsUseCase", () => {
  test("hard-deletes a notification past the 7-day retention window", () => {
    const eightDaysAgo = new Date(NOW.getTime() - 8 * ONE_DAY_MS);
    notificationRepository.create(
      makeNotification({
        id: "notification-old",
        isRead: true,
        isDeleted: true,
        deletedAt: eightDaysAgo,
        createdAt: eightDaysAgo,
      }),
    );

    const purged = purgeNotifications.execute();

    expect(purged).toBe(1);
  });

  test("leaves a recently soft-deleted notification alone", () => {
    const oneDayAgo = new Date(NOW.getTime() - ONE_DAY_MS);
    notificationRepository.create(
      makeNotification({
        id: "notification-recent",
        isRead: true,
        isDeleted: true,
        deletedAt: oneDayAgo,
        createdAt: oneDayAgo,
      }),
    );

    expect(purgeNotifications.execute()).toBe(0);
  });

  test("leaves an active (not deleted) notification alone", () => {
    notificationRepository.create(makeNotification({ id: "notification-active" }));

    expect(purgeNotifications.execute()).toBe(0);
  });
});

describe("countUnread / unreadCount", () => {
  test("countUnread only counts unread, non-deleted notifications", () => {
    notificationRepository.create(makeNotification({ id: "notification-unread" }));
    const read = notificationRepository.create(makeNotification({ id: "notification-read" }));
    notificationRepository.markAsRead(read.id);
    notificationRepository.create(
      makeNotification({ id: "notification-deleted", isDeleted: true, deletedAt: NOW }),
    );

    expect(notificationRepository.countUnread()).toBe(1);
  });

  test("ListNotificationsUseCase returns unreadCount alongside items and total", () => {
    notificationRepository.create(makeNotification({ id: "notification-unread-1" }));
    notificationRepository.create(makeNotification({ id: "notification-unread-2" }));
    const read = notificationRepository.create(makeNotification({ id: "notification-read" }));
    notificationRepository.markAsRead(read.id);

    const result = listNotifications.execute({ limit: 20, offset: 0 });

    expect(result.total).toBe(3);
    expect(result.unreadCount).toBe(2);
  });
});

describe("actionTaken semantics", () => {
  test("markAsRead (opening a notification) never sets actionTaken", () => {
    const notification = notificationRepository.create(makeNotification({ id: "notification-open-only" }));

    const updated = markNotificationRead.execute(notification.id);

    expect(updated.isRead).toBe(true);
    expect(updated.actionTaken).toBe(false);
  });

  test("markResolvedForEntity flips actionTaken for every notification tied to that entity", () => {
    const assignment = createOverdueAssignment();
    checkOverdueAssignments.execute();
    // A second, unrelated-in-type notification for the same assignment should also resolve.
    notificationRepository.create(
      makeNotification({
        id: "notification-due-soon-same-assignment",
        type: "ASSIGNMENT_DUE_SOON",
        entityType: "ASSIGNMENT",
        entityId: assignment.id,
      }),
    );

    confirmCompleteAssignment.execute(assignment.id);

    const items = listNotifications.execute({ limit: 20, offset: 0 }).items;
    expect(items).toHaveLength(2);
    expect(items.every((n) => n.isRead && n.actionTaken)).toBe(true);
  });
});

describe("GetNotificationByIdUseCase", () => {
  test("returns the notification when it exists", () => {
    const notification = notificationRepository.create(makeNotification({ id: "notification-lookup" }));

    expect(getNotificationById.execute(notification.id)?.id).toBe(notification.id);
  });

  test("returns null when the notification does not exist", () => {
    expect(getNotificationById.execute("missing-id")).toBeNull();
  });
});

describe("ListNotificationsUseCase pagination", () => {
  function seedNotifications(count: number) {
    for (let i = 0; i < count; i++) {
      notificationRepository.create(
        makeNotification({
          id: `notification-${i}`,
          createdAt: new Date(NOW.getTime() + i * 1000),
        }),
      );
    }
  }

  test("total reflects the full count even when limit is smaller than it", () => {
    seedNotifications(5);

    const result = listNotifications.execute({ limit: 2, offset: 0 });

    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(5);
  });

  test("a second page returns the next slice in createdAt DESC order with no overlap or gaps", () => {
    seedNotifications(5);

    const firstPage = listNotifications.execute({ limit: 2, offset: 0 });
    const secondPage = listNotifications.execute({ limit: 2, offset: 2 });

    expect(firstPage.items.map((n) => n.id)).toEqual(["notification-4", "notification-3"]);
    expect(secondPage.items.map((n) => n.id)).toEqual(["notification-2", "notification-1"]);
    expect(secondPage.total).toBe(5);
  });

  test("an offset past the end returns an empty items array with total still correct", () => {
    seedNotifications(3);

    const result = listNotifications.execute({ limit: 20, offset: 10 });

    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(3);
  });
});
