import { Outlet } from "react-router-dom";

export function AuthShell() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
      <div className="w-full max-w-md">{<Outlet />}</div>
    </main>
  );
}
