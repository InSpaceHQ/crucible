import { mutation } from "./_generated/server";

function ts(dateStr: string, timeStr: string): number {
  const [month, day] = dateStr.split(" ");
  const months: Record<string, string> = {
    Jan: "01",
    Feb: "02",
    Mar: "03",
    Apr: "04",
    May: "05",
    Jun: "06",
    Jul: "07",
    Aug: "08",
    Sep: "09",
    Oct: "10",
    Nov: "11",
    Dec: "12",
  };
  const iso = `2026-${months[month]}-${String(Number(day)).padStart(2, "0")}T${timeStr}:00+01:00`;
  return new Date(iso).getTime();
}

const SEED_SCHEDULE = [
  {
    date: "Jul 05",
    time: "09:00",
    activity: "Venue Setup",
    description:
      "The production crew arrives early to assemble the main stage, install the competition booths, and run through the rigging and lighting systems ahead of the first broadcast.",
  },
  {
    date: "Jul 05",
    time: "14:00",
    activity: "Tech Rehearsal",
    description:
      "Broadcast engineers put the streaming pipeline through its final paces, stress testing the camera feeds, audio mix, and overlay graphics to ensure zero downtime during the live shows.",
  },
  {
    date: "Jul 05",
    time: "18:00",
    activity: "Media Day",
    description:
      "All eight starting players gather for official headshots, roster reveal videos, and short interviews with the press before they lock in for the week.",
  },
  {
    date: "Jul 06",
    time: "10:00",
    activity: "Early Bird Cup",
    description:
      "An optional warm-up bracket where players shake off the rust with best-of-one exhibition matches. No standings are kept, but bragging rights are very much on the line.",
  },
  {
    date: "Jul 06",
    time: "12:00",
    activity: "Players Check-in",
    description:
      "Every competitor must confirm their presence at the registration desk, sign the code of conduct waiver, and collect their backstage credentials before being cleared to compete.",
  },
  {
    date: "Jul 06",
    time: "14:00",
    activity: "Warmup Arena",
    description:
      "The practice stations open for a two-hour free play window where players can test their peripherals, adjust in-game settings, and run through their warm-up routines in a quiet environment.",
  },
  {
    date: "Jul 06",
    time: "19:00",
    activity: "Opening Ceremony",
    description:
      "The tournament officially begins with a high-energy showcase featuring player introductions, a trophy reveal, and a preview of the bracket format set to unfold over the coming days.",
  },
  {
    date: "Jul 07",
    time: "10:00",
    activity: "Draft Lottery",
    description:
      "Team representatives take the stage to draw their group-stage opponents live. The lottery results will determine the path each roster must walk to reach the grand final.",
  },
  {
    date: "Jul 07",
    time: "13:00",
    activity: "Roster Lock",
    description:
      "Coaches submit their final starting line-ups for the group stage. Any late changes after this deadline will result in a forfeit penalty for the first match of the round.",
  },
  {
    date: "Jul 07",
    time: "16:00",
    activity: "Press Briefing",
    description:
      "Head coaches from all four teams field questions from the media about their draft strategy, roster decisions, and how they plan to handle their group-stage opponents.",
  },
  {
    date: "Jul 08",
    time: "14:00",
    activity: "FC26 Face-off",
    description:
      "Nova and Vertex open the FC26 bracket with a best-of-three series. Both teams are expected to push the pace early, with the midfield battle likely deciding the outcome of the match.",
  },
  {
    date: "Jul 08",
    time: "15:30",
    activity: "MK1 Brawl",
    description:
      "Pulse meets Apex in the Mortal Kombat 1 opener. Pulse brings a rush-down style while Apex favours a patient, counter-based approach that could frustrate the opposition.",
  },
  {
    date: "Jul 09",
    time: "14:00",
    activity: "FC26 Rematch",
    description:
      "Nova returns to the pitch against Pulse in what promises to be a tactical slugfest. Pulse will need to tighten their defence after conceding early goals in their previous scrim.",
  },
  {
    date: "Jul 09",
    time: "15:30",
    activity: "MK1 Rematch",
    description:
      "Vertex and Apex collide in the second round of MK1 group play. Both rosters have spent the extra day labbing new combos and will be eager to show their improved form.",
  },
  {
    date: "Jul 10",
    time: "14:00",
    activity: "FC26 Semis",
    description:
      "The top two FC26 teams battle for a spot in the grand final. Expect high-pressure defending, creative set pieces, and individual brilliance from the star players when it matters most.",
  },
  {
    date: "Jul 10",
    time: "15:30",
    activity: "MK1 Semis",
    description:
      "The last MK1 semi-final decides which roster earns the right to play for the championship. Every round will be a war of attrition as both teams empty their toolkits to survive.",
  },
  {
    date: "Jul 11",
    time: "10:00",
    activity: "Fan Meet & Greet",
    description:
      "A ticketed session where supporters can meet the players face to face, grab autographs, and snap photos. Players will be seated by team with their championship belts and trophies on display.",
  },
  {
    date: "Jul 11",
    time: "12:00",
    activity: "All-Star Event",
    description:
      "The community-voted all-star line-up takes the stage for a series of fun show matches featuring alternate game modes, handicap challenges, and a surprise mystery opponent drafted by the crowd.",
  },
  {
    date: "Jul 11",
    time: "18:00",
    activity: "Finals Party",
    description:
      "The venue transforms into a festival ground with live music, food trucks, and a big screen replaying the best moments from the week. Players mingle with fans ahead of championship Sunday.",
  },
  {
    date: "Jul 12",
    time: "14:00",
    activity: "Bronze Match",
    description:
      "The two semi-final losers face off one last time to determine who finishes third. Pride and a respectable podium finish are on the line in this best-of-five consolation series.",
  },
  {
    date: "Jul 12",
    time: "16:00",
    activity: "Title Fight",
    description:
      "The moment every competitor has been grinding for. Two teams enter, one leaves with the trophy. A best-of-seven championship series that will be remembered long after the stage lights go dark.",
  },
  {
    date: "Jul 12",
    time: "18:30",
    activity: "Awards Night",
    description:
      "The tournament concludes with the medal ceremony, the MVP announcement, and the champion team lifting the trophy. Confetti rains down as the season's final chapter is written into history.",
  },
];

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("schedule").take(1);
    if (existing.length > 0) return { seeded: false };

    for (const item of SEED_SCHEDULE) {
      await ctx.db.insert("schedule", {
        timestamp: ts(item.date, item.time),
        activity: item.activity,
        description: item.description,
      });
    }

    return { seeded: true };
  },
});
