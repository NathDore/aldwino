import type { Hono } from "hono";
import { NotificationNotFoundError } from "../../../domain/notification/NotificationError";
import type { ListNotificationsUseCase } from "../../../application/notification/ListNotificationsUseCase";
import type { MarkNotificationReadUseCase } from "../../../application/notification/MarkNotificationReadUseCase";

interface NotificationRouteDeps {
  listNotificationsUseCase: ListNotificationsUseCase;
  markNotificationReadUseCase: MarkNotificationReadUseCase;
}

function handleNotificationError(error: unknown) {
  if (error instanceof NotificationNotFoundError) {
    return { body: { error: error.message }, status: 404 as const };
  }
  return null;
}

export function registerNotificationRoutes(app: Hono, deps: NotificationRouteDeps) {
  app.get("/notifications", (c) => {
    const notifications = deps.listNotificationsUseCase.execute();
    return c.json(notifications.map((notification) => notification.toJSON()), 200);
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
