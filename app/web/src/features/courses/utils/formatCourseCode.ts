// Auto-uppercases letters (e.g. "mat" -> "MAT"), auto-inserts a dash the
// instant a digit follows the letter prefix (e.g. "MAT1" -> "MAT-1"), and
// removes an auto-inserted dash again if the digit right after it is
// backspaced away (e.g. "MAT-1" -> "MAT").
export function formatCourseCode(previousValue: string, rawValue: string): string {
  const upperRawValue = rawValue.toUpperCase();

  const isSingleTrailingDeletion =
    upperRawValue.length === previousValue.length - 1 && previousValue.startsWith(upperRawValue);

  if (isSingleTrailingDeletion && upperRawValue.endsWith("-")) {
    return upperRawValue.slice(0, -1);
  }

  const boundaryMatch = upperRawValue.match(/^([A-Z]+)(\d.*)$/);
  return boundaryMatch ? `${boundaryMatch[1]}-${boundaryMatch[2]}` : upperRawValue;
}
