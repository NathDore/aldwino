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
import { ConfirmCompleteAssignmentUseCase } from "../src/application/assignment/ConfirmCompleteAssignmentUseCase";
import { RescheduleAssignmentUseCase } from "../src/application/assignment/RescheduleAssignmentUseCase";
import { WrapUpLateAssignmentUseCase } from "../src/application/assignment/WrapUpLateAssignmentUseCase";
import { RescheduleWorkSessionUseCase } from "../src/application/workSession/RescheduleWorkSessionUseCase";
import { DeleteWorkSessionUseCase } from "../src/application/workSession/DeleteWorkSessionUseCase";
import { CompleteWorkSessionUseCase } from "../src/application/workSession/CompleteWorkSessionUseCase";
import { UncompleteWorkSessionUseCase } from "../src/application/workSession/UncompleteWorkSessionUseCase";
import { WorkSessionMergeService } from "../src/application/workSession/WorkSessionMergeService";
import {
  CannotCompleteNonInProgressWorkSessionError,
  CannotUncompleteNonCompletedWorkSessionError,
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
let confirmCompleteAssignment: ConfirmCompleteAssignmentUseCase;
let rescheduleAssignment: RescheduleAssignmentUseCase;
let wrapUpLateAssignment: WrapUpLateAssignmentUseCase;
let rescheduleWorkSession: RescheduleWorkSessionUseCase;
let deleteWorkSession: DeleteWorkSessionUseCase;
let completeWorkSession: CompleteWorkSessionUseCase;
let uncompleteWorkSession: UncompleteWorkSessionUseCase;

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
  deleteWorkSession = new DeleteWorkSessionUseCase(workSessionRepository, linkRepository, notificationRepository, clock, db);
  completeWorkSession = new CompleteWorkSessionUseCase(workSessionRepository, workSessionStateRepository, clock, db);
  uncompleteWorkSession = new UncompleteWorkSessionUseCase(
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
    const notifications = listNotifications.execute();
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
    expect(listNotifications.execute()).toHaveLength(1);
  });

  test("ignores an upcoming assignment", () => {
    assignmentRepository.create(
      makeAssignment({ id: "assignment-upcoming", dueDate: FUTURE, assignmentStateId: stateIdFor(db, "UNCOMPLETED") }),
    );

    expect(checkOverdueAssignments.execute()).toBe(0);
    expect(listNotifications.execute()).toHaveLength(0);
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
    expect(listNotifications.execute()).toHaveLength(0);
  });
});

describe("CheckMissedWorkSessionsUseCase", () => {
  test("flags a missed session as WAIT_CONFIRM and creates a notification", () => {
    const session = createMissedWorkSession();

    const flagged = checkMissedWorkSessions.execute();

    expect(flagged).toBe(1);
    expect(workSessionRepository.getById(session.id)?.workSessionStateId).toBe(workSessionStateIdFor(db, "WAIT_CONFIRM"));
    const notifications = listNotifications.execute();
    expect(notifications).toHaveLength(1);
    expect(notifications[0].type).toBe("WORK_SESSION_SKIPPED");
    expect(notifications[0].entityType).toBe("WORK_SESSION");
    expect(notifications[0].entityId).toBe(session.id);
  });

  test("is a no-op on a second run (already WAIT_CONFIRM)", () => {
    createMissedWorkSession();
    checkMissedWorkSessions.execute();

    expect(checkMissedWorkSessions.execute()).toBe(0);
    expect(listNotifications.execute()).toHaveLength(1);
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
    const notifications = listNotifications.execute();
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
    expect(listNotifications.execute()).toHaveLength(1);
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
    const [existing] = listNotifications.execute();
    notificationRepository.markAsRead(existing.id, NOW);

    const created = checkUpcomingAssignments.execute();

    expect(created).toBe(1);
    expect(listNotifications.execute()).toHaveLength(1);
  });
});

describe("auto-resolve on assignment resolution", () => {
  test("confirm-completing an overdue assignment clears its unread notification", () => {
    const assignment = createOverdueAssignment();
    checkOverdueAssignments.execute();
    expect(listNotifications.execute()).toHaveLength(1);

    confirmCompleteAssignment.execute(assignment.id);

    expect(listNotifications.execute()).toHaveLength(0);
  });

  test("rescheduling an overdue assignment clears its unread notification and resets state", () => {
    const assignment = createOverdueAssignment();
    checkOverdueAssignments.execute();

    const rescheduled = rescheduleAssignment.execute({ id: assignment.id, dueDate: FUTURE });

    expect(rescheduled.assignmentStateId).toBe(stateIdFor(db, "UNCOMPLETED"));
    expect(listNotifications.execute()).toHaveLength(0);
  });

  test("wrapping up late an overdue assignment clears its unread notification", () => {
    const assignment = createOverdueAssignment();
    checkOverdueAssignments.execute();

    wrapUpLateAssignment.execute(assignment.id);

    expect(listNotifications.execute()).toHaveLength(0);
  });
});

describe("auto-resolve on work session resolution", () => {
  test("rescheduling a missed session clears its unread notification", () => {
    const session = createMissedWorkSession();
    checkMissedWorkSessions.execute();

    rescheduleWorkSession.execute({
      id: session.id,
      startTime: FUTURE,
      endTime: new Date(FUTURE.getTime() + 60 * 60 * 1000),
    });

    expect(listNotifications.execute()).toHaveLength(0);
  });

  test("removing a missed session clears its unread notification", () => {
    const session = createMissedWorkSession();
    checkMissedWorkSessions.execute();

    deleteWorkSession.execute(session.id);

    expect(listNotifications.execute()).toHaveLength(0);
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
