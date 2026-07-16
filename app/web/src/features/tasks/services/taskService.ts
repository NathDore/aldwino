import { apiClient } from "@/shared/lib/apiClient";
import { TaskDto, TaskFormData } from "../types/task.types";

export const taskService = {
  fetchTasks: () => apiClient<TaskDto[]>("/tasks"),

  createTask: (data: TaskFormData) =>
    apiClient<TaskDto>("/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  updateTask: (id: string, data: TaskFormData) =>
    apiClient<TaskDto>(`/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  deleteTask: (id: string) =>
    apiClient<void>(`/tasks/${id}`, {
      method: "DELETE",
    }),
};
