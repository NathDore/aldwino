import type { Hono } from "hono";
import {
  AssignmentValidationError,
  AssignmentStateTransitionError,
  CourseNotFoundError,
  AssignmentStateNotFoundError,
} from "../../../domain/assignment/AssignmentError";
import type { CreateAssignmentUseCase } from "../../../application/assignment/CreateAssignmentUseCase";
import type { GetAssignmentByIdUseCase } from "../../../application/assignment/GetAssignmentByIdUseCase";
import type { ListAssignmentsUseCase } from "../../../application/assignment/ListAssignmentsUseCase";
import type { UpdateAssignmentUseCase } from "../../../application/assignment/UpdateAssignmentUseCase";
import type { DeleteAssignmentUseCase } from "../../../application/assignment/DeleteAssignmentUseCase";
import type { CompleteAssignmentUseCase } from "../../../application/assignment/CompleteAssignmentUseCase";
import type { UncompleteAssignmentUseCase } from "../../../application/assignment/UncompleteAssignmentUseCase";
import type { RescheduleAssignmentUseCase } from "../../../application/assignment/RescheduleAssignmentUseCase";
import type { WrapUpAssignmentUseCase } from "../../../application/assignment/WrapUpAssignmentUseCase";
import type { WrapUpLateAssignmentUseCase } from "../../../application/assignment/WrapUpLateAssignmentUseCase";

interface AssignmentRouteDeps {
  createAssignmentUseCase: CreateAssignmentUseCase;
  getAssignmentByIdUseCase: GetAssignmentByIdUseCase;
  listAssignmentsUseCase: ListAssignmentsUseCase;
  updateAssignmentUseCase: UpdateAssignmentUseCase;
  deleteAssignmentUseCase: DeleteAssignmentUseCase;
  completeAssignmentUseCase: CompleteAssignmentUseCase;
  uncompleteAssignmentUseCase: UncompleteAssignmentUseCase;
  rescheduleAssignmentUseCase: RescheduleAssignmentUseCase;
  wrapUpAssignmentUseCase: WrapUpAssignmentUseCase;
  wrapUpLateAssignmentUseCase: WrapUpLateAssignmentUseCase;
}

function handleAssignmentError(error: unknown) {
  if (error instanceof AssignmentStateTransitionError) {
    return { body: { error: error.message }, status: 409 as const };
  }
  if (error instanceof AssignmentValidationError) {
    return { body: { error: error.message }, status: 400 as const };
  }
  if (error instanceof CourseNotFoundError || error instanceof AssignmentStateNotFoundError) {
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
        name?: string;
        dueDate?: string;
      };

      if (!body.courseId || !body.name || !body.dueDate) {
        return c.json({ error: "courseId, name and dueDate are required" }, 400);
      }

      const dueDate = new Date(body.dueDate);
      if (isNaN(dueDate.getTime())) {
        return c.json({ error: "dueDate must be a valid ISO 8601 date" }, 400);
      }

      const assignment = deps.createAssignmentUseCase.execute({
        courseId: body.courseId,
        name: body.name,
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
        name?: string;
        dueDate?: string;
      };

      if (!body.courseId || !body.name || !body.dueDate) {
        return c.json({ error: "courseId, name and dueDate are required" }, 400);
      }

      const dueDate = new Date(body.dueDate);
      if (isNaN(dueDate.getTime())) {
        return c.json({ error: "dueDate must be a valid ISO 8601 date" }, 400);
      }

      const assignment = deps.updateAssignmentUseCase.execute({
        id,
        courseId: body.courseId,
        name: body.name,
        dueDate,
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

  app.patch("/assignments/:id/reschedule", async (c) => {
    try {
      const id = c.req.param("id");
      const body = (await c.req.json()) as { dueDate?: string };

      if (!body.dueDate) {
        return c.json({ error: "dueDate is required" }, 400);
      }

      const dueDate = new Date(body.dueDate);
      if (isNaN(dueDate.getTime())) {
        return c.json({ error: "dueDate must be a valid ISO 8601 date" }, 400);
      }

      const assignment = deps.rescheduleAssignmentUseCase.execute({ id, dueDate });
      return c.json(assignment.toJSON(), 200);
    } catch (error) {
      const handled = handleAssignmentError(error);
      if (handled) {
        return c.json(handled.body, handled.status);
      }
      throw error;
    }
  });

  app.post("/assignments/:id/complete", (c) => {
    try {
      const assignment = deps.completeAssignmentUseCase.execute(c.req.param("id"));
      return c.json(assignment.toJSON(), 200);
    } catch (error) {
      const handled = handleAssignmentError(error);
      if (handled) {
        return c.json(handled.body, handled.status);
      }
      throw error;
    }
  });

  app.post("/assignments/:id/uncomplete", (c) => {
    try {
      const assignment = deps.uncompleteAssignmentUseCase.execute(c.req.param("id"));
      return c.json(assignment.toJSON(), 200);
    } catch (error) {
      const handled = handleAssignmentError(error);
      if (handled) {
        return c.json(handled.body, handled.status);
      }
      throw error;
    }
  });

  app.post("/assignments/:id/wrap-up", (c) => {
    try {
      const id = c.req.param("id");
      const assignment = deps.wrapUpAssignmentUseCase.execute(id);
      return c.json(assignment.toJSON(), 200);
    } catch (error) {
      const handled = handleAssignmentError(error);
      if (handled) {
        return c.json(handled.body, handled.status);
      }
      throw error;
    }
  });

  app.post("/assignments/:id/wrap-up-late", (c) => {
    try {
      const id = c.req.param("id");
      const assignment = deps.wrapUpLateAssignmentUseCase.execute(id);
      return c.json(assignment.toJSON(), 200);
    } catch (error) {
      const handled = handleAssignmentError(error);
      if (handled) {
        return c.json(handled.body, handled.status);
      }
      throw error;
    }
  });
}
