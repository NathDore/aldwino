import type { ReactNode } from "react";
import { Button } from "./Button";

interface DeleteConfirmationProps {
  title: string;
  description: ReactNode;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmation({
  title,
  description,
  isLoading,
  onConfirm,
  onCancel,
}: DeleteConfirmationProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-700">{description}</p>
      </div>

      <div className="flex justify-end gap-3 pt-6">
        <Button variant="ghost" size="md" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="danger" size="md" onClick={onConfirm} disabled={isLoading}>
          {isLoading ? "Deleting..." : "Delete"}
        </Button>
      </div>
    </div>
  );
}
