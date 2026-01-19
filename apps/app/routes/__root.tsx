import { AuthErrorBoundary } from "@/components/auth/auth-error-boundary";
import type { AuthClient } from "@/lib/auth";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRouteWithContext<{
  auth: AuthClient;
  queryClient: QueryClient;
}>()({
  component: Root,
});

export function Root() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthErrorBoundary>
          <Outlet />
          {import.meta.env.DEV && <TanStackRouterDevtools />}
        </AuthErrorBoundary>
      </I18nProvider>
    </ThemeProvider>
  );
}
