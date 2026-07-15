export interface CourseDto {
  id: string;
  color: string;
  code: string;
  title: string;
  createdAt: string;
}

export interface CourseFormData {
  color: string;
  code: string;
  title: string;
}

export interface CourseColor {
  hex: string;
}
