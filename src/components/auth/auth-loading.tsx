import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export function AuthLoadingComponent() {
  return (
    <div className="flex h-screen w-full">
      {/* Sidebar with skeletons */}
      <aside className="flex h-full w-64 flex-col border bg-sidebar m-2 rounded-md">
        {/* Logo skeleton */}
        <div className="flex h-14 items-center gap-2 border-b px-4">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-6 w-20" />
        </div>

        {/* Navigation section */}
        <div className="flex-1 overflow-auto p-4">
          <div className="mb-2 px-2">
            <Skeleton className="h-4 w-16" />
          </div>
          
          {/* Menu items skeletons */}
          <div className="space-y-2">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-md px-2 py-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>

        {/* User profile skeleton at bottom */}
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main content with centered loader */}
      <main className="flex flex-1 items-center justify-center -ml-1 m-2 rounded-md border bg-sidebar">
        <div className="flex flex-col items-center gap-4"> 
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </main>
    </div>
  );
}

