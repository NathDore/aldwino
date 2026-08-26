import { beforeEach, describe, expect, test } from "bun:test";
import type { Database } from "bun:sqlite";
import { AssignmentRepository } from "../src/infrastructure/database/repositories/AssignmentRepository";
import { AssignmentStateRepository } from "../src/infrastructure/database/repositories/AssignmentStateRepository";
import { AssignmentWorkSessionRepository } from "../src/infrastructure/database/repositories/AssignmentWorkSessionRepository";
import { CourseRepository } from "../src/infrastructure/database/repositories/CourseRepository";
import { WorkSessionRepository } from "../src/infrastructure/database/repositories/WorkSessionRepository";
import { WorkSessionStateRepository } from "../src/infrastructure/database/repositories/WorkSessionStateRepository";
import { NotificationRepository } from "../src/infrastructure/database/repositories/NotificationRepository";
import { CreateAssignmentUseCase } from "../src/application/assignment/CreateAssignmentUseCase";
import { CompleteAssignmentUseCase } from "../src/application/assignment/CompleteAssignmentUseCase";
import { UncompleteAssignmentUseCase } from "../src/application/assignment/UncompleteAssignmentUseCase";
import { WrapUpAssignmentUseCase } from "../src/application/assignment/WrapUpAssignmentUseCase";
import { DeleteAssignmentUseCase } from "../src/application/assignment/DeleteAssignmentUseCase";
import { DeleteWorkSessionUseCase } from "../src/application/workSession/DeleteWorkSessionUseCase";
import { CreateAssignmentWorkSessionUseCase } from "../src/application/assignmentWorkSession/CreateAssignmentWorkSessionUseCase";
import { DeleteAssignmentWorkSessionUseCase } from "../src/application/assignmentWorkSession/DeleteAssignmentWorkSessionUseCase";
import { MarkAssignmentWorkedOnUseCase } from "../src/application/assignmentWorkSession/MarkAssignmentWorkedOnUseCase";
import { UnmarkAssignmentWorkedOnUseCase } from "../src/application/assignmentWorkSession/UnmarkAssignmentWorkedOnUseCase";
import { RescheduleWorkSessionUseCase } from "../src/application/workSession/RescheduleWorkSessionUseCase";
import { EditWorkSessionUseCase } from "../src/application/workSession/EditWorkSessionUseCase";
import { AssignmentStateTransitionError } from "../src/domain/assignment/AssignmentError";
import { CannotDeleteAutoDetachedLinkError, WorkSessionCompletedError } from "../src/domain/assignmentWorkSession/AssignmentWorkSessionError";
import {
  CannotRescheduleNonWaitConfirmWorkSessionError,
  CannotEditNonInProgressWorkSessionError,
  StartTimeInPastError,
} from "../src/domain/workSession/WorkSessionError";
import { WorkSession } from "../src/domain/workSession/WorkSession";
import {
  createTestDatabase,
  makeCourse,
  FixedClock,
  NOW,
  FUTURE,
  workSessionStateIdFor,
} from "./support/fixtures";

let db: Database;
let clock: FixedClock;
let assignmentRepository: AssignmentRepository;
let workSessionRepository: WorkSessionRepository;
let linkRepository: AssignmentWorkSessionRepository;
let workSessionStateRepository: WorkSessionStateRepository;
let notificationRepository: NotificationRepository;

let create: CreateAssignmentUseCase;
let complete: CompleteAssignmentUseCase;
let uncomplete: UncompleteAssignmentUseCase;
let wrapUp: WrapUpAssignmentUseCase;
let deleteAssignment: DeleteAssignmentUseCase;
let deleteWorkSession: DeleteWorkSessionUseCase;
let link: CreateAssignmentWorkSessionUseCase;
let unlink: DeleteAssignmentWorkSessionUseCase;
let markWorkedOn: MarkAssignmentWorkedOnUseCase;
let unmarkWorkedOn: UnmarkAssignmentWorkedOnUseCase;
let rescheduleSession: RescheduleWorkSessionUseCase;
let editSession: EditWorkSessionUseCase;

// A window on the same calendar day, comfortably after NOW.
const SESSION_START = new Date("2026-06-15T14:00:00.000Z");
const SESSION_END = new Date("2026-06-15T16:00:00.000Z");
const NEW_START = new Date("2026-07-01T14:00:00.000Z");
const NEW_END = new Date("2026-07-01T16:00:00.000Z");
// A window on the same calendar day, comfortably before NOW.
const PAST_SESSION_START = new Date("2026-06-15T08:00:00.000Z");
const PAST_SESSION_END = new Date("2026-06-15T10:00:00.000Z");

beforeEach(() => {
  db = createTestDatabase();
  clock = new FixedClock(NOW);
  assignmentRepository = new AssignmentRepository(db);
  workSessionRepository = new WorkSessionRepository(db);
  linkRepository = new AssignmentWorkSessionRepository(db);
  workSessionStateRepository = new WorkSessionStateRepository(db);
  notificationRepository = new NotificationRepository(db);
  makeCourse(db);

  create = new CreateAssignmentUseCase(
    assignmentRepository,
    new CourseRepository(db),
    new AssignmentStateRepository(db),
    clock,
    db,
  );
  complete = new CompleteAssignmentUseCase(
    assignmentRepository,
    new AssignmentStateRepository(db),
    linkRepository,
    workSessionRepository,
    notificationRepository,
    clock,
    db,
  );
  uncomplete = new UncompleteAssignmentUseCase(
    assignmentRepository,
    new AssignmentStateRepository(db),
    linkRepository,
    workSessionRepository,
    clock,
    db,
  );
  wrapUp = new WrapUpAssignmentUseCase(assignmentRepository, linkRepository, clock, db);
  deleteAssignment = new DeleteAssignmentUseCase(assignmentRepository, linkRepository, clock, db);
  deleteWorkSession = new DeleteWorkSessionUseCase(workSessionRepository, linkRepository, notificationRepository, clock, db);
  link = new CreateAssignmentWorkSessionUseCase(
    linkRepository,
    assignmentRepository,
    workSessionRepository,
    clock,
    db,
  );
  unlink = new DeleteAssignmentWorkSessionUseCase(
    linkRepository,
    assignmentRepository,
    workSessionRepository,
    clock,
    db,
  );
  markWorkedOn = new MarkAssignmentWorkedOnUseCase(linkRepository, workSessionRepository, db);
  unmarkWorkedOn = new UnmarkAssignmentWorkedOnUseCase(linkRepository, workSessionRepository, db);
  rescheduleSession = new RescheduleWorkSessionUseCase(
    workSessionRepository,
    workSessionStateRepository,
    notificationRepository,
    clock,
    db,
  );
  editSession = new EditWorkSessionUseCase(workSessionRepository, workSessionStateRepository, clock, db);
});

function newAssignment(dueDate = FUTURE) {
  return create.execute({ courseId: "course-1", name: "Essay", dueDate });
}

function newWorkSession(state = "INPROGRESS", id = "session-1") {
  return workSessionRepository.create(
    WorkSession.create({
      id,
      workSessionStateId: workSessionStateIdFor(db, state),
      startTime: SESSION_START,
      endTime: SESSION_END,
      completedAt: null,
      createdAt: NOW,
    }),
  );
}

function newPastWorkSession(state = "INPROGRESS", id = "past-session-1") {
  return workSessionRepository.create(
    WorkSession.create({
      id,
      workSessionStateId: workSessionStateIdFor(db, state),
      startTime: PAST_SESSION_START,
      endTime: PAST_SESSION_END,
      completedAt: null,
      createdAt: NOW,
    }),
  );
}

describe("assignment work session links", () => {
  test("links an upcoming assignment to a session", () => {
    const assignment = newAssignment();
    const session = newWorkSession();

    const created = link.execute({ assignmentId: assignment.id, workSessionId: session.id });

    expect(created.assignmentId).toBe(assignment.id);
  });

  test("rejects linking an overdue assignment", () => {
    const assignment = newAssignment();
    const session = newWorkSession();
    clock.set(new Date(FUTURE.getTime() + 1000));

    expect(() => link.execute({ assignmentId: assignment.id, workSessionId: session.id })).toThrow(
      AssignmentStateTransitionError,
    );
  });

  test("rejects linking a completed assignment", () => {
    const assignment = newAssignment();
    const session = newWorkSession();
    complete.execute(assignment.id);

    expect(() => link.execute({ assignmentId: assignment.id, workSessionId: session.id })).toThrow(
      AssignmentStateTransitionError,
    );
  });

  test("unlinks while the assignment is still upcoming", () => {
    const assignment = newAssignment();
    const session = newWorkSession();
    const created = link.execute({ assignmentId: assignment.id, workSessionId: session.id });

    expect(() => unlink.execute(created.id)).not.toThrow();
  });

  test("rejects unlinking once the assignment is overdue", () => {
    const assignment = newAssignment();
    const session = newWorkSession();
    const created = link.execute({ assignmentId: assignment.id, workSessionId: session.id });
    clock.set(new Date(FUTURE.getTime() + 1000));

    expect(() => unlink.execute(created.id)).toThrow(AssignmentStateTransitionError);
  });

  test("rejects unlinking a completed assignment's link to a session that already started", () => {
    const assignment = newAssignment();
    const session = newPastWorkSession();
    const created = link.execute({ assignmentId: assignment.id, workSessionId: session.id });
    complete.execute(assignment.id);

    expect(() => unlink.execute(created.id)).toThrow(AssignmentStateTransitionError);
  });
});

describe("CompleteAssignmentUseCase cascade", () => {
  test("detaches a completed assignment from a work session that hasn't started yet", () => {
    const assignment = newAssignment();
    const session = newWorkSession();
    const created = link.execute({ assignmentId: assignment.id, workSessionId: session.id });

    complete.execute(assignment.id);

    expect(linkRepository.getById(created.id)).toBeNull();
  });

  test("leaves a completed assignment linked to a work session that already started", () => {
    const assignment = newAssignment();
    const pastSession = newPastWorkSession();
    const created = link.execute({ assignmentId: assignment.id, workSessionId: pastSession.id });

    complete.execute(assignment.id);

    const stillLinked = linkRepository.getById(created.id);
    expect(stillLinked).not.toBeNull();
    expect(stillLinked?.workSessionId).toBe(pastSession.id);
  });

  test("leaves other assignments' links to future sessions untouched", () => {
    const assignment = newAssignment();
    const otherAssignment = create.execute({ courseId: "course-1", name: "Other", dueDate: FUTURE });
    const session = newWorkSession();
    link.execute({ assignmentId: assignment.id, workSessionId: session.id });
    const otherLink = link.execute({ assignmentId: otherAssignment.id, workSessionId: session.id });

    complete.execute(assignment.id);

    expect(linkRepository.getById(otherLink.id)).not.toBeNull();
  });
});

describe("UncompleteAssignmentUseCase restore", () => {
  test("restores a link to a session still in the future", () => {
    const assignment = newAssignment();
    const session = newWorkSession();
    const created = link.execute({ assignmentId: assignment.id, workSessionId: session.id });
    markWorkedOn.execute(created.id);
    complete.execute(assignment.id);
    expect(linkRepository.getById(created.id)).toBeNull();

    uncomplete.execute(assignment.id);

    const restored = linkRepository.getById(created.id);
    expect(restored).not.toBeNull();
    expect(restored?.workedOn).toBe(true);
    expect(restored?.detachReason).toBeNull();
  });

  test("leaves a past-session link untouched (never detached, nothing to restore)", () => {
    const assignment = newAssignment();
    const pastSession = newPastWorkSession();
    const created = link.execute({ assignmentId: assignment.id, workSessionId: pastSession.id });
    complete.execute(assignment.id);

    uncomplete.execute(assignment.id);

    const stillLinked = linkRepository.getById(created.id);
    expect(stillLinked).not.toBeNull();
    expect(stillLinked?.workSessionId).toBe(pastSession.id);
  });

  test("never restores a link the user manually unlinked before completing", () => {
    const assignment = newAssignment();
    const session = newWorkSession();
    const created = link.execute({ assignmentId: assignment.id, workSessionId: session.id });
    unlink.execute(created.id);
    complete.execute(assignment.id);

    uncomplete.execute(assignment.id);

    expect(linkRepository.getById(created.id)).toBeNull();
  });

  test("does not restore a link once its once-future session has since started", () => {
    const assignment = newAssignment();
    const session = newWorkSession();
    const created = link.execute({ assignmentId: assignment.id, workSessionId: session.id });
    complete.execute(assignment.id);
    clock.set(new Date(SESSION_START.getTime() + 1000));

    uncomplete.execute(assignment.id);

    expect(linkRepository.getById(created.id)).toBeNull();
  });
});

describe("DeleteAssignmentWorkSessionUseCase guard on auto-detached links", () => {
  test("rejects deleting a link auto-detached by the completion cascade", () => {
    const assignment = newAssignment();
    const session = newWorkSession();
    const created = link.execute({ assignmentId: assignment.id, workSessionId: session.id });
    complete.execute(assignment.id);

    expect(() => unlink.execute(created.id)).toThrow(CannotDeleteAutoDetachedLinkError);
  });

  test("still throws a generic not-found error for a link that truly doesn't exist", () => {
    expect(() => unlink.execute("no-such-link")).toThrow(/not found/);
  });
});

describe("relabeling stale COMPLETION links to MANUAL", () => {
  test("relabels a leftover COMPLETION link once the assignment is wrapped up", () => {
    const assignment = newAssignment();
    const session = newWorkSession();
    const created = link.execute({ assignmentId: assignment.id, workSessionId: session.id });
    complete.execute(assignment.id);

    wrapUp.execute(assignment.id);

    const relabeled = linkRepository.getByIdIncludingDeleted(created.id);
    expect(relabeled?.detachReason).toBe("MANUAL");
    expect(relabeled?.isDeleted).toBe(true);
  });

  test("relabels a leftover COMPLETION link once the assignment is deleted", () => {
    const assignment = newAssignment();
    const session = newWorkSession();
    const created = link.execute({ assignmentId: assignment.id, workSessionId: session.id });
    complete.execute(assignment.id);
    clock.set(new Date(SESSION_START.getTime() + 1000));
    uncomplete.execute(assignment.id);
    expect(linkRepository.getByIdIncludingDeleted(created.id)?.detachReason).toBe("COMPLETION");

    deleteAssignment.execute(assignment.id);

    expect(linkRepository.getByIdIncludingDeleted(created.id)?.detachReason).toBe("MANUAL");
  });

  test("relabels a leftover COMPLETION link once its work session is deleted", () => {
    const assignment = newAssignment();
    const session = newWorkSession();
    const created = link.execute({ assignmentId: assignment.id, workSessionId: session.id });
    complete.execute(assignment.id);

    deleteWorkSession.execute(session.id);

    expect(linkRepository.getByIdIncludingDeleted(created.id)?.detachReason).toBe("MANUAL");
  });
});

describe("workedOn tracking", () => {
  test("marks a linked assignment as worked on", () => {
    const assignment = newAssignment();
    const session = newWorkSession();
    const created = link.execute({ assignmentId: assignment.id, workSessionId: session.id });

    const marked = markWorkedOn.execute(created.id);

    expect(marked.workedOn).toBe(true);
  });

  test("unmarks a previously worked-on assignment", () => {
    const assignment = newAssignment();
    const session = newWorkSession();
    const created = link.execute({ assignmentId: assignment.id, workSessionId: session.id });
    markWorkedOn.execute(created.id);

    const unmarked = unmarkWorkedOn.execute(created.id);

    expect(unmarked.workedOn).toBe(false);
  });

  test("marking twice is idempotent", () => {
    const assignment = newAssignment();
    const session = newWorkSession();
    const created = link.execute({ assignmentId: assignment.id, workSessionId: session.id });

    markWorkedOn.execute(created.id);
    const markedAgain = markWorkedOn.execute(created.id);

    expect(markedAgain.workedOn).toBe(true);
  });

  test("unmarking an already-unmarked link is idempotent", () => {
    const assignment = newAssignment();
    const session = newWorkSession();
    const created = link.execute({ assignmentId: assignment.id, workSessionId: session.id });

    const unmarked = unmarkWorkedOn.execute(created.id);

    expect(unmarked.workedOn).toBe(false);
  });

  test("rejects marking once the parent session is completed", () => {
    const assignment = newAssignment();
    const session = newWorkSession();
    const created = link.execute({ assignmentId: assignment.id, workSessionId: session.id });
    workSessionRepository.update(
      WorkSession.create({
        id: session.id,
        workSessionStateId: session.workSessionStateId,
        startTime: session.startTime,
        endTime: session.endTime,
        completedAt: NOW,
        createdAt: session.createdAt,
      }),
    );

    expect(() => markWorkedOn.execute(created.id)).toThrow(WorkSessionCompletedError);
  });

  test("rejects unmarking once the parent session is completed", () => {
    const assignment = newAssignment();
    const session = newWorkSession();
    const created = link.execute({ assignmentId: assignment.id, workSessionId: session.id });
    markWorkedOn.execute(created.id);
    workSessionRepository.update(
      WorkSession.create({
        id: session.id,
        workSessionStateId: session.workSessionStateId,
        startTime: session.startTime,
        endTime: session.endTime,
        completedAt: NOW,
        createdAt: session.createdAt,
      }),
    );

    expect(() => unmarkWorkedOn.execute(created.id)).toThrow(WorkSessionCompletedError);
  });
});

describe("RescheduleWorkSessionUseCase", () => {
  test("reschedules a wait-confirm session, stamps rescheduleAt, and resets to in-progress", () => {
    const session = newWorkSession("WAIT_CONFIRM");

    const result = rescheduleSession.execute({ id: session.id, startTime: NEW_START, endTime: NEW_END });

    expect(result.session.startTime).toEqual(NEW_START);
    expect(result.session.endTime).toEqual(NEW_END);
    expect(result.session.rescheduleAt).toEqual(NOW);
    expect(result.session.workSessionStateId).toBe(workSessionStateIdFor(db, "INPROGRESS"));
    expect(result.mergedFrom).toEqual([]);
  });

  test("rejects an in-progress session", () => {
    const session = newWorkSession("INPROGRESS");

    expect(() => rescheduleSession.execute({ id: session.id, startTime: NEW_START, endTime: NEW_END })).toThrow(
      CannotRescheduleNonWaitConfirmWorkSessionError,
    );
  });

  test("rejects a completed session", () => {
    const session = newWorkSession("COMPLETED");

    expect(() => rescheduleSession.execute({ id: session.id, startTime: NEW_START, endTime: NEW_END })).toThrow(
      CannotRescheduleNonWaitConfirmWorkSessionError,
    );
  });

  test("rejects a start time in the past", () => {
    const session = newWorkSession("WAIT_CONFIRM");
    const past = new Date("2026-06-01T14:00:00.000Z");
    const pastEnd = new Date("2026-06-01T16:00:00.000Z");

    expect(() => rescheduleSession.execute({ id: session.id, startTime: past, endTime: pastEnd })).toThrow(
      StartTimeInPastError,
    );
  });

  test("tolerates a start time a few seconds in the past", () => {
    const session = newWorkSession("WAIT_CONFIRM");
    const justPassed = new Date(NOW.getTime() - 2000);
    const end = new Date(NOW.getTime() + 60 * 60 * 1000);

    expect(() => rescheduleSession.execute({ id: session.id, startTime: justPassed, endTime: end })).not.toThrow();
  });

  test("preserves wrapUpAt when rescheduling", () => {
    const session = workSessionRepository.create(
      WorkSession.create({
        id: "session-wrapped",
        workSessionStateId: workSessionStateIdFor(db, "WAIT_CONFIRM"),
        startTime: SESSION_START,
        endTime: SESSION_END,
        completedAt: null,
        wrapUpAt: NOW,
        createdAt: NOW,
      }),
    );

    const result = rescheduleSession.execute({ id: session.id, startTime: NEW_START, endTime: NEW_END });

    expect(result.session.wrapUpAt).toEqual(NOW);
  });
});

describe("EditWorkSessionUseCase", () => {
  test("edits an in-progress session and leaves rescheduleAt untouched", () => {
    const session = newWorkSession("INPROGRESS");

    const result = editSession.execute({ id: session.id, startTime: NEW_START, endTime: NEW_END });

    expect(result.session.startTime).toEqual(NEW_START);
    expect(result.session.endTime).toEqual(NEW_END);
    expect(result.session.rescheduleAt).toBeNull();
    expect(result.mergedFrom).toEqual([]);
  });

  test("rejects a skipped session", () => {
    const session = newWorkSession("SKIPPED");

    expect(() => editSession.execute({ id: session.id, startTime: NEW_START, endTime: NEW_END })).toThrow(
      CannotEditNonInProgressWorkSessionError,
    );
  });

  test("rejects a completed session", () => {
    const session = newWorkSession("COMPLETED");

    expect(() => editSession.execute({ id: session.id, startTime: NEW_START, endTime: NEW_END })).toThrow(
      CannotEditNonInProgressWorkSessionError,
    );
  });

  test("allows a start time in the past", () => {
    const session = newWorkSession("INPROGRESS");
    const past = new Date("2026-06-01T14:00:00.000Z");
    const pastEnd = new Date("2026-06-01T16:00:00.000Z");

    expect(() => editSession.execute({ id: session.id, startTime: past, endTime: pastEnd })).not.toThrow();
  });
});
