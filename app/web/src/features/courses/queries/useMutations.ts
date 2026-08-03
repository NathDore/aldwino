import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCourse } from "../services/courseService";

export function useCreateCourseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}
