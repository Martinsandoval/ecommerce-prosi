"use client";

import { Toast } from "@base-ui/react/toast";
import {
  ToastPortal,
  ToastRoot,
  ToastViewport,
} from "@/components/ui/toast";

/**
 * Renders the queue of toasts registered on the app-wide toast manager
 * (`@/lib/toast`). Mount once, anywhere inside `ToastProvider`.
 *
 * @author Martin Sandoval
 */
export function Toaster() {
  const { toasts } = Toast.useToastManager();

  return (
    <ToastPortal>
      <ToastViewport>
        {toasts.map((toastItem) => (
          <ToastRoot key={toastItem.id} toast={toastItem} />
        ))}
      </ToastViewport>
    </ToastPortal>
  );
}
