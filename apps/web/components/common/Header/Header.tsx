import Link from "next/link";
import { ChevronDown, CircleUserRound, LayoutDashboard } from "lucide-react";
import { buttonVariants } from "@/components/common/Button/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

/**
 * Site-wide sticky header with the account menu (left) and the
 * Prósi logo (right), including the link to the admin console.
 *
 * @author Martin Sandoval
 */
export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-xl font-semibold tracking-tight italic"
        >
          <span>Prosigliere</span>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "group h-9 gap-2 rounded-full pr-3 pl-2.5",
            )}
          >
            <CircleUserRound className="size-4" />
            <span className="hidden sm:inline">Account</span>
            <ChevronDown className="size-3.5 text-muted-foreground transition-transform duration-200 group-data-open:rotate-180" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Signed in as Store Manager</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link href="/admin/products" />}>
                <LayoutDashboard className="size-4" />
                Admin Console
                <Badge variant="outline" className="bg-amber-200">
                  Admin
                </Badge>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
