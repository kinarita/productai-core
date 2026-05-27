import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function AppShell({ children, title, description }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          {(title || description) && (
            <div className="border-b border-border bg-background px-8 py-6">
              {title && (
                <h1 className="text-xl font-semibold text-foreground">{title}</h1>
              )}
              {description && (
                <p className="mt-1 text-sm text-muted">{description}</p>
              )}
            </div>
          )}
          <div className="p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
