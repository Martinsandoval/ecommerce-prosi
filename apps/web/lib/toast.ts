import { Toast } from "@base-ui/react/toast";

/**
 * App-wide toast manager. Bound to `ToastProvider` in `app/providers.tsx`,
 * this can be used to trigger toasts from anywhere - including outside
 * React (e.g. the axios interceptor in `api-client.ts`) - not just from
 * components that call `useToastManager()`.
 */
export const toastManager = Toast.createToastManager();

interface ToastOptions {
  description?: string;
  /**
   * Fixed id: adding a toast with an id that's already showing updates
   * it in place instead of stacking a duplicate. Use this for toasts
   * that can otherwise fire repeatedly for the same underlying issue
   * (e.g. a network error retried by react-query).
   */
  id?: string;
}

function show(type: "success" | "error", title: string, options?: ToastOptions) {
  return toastManager.add({
    id: options?.id,
    type,
    title,
    description: options?.description,
  });
}

export const toast = {
  success: (title: string, options?: ToastOptions) =>
    show("success", title, options),
  error: (title: string, options?: ToastOptions) =>
    show("error", title, options),
};
