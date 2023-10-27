"use client";
import { useCallback, useRef, useEffect, MouseEventHandler } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export default function Modal({
  children,
  closeButtonOnly,
}: {
  children: React.ReactNode;
  closeButtonOnly?: boolean;
}) {
  const overlay = useRef(null);
  const wrapper = useRef(null);
  const router = useRouter();

  const onDismiss = useCallback(() => {
    router.back();
  }, [router]);

  const onClick: MouseEventHandler = useCallback(
    (e) => {
      if (closeButtonOnly) return;
      if (e.target === overlay.current || e.target === wrapper.current) {
        if (onDismiss) onDismiss();
      }
    },
    [onDismiss, overlay, wrapper]
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    },
    [onDismiss]
  );

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  return (
    <div
      ref={overlay}
      className="fixed z-50 left-0 right-0 top-0 bottom-0 mx-auto bg-black/60  overflow-y-auto pb-6"
      onClick={onClick}
    >
      <div
        ref={wrapper}
        className="absolute top-[55%] sm:top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full sm:w-10/12 md:w-8/12 lg:w-1/2 p-1 xxs:p-3 sm:p-6 h-full "
      >
        <button
          className="close-btn absolute p-1 xxs:p-7 top-2 xxs:top-4 right-2 xxs:right-4 z-10 text-background"
          onClick={onDismiss}
        >
          {/* X Close Button SVG */}
          <X size={20} strokeWidth={2} color="#f6f1e9" />
        </button>

        {children}
      </div>
    </div>
  );
}
