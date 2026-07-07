# Data Interfaces

Source of truth for all data shapes used across the project.

## Convex Tables

### `games`

```
name: string          — unique slug, e.g. "FC26", "MK1"
displayName: string   — human-readable, e.g. "FC26", "Mortal Kombat 1"
description: string   — optional overview
```

### `teams`

```
name: string
logo: string           — DiceBear/asset URL
order: number          — display ordering (0-based)
```

### `teamGames`

```
teamId: Id<"teams">
gameId: Id<"games">
```

### `players`

```
name: string
gameId: Id<"games">    — player's game
teamId: Id<"teams">    — parent team
```

### `rulesets`

```
gameId: Id<"games">      — FK to games
sections: array of {
  title: string
  content: string
}
```

Index: `by_game` (one ruleset per game)

### `rulesets.getByGame` → `Option<Ruleset>`

Returns a single ruleset document for the given game.
Args: `gameId: Id<"games">`

### `rulesets.upsert`

Creates or replaces the ruleset for a given game.
Args: `gameId: Id<"games">`, `sections: array of { title: string, content: string }`

## Seed Data

### `seed.seed`

FC26 rules: Match Format (5v5, 6-min halves, Golden Goal), Scoring (Win 3, Draw 1, Loss 0), Team Selection (any club, no custom tactics)
MK1 rules: Match Format (Best of 3, 90s rounds), Character Selection (any character, kameo allowed, random stage), Rules (no stalling)

## Query Return Types

### `teams.list` → `TeamWithPlayers[]`

```
_id: Id<"teams">
_creationTime: number
name: string
games: Array<{ name, displayName, description }>   — resolved games via teamGames
logo: string
order: number
players: PlayerWithGame[]
```

### `PlayerWithGame` (nested inside team)

```
_id: Id<"players">
_creationTime: number
name: string
gameId: Id<"games">
game: Option<{ name, displayName, description }>   — resolved game
teamId: Id<"teams">
```

### `schedule`

```
timestamp: number     — Unix timestamp ms (UTC+1 / WAT)
activity: string       — e.g. "Venue Setup"
description: string    — long text
```

### `fixtures`

```
gameId: Id<"games">
startTime: number     — Unix timestamp ms (UTC+1)
endTime: number       — Unix timestamp ms (UTC+1)
entries: array of {
  playerId: Id<"players">
  score: number       — 0 = not played / scoreless
}
```

### `playerStats`

```
playerId: Id<"players">   — FK to players table
kills: number
wins: number
matches: number
```

### `fixtures.list` → `FixtureWithPlayers[]`

```
_id: Id<"fixtures">
_creationTime: number
gameId: Id<"games">
game: Option<{ name, displayName, description }>
startTime: number
endTime: number
entries: FixtureEntryResolved[]
```

### `FixtureEntryResolved` (nested inside fixture)

```
playerId: Id<"players">
score: number
player: Option<{ name, team: Option<{ name, logo }> }>
```

### `playerStats.list` → `PlayerStatsWithPlayer[]`

```
_id: Id<"playerStats">
_creationTime: number
kills: number
wins: number
matches: number
player: Option<{ name, game: Option<{ name, displayName }>, team: Option<{ name, logo }> }>
```

### `playerStats.getByPlayerId` → `Option<PlayerStatsWithPlayer>`

Returns player stats (kills, wins, matches) plus resolved player info for a single player.
Args: `playerId: Id<"players">`

### `standings.list` → `StandingRow[]`

```
rank: number
team: Option<{ _id: Id<"teams">, name: string, logo: string }>
wins: number
draws: number
losses: number
goalDifference: number
points: number      — computed as (wins × 3) + draws
```

### `pointsLog`

```
playerId: Id<"players">   — FK to players table
amount: number             — positive earned, negative spent
reason: string             — e.g. "Match win vs Pulse"
timestamp: number          — Unix ms
```

Indexes: `by_timestamp`, `by_player_timestamp` (`["playerId", "timestamp"]`)

### `pointsLog.list` → `PointsLogWithPlayer[]`

```
_id: Id<"pointsLog">
_creationTime: number
playerId: Id<"players">
amount: number
reason: string
timestamp: number
player: Option<{ name, team: Option<{ name, logo }> }>
```

Args: `playerId?: Id<"players">` — filter to entries for a specific player. `limit?: number` — max results (default 50).

### `pointsLog.listPaginated` → `PaginatedResult<PointsLogWithPlayer[]>`

```
Same shape as list, but accepts PaginationOpts for cursor-based pagination.
```

Args: `paginationOpts: PaginationOpts`
Index: `by_timestamp` (desc)

## Seed Data

### `seed.seed`

Games: FC26 (`FC26`), MK1 (`Mortal Kombat 1`)
Teams: 20 teams (Nova, Vertex, Pulse, Apex, Blaze, Shadow, Eclipse, Reaper, Frost, Phantom, Storm, Vanguard, Comet, Warden, Fury, Raven, Thunder, Hydra, Vapor, Phoenix) — each team competes in all games
Players: 48 players (2 per team, 1 FC26 + 1 MK1)

### `seedFixtures.seed`

8 fixtures over Jul 08–09, 2026 with non-zero scores for standings computation.

### `seedSchedule.seed`

22 schedule items from Jul 05–12, 2026 (mapped from `app/data.ts`)

### `seedPlayerStats.seed`

8 player stat entries (kills/wins/matches) for all players, ordered by kills descending.

### `seedPointsLog.seed`

17 sample point transactions (positive and negative) across all players for credit transparency.

### `skills`

```
name: string
gameId: Option<Id<"games">>     — null when awarded across both games
description: Option<string>      — optional flavor text e.g. "Soccer"
```

### `skillHolders`

```
skillId: Id<"skills">           — parent skill
playerId: Id<"players">         — player who holds the skill
```

## Query Return Types

### `skills.list` → `SkillWithHolders[]`

```
_id: Id<"skills">
_creationTime: number
name: string
gameId: Option<Id<"games">>
game: Option<{ name, displayName, description }>   — resolved game
description: Option<string>
holders: PlayerWithTeamAndGame[]
```

### `PlayerWithTeamAndGame` (nested inside skill.holders)

```
_id: Id<"players">
_creationTime: number
name: string
gameId: Id<"games">
game: Option<{ name, displayName, description }>   — resolved game
teamId: Id<"teams">
team: Option<{ _id, name, logo, order }>    — resolved team with logo
```

## Seed Data

### `seed.seed`

Skills: Best Goal, Most Skilled Player, Longest Combo, Quickest Win, Flawless Warlock
