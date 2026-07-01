"use client";

export const teams = [
  {
    name: "Nova",
    game: "FC26",
    logo: "https://api.dicebear.com/9.x/shapes/png?seed=Nova&backgroundColor=ff6b6b",
    players: [
      { name: "Aisha Khan", game: "FC26" },
      { name: "Marcus Chen", game: "FC26" },
      { name: "Priya Singh", game: "MK1" },
      { name: "James Kim", game: "MK1" },
    ],
  },
  {
    name: "Vertex",
    game: "MK1",
    logo: "https://api.dicebear.com/9.x/shapes/png?seed=Vertex&backgroundColor=4ecdc4",
    players: [
      { name: "Zara Patel", game: "MK1" },
      { name: "Leo Torres", game: "MK1" },
      { name: "Maya Okafor", game: "FC26" },
      { name: "Kai Nakamura", game: "FC26" },
    ],
  },
  {
    name: "Pulse",
    game: "FC26",
    logo: "https://api.dicebear.com/9.x/shapes/png?seed=Pulse&backgroundColor=ffa502",
    players: [
      { name: "Yuki Tanaka", game: "FC26" },
      { name: "Elena Voss", game: "FC26" },
      { name: "Idris Adebayo", game: "MK1" },
      { name: "Lena Dupont", game: "MK1" },
    ],
  },
  {
    name: "Apex",
    game: "MK1",
    logo: "https://api.dicebear.com/9.x/shapes/png?seed=Apex&backgroundColor=7c5cfc",
    players: [
      { name: "Sofia Reyes", game: "MK1" },
      { name: "Ravi Mehta", game: "MK1" },
      { name: "Nadia Petrova", game: "FC26" },
      { name: "Tomás Silva", game: "FC26" },
    ],
  },
];

export const allPlayers = teams.flatMap((team) =>
  team.players.map((player) => ({
    ...player,
    team: team.name,
    teamLogo: team.logo,
  })),
);

export const skills = [
  {
    name: "Best Goal",
    game: "FC26",
    description: "Soccer",
    players: ["Aisha Khan", "Marcus Chen", "Yuki Tanaka", "Nadia Petrova"],
  },
  {
    name: "Most Skilled Player",
    game: "Both",
    description: "",
    players: ["Zara Patel", "Kai Nakamura", "Idris Adebayo", "Ravi Mehta"],
  },
  {
    name: "Longest Combo",
    game: "MK",
    description: "",
    players: ["Priya Singh", "Leo Torres", "Lena Dupont", "Sofia Reyes"],
  },
  {
    name: "Quickest Win",
    game: "Both",
    description: "",
    players: ["Elena Voss", "Maya Okafor", "James Kim", "Tomás Silva"],
  },
  {
    name: "Flawless Warlock",
    game: "MK",
    description: "",
    players: ["James Kim", "Idris Adebayo", "Priya Singh", "Zara Patel"],
  },
];

export const fixtures = [
  { player1: "Aisha Khan", player2: "Zara Patel", game: "FC26", time: "14:00", score: "3 - 1" },
  {
    player1: "Marcus Chen",
    player2: "Leo Torres",
    game: "FC26",
    time: "14:20",
  },
  {
    player1: "Priya Singh",
    player2: "Sofia Reyes",
    game: "MK1",
    time: "14:40",
  },
  { player1: "James Kim", player2: "Ravi Mehta", game: "MK1", time: "15:00" },
  {
    player1: "Yuki Tanaka",
    player2: "Maya Okafor",
    game: "FC26",
    time: "15:20",
  },
  {
    player1: "Elena Voss",
    player2: "Kai Nakamura",
    game: "FC26",
    time: "15:40",
  },
  {
    player1: "Idris Adebayo",
    player2: "Nadia Petrova",
    game: "MK1",
    time: "16:00",
  },
  {
    player1: "Lena Dupont",
    player2: "Tomás Silva",
    game: "MK1",
    time: "16:20",
  },
];

export const standings = [
  { rank: 1, name: "Nova", w: 6, d: 1, l: 1, gd: 14 },
  { rank: 2, name: "Vertex", w: 5, d: 2, l: 1, gd: 9 },
  { rank: 3, name: "Pulse", w: 4, d: 1, l: 3, gd: 5 },
  { rank: 4, name: "Apex", w: 3, d: 0, l: 5, gd: -3 },
];

export const schedule = [
  { date: "Jul 05", time: "09:00", activity: "Venue Setup", description: "The production crew arrives early to assemble the main stage, install the competition booths, and run through the rigging and lighting systems ahead of the first broadcast." },
  { date: "Jul 05", time: "14:00", activity: "Tech Rehearsal", description: "Broadcast engineers put the streaming pipeline through its final paces, stress testing the camera feeds, audio mix, and overlay graphics to ensure zero downtime during the live shows." },
  { date: "Jul 05", time: "18:00", activity: "Media Day", description: "All eight starting players gather for official headshots, roster reveal videos, and short interviews with the press before they lock in for the week." },
  { date: "Jul 06", time: "10:00", activity: "Early Bird Cup", description: "An optional warm-up bracket where players shake off the rust with best-of-one exhibition matches. No standings are kept, but bragging rights are very much on the line." },
  { date: "Jul 06", time: "12:00", activity: "Players Check-in", description: "Every competitor must confirm their presence at the registration desk, sign the code of conduct waiver, and collect their backstage credentials before being cleared to compete." },
  { date: "Jul 06", time: "14:00", activity: "Warmup Arena", description: "The practice stations open for a two-hour free play window where players can test their peripherals, adjust in-game settings, and run through their warm-up routines in a quiet environment." },
  { date: "Jul 06", time: "19:00", activity: "Opening Ceremony", description: "The tournament officially begins with a high-energy showcase featuring player introductions, a trophy reveal, and a preview of the bracket format set to unfold over the coming days." },
  { date: "Jul 07", time: "10:00", activity: "Draft Lottery", description: "Team representatives take the stage to draw their group-stage opponents live. The lottery results will determine the path each roster must walk to reach the grand final." },
  { date: "Jul 07", time: "13:00", activity: "Roster Lock", description: "Coaches submit their final starting line-ups for the group stage. Any late changes after this deadline will result in a forfeit penalty for the first match of the round." },
  { date: "Jul 07", time: "16:00", activity: "Press Briefing", description: "Head coaches from all four teams field questions from the media about their draft strategy, roster decisions, and how they plan to handle their group-stage opponents." },
  { date: "Jul 08", time: "14:00", activity: "FC26 Face-off", description: "Nova and Vertex open the FC26 bracket with a best-of-three series. Both teams are expected to push the pace early, with the midfield battle likely deciding the outcome of the match." },
  { date: "Jul 08", time: "15:30", activity: "MK1 Brawl", description: "Pulse meets Apex in the Mortal Kombat 1 opener. Pulse brings a rush-down style while Apex favours a patient, counter-based approach that could frustrate the opposition." },
  { date: "Jul 09", time: "14:00", activity: "FC26 Rematch", description: "Nova returns to the pitch against Pulse in what promises to be a tactical slugfest. Pulse will need to tighten their defence after conceding early goals in their previous scrim." },
  { date: "Jul 09", time: "15:30", activity: "MK1 Rematch", description: "Vertex and Apex collide in the second round of MK1 group play. Both rosters have spent the extra day labbing new combos and will be eager to show their improved form." },
  { date: "Jul 10", time: "14:00", activity: "FC26 Semis", description: "The top two FC26 teams battle for a spot in the grand final. Expect high-pressure defending, creative set pieces, and individual brilliance from the star players when it matters most." },
  { date: "Jul 10", time: "15:30", activity: "MK1 Semis", description: "The last MK1 semi-final decides which roster earns the right to play for the championship. Every round will be a war of attrition as both teams empty their toolkits to survive." },
  { date: "Jul 11", time: "10:00", activity: "Fan Meet & Greet", description: "A ticketed session where supporters can meet the players face to face, grab autographs, and snap photos. Players will be seated by team with their championship belts and trophies on display." },
  { date: "Jul 11", time: "12:00", activity: "All-Star Event", description: "The community-voted all-star line-up takes the stage for a series of fun show matches featuring alternate game modes, handicap challenges, and a surprise mystery opponent drafted by the crowd." },
  { date: "Jul 11", time: "18:00", activity: "Finals Party", description: "The venue transforms into a festival ground with live music, food trucks, and a big screen replaying the best moments from the week. Players mingle with fans ahead of championship Sunday." },
  { date: "Jul 12", time: "14:00", activity: "Bronze Match", description: "The two semi-final losers face off one last time to determine who finishes third. Pride and a respectable podium finish are on the line in this best-of-five consolation series." },
  { date: "Jul 12", time: "16:00", activity: "Title Fight", description: "The moment every competitor has been grinding for. Two teams enter, one leaves with the trophy. A best-of-seven championship series that will be remembered long after the stage lights go dark." },
  { date: "Jul 12", time: "18:30", activity: "Awards Night", description: "The tournament concludes with the medal ceremony, the MVP announcement, and the champion team lifting the trophy. Confetti rains down as the season's final chapter is written into history." },
];
