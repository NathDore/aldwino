import { useQuery } from "@tanstack/react-query";
import { fetchCourses } from "../services/courseService";

export function useCoursesQuery() {
  return useQuery({
    queryKey: ["courses"],
    queryFn: fetchCourses,
  });
}
