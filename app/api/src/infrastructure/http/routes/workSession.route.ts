import type { Hono } from "hono";
import {
  WorkSessionValidationError,
  WorkSessionStateNotFoundError,
  CannotRescheduleNonSkippedWorkSessionError,
  CannotEditNonInProgressWorkSessionError,
  CannotUncompletePastWorkSessionError,
} from "../../../domain/workSession/WorkSessionError";
import type { CreateWorkSessionUseCase } from "../../../application/workSession/CreateWorkSessionUseCase";
import type { GetWorkSessionByIdUseCase } from "../../../application/workSession/GetWorkSessionByIdUseCase";
import type { ListWorkSessionsUseCase } from "../../../application/workSession/ListWorkSessionsUseCase";
import type { ChangeWorkSessionStateUseCase } from "../../../application/workSession/ChangeWorkSessionStateUseCase";
import type { DeleteWorkSessionUseCase } from "../../../application/workSession/DeleteWorkSessionUseCase";
import type { RescheduleWorkSessionUseCase } from "../../../application/workSession/RescheduleWorkSessionUseCase";
import type { EditWorkSessionUseCase } from "../../../application/workSession/EditWorkSessionUseCase";
import type { WrapUpWorkSessionUseCase } from "../../../application/workSession/WrapUpWorkSessionUseCase";
import type { WorkSessionMergeResult } from "../../../application/workSession/WorkSessionMergeService";
import type { GetRandomWorkSessionCompletionMessageUseCase } from "../../../application/workSession/GetRandomWorkSessionCompletionMessageUseCase";

interface WorkSessionRouteDeps {
  createWorkSessionUseCase: CreateWorkSessionUseCase;
  getWorkSessionByIdUseCase: GetWorkSessionByIdUseCase;
  listWorkSessionsUseCase: ListWorkSessionsUseCase;
  changeWorkSessionStateUseCase: ChangeWorkSessionStateUseCase;
  deleteWorkSessionUseCase: DeleteWorkSessionUseCase;
  rescheduleWorkSessionUseCase: RescheduleWorkSessionUseCase;
  editWorkSessionUseCase: EditWorkSessionUseCase;
  wrapUpWorkSessionUseCase: WrapUpWorkSessionUseCase;
  getRandomWorkSessionCompletionMessageUseCase: GetRandomWorkSessionCompletionMessageUseCase;
}

function handleWorkSessionError(error: unknown) {
  if (
    error instanceof CannotRescheduleNonSkippedWorkSessionError ||
    error instanceof CannotEditNonInProgressWorkSessionError ||
    error instanceof CannotUncompletePastWorkSessionError
  ) {
    return { body: { error: error.message }, status: 409 as const };
  }
  if (error instanceof WorkSessionValidationError) {
    return { body: { error: error.message }, status: 400 as const };
  }
  if (error instanceof WorkSessionStateNotFoundError) {
    return { body: { error: error.message }, status: 404 as const };
  }
  if (error instanceof Error && error.message.includes("not found")) {
    return { body: { error: error.message }, status: 404 as const };
  }
  return null;
}

function toWorkSessionResponse(result: WorkSessionMergeResult) {
  const json = result.session.toJSON();
  return result.mergedFrom.length > 0 ? { ...json, mergedFrom: result.mergedFrom } : json;
}

export function registerWorkSessionRoutes(app: Hono, deps: WorkSessionRouteDeps) {
  app.post("/work-sessions", async (c) => {
    try {
      const body = (await c.req.json()) as {
        startTime?: string;
        endTime?: string;
        workSessionStateId?: string;
      };

      if (!body.startTime || !body.endTime) {
        return c.json({ error: "startTime and endTime are required" }, 400);
      }

      const startTime = new Date(body.startTime);
      if (isNaN(startTime.getTime())) {
        return c.json({ error: "startTime must be a valid ISO 8601 date" }, 400);
      }

      const endTime = new Date(body.endTime);
      if (isNaN(endTime.getTime())) {
        return c.json({ error: "endTime must be a valid ISO 8601 date" }, 400);
      }

      const result = deps.createWorkSessionUseCase.execute({
        startTime,
        endTime,
        workSessionStateId: body.workSessionStateId,
      });
      return c.json(toWorkSessionResponse(result), 201);
    } catch (error) {
      const handled = handleWorkSessionError(error);
      if (handled) {
        return c.json(handled.body, handled.status);
      }
      throw error;
    }
  });

  app.get("/work-sessions/completion-message", (c) => {
    return c.json(deps.getRandomWorkSessionCompletionMessageUseCase.execute(), 200);
  });

  app.get("/work-sessions/:id", (c) => {
    const id = c.req.param("id");
    const workSession = deps.getWorkSessionByIdUseCase.execute(id);
    if (!workSession) {
      return c.json({ error: "WorkSession not found" }, 404);
    }
    return c.json(workSession.toJSON(), 200);
  });

  app.get("/work-sessions", (c) => {
    const workSessions = deps.listWorkSessionsUseCase.execute();
    return c.json(workSessions.map((workSession) => workSession.toJSON()), 200);
  });

  app.patch("/work-sessions/:id/state", async (c) => {
    try {
      const id = c.req.param("id");
      const body = (await c.req.json()) as { workSessionStateId?: string };

      if (!body.workSessionStateId) {
        return c.json({ error: "workSessionStateId is required" }, 400);
      }

      const result = deps.changeWorkSessionStateUseCase.execute({
        id,
        workSessionStateId: body.workSessionStateId,
      });
      return c.json(toWorkSessionResponse(result), 200);
    } catch (error) {
      const handled = handleWorkSessionError(error);
      if (handled) {
        return c.json(handled.body, handled.status);
      }
      throw error;
    }
  });

  app.delete("/work-sessions/:id", (c) => {
    try {
      const id = c.req.param("id");
      deps.deleteWorkSessionUseCase.execute(id);
      return new Response(null, { status: 204 });
    } catch (error) {
      const handled = handleWorkSessionError(error);
      if (handled) {
        return c.json(handled.body, handled.status);
      }
      throw error;
    }
  });

  app.patch("/work-sessions/:id/reschedule", async (c) => {
    try {
      const id = c.req.param("id");
      const body = (await c.req.json()) as { startTime?: string; endTime?: string };

      if (!body.startTime || !body.endTime) {
        return c.json({ error: "startTime and endTime are required" }, 400);
      }

      const startTime = new Date(body.startTime);
      if (isNaN(startTime.getTime())) {
        return c.json({ error: "startTime must be a valid ISO 8601 date" }, 400);
      }

      const endTime = new Date(body.endTime);
      if (isNaN(endTime.getTime())) {
        return c.json({ error: "endTime must be a valid ISO 8601 date" }, 400);
      }

      const result = deps.rescheduleWorkSessionUseCase.execute({ id, startTime, endTime });
      return c.json(toWorkSessionResponse(result), 200);
    } catch (error) {
      const handled = handleWorkSessionError(error);
      if (handled) {
        return c.json(handled.body, handled.status);
      }
      throw error;
    }
  });

  app.patch("/work-sessions/:id/edit", async (c) => {
    try {
      const id = c.req.param("id");
      const body = (await c.req.json()) as { startTime?: string; endTime?: string };

      if (!body.startTime || !body.endTime) {
        return c.json({ error: "startTime and endTime are required" }, 400);
      }

      const startTime = new Date(body.startTime);
      if (isNaN(startTime.getTime())) {
        return c.json({ error: "startTime must be a valid ISO 8601 date" }, 400);
      }

      const endTime = new Date(body.endTime);
      if (isNaN(endTime.getTime())) {
        return c.json({ error: "endTime must be a valid ISO 8601 date" }, 400);
      }

      const result = deps.editWorkSessionUseCase.execute({ id, startTime, endTime });
      return c.json(toWorkSessionResponse(result), 200);
    } catch (error) {
      const handled = handleWorkSessionError(error);
      if (handled) {
        return c.json(handled.body, handled.status);
      }
      throw error;
    }
  });

  app.post("/work-sessions/:id/wrap-up", (c) => {
    try {
      const id = c.req.param("id");
      const workSession = deps.wrapUpWorkSessionUseCase.execute(id);
      return c.json(workSession.toJSON(), 200);
    } catch (error) {
      const handled = handleWorkSessionError(error);
      if (handled) {
        return c.json(handled.body, handled.status);
      }
      throw error;
    }
  });
}
