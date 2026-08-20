import { Database } from "bun:sqlite";
import { Assignment } from "../../src/domain/assignment/Assignment";
import type { Clock } from "../../src/application/health/ports/Clock";
import { migrate as migrateCourses } from "../../src/infrastructure/database/migrations/002_create_course_table";
import { migrate as migrateCourseDeleted } from "../../src/infrastructure/database/migrations/010_add_course_deleted_columns";
import { migrate as migrateAssignmentStateTable } from "../../src/infrastructure/database/migrations/011_create_assignment_state_table";
import { migrate as migrateWorkSessionStateTable } from "../../src/infrastructure/database/migrations/012_create_work_session_state_table";
import { migrate as migrateRecreateAssignment } from "../../src/infrastructure/database/migrations/013_recreate_assignment_table";
import { migrate as migrateWorkSessionTable } from "../../src/infrastructure/database/migrations/014_create_work_session_table";
import { migrate as migrateAssignmentWorkSessionTable } from "../../src/infrastructure/database/migrations/015_create_assignment_work_session_table";
import { migrate as migrateWorkSessionOverlapIndex } from "../../src/infrastructure/database/migrations/016_add_work_session_overlap_index";
import { migrate as migrateAssignmentWrapUpAt } from "../../src/infrastructure/database/migrations/017_add_assignment_wrap_up_at_column";
import { migrate as migrateWorkSessionWrapUpAt } from "../../src/infrastructure/database/migrations/018_add_work_session_wrap_up_at_column";
import { migrate as migrateAssignmentRescheduleAt } from "../../src/infrastructure/database/migrations/019_add_assignment_reschedule_at_column";
import { migrate as migrateWorkSessionRescheduleAt } from "../../src/infrastructure/database/migrations/020_add_work_session_reschedule_at_column";
import { seedAssignmentStates } from "../../src/infrastructure/database/seeds/seedAssignmentStates";
import { seedWorkSessionStates } from "../../src/infrastructure/database/seeds/seedWorkSessionStates";

export const NOW = new Date("2026-06-15T12:00:00.000Z");
export const PAST = new Date("2026-06-01T12:00:00.000Z");
export const FUTURE = new Date("2026-07-01T12:00:00.000Z");

export class FixedClock implements Clock {
  constructor(private current: Date = NOW) {}

  now(): Date {
    return this.current;
  }

  set(next: Date): void {
    this.current = next;
  }
}

/**
 * An in-memory database carrying the same schema the app boots with. The
 * migration list mirrors src/index.ts, minus the ones for dropped tables.
 */
export function createTestDatabase(): Database {
  const db = new Database(":memory:");
  migrateCourses(db);
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
  seedAssignmentStates(db);
  seedWorkSessionStates(db);
  return db;
}

export function makeCourse(db: Database, id = "course-1"): string {
  db.prepare(
    "INSERT INTO courses (id, code, title, color, isDeleted, deletedAt, createdAt) VALUES (?, ?, ?, ?, 0, NULL, ?)",
  ).run(id, "CS-101", "Intro", "#5B8DB8", NOW.toISOString());
  return id;
}

interface AssignmentOverrides {
  id?: string;
  courseId?: string;
  assignmentStateId?: string;
  name?: string;
  dueDate?: Date;
  completedAt?: Date | null;
  wrapUpAt?: Date | null;
  rescheduleAt?: Date | null;
}

export function makeAssignment(overrides: AssignmentOverrides = {}): Assignment {
  return Assignment.create({
    id: overrides.id ?? "assignment-1",
    courseId: overrides.courseId ?? "course-1",
    assignmentStateId: overrides.assignmentStateId ?? "state-uncompleted",
    name: overrides.name ?? "Essay",
    dueDate: overrides.dueDate ?? FUTURE,
    completedAt: overrides.completedAt ?? null,
    wrapUpAt: overrides.wrapUpAt ?? null,
    rescheduleAt: overrides.rescheduleAt ?? null,
    createdAt: NOW,
  });
}

export function stateIdFor(db: Database, state: string): string {
  const row = db.prepare("SELECT id FROM assignmentStates WHERE state = ?").get(state) as { id: string };
  return row.id;
}

export function workSessionStateIdFor(db: Database, state: string): string {
  const row = db.prepare("SELECT id FROM workSessionStates WHERE state = ?").get(state) as { id: string };
  return row.id;
}
