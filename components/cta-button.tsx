import { ArrowUpRight } from "lucide-react";
import type React from "react";
import { cn } from "~/lib/utils";
import { Button } from "./ui/button";
// import { useAutoToggle } from "~/hooks/use-auto-toggle";

export function CTAButton(props: React.ComponentProps<typeof Button>) {
  // const state = useAutoToggle();

  return (
    <Button
      size="lg"
      variant="fill"
      {...props}
      className={cn(
        "w-full gap-4 group hover:bg-foreground font-bold relative h-auto md:w-auto text-lg md:text-xl ps-4 py-1 pe-1",
        props.className,
      )}
    >
      <span className="absolute z-10 inset-0" />
      <span className="inline-block text-nowrap text-center flex-1">
        {props.children}
      </span>
      <span
        className={cn(
          "w-0 transition-default ease-eager group-hover:w-12 h-12 items-center justify-center inline-flex text-foreground end-0 bg-background relative ",
          // {
          //   "w-12": state
          // },
        )}
      >
        <ArrowUpRight className="size-[0.75em] group-hover:rotate-45 transition-default absolute" />
      </span>
    </Button>
  );
}
