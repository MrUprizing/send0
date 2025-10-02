"use client";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { AppSidebar } from "@/components/app-sidebar";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { UnauthenticatedState } from "@/components/auth/unauthenticated-state";
import { AuthLoadingComponent } from "@/components/auth/auth-loading";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexClientProvider>
      <Unauthenticated>
        <UnauthenticatedState />
      </Unauthenticated>
      <Authenticated>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
      </Authenticated>
      <AuthLoading>
        <AuthLoadingComponent />
      </AuthLoading>
    </ConvexClientProvider>
  );
}
