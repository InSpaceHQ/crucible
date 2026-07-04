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
gameId: Id<"games">   — team's primary game
logo: string           — DiceBear/asset URL
order: number          — display ordering (0-based)
```

### `players`
```
name: string
gameId: Id<"games">    — player's game
teamId: Id<"teams">    — parent team
```

## Query Return Types

### `teams.list` → `TeamWithPlayers[]`
```
_id: Id<"teams">
_creationTime: number
name: string
gameId: Id<"games">
game: { name, displayName, description } | null   — resolved game
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
game: { name, displayName, description } | null   — resolved game
teamId: Id<"teams">
```

## Seed Data

Games: FC26 (`FC26`), MK1 (`Mortal Kombat 1`)
Teams: Nova, Vertex, Pulse, Apex (same logos as `app/data.ts`)
Players: all 16 players from `app/data.ts`
