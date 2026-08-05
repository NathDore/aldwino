import type { Hono } from "hono";
import type { ListWorkSessionStatesUseCase } from "../../../application/workSessionState/ListWorkSessionStatesUseCase";

interface WorkSessionStateRouteDeps {
  listWorkSessionStatesUseCase: ListWorkSessionStatesUseCase;
}

export function registerWorkSessionStateRoutes(app: Hono, deps: WorkSessionStateRouteDeps) {
  app.get("/work-session-states", (c) => {
    const states = deps.listWorkSessionStatesUseCase.execute();
    return c.json(states.map((state) => state.toJSON()), 200);
  });
}
