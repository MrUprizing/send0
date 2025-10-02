import { Link } from "next-view-transitions";
import { Button } from "@/components/ui/button";
import { IconMailAi } from "@tabler/icons-react";

export function UnauthenticatedState() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6 md:p-10">
      <div className="flex flex-col gap-6 w-full max-w-md">
        <div className="flex flex-col items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md">
            <IconMailAi className="size-12" />
          </div>
          <h1 className="text-xl font-bold">Welcome</h1>
          <div className="text-center text-sm">
            Sign in to access your account or create a new one
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Button asChild size="lg" className="w-full">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link href="/sign-up">Create Account</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

