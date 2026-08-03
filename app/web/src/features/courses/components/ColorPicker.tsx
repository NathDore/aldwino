import type { CourseColor } from "../types/course.types";

interface ColorPickerProps {
  colors: CourseColor[];
  selectedColor: string | null;
  onChange: (color: string) => void;
  isLoading?: boolean;
}

export function ColorPicker({
  colors,
  selectedColor,
  onChange,
  isLoading = false,
}: ColorPickerProps) {
  if (isLoading) {
    return <div className="text-slate-600 text-sm">Loading colors...</div>;
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(24px,1fr))] gap-1.5">
      {colors.map((color) => (
        <button
          key={color.hex}
          onClick={() => onChange(color.hex)}
          className="relative w-6 h-6 rounded-sm border transition-all hover:scale-105"
          style={{
            backgroundColor: color.hex,
            borderColor: selectedColor === color.hex ? "#059669" : "#94a3b8",
          }}
          title={color.hex}
          type="button"
        >
          {selectedColor === color.hex && (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="white"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
