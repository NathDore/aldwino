import { beforeEach, describe, expect, test } from "bun:test";
import type { Database } from "bun:sqlite";
import { AssignmentRepository } from "../src/infrastructure/database/repositories/AssignmentRepository";
import { CourseRepository } from "../src/infrastructure/database/repositories/CourseRepository";
import { WorkSessionRepository } from "../src/infrastructure/database/repositories/WorkSessionRepository";
import { PurgeDeletedAssignmentsUseCase } from "../src/application/assignment/PurgeDeletedAssignmentsUseCase";
import { PurgeDeletedCoursesUseCase } from "../src/application/course/PurgeDeletedCoursesUseCase";
import { PurgeDeletedWorkSessionsUseCase } from "../src/application/workSession/PurgeDeletedWorkSessionsUseCase";
import { Assignment } from "../src/domain/assignment/Assignment";
import { Course } from "../src/domain/course/Course";
import { WorkSession } from "../src/domain/workSession/WorkSession";
import { createTestDatabase, makeCourse, FixedClock, NOW, stateIdFor, workSessionStateIdFor } from "./support/fixtures";

let db: Database;
let clock: FixedClock;
let assignmentRepository: AssignmentRepository;
let courseRepository: CourseRepository;
let workSessionRepository: WorkSessionRepository;

let purgeAssignments: PurgeDeletedAssignmentsUseCase;
let purgeCourses: PurgeDeletedCoursesUseCase;
let purgeWorkSessions: PurgeDeletedWorkSessionsUseCase;

const EIGHT_DAYS_AGO = new Date(NOW.getTime() - 8 * 24 * 60 * 60 * 1000);
const YESTERDAY = new Date(NOW.getTime() - 24 * 60 * 60 * 1000);

beforeEach(() => {
  db = createTestDatabase();
  clock = new FixedClock(NOW);
  assignmentRepository = new AssignmentRepository(db);
  courseRepository = new CourseRepository(db);
  workSessionRepository = new WorkSessionRepository(db);
  makeCourse(db);

  purgeAssignments = new PurgeDeletedAssignmentsUseCase(assignmentRepository, clock);
  purgeCourses = new PurgeDeletedCoursesUseCase(courseRepository, clock);
  purgeWorkSessions = new PurgeDeletedWorkSessionsUseCase(workSessionRepository, clock);
});

function rowCount(table: string, id: string): number {
  const row = db.prepare(`SELECT COUNT(*) as c FROM ${table} WHERE id = ?`).get(id) as { c: number };
  return row.c;
}

describe("PurgeDeletedAssignmentsUseCase", () => {
  function makeTestAssignment(id: string, deletedAt: Date | null) {
    return Assignment.create({
      id,
      courseId: "course-1",
      assignmentStateId: stateIdFor(db, "UNCOMPLETED"),
      name: "Purge Test",
      dueDate: new Date("2026-07-01T12:00:00.000Z"),
      completedAt: null,
      isDeleted: deletedAt !== null,
      deletedAt,
      createdAt: NOW,
    });
  }

  test("purges an assignment soft-deleted more than a week ago", () => {
    const assignment = assignmentRepository.create(makeTestAssignment("old-assignment", EIGHT_DAYS_AGO));

    const purged = purgeAssignments.execute();

    expect(purged).toBe(1);
    expect(rowCount("assignments", assignment.id)).toBe(0);
  });

  test("keeps an assignment soft-deleted within the retention window", () => {
    const assignment = assignmentRepository.create(makeTestAssignment("recent-assignment", YESTERDAY));

    const purged = purgeAssignments.execute();

    expect(purged).toBe(0);
    expect(rowCount("assignments", assignment.id)).toBe(1);
  });

  test("leaves a non-deleted assignment alone", () => {
    const assignment = assignmentRepository.create(makeTestAssignment("active-assignment", null));

    const purged = purgeAssignments.execute();

    expect(purged).toBe(0);
    expect(rowCount("assignments", assignment.id)).toBe(1);
  });
});

describe("PurgeDeletedCoursesUseCase", () => {
  function makeTestCourse(id: string, deletedAt: Date | null) {
    return Course.create({
      id,
      color: "#5B8DB8",
      code: "CS-999",
      title: "Purge Test",
      isDeleted: deletedAt !== null,
      deletedAt,
      createdAt: NOW,
    });
  }

  test("purges a course soft-deleted more than a week ago", () => {
    const course = courseRepository.create(makeTestCourse("old-course", EIGHT_DAYS_AGO));

    const purged = purgeCourses.execute();

    expect(purged).toBe(1);
    expect(rowCount("courses", course.id)).toBe(0);
  });

  test("keeps a course soft-deleted within the retention window", () => {
    const course = courseRepository.create(makeTestCourse("recent-course", YESTERDAY));

    const purged = purgeCourses.execute();

    expect(purged).toBe(0);
    expect(rowCount("courses", course.id)).toBe(1);
  });

  test("leaves a non-deleted course alone", () => {
    const course = courseRepository.create(makeTestCourse("active-course", null));

    const purged = purgeCourses.execute();

    expect(purged).toBe(0);
    expect(rowCount("courses", course.id)).toBe(1);
  });
});

describe("PurgeDeletedWorkSessionsUseCase", () => {
  function makeTestWorkSession(id: string, deletedAt: Date | null) {
    return WorkSession.create({
      id,
      workSessionStateId: workSessionStateIdFor(db, "INPROGRESS"),
      startTime: new Date("2026-06-15T14:00:00.000Z"),
      endTime: new Date("2026-06-15T16:00:00.000Z"),
      completedAt: null,
      isDeleted: deletedAt !== null,
      deletedAt,
      createdAt: NOW,
    });
  }

  test("purges a work session soft-deleted more than a week ago", () => {
    const session = workSessionRepository.create(makeTestWorkSession("old-session", EIGHT_DAYS_AGO));

    const purged = purgeWorkSessions.execute();

    expect(purged).toBe(1);
    expect(rowCount("workSessions", session.id)).toBe(0);
  });

  test("keeps a work session soft-deleted within the retention window", () => {
    const session = workSessionRepository.create(makeTestWorkSession("recent-session", YESTERDAY));

    const purged = purgeWorkSessions.execute();

    expect(purged).toBe(0);
    expect(rowCount("workSessions", session.id)).toBe(1);
  });

  test("leaves a non-deleted work session alone", () => {
    const session = workSessionRepository.create(makeTestWorkSession("active-session", null));

    const purged = purgeWorkSessions.execute();

    expect(purged).toBe(0);
    expect(rowCount("workSessions", session.id)).toBe(1);
  });
});
