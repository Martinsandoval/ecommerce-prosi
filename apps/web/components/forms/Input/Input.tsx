import { useId } from "react";
import { Input as BaseInput } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface InputProps extends React.ComponentProps<"input"> {
  label?: string;
  error?: string;
}

/**
 * Reusable labeled text input with inline error message, designed to
 * be spread directly from a `react-hook-form` `register()` call.
 *
 * @author Martin Sandoval
 */
export function Input({ label, error, id, className, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-foreground"
        >
          {label}
        </label>
      )}
      <BaseInput
        id={inputId}
        aria-invalid={Boolean(error)}
        className={cn(
          error && "border-destructive focus-visible:ring-destructive/20",
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
