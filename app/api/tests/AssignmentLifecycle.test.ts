import { describe, expect, test } from "bun:test";
import {
  resolveLifecycle,
  assertCanComplete,
  assertCanUncomplete,
  assertCanEdit,
  assertCanDelete,
  assertCanReschedule,
  assertCanLink,
  assertCanWrapUp,
  assertCanWrapUpLate,
  type AssignmentLifecycleState,
} from "../src/domain/assignment/AssignmentLifecycle";
import { AssignmentStateTransitionError } from "../src/domain/assignment/AssignmentError";
import type { Assignment } from "../src/domain/assignment/Assignment";
import { makeAssignment, NOW, PAST, FUTURE } from "./support/fixtures";

const assignmentsByState: Record<AssignmentLifecycleState, () => Assignment> = {
  UPCOMING: () => makeAssignment({ dueDate: FUTURE, completedAt: null }),
  OVERDUE: () => makeAssignment({ dueDate: PAST, completedAt: null }),
  COMPLETED: () => makeAssignment({ dueDate: FUTURE, completedAt: NOW }),
  COMPLETED_OVERDUE: () => makeAssignment({ dueDate: PAST, completedAt: NOW }),
};

const ALL_STATES = Object.keys(assignmentsByState) as AssignmentLifecycleState[];

type Guard = (assignment: Assignment, now: Date) => void;

/** The allowed cell of the state machine: action -> states that permit it. */
const truthTable: { action: string; guard: Guard; allowedIn: AssignmentLifecycleState[] }[] = [
  { action: "complete", guard: assertCanComplete, allowedIn: ["UPCOMING", "OVERDUE"] },
  { action: "uncomplete", guard: assertCanUncomplete, allowedIn: ["COMPLETED"] },
  { action: "edit", guard: assertCanEdit, allowedIn: ["UPCOMING"] },
  { action: "delete", guard: assertCanDelete, allowedIn: ["UPCOMING"] },
  { action: "reschedule", guard: assertCanReschedule, allowedIn: ["OVERDUE"] },
  { action: "link", guard: assertCanLink, allowedIn: ["UPCOMING"] },
  { action: "wrap up", guard: assertCanWrapUp, allowedIn: ["COMPLETED", "COMPLETED_OVERDUE"] },
  { action: "wrap up late", guard: assertCanWrapUpLate, allowedIn: ["OVERDUE"] },
];

describe("resolveLifecycle", () => {
  test.each([
    ["UPCOMING", FUTURE, null],
    ["OVERDUE", PAST, null],
    ["COMPLETED", FUTURE, NOW],
    ["COMPLETED_OVERDUE", PAST, NOW],
  ] as const)("is %s when dueDate=%s and completedAt=%s", (expected, dueDate, completedAt) => {
    expect(resolveLifecycle(makeAssignment({ dueDate, completedAt }), NOW)).toBe(expected);
  });

  test("an assignment due exactly now is not yet overdue", () => {
    expect(resolveLifecycle(makeAssignment({ dueDate: NOW }), NOW)).toBe("UPCOMING");
  });

  test("a skipped assignment with no completedAt counts as uncompleted", () => {
    const skipped = makeAssignment({ assignmentStateId: "state-skipped", dueDate: FUTURE, completedAt: null });
    expect(resolveLifecycle(skipped, NOW)).toBe("UPCOMING");
  });
});

describe("lifecycle guards", () => {
  for (const { action, guard, allowedIn } of truthTable) {
    for (const state of ALL_STATES) {
      const permitted = allowedIn.includes(state);

      test(`${action} is ${permitted ? "allowed" : "rejected"} in ${state}`, () => {
        const assignment = assignmentsByState[state]();

        if (permitted) {
          expect(() => guard(assignment, NOW)).not.toThrow();
        } else {
          expect(() => guard(assignment, NOW)).toThrow(AssignmentStateTransitionError);
        }
      });
    }
  }

  test("a rejection carries the state it was rejected from", () => {
    try {
      assertCanEdit(assignmentsByState.COMPLETED_OVERDUE(), NOW);
      throw new Error("expected assertCanEdit to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(AssignmentStateTransitionError);
      expect((error as AssignmentStateTransitionError).state).toBe("COMPLETED_OVERDUE");
    }
  });

  test("an upcoming assignment becomes overdue purely by the clock moving", () => {
    const assignment = makeAssignment({ dueDate: FUTURE, completedAt: null });

    expect(() => assertCanEdit(assignment, NOW)).not.toThrow();
    expect(() => assertCanEdit(assignment, new Date(FUTURE.getTime() + 1))).toThrow(AssignmentStateTransitionError);
  });
});
