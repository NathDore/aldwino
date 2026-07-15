import type { Hono } from "hono";
import { AssignmentValidationError, CourseNotFoundError, EventNotFoundError } from "../../../domain/assignment/AssignmentError";
import type { CreateAssignmentUseCase } from "../../../application/assignment/CreateAssignmentUseCase";
import type { GetAssignmentByIdUseCase } from "../../../application/assignment/GetAssignmentByIdUseCase";
import type { ListAssignmentsUseCase } from "../../../application/assignment/ListAssignmentsUseCase";
import type { UpdateAssignmentUseCase } from "../../../application/assignment/UpdateAssignmentUseCase";
import type { DeleteAssignmentUseCase } from "../../../application/assignment/DeleteAssignmentUseCase";

interface AssignmentRouteDeps {
  createAssignmentUseCase: CreateAssignmentUseCase;
  getAssignmentByIdUseCase: GetAssignmentByIdUseCase;
  listAssignmentsUseCase: ListAssignmentsUseCase;
  updateAssignmentUseCase: UpdateAssignmentUseCase;
  deleteAssignmentUseCase: DeleteAssignmentUseCase;
}

function handleAssignmentError(error: unknown) {
  if (error instanceof AssignmentValidationError) {
    return { body: { error: error.message }, status: 400 as const };
  }
  if (error instanceof CourseNotFoundError || error instanceof EventNotFoundError) {
    return { body: { error: error.message }, status: 404 as const };
  }
  if (error instanceof Error && error.message.includes("not found")) {
    return { body: { error: error.message }, status: 404 as const };
  }
  return null;
}

export function registerAssignmentRoutes(app: Hono, deps: AssignmentRouteDeps) {
  app.post("/assignments", async (c) => {
    try {
      const body = (await c.req.json()) as {
        courseId?: string;
        eventId?: string;
        description?: string;
        dueDate?: string;
      };

      if (!body.courseId || !body.eventId || !body.description || !body.dueDate) {
        return c.json({ error: "courseId, eventId, description and dueDate are required" }, 400);
      }

      const dueDate = new Date(body.dueDate);
      if (isNaN(dueDate.getTime())) {
        return c.json({ error: "dueDate must be a valid ISO 8601 date" }, 400);
      }

      const assignment = deps.createAssignmentUseCase.execute({
        courseId: body.courseId,
        eventId: body.eventId,
        description: body.description,
        dueDate,
      });
      return c.json(assignment.toJSON(), 201);
    } catch (error) {
      const handled = handleAssignmentError(error);
      if (handled) {
        return c.json(handled.body, handled.status);
      }
      throw error;
    }
  });

  app.get("/assignments/:id", (c) => {
    const id = c.req.param("id");
    const assignment = deps.getAssignmentByIdUseCase.execute(id);
    if (!assignment) {
      return c.json({ error: "Assignment not found" }, 404);
    }
    return c.json(assignment.toJSON(), 200);
  });

  app.get("/assignments", (c) => {
    const assignments = deps.listAssignmentsUseCase.execute();
    return c.json(assignments.map((assignment) => assignment.toJSON()), 200);
  });

  app.put("/assignments/:id", async (c) => {
    try {
      const id = c.req.param("id");
      const body = (await c.req.json()) as {
        courseId?: string;
        eventId?: string;
        description?: string;
        dueDate?: string;
        isCompleted?: boolean;
      };

      if (!body.courseId || !body.eventId || !body.description || !body.dueDate || body.isCompleted === undefined) {
        return c.json(
          { error: "courseId, eventId, description, dueDate and isCompleted are required" },
          400,
        );
      }

      const dueDate = new Date(body.dueDate);
      if (isNaN(dueDate.getTime())) {
        return c.json({ error: "dueDate must be a valid ISO 8601 date" }, 400);
      }

      const assignment = deps.updateAssignmentUseCase.execute({
        id,
        courseId: body.courseId,
        eventId: body.eventId,
        description: body.description,
        dueDate,
        isCompleted: body.isCompleted,
      });
      return c.json(assignment.toJSON(), 200);
    } catch (error) {
      const handled = handleAssignmentError(error);
      if (handled) {
        return c.json(handled.body, handled.status);
      }
      throw error;
    }
  });

  app.delete("/assignments/:id", (c) => {
    try {
      const id = c.req.param("id");
      deps.deleteAssignmentUseCase.execute(id);
      return new Response(null, { status: 204 });
    } catch (error) {
      const handled = handleAssignmentError(error);
      if (handled) {
        return c.json(handled.body, handled.status);
      }
      throw error;
    }
  });
}
