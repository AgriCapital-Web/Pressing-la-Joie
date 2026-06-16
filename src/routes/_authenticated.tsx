import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useCurrentProfile } from "@/lib/mock/store";
import { AppShell } from "@/components/flex/AppShell";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: AuthLayout,
});

function AuthLayout() {
  const me = useCurrentProfile();
  if (!me) return <Navigate to="/auth" />;
  return <AppShell />;
}
