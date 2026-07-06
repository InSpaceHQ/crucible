import Image from "next/image";
import { CreativeWrapper } from "./schedule-section";
import { cn } from "~/lib/utils";
import { Button } from "./ui/button";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

const tiers = [
  {
    name: "Gold",
    sponsors: [{ name: "Inspace", src: "/images/sponsors-Inspace-logo.png" }],
  },
  {
    name: "Silver",
    sponsors: [
      { name: "Wigxel", src: "/images/sponsors-wigxel-logo.png" },
      { name: "Spavecraft", src: "/images/sponsors-spavecraft-logo.png" },
    ],
  },
  {
    name: "Platinum",
    sponsors: [
      { name: "Jet", src: "/images/sponsors-jet-logo.png" },
      {
        name: "Godfather Games",
        src: "/images/sponsors-godfather-games-logo.png",
      },
      { name: "Daimyo", src: "/images/sponsors-daimyo-logo.png" },
    ],
  },
];

export function SponsorsSection() {
  return (
    <CreativeWrapper heading="Sponsors" subHeading="Our Partners">
      <div className="space-y-12 pe-4">
        {tiers.map((tier, index) => (
          <div key={tier.name}>
            <h3 className="text-xs md:text-sm uppercase tracking-wider font-mono mb-6 text-foreground/60">
              {tier.name}
            </h3>
            <div className="flex gap-6">
              {tier.sponsors.map((sponsor) => (
                <div
                  key={sponsor.name}
                  className={cn("flex items-center justify-start", {
                    "col-span-3": index === 0,
                    "col-span-2": index === 1,
                    "col-span-1": index === 2,
                  })}
                >
                  <Image
                    src={sponsor.src}
                    alt={`${sponsor.name} logo`}
                    width={240}
                    height={260}
                    className={cn(
                      "w-auto opacity-60 hover:opacity-100 transition-opacity object-contain",
                      {
                        "h-16 md:h-24": index === 0,
                        "h-12 md:h-16": index === 1,
                        "h-8 md:h-12": index === 2,
                      },
                    )}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-32">
          <Button
            variant="fill"
            size="lg"
            className="w-full gap-4 font-bold relative h-auto md:w-auto text-lg md:text-xl px-4 py-2 pe-2"
            asChild
          >
            <Link href="https://forms.gle/irLMRRzVMycyZ4T48" target="_blank">
              <span className="inline-block text-start flex-1">
                Be a Sponsor
              </span>
              <span className="aspect-square p-[0.8em] inline-block text-foreground end-0 bg-background">
                <ArrowUpRight className="size-[0.75em]" />
              </span>
            </Link>
          </Button>
        </div>
      </div>
    </CreativeWrapper>
  );
}
