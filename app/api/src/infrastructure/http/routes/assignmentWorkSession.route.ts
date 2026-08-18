import type { Hono } from "hono";
import {
  AssignmentWorkSessionValidationError,
  AssignmentNotFoundError,
  WorkSessionNotFoundError,
  WorkSessionCompletedError,
} from "../../../domain/assignmentWorkSession/AssignmentWorkSessionError";
import type { CreateAssignmentWorkSessionUseCase } from "../../../application/assignmentWorkSession/CreateAssignmentWorkSessionUseCase";
import type { GetAssignmentWorkSessionByIdUseCase } from "../../../application/assignmentWorkSession/GetAssignmentWorkSessionByIdUseCase";
import type { ListAssignmentWorkSessionsUseCase } from "../../../application/assignmentWorkSession/ListAssignmentWorkSessionsUseCase";
import type { UpdateAssignmentWorkSessionUseCase } from "../../../application/assignmentWorkSession/UpdateAssignmentWorkSessionUseCase";
import type { DeleteAssignmentWorkSessionUseCase } from "../../../application/assignmentWorkSession/DeleteAssignmentWorkSessionUseCase";

interface AssignmentWorkSessionRouteDeps {
  createAssignmentWorkSessionUseCase: CreateAssignmentWorkSessionUseCase;
  getAssignmentWorkSessionByIdUseCase: GetAssignmentWorkSessionByIdUseCase;
  listAssignmentWorkSessionsUseCase: ListAssignmentWorkSessionsUseCase;
  updateAssignmentWorkSessionUseCase: UpdateAssignmentWorkSessionUseCase;
  deleteAssignmentWorkSessionUseCase: DeleteAssignmentWorkSessionUseCase;
}

function handleAssignmentWorkSessionError(error: unknown) {
  if (error instanceof AssignmentWorkSessionValidationError) {
    return { body: { error: error.message }, status: 400 as const };
  }
  if (error instanceof AssignmentNotFoundError || error instanceof WorkSessionNotFoundError) {
    return { body: { error: error.message }, status: 404 as const };
  }
  if (error instanceof WorkSessionCompletedError) {
    return { body: { error: error.message }, status: 409 as const };
  }
  if (error instanceof Error && error.message.includes("not found")) {
    return { body: { error: error.message }, status: 404 as const };
  }
  return null;
}

export function registerAssignmentWorkSessionRoutes(app: Hono, deps: AssignmentWorkSessionRouteDeps) {
  app.post("/assignment-work-sessions", async (c) => {
    try {
      const body = (await c.req.json()) as { assignmentId?: string; workSessionId?: string };

      if (!body.assignmentId || !body.workSessionId) {
        return c.json({ error: "assignmentId and workSessionId are required" }, 400);
      }

      const link = deps.createAssignmentWorkSessionUseCase.execute({
        assignmentId: body.assignmentId,
        workSessionId: body.workSessionId,
      });
      return c.json(link.toJSON(), 201);
    } catch (error) {
      const handled = handleAssignmentWorkSessionError(error);
      if (handled) {
        return c.json(handled.body, handled.status);
      }
      throw error;
    }
  });

  app.get("/assignment-work-sessions/:id", (c) => {
    const id = c.req.param("id");
    const link = deps.getAssignmentWorkSessionByIdUseCase.execute(id);
    if (!link) {
      return c.json({ error: "AssignmentWorkSession not found" }, 404);
    }
    return c.json(link.toJSON(), 200);
  });

  app.get("/assignment-work-sessions", (c) => {
    const workSessionId = c.req.query("workSessionId");
    const links = deps.listAssignmentWorkSessionsUseCase.execute(workSessionId ? { workSessionId } : undefined);
    return c.json(links.map((link) => link.toJSON()), 200);
  });

  app.put("/assignment-work-sessions/:id", async (c) => {
    try {
      const id = c.req.param("id");
      const body = (await c.req.json()) as { assignmentId?: string; workSessionId?: string };

      if (!body.assignmentId || !body.workSessionId) {
        return c.json({ error: "assignmentId and workSessionId are required" }, 400);
      }

      const link = deps.updateAssignmentWorkSessionUseCase.execute({
        id,
        assignmentId: body.assignmentId,
        workSessionId: body.workSessionId,
      });
      return c.json(link.toJSON(), 200);
    } catch (error) {
      const handled = handleAssignmentWorkSessionError(error);
      if (handled) {
        return c.json(handled.body, handled.status);
      }
      throw error;
    }
  });

  app.delete("/assignment-work-sessions/:id", (c) => {
    try {
      const id = c.req.param("id");
      deps.deleteAssignmentWorkSessionUseCase.execute(id);
      return new Response(null, { status: 204 });
    } catch (error) {
      const handled = handleAssignmentWorkSessionError(error);
      if (handled) {
        return c.json(handled.body, handled.status);
      }
      throw error;
    }
  });
}
