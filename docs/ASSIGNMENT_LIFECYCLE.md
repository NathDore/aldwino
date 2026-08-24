# Assignment Lifecycle

This explains how an assignment's status is tracked, and why it's built the way it is.

## The four states

An assignment is always in exactly one of:

- `UPCOMING` — not completed, due date hasn't passed
- `OVERDUE` — not completed, due date has passed
- `COMPLETED` — completed, before its due date passed (or on time)
- `COMPLETED_OVERDUE` — completed, but after its due date had already passed

## Derived, not stored

There is no `status` column in the database for an assignment. The status is calculated on demand, every time it's needed, from just two fields: `dueDate` and `completedAt` (`resolveLifecycle` in [`app/api/src/domain/assignment/AssignmentLifecycle.ts`](../app/api/src/domain/assignment/AssignmentLifecycle.ts)):

```ts
function resolveLifecycle(assignment, now) {
  const isCompleted = assignment.completedAt !== null;
  const isOverdue = assignment.dueDate < now;

  if (isCompleted) return isOverdue ? "COMPLETED_OVERDUE" : "COMPLETED";
  return isOverdue ? "OVERDUE" : "UPCOMING";
}
```

**Why this matters:** if status were instead a flag stored in the database, every code path that touches an assignment would need to remember to update it correctly — miss one, and the assignment could show a stale status (e.g. still "OVERDUE" after being marked complete). By computing it fresh from `dueDate`/`completedAt`/`now` instead, there's no separate value to forget to update — the status is always consistent with the underlying data, by construction.

## Guarded transitions

Every action that changes an assignment first re-derives its current state and only proceeds if that action is actually valid from there. Each guard lives next to `resolveLifecycle` and throws a typed error if the transition isn't allowed:

| Action | Allowed from |
| --- | --- |
| Complete | `UPCOMING` |
| Uncomplete | `COMPLETED` |
| Edit | `UPCOMING` |
| Delete | `UPCOMING` |
| Reschedule | `OVERDUE` |
| Link to a work session | `UPCOMING` |
| Wrap up | `COMPLETED`, `COMPLETED_OVERDUE` |
| Wrap up late | `OVERDUE` |

For example, trying to delete an assignment that's already `OVERDUE` or `COMPLETED` throws `CannotDeleteAssignmentError` rather than silently deleting it — deleting is only meaningful while it's still `UPCOMING`.

The same derive-then-guard pattern (state re-checked before every mutating action) is used elsewhere in the backend for lifecycle-sensitive entities, such as work sessions.

## Tested exhaustively

[`app/api/tests/AssignmentLifecycle.test.ts`](../app/api/tests/AssignmentLifecycle.test.ts) doesn't just test the happy path — it runs every action against every state (a full state × action matrix) and asserts each combination either succeeds or throws, whichever is correct. That's 4 states × 8 actions = 32 checks, so a change that accidentally loosens or tightens a guard's allowed states gets caught immediately, no matter which state/action pair it affects.
