import type { Hono } from "hono";
import { TaskValidationError, AssignmentNotFoundError } from "../../../domain/task/TaskError";
import type { CreateTaskUseCase } from "../../../application/task/CreateTaskUseCase";
import type { GetTaskByIdUseCase } from "../../../application/task/GetTaskByIdUseCase";
import type { ListTasksUseCase } from "../../../application/task/ListTasksUseCase";
import type { UpdateTaskUseCase } from "../../../application/task/UpdateTaskUseCase";
import type { DeleteTaskUseCase } from "../../../application/task/DeleteTaskUseCase";

interface TaskRouteDeps {
  createTaskUseCase: CreateTaskUseCase;
  getTaskByIdUseCase: GetTaskByIdUseCase;
  listTasksUseCase: ListTasksUseCase;
  updateTaskUseCase: UpdateTaskUseCase;
  deleteTaskUseCase: DeleteTaskUseCase;
}

function handleTaskError(error: unknown) {
  if (error instanceof TaskValidationError) {
    return { body: { error: error.message }, status: 400 as const };
  }
  if (error instanceof AssignmentNotFoundError) {
    return { body: { error: error.message }, status: 404 as const };
  }
  if (error instanceof Error && error.message.includes("not found")) {
    return { body: { error: error.message }, status: 404 as const };
  }
  return null;
}

export function registerTaskRoutes(app: Hono, deps: TaskRouteDeps) {
  app.post("/tasks", async (c) => {
    try {
      const body = (await c.req.json()) as {
        assignmentId?: string;
        description?: string;
      };

      if (!body.assignmentId || !body.description) {
        return c.json({ error: "assignmentId and description are required" }, 400);
      }

      const task = deps.createTaskUseCase.execute({
        assignmentId: body.assignmentId,
        description: body.description,
      });
      return c.json(task.toJSON(), 201);
    } catch (error) {
      const handled = handleTaskError(error);
      if (handled) {
        return c.json(handled.body, handled.status);
      }
      throw error;
    }
  });

  app.get("/tasks/:id", (c) => {
    const id = c.req.param("id");
    const task = deps.getTaskByIdUseCase.execute(id);
    if (!task) {
      return c.json({ error: "Task not found" }, 404);
    }
    return c.json(task.toJSON(), 200);
  });

  app.get("/tasks", (c) => {
    const tasks = deps.listTasksUseCase.execute();
    return c.json(tasks.map((task) => task.toJSON()), 200);
  });

  app.put("/tasks/:id", async (c) => {
    try {
      const id = c.req.param("id");
      const body = (await c.req.json()) as {
        assignmentId?: string;
        description?: string;
        isCompleted?: boolean;
      };

      if (!body.assignmentId || !body.description || body.isCompleted === undefined) {
        return c.json(
          { error: "assignmentId, description and isCompleted are required" },
          400,
        );
      }

      const task = deps.updateTaskUseCase.execute({
        id,
        assignmentId: body.assignmentId,
        description: body.description,
        isCompleted: body.isCompleted,
      });
      return c.json(task.toJSON(), 200);
    } catch (error) {
      const handled = handleTaskError(error);
      if (handled) {
        return c.json(handled.body, handled.status);
      }
      throw error;
    }
  });

  app.delete("/tasks/:id", (c) => {
    try {
      const id = c.req.param("id");
      deps.deleteTaskUseCase.execute(id);
      return new Response(null, { status: 204 });
    } catch (error) {
      const handled = handleTaskError(error);
      if (handled) {
        return c.json(handled.body, handled.status);
      }
      throw error;
    }
  });
}
