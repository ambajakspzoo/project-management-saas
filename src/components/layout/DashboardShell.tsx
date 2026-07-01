import { ReactNode } from "react";

import { SignOutButton } from "@/components/auth/SignOutButton";
import { cn } from "@/lib/utils";

type DashboardShellProps = {
  children: ReactNode;
  className?: string;
  userEmail?: string;
};

const navItems = [{ label: "Projects", href: "/", active: true }];

export function DashboardShell({
  children,
  className,
  userEmail,
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white lg:hidden">
        <div className="flex h-14 items-center justify-between gap-3 px-4">
          <span className="text-base font-semibold text-zinc-900">
            Project Dashboard
          </span>
          <SignOutButton />
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-zinc-100 px-4 py-2">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                item.active
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-600 hover:bg-zinc-100",
              )}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <div className="lg:flex lg:min-h-screen">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-zinc-200 bg-white lg:flex">
          <div className="flex h-16 items-center border-b border-zinc-200 px-6">
            <span className="text-base font-semibold text-zinc-900">
              Project Dashboard
            </span>
          </div>
          <nav className="space-y-1 p-4">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  item.active
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
                )}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="mt-auto border-t border-zinc-200 p-4">
            {userEmail ? (
              <p className="mb-3 truncate text-xs text-zinc-500">{userEmail}</p>
            ) : null}
            <SignOutButton className="w-full" />
          </div>
        </aside>

        <main className={cn("flex-1 p-4 sm:p-6 lg:p-8", className)}>
          {children}
        </main>
      </div>
    </div>
  );
}
