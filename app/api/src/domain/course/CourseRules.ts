import {
  ColorEmptyError,
  ColorInvalidFormatError,
  ColorNotAllowedError,
  ColorTooLongError,
  CodeEmptyError,
  CodeInvalidFormatError,
  CodeTooLongError,
  TitleEmptyError,
  TitleTooLongError,
} from "./CourseError";

const MAX_LENGTH = 150;

const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;
const CODE_PATTERN = /^[A-Z]{1,10}-\d+$/;

const ALLOWED_COLORS: readonly string[] = [
  // Blues
  "#5B8DB8",
  "#3A6F9F",
  "#7BAFD4",
  "#2E5F8A",
  "#A8C8E8",
  // Oranges & Reds
  "#C97A3E",
  "#E8955A",
  "#B05C2A",
  "#D4A574",
  "#C0392B",
  // Purples
  "#8B6AAF",
  "#6A4E8F",
  "#A98CC8",
  "#4A3470",
  "#C4A8E0",
  // Greens
  "#4DA57A",
  "#2E8A5F",
  "#6FC494",
  "#1A6B45",
  "#9ADBB4",
  // Neutrals & Others
  "#E8A0B4",
  "#F0C040",
  "#7A9E7E",
  "#D4726A",
  "#5C7A9F",
];

export function validateColor(color: string): void {
  if (color.length === 0) {
    throw new ColorEmptyError();
  }
  if (color.length > MAX_LENGTH) {
    throw new ColorTooLongError();
  }
  if (!HEX_COLOR_PATTERN.test(color)) {
    throw new ColorInvalidFormatError();
  }
  if (!ALLOWED_COLORS.includes(color.toUpperCase())) {
    throw new ColorNotAllowedError();
  }
}

export function validateCode(code: string): void {
  if (code.length === 0) {
    throw new CodeEmptyError();
  }
  if (code.length > MAX_LENGTH) {
    throw new CodeTooLongError();
  }
  if (!CODE_PATTERN.test(code)) {
    throw new CodeInvalidFormatError();
  }
}

export function validateTitle(title: string): void {
  if (title.length === 0) {
    throw new TitleEmptyError();
  }
  if (title.length > MAX_LENGTH) {
    throw new TitleTooLongError();
  }
}
