import { useQuery } from "@tanstack/react-query";
import { taskService } from "../services/taskService";
import { TaskDto } from "../types/task.types";

export const useTasksQuery = () => {
  return useQuery<TaskDto[]>({
    queryKey: ["tasks"],
    queryFn: taskService.fetchTasks,
  });
};
