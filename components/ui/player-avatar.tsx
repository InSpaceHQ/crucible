import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("");
}

export function PlayerAvatar({
  name,
  size = "default",
  className,
}: {
  name: string;
  size?: "default" | "sm" | "lg";
  className?: string;
}) {
  return (
    <Avatar size={size} className={className}>
      <AvatarImage
        src={`https://api.dicebear.com/10.x/micah/png?seed=${encodeURIComponent(name)}`}
        alt={name}
      />
      <AvatarFallback className="bg-foreground text-background">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
