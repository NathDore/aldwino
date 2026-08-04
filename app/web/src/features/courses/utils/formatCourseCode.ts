// Auto-inserts a dash the instant a digit follows the course code's letter
// prefix (e.g. "MAT1" -> "MAT-1"), and removes an auto-inserted dash again
// if the digit right after it is backspaced away (e.g. "MAT-1" -> "MAT").
export function formatCourseCode(previousValue: string, rawValue: string): string {
  const isSingleTrailingDeletion =
    rawValue.length === previousValue.length - 1 && previousValue.startsWith(rawValue);

  if (isSingleTrailingDeletion && rawValue.endsWith("-")) {
    return rawValue.slice(0, -1);
  }

  const boundaryMatch = rawValue.match(/^([A-Za-z]+)(\d.*)$/);
  return boundaryMatch ? `${boundaryMatch[1]}-${boundaryMatch[2]}` : rawValue;
}
