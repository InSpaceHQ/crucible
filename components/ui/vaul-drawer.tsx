"use client";

import * as Vaul from "vaul";
import type * as React from "react";

import { cn } from "~/lib/utils";

function Drawer({ ...props }: React.ComponentProps<typeof Vaul.Drawer.Root>) {
  return <Vaul.Drawer.Root data-slot="drawer" {...props} />;
}

function DrawerTrigger({
  ...props
}: React.ComponentProps<typeof Vaul.Drawer.Trigger>) {
  return <Vaul.Drawer.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerClose({
  ...props
}: React.ComponentProps<typeof Vaul.Drawer.Close>) {
  return <Vaul.Drawer.Close data-slot="drawer-close" {...props} />;
}

function DrawerContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Vaul.Drawer.Content>) {
  return (
    <Vaul.Drawer.Portal>
      <Vaul.Drawer.Overlay className="fixed inset-0 z-50 bg-black/60" />
      <Vaul.Drawer.Content
        data-slot="drawer-content"
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto max-h-[85vh] flex-col bg-background border-t border-border shadow-[5px_5px_0px_0px_black]",
          className,
        )}
        {...props}
      >
        <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 bg-foreground/20" />
        <div className="flex-1 overflow-auto px-4 pb-6">{children}</div>
      </Vaul.Drawer.Content>
    </Vaul.Drawer.Portal>
  );
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn("flex items-center justify-between py-4", className)}
      {...props}
    />
  );
}

function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof Vaul.Drawer.Title>) {
  return (
    <Vaul.Drawer.Title
      data-slot="drawer-title"
      className={cn("font-mono text-lg font-bold", className)}
      {...props}
    />
  );
}

function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof Vaul.Drawer.Description>) {
  return (
    <Vaul.Drawer.Description
      data-slot="drawer-description"
      className={cn("text-sm text-foreground/50", className)}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
};
