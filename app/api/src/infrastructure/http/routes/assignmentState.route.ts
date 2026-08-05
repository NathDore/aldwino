import type { Hono } from "hono";
import type { ListAssignmentStatesUseCase } from "../../../application/assignmentState/ListAssignmentStatesUseCase";

interface AssignmentStateRouteDeps {
  listAssignmentStatesUseCase: ListAssignmentStatesUseCase;
}

export function registerAssignmentStateRoutes(app: Hono, deps: AssignmentStateRouteDeps) {
  app.get("/assignment-states", (c) => {
    const states = deps.listAssignmentStatesUseCase.execute();
    return c.json(states.map((state) => state.toJSON()), 200);
  });
}
