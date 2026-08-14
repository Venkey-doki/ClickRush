interface UserRank {
    mode: string
    todayRank: number | null
    weeklyRank: number | null
    globalRank: number | null
    todayScore?: number | null
    weeklyScore?: number | null
    globalScore?: number | null
}

interface ApiResponse<T> {
    success: boolean
    message: string
    data: T
}

interface RankEntry {
    rank: number
    score: number
}

type GameMode = "CLASSIC_60S" | "SPRINT_10S" | "MARATHON_120S"

interface UserStatsResponse {
    mode: GameMode
    todayRank: RankEntry | null
    weeklyRank: RankEntry | null
    globalRank: RankEntry | null
}

interface UserHistoryEntry {
    id: string
    sessionId: string
    userId: string
    mode: GameMode
    clickCount: number
    durationMs: number
    cps: number
    createdAt: string
}

interface UserHistoryResponse {
    history: UserHistoryEntry[]
}

interface AuthedUser {
    id: string
    username: string
    email: string
}

export type {
    ApiResponse,
    AuthedUser,
    GameMode,
    RankEntry,
    UserHistoryEntry,
    UserHistoryResponse,
    UserRank,
    UserStatsResponse,
}
