import { currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type React from "react";
import { Button } from "~/components/ui/button";
import { ControlsNavbar } from "~/components/controls/controls-navbar";

export const metadata = {
  title: "Controls",
};

export default async function ControlsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  if (!user) redirect("/auth");

  const isAdmin = user?.privateMetadata?.role === "admin";
  if (!isAdmin) notFound();
  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-mono text-lg font-bold">Controls</h1>
        <Link href="/">
          <Button variant="outline" size="sm">
            Back
          </Button>
        </Link>
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-48 shrink-0">
          <ControlsNavbar />
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
