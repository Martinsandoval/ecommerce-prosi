"use client";

import * as React from "react";
import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import { CheckCircle2Icon, XCircleIcon, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function ToastProvider({ ...props }: ToastPrimitive.Provider.Props) {
  return <ToastPrimitive.Provider data-slot="toast-provider" {...props} />;
}

function ToastPortal({ ...props }: ToastPrimitive.Portal.Props) {
  return <ToastPrimitive.Portal data-slot="toast-portal" {...props} />;
}

function ToastViewport({ className, ...props }: ToastPrimitive.Viewport.Props) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn(
        "fixed top-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2 outline-none sm:top-6 sm:right-6",
        className,
      )}
      {...props}
    />
  );
}

function ToastTypeIcon({ type }: { type?: string }) {
  if (type === "success") {
    return (
      <CheckCircle2Icon className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
    );
  }
  if (type === "error") {
    return <XCircleIcon className="size-5 shrink-0 text-destructive" />;
  }
  return null;
}

function ToastRoot({ className, toast, ...props }: ToastPrimitive.Root.Props) {
  return (
    <ToastPrimitive.Root
      data-slot="toast"
      toast={toast}
      className={cn(
        "relative flex items-start gap-3 rounded-xl bg-popover p-4 text-sm text-popover-foreground shadow-lg ring-1 ring-foreground/10 transition-all duration-200 data-[ending-style]:opacity-0 data-[starting-style]:translate-x-[calc(100%+1.5rem)] data-[starting-style]:opacity-0",
        className,
      )}
      {...props}
    >
      <ToastTypeIcon type={toast.type} />
      <div className="flex-1 space-y-1">
        <ToastPrimitive.Title
          data-slot="toast-title"
          className="font-medium text-foreground"
        />
        <ToastPrimitive.Description
          data-slot="toast-description"
          className="text-muted-foreground"
        />
      </div>
      <ToastPrimitive.Close
        data-slot="toast-close"
        aria-label="Dismiss"
        render={<Button variant="ghost" size="icon-sm" className="-m-1" />}
      >
        <XIcon />
        <span className="sr-only">Dismiss</span>
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  );
}

export { ToastProvider, ToastPortal, ToastViewport, ToastRoot };
