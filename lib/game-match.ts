type TeamLike = { name: string } | null | undefined;

export const GameMatch = {
  isTBD(...teams: TeamLike[]): boolean {
    return teams.some((t) => !t || t.name === "TBD");
  },
};
