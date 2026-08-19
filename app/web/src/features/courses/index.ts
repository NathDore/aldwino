export { useCoursesQuery } from "./queries/useCoursesQuery";
export { useAllowedColorsQuery } from "./queries/useAllowedColorsQuery";
export { useCreateCourseMutation, useUpdateCourseMutation, useDeleteCourseMutation } from "./queries/useMutations";
export { formatCourseLabel } from "./utils/formatCourseLabel";
export { EditCourseForm } from "./components/EditCourseForm";
export type { CourseDto, CourseFormData, CourseColor } from "./types/course.types";
