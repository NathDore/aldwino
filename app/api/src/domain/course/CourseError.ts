export class CourseValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CourseValidationError";
  }
}

export class ColorEmptyError extends CourseValidationError {
  constructor() {
    super("color cannot be empty");
    this.name = "ColorEmptyError";
  }
}

export class ColorTooLongError extends CourseValidationError {
  constructor() {
    super("color must not exceed 150 characters");
    this.name = "ColorTooLongError";
  }
}

export class ColorInvalidFormatError extends CourseValidationError {
  constructor() {
    super("color must be a valid hexadecimal color code");
    this.name = "ColorInvalidFormatError";
  }
}

export class ColorNotAllowedError extends CourseValidationError {
  constructor() {
    super("color must be one of the allowed colors");
    this.name = "ColorNotAllowedError";
  }
}

export class CodeEmptyError extends CourseValidationError {
  constructor() {
    super("code cannot be empty");
    this.name = "CodeEmptyError";
  }
}

export class CodeTooLongError extends CourseValidationError {
  constructor() {
    super("code must not exceed 150 characters");
    this.name = "CodeTooLongError";
  }
}

export class CodeInvalidFormatError extends CourseValidationError {
  constructor() {
    super("code must be 1 to 10 uppercase letters, followed by a dash and a number (e.g. MAT-0130)");
    this.name = "CodeInvalidFormatError";
  }
}

export class TitleEmptyError extends CourseValidationError {
  constructor() {
    super("title cannot be empty");
    this.name = "TitleEmptyError";
  }
}

export class TitleTooLongError extends CourseValidationError {
  constructor() {
    super("title must not exceed 150 characters");
    this.name = "TitleTooLongError";
  }
}

export class CourseCodeAlreadyExistsError extends Error {
  constructor(code: string) {
    super(`Course with code ${code} already exists`);
    this.name = "CourseCodeAlreadyExistsError";
  }
}
