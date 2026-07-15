import { validateColor, validateCode, validateTitle } from "./CourseRules";

export class Course {
  private constructor(
    public readonly id: string,
    public readonly color: string,
    public readonly code: string,
    public readonly title: string,
    public readonly createdAt: Date,
  ) {}

  static create(params: {
    id: string;
    color: string;
    code: string;
    title: string;
    createdAt: Date;
  }): Course {
    validateColor(params.color);
    validateCode(params.code);
    validateTitle(params.title);
    return new Course(params.id, params.color, params.code, params.title, params.createdAt);
  }

  toJSON() {
    return {
      id: this.id,
      color: this.color,
      code: this.code,
      title: this.title,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
