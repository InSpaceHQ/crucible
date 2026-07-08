import { SignIn } from "@clerk/nextjs";

export default async function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col gap-8 w-96 mx-auto items-center">
        <h1 className="font-mono text-2xl font-bold">Crucible</h1>
        <p className="font-mono text-sm text-foreground/60">
          Sign in to manage controls
        </p>
        <SignIn />
      </div>
    </div>
  );
}
