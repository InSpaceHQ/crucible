import { currentUser } from "@clerk/nextjs/server";

export const metadata = {
  title: "Onboarding",
};

export default async function OnboardingPage() {
  const user = await currentUser();

  return (
    <div className="flex flex-col gap-8 w-96 mx-auto h-screen justify-center items-center p-6">
      <h1 className="font-mono text-2xl font-bold">Complete Your Profile</h1>
      <p className="font-mono text-sm text-foreground/60 text-center">
        Please provide the following information to complete your registration.
      </p>
    </div>
  );
}
