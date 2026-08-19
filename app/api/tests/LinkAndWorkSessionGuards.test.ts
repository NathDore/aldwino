import { beforeEach, describe, expect, test } from "bun:test";
import type { Database } from "bun:sqlite";
import { AssignmentRepository } from "../src/infrastructure/database/repositories/AssignmentRepository";
import { AssignmentStateRepository } from "../src/infrastructure/database/repositories/AssignmentStateRepository";
import { AssignmentWorkSessionRepository } from "../src/infrastructure/database/repositories/AssignmentWorkSessionRepository";
import { CourseRepository } from "../src/infrastructure/database/repositories/CourseRepository";
import { WorkSessionRepository } from "../src/infrastructure/database/repositories/WorkSessionRepository";
import { WorkSessionStateRepository } from "../src/infrastructure/database/repositories/WorkSessionStateRepository";
import { CreateAssignmentUseCase } from "../src/application/assignment/CreateAssignmentUseCase";
import { CompleteAssignmentUseCase } from "../src/application/assignment/CompleteAssignmentUseCase";
import { CreateAssignmentWorkSessionUseCase } from "../src/application/assignmentWorkSession/CreateAssignmentWorkSessionUseCase";
import { DeleteAssignmentWorkSessionUseCase } from "../src/application/assignmentWorkSession/DeleteAssignmentWorkSessionUseCase";
import { RescheduleWorkSessionUseCase } from "../src/application/workSession/RescheduleWorkSessionUseCase";
import { AssignmentStateTransitionError } from "../src/domain/assignment/AssignmentError";
import {
  CannotRescheduleNonSkippedWorkSessionError,
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

let create: CreateAssignmentUseCase;
let complete: CompleteAssignmentUseCase;
let link: CreateAssignmentWorkSessionUseCase;
let unlink: DeleteAssignmentWorkSessionUseCase;
let rescheduleSession: RescheduleWorkSessionUseCase;

// A window on the same calendar day, comfortably after NOW.
const SESSION_START = new Date("2026-06-15T14:00:00.000Z");
const SESSION_END = new Date("2026-06-15T16:00:00.000Z");
const NEW_START = new Date("2026-07-01T14:00:00.000Z");
const NEW_END = new Date("2026-07-01T16:00:00.000Z");

beforeEach(() => {
  db = createTestDatabase();
  clock = new FixedClock(NOW);
  assignmentRepository = new AssignmentRepository(db);
  workSessionRepository = new WorkSessionRepository(db);
  linkRepository = new AssignmentWorkSessionRepository(db);
  workSessionStateRepository = new WorkSessionStateRepository(db);
  makeCourse(db);

  create = new CreateAssignmentUseCase(
    assignmentRepository,
    new CourseRepository(db),
    new AssignmentStateRepository(db),
    clock,
    db,
  );
  complete = new CompleteAssignmentUseCase(assignmentRepository, new AssignmentStateRepository(db), clock, db);
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
  rescheduleSession = new RescheduleWorkSessionUseCase(workSessionRepository, workSessionStateRepository, clock, db);
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

  test("rejects unlinking a completed assignment", () => {
    const assignment = newAssignment();
    const session = newWorkSession();
    const created = link.execute({ assignmentId: assignment.id, workSessionId: session.id });
    complete.execute(assignment.id);

    expect(() => unlink.execute(created.id)).toThrow(AssignmentStateTransitionError);
  });
});

describe("RescheduleWorkSessionUseCase", () => {
  test("reschedules a skipped session and stamps rescheduleAt", () => {
    const session = newWorkSession("SKIPPED");

    const result = rescheduleSession.execute({ id: session.id, startTime: NEW_START, endTime: NEW_END });

    expect(result.session.startTime).toEqual(NEW_START);
    expect(result.session.endTime).toEqual(NEW_END);
    expect(result.session.rescheduleAt).toEqual(NOW);
    expect(result.mergedFrom).toEqual([]);
  });

  test("rejects an in-progress session", () => {
    const session = newWorkSession("INPROGRESS");

    expect(() => rescheduleSession.execute({ id: session.id, startTime: NEW_START, endTime: NEW_END })).toThrow(
      CannotRescheduleNonSkippedWorkSessionError,
    );
  });

  test("rejects a completed session", () => {
    const session = newWorkSession("COMPLETED");

    expect(() => rescheduleSession.execute({ id: session.id, startTime: NEW_START, endTime: NEW_END })).toThrow(
      CannotRescheduleNonSkippedWorkSessionError,
    );
  });

  test("rejects a start time in the past", () => {
    const session = newWorkSession("SKIPPED");
    const past = new Date("2026-06-01T14:00:00.000Z");
    const pastEnd = new Date("2026-06-01T16:00:00.000Z");

    expect(() => rescheduleSession.execute({ id: session.id, startTime: past, endTime: pastEnd })).toThrow(
      StartTimeInPastError,
    );
  });

  test("tolerates a start time a few seconds in the past", () => {
    const session = newWorkSession("SKIPPED");
    const justPassed = new Date(NOW.getTime() - 2000);
    const end = new Date(NOW.getTime() + 60 * 60 * 1000);

    expect(() => rescheduleSession.execute({ id: session.id, startTime: justPassed, endTime: end })).not.toThrow();
  });

  test("preserves wrapUpAt when rescheduling", () => {
    const session = workSessionRepository.create(
      WorkSession.create({
        id: "session-wrapped",
        workSessionStateId: workSessionStateIdFor(db, "SKIPPED"),
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
