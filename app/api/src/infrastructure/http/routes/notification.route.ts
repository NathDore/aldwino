import type { Hono } from "hono";
import { NotificationNotFoundError } from "../../../domain/notification/NotificationError";
import type { ListNotificationsUseCase } from "../../../application/notification/ListNotificationsUseCase";
import type { MarkNotificationReadUseCase } from "../../../application/notification/MarkNotificationReadUseCase";
import type { GetNotificationByIdUseCase } from "../../../application/notification/GetNotificationByIdUseCase";

interface NotificationRouteDeps {
  listNotificationsUseCase: ListNotificationsUseCase;
  markNotificationReadUseCase: MarkNotificationReadUseCase;
  getNotificationByIdUseCase: GetNotificationByIdUseCase;
}

function handleNotificationError(error: unknown) {
  if (error instanceof NotificationNotFoundError) {
    return { body: { error: error.message }, status: 404 as const };
  }
  return null;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function parseLimit(raw: string | undefined): number {
  const parsed = Number(raw);
  if (!raw || !Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_LIMIT;
  }
  return Math.min(parsed, MAX_LIMIT);
}

function parseOffset(raw: string | undefined): number {
  const parsed = Number(raw);
  if (!raw || !Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }
  return parsed;
}

export function registerNotificationRoutes(app: Hono, deps: NotificationRouteDeps) {
  app.get("/notifications", (c) => {
    const limit = parseLimit(c.req.query("limit"));
    const offset = parseOffset(c.req.query("offset"));
    const { items, total, unreadCount } = deps.listNotificationsUseCase.execute({ limit, offset });
    return c.json({ items: items.map((notification) => notification.toJSON()), total, unreadCount }, 200);
  });

  app.get("/notifications/:id", (c) => {
    const notification = deps.getNotificationByIdUseCase.execute(c.req.param("id"));
    if (!notification) {
      return c.json({ error: "Notification not found" }, 404);
    }
    return c.json(notification.toJSON(), 200);
  });

  app.post("/notifications/:id/read", (c) => {
    try {
      const id = c.req.param("id");
      const notification = deps.markNotificationReadUseCase.execute(id);
      return c.json(notification.toJSON(), 200);
    } catch (error) {
      const handled = handleNotificationError(error);
      if (handled) {
        return c.json(handled.body, handled.status);
      }
      throw error;
    }
  });
}
