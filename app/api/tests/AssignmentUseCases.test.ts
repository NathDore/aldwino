import { beforeEach, describe, expect, test } from "bun:test";
import type { Database } from "bun:sqlite";
import { AssignmentRepository } from "../src/infrastructure/database/repositories/AssignmentRepository";
import { AssignmentStateRepository } from "../src/infrastructure/database/repositories/AssignmentStateRepository";
import { AssignmentWorkSessionRepository } from "../src/infrastructure/database/repositories/AssignmentWorkSessionRepository";
import { CourseRepository } from "../src/infrastructure/database/repositories/CourseRepository";
import { WorkSessionRepository } from "../src/infrastructure/database/repositories/WorkSessionRepository";
import { CreateAssignmentUseCase } from "../src/application/assignment/CreateAssignmentUseCase";
import { UpdateAssignmentUseCase } from "../src/application/assignment/UpdateAssignmentUseCase";
import { DeleteAssignmentUseCase } from "../src/application/assignment/DeleteAssignmentUseCase";
import { CompleteAssignmentUseCase } from "../src/application/assignment/CompleteAssignmentUseCase";
import { UncompleteAssignmentUseCase } from "../src/application/assignment/UncompleteAssignmentUseCase";
import { RescheduleAssignmentUseCase } from "../src/application/assignment/RescheduleAssignmentUseCase";
import { WrapUpAssignmentUseCase } from "../src/application/assignment/WrapUpAssignmentUseCase";
import { WrapUpLateAssignmentUseCase } from "../src/application/assignment/WrapUpLateAssignmentUseCase";
import { AssignmentStateTransitionError, DueDateInPastError } from "../src/domain/assignment/AssignmentError";
import { createTestDatabase, makeCourse, FixedClock, NOW, PAST, FUTURE, stateIdFor } from "./support/fixtures";

let db: Database;
let clock: FixedClock;
let repository: AssignmentRepository;
let stateRepository: AssignmentStateRepository;
let courseRepository: CourseRepository;
let linkRepository: AssignmentWorkSessionRepository;
let workSessionRepository: WorkSessionRepository;

let create: CreateAssignmentUseCase;
let update: UpdateAssignmentUseCase;
let remove: DeleteAssignmentUseCase;
let complete: CompleteAssignmentUseCase;
let uncomplete: UncompleteAssignmentUseCase;
let reschedule: RescheduleAssignmentUseCase;
let wrapUp: WrapUpAssignmentUseCase;
let wrapUpLate: WrapUpLateAssignmentUseCase;

const LATER = new Date("2026-08-01T12:00:00.000Z");

beforeEach(() => {
  db = createTestDatabase();
  clock = new FixedClock(NOW);
  repository = new AssignmentRepository(db);
  stateRepository = new AssignmentStateRepository(db);
  courseRepository = new CourseRepository(db);
  linkRepository = new AssignmentWorkSessionRepository(db);
  workSessionRepository = new WorkSessionRepository(db);
  makeCourse(db);

  create = new CreateAssignmentUseCase(repository, courseRepository, stateRepository, clock, db);
  update = new UpdateAssignmentUseCase(repository, courseRepository, clock, db);
  remove = new DeleteAssignmentUseCase(repository, linkRepository, clock, db);
  complete = new CompleteAssignmentUseCase(repository, stateRepository, linkRepository, workSessionRepository, clock, db);
  uncomplete = new UncompleteAssignmentUseCase(repository, stateRepository, linkRepository, workSessionRepository, clock, db);
  reschedule = new RescheduleAssignmentUseCase(repository, clock, db);
  wrapUp = new WrapUpAssignmentUseCase(repository, linkRepository, clock, db);
  wrapUpLate = new WrapUpLateAssignmentUseCase(repository, clock, db);
});

function newAssignment(dueDate = FUTURE) {
  return create.execute({ courseId: "course-1", name: "Essay", dueDate });
}

// Moves the clock past the due date so the assignment reads as overdue.
function makeOverdue() {
  const assignment = newAssignment(FUTURE);
  clock.set(new Date(FUTURE.getTime() + 1000));
  return assignment;
}

describe("CreateAssignmentUseCase", () => {
  test("creates an upcoming, uncompleted assignment", () => {
    const assignment = newAssignment();

    expect(assignment.completedAt).toBeNull();
    expect(assignment.assignmentStateId).toBe(stateIdFor(db, "UNCOMPLETED"));
    expect(assignment.rescheduleAt).toBeNull();
  });

  test("rejects a due date in the past", () => {
    expect(() => create.execute({ courseId: "course-1", name: "Essay", dueDate: PAST })).toThrow(DueDateInPastError);
  });
});

describe("CompleteAssignmentUseCase", () => {
  test("completes an upcoming assignment", () => {
    const completed = complete.execute(newAssignment().id);

    expect(completed.completedAt).toEqual(NOW);
    expect(completed.assignmentStateId).toBe(stateIdFor(db, "COMPLETED"));
  });

  test("rejects an overdue assignment", () => {
    const assignment = makeOverdue();

    expect(() => complete.execute(assignment.id)).toThrow(AssignmentStateTransitionError);
  });

  test("rejects an already completed assignment", () => {
    const assignment = newAssignment();
    complete.execute(assignment.id);

    expect(() => complete.execute(assignment.id)).toThrow(AssignmentStateTransitionError);
  });
});

describe("UncompleteAssignmentUseCase", () => {
  test("uncompletes a completed assignment that is not overdue", () => {
    const assignment = newAssignment();
    complete.execute(assignment.id);

    const result = uncomplete.execute(assignment.id);

    expect(result.completedAt).toBeNull();
    expect(result.assignmentStateId).toBe(stateIdFor(db, "UNCOMPLETED"));
  });

  test("rejects a completed assignment whose due date has passed", () => {
    const assignment = newAssignment();
    complete.execute(assignment.id);
    clock.set(new Date(FUTURE.getTime() + 1000));

    expect(() => uncomplete.execute(assignment.id)).toThrow(AssignmentStateTransitionError);
  });
});

describe("UpdateAssignmentUseCase", () => {
  test("edits an upcoming assignment", () => {
    const assignment = newAssignment();

    const updated = update.execute({ id: assignment.id, courseId: "course-1", name: "Revised", dueDate: LATER });

    expect(updated.name).toBe("Revised");
    expect(updated.dueDate).toEqual(LATER);
  });

  test("rejects editing an overdue assignment", () => {
    const assignment = makeOverdue();

    expect(() => update.execute({ id: assignment.id, courseId: "course-1", name: "Revised", dueDate: LATER })).toThrow(
      AssignmentStateTransitionError,
    );
  });

  test("rejects editing a completed assignment", () => {
    const assignment = newAssignment();
    complete.execute(assignment.id);

    expect(() => update.execute({ id: assignment.id, courseId: "course-1", name: "Revised", dueDate: LATER })).toThrow(
      AssignmentStateTransitionError,
    );
  });

  test("rejects moving the due date into the past", () => {
    const assignment = newAssignment();

    expect(() => update.execute({ id: assignment.id, courseId: "course-1", name: "Essay", dueDate: PAST })).toThrow(
      DueDateInPastError,
    );
  });
});

describe("DeleteAssignmentUseCase", () => {
  test("removes an upcoming assignment", () => {
    const assignment = newAssignment();

    remove.execute(assignment.id);

    expect(repository.getById(assignment.id)).toBeNull();
  });

  test("rejects removing an overdue assignment", () => {
    const assignment = makeOverdue();

    expect(() => remove.execute(assignment.id)).toThrow(AssignmentStateTransitionError);
  });

  test("rejects removing a completed assignment", () => {
    const assignment = newAssignment();
    complete.execute(assignment.id);

    expect(() => remove.execute(assignment.id)).toThrow(AssignmentStateTransitionError);
  });
});

describe("RescheduleAssignmentUseCase", () => {
  test("moves an overdue assignment forward and stamps rescheduleAt", () => {
    const assignment = makeOverdue();
    const now = clock.now();

    const rescheduled = reschedule.execute({ id: assignment.id, dueDate: LATER });

    expect(rescheduled.dueDate).toEqual(LATER);
    expect(rescheduled.rescheduleAt).toEqual(now);
    expect(rescheduled.completedAt).toBeNull();
  });

  test("leaves the assignment editable again once it is upcoming", () => {
    const assignment = makeOverdue();
    reschedule.execute({ id: assignment.id, dueDate: LATER });

    expect(() =>
      update.execute({ id: assignment.id, courseId: "course-1", name: "Revised", dueDate: LATER }),
    ).not.toThrow();
  });

  test("preserves rescheduleAt across a later edit", () => {
    const assignment = makeOverdue();
    const rescheduled = reschedule.execute({ id: assignment.id, dueDate: LATER });

    const updated = update.execute({ id: assignment.id, courseId: "course-1", name: "Revised", dueDate: LATER });

    expect(updated.rescheduleAt).toEqual(rescheduled.rescheduleAt);
  });

  test("rejects a new due date that is still in the past", () => {
    const assignment = makeOverdue();

    expect(() => reschedule.execute({ id: assignment.id, dueDate: PAST })).toThrow(DueDateInPastError);
  });

  test("rejects an upcoming assignment", () => {
    const assignment = newAssignment();

    expect(() => reschedule.execute({ id: assignment.id, dueDate: LATER })).toThrow(AssignmentStateTransitionError);
  });

  test("rejects a completed assignment", () => {
    const assignment = newAssignment();
    complete.execute(assignment.id);

    expect(() => reschedule.execute({ id: assignment.id, dueDate: LATER })).toThrow(AssignmentStateTransitionError);
  });
});

describe("wrap up", () => {
  test("wraps up a completed assignment", () => {
    const assignment = newAssignment();
    complete.execute(assignment.id);

    const wrapped = wrapUp.execute(assignment.id);

    expect(wrapped.wrapUpAt).toEqual(NOW);
    expect(wrapped.isDeleted).toBe(true);
    expect(repository.getById(assignment.id)).toBeNull();
  });

  test("wraps up a completed assignment whose due date has passed", () => {
    const assignment = newAssignment();
    complete.execute(assignment.id);
    clock.set(new Date(FUTURE.getTime() + 1000));

    expect(() => wrapUp.execute(assignment.id)).not.toThrow();
  });

  test("rejects wrapping up an overdue, uncompleted assignment", () => {
    const assignment = makeOverdue();

    expect(() => wrapUp.execute(assignment.id)).toThrow(AssignmentStateTransitionError);
  });

  test("wraps up late an overdue assignment, marking it completed", () => {
    const assignment = makeOverdue();
    const now = clock.now();

    const wrapped = wrapUpLate.execute(assignment.id);

    expect(wrapped.completedAt).toEqual(now);
    expect(wrapped.wrapUpAt).toEqual(now);
    expect(wrapped.isDeleted).toBe(true);
  });

  test("rejects wrapping up late an assignment that is not overdue", () => {
    const assignment = newAssignment();

    expect(() => wrapUpLate.execute(assignment.id)).toThrow(AssignmentStateTransitionError);
  });
});
