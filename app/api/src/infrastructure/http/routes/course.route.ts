import type { Hono } from "hono";
import { CourseValidationError, CourseCodeAlreadyExistsError } from "../../../domain/course/CourseError";
import type { CreateCourseUseCase } from "../../../application/course/CreateCourseUseCase";
import type { GetCourseByIdUseCase } from "../../../application/course/GetCourseByIdUseCase";
import type { ListCoursesUseCase } from "../../../application/course/ListCoursesUseCase";
import type { UpdateCourseUseCase } from "../../../application/course/UpdateCourseUseCase";
import type { DeleteCourseUseCase } from "../../../application/course/DeleteCourseUseCase";

interface CourseRouteDeps {
  createCourseUseCase: CreateCourseUseCase;
  getCourseByIdUseCase: GetCourseByIdUseCase;
  listCoursesUseCase: ListCoursesUseCase;
  updateCourseUseCase: UpdateCourseUseCase;
  deleteCourseUseCase: DeleteCourseUseCase;
}

function handleCourseError(error: unknown) {
  if (error instanceof CourseValidationError) {
    return { body: { error: error.message }, status: 400 as const };
  }
  if (error instanceof CourseCodeAlreadyExistsError) {
    return { body: { error: error.message }, status: 409 as const };
  }
  if (error instanceof Error && error.message.includes("not found")) {
    return { body: { error: error.message }, status: 404 as const };
  }
  return null;
}

export function registerCourseRoutes(app: Hono, deps: CourseRouteDeps) {
  app.post("/courses", async (c) => {
    try {
      const body = (await c.req.json()) as { color?: string; code?: string; title?: string };

      if (!body.color || !body.code || !body.title) {
        return c.json({ error: "color, code and title are required" }, 400);
      }

      const course = deps.createCourseUseCase.execute({
        color: body.color,
        code: body.code,
        title: body.title,
      });
      return c.json(course.toJSON(), 201);
    } catch (error) {
      const handled = handleCourseError(error);
      if (handled) {
        return c.json(handled.body, handled.status);
      }
      throw error;
    }
  });

  app.get("/courses/:id", (c) => {
    const id = c.req.param("id");
    const course = deps.getCourseByIdUseCase.execute(id);
    if (!course) {
      return c.json({ error: "Course not found" }, 404);
    }
    return c.json(course.toJSON(), 200);
  });

  app.get("/courses", (c) => {
    const courses = deps.listCoursesUseCase.execute();
    return c.json(courses.map((course) => course.toJSON()), 200);
  });

  app.put("/courses/:id", async (c) => {
    try {
      const id = c.req.param("id");
      const body = (await c.req.json()) as { color?: string; code?: string; title?: string };

      if (!body.color || !body.code || !body.title) {
        return c.json({ error: "color, code and title are required" }, 400);
      }

      const course = deps.updateCourseUseCase.execute({
        id,
        color: body.color,
        code: body.code,
        title: body.title,
      });
      return c.json(course.toJSON(), 200);
    } catch (error) {
      const handled = handleCourseError(error);
      if (handled) {
        return c.json(handled.body, handled.status);
      }
      throw error;
    }
  });

  app.delete("/courses/:id", (c) => {
    try {
      const id = c.req.param("id");
      deps.deleteCourseUseCase.execute(id);
      return new Response(null, { status: 204 });
    } catch (error) {
      const handled = handleCourseError(error);
      if (handled) {
        return c.json(handled.body, handled.status);
      }
      throw error;
    }
  });
}
