import type { ReactNode } from "react";

interface ModalProps {
  children: ReactNode;
  maxWidth?: string;
}

export function Modal({ children, maxWidth = "max-w-2xl" }: ModalProps) {
  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div
        className={`bg-white border border-slate-200 rounded-lg p-8 w-full ${maxWidth} shadow-lg max-h-[90vh] overflow-y-auto styled-scrollbar`}
      >
        {children}
      </div>
    </div>
  );
}
