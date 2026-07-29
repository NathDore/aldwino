import Database from "bun:sqlite";
import { randomUUID } from "crypto";

const db = new Database("app/api/aldwino.db");

// Get all current assignments with their event details
const assignments = db
  .prepare(
    `SELECT
      a.id,
      a.courseId,
      a.description,
      a.dueDate,
      a.startTime,
      a.expectedDurationMinutes,
      e.startTime as eventStart,
      e.endTime as eventEnd
     FROM assignments a
     LEFT JOIN events e ON a.eventId = e.id
     ORDER BY e.startTime`
  )
  .all() as any[];

console.log("Current assignments:");
console.log(JSON.stringify(assignments, null, 2));

// Creative assignment names to use
const creativeNames = [
  "Calculus Problem Set",
  "Literature Essay Draft",
  "Physics Lab Report",
  "History Research Project",
  "Chemistry Experiment Notes",
  "Biology Study Guide",
  "Programming Assignment",
  "Data Analysis Task",
  "Design Mockups",
  "Presentation Slides",
  "Case Study Analysis",
  "Reading Comprehension",
  "Article Summary",
  "Code Review",
  "Debugging Exercise",
  "Documentation Update",
  "Team Collaboration",
  "Final Review",
  "Mock Exam",
  "Portfolio Update",
];

let nameIndex = 0;

// Delete all assignments
const deleteResult = db.exec("DELETE FROM assignments");
console.log("Deleted all assignments");

// Recreate assignments with creative names, keeping the same timing
assignments.forEach((assignment) => {
  const newName = creativeNames[nameIndex % creativeNames.length];
  nameIndex++;

  const newId = randomUUID();
  const now = new Date().toISOString();

  db.prepare(
    `INSERT INTO assignments (id, courseId, eventId, description, dueDate, isCompleted, createdAt)
     VALUES (?, ?, ?, ?, ?, 0, ?)`
  ).run(newId, assignment.courseId, assignment.eventId, newName, assignment.dueDate, now);

  console.log(`Created: ${newName} (${assignment.courseId})`);
});

console.log("\nRecreation complete!");
db.close();
