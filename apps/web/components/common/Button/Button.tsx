import { Loader2 } from "lucide-react";
import { Button as BaseButton, buttonVariants } from "@/components/ui/button";

export interface ButtonProps extends React.ComponentProps<typeof BaseButton> {
  /**
   * Shows a spinner and disables the button while an async action is
   * in flight. Prefer this over hand-rolling a `Loader2` + `disabled`
   * pair at each call site.
   */
  loading?: boolean;
  /** Text to show instead of `children` while `loading` is true. */
  loadingText?: React.ReactNode;
}

/**
 * Project-wide button. Wraps the shadcn/Base UI button primitive with
 * a `loading` state, and is the one component that should be used
 * anywhere an app screen needs a `<button>` — plain `<button>`
 * elements should not be used directly. For icon-only buttons, always
 * pass an `aria-label`.
 *
 * @author Martin Sandoval
 */
export function Button({
  loading = false,
  loadingText,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <BaseButton
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" />}
      {loading && loadingText !== undefined ? loadingText : children}
    </BaseButton>
  );
}

export { buttonVariants };
