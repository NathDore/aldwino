import type { Hono } from "hono";
import { EventValidationError } from "../../../domain/event/EventError";
import type { CreateEventUseCase } from "../../../application/event/CreateEventUseCase";
import type { GetEventByIdUseCase } from "../../../application/event/GetEventByIdUseCase";
import type { ListEventsUseCase } from "../../../application/event/ListEventsUseCase";
import type { UpdateEventUseCase } from "../../../application/event/UpdateEventUseCase";
import type { DeleteEventUseCase } from "../../../application/event/DeleteEventUseCase";

interface EventRouteDeps {
  createEventUseCase: CreateEventUseCase;
  getEventByIdUseCase: GetEventByIdUseCase;
  listEventsUseCase: ListEventsUseCase;
  updateEventUseCase: UpdateEventUseCase;
  deleteEventUseCase: DeleteEventUseCase;
}

export function registerEventRoutes(app: Hono, deps: EventRouteDeps) {
  app.post("/events", async (c) => {
    try {
      const body = await c.req.json() as { startTime?: string; endTime?: string };

      if (!body.startTime || !body.endTime) {
        return c.json(
          { error: "startTime and endTime are required" },
          400,
        );
      }

      const startTime = new Date(body.startTime);
      const endTime = new Date(body.endTime);

      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        return c.json(
          { error: "startTime and endTime must be valid ISO 8601 dates" },
          400,
        );
      }

      const event = deps.createEventUseCase.execute({ startTime, endTime });
      return c.json(event.toJSON(), 201);
    } catch (error) {
      if (error instanceof EventValidationError) {
        return c.json({ error: error.message }, 400);
      }
      throw error;
    }
  });

  app.get("/events/:id", (c) => {
    const id = c.req.param("id");
    const event = deps.getEventByIdUseCase.execute(id);

    if (!event) {
      return c.json({ error: "Event not found" }, 404);
    }

    return c.json(event.toJSON(), 200);
  });

  app.get("/events", (c) => {
    const events = deps.listEventsUseCase.execute();
    return c.json(events.map((e) => e.toJSON()), 200);
  });

  app.put("/events/:id", async (c) => {
    try {
      const id = c.req.param("id");
      const body = await c.req.json() as { startTime?: string; endTime?: string };

      if (!body.startTime || !body.endTime) {
        return c.json(
          { error: "startTime and endTime are required" },
          400,
        );
      }

      const startTime = new Date(body.startTime);
      const endTime = new Date(body.endTime);

      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        return c.json(
          { error: "startTime and endTime must be valid ISO 8601 dates" },
          400,
        );
      }

      const event = deps.updateEventUseCase.execute({ id, startTime, endTime });
      return c.json(event.toJSON(), 200);
    } catch (error) {
      if (error instanceof EventValidationError) {
        return c.json({ error: error.message }, 400);
      }
      if (error instanceof Error && error.message.includes("not found")) {
        return c.json({ error: error.message }, 404);
      }
      throw error;
    }
  });

  app.delete("/events/:id", (c) => {
    try {
      const id = c.req.param("id");
      deps.deleteEventUseCase.execute(id);
      return new Response(null, { status: 204 });
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        return c.json({ error: error.message }, 404);
      }
      throw error;
    }
  });
}
