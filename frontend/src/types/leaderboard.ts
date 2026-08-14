export type LeaderboardMode = "CLASSIC_60S" | "SPRINT_10S" | "MARATHON_120S"
export type LeaderboardPeriod = "daily" | "weekly" | "global"

export interface ApiResponse<T> {
    success: boolean
    message: string
    data: T
}

export interface LeaderboardEntry {
    rank: number
    userId: string
    username: string
    score: number
}

export interface LeaderboardData {
    mode: LeaderboardMode
    period: LeaderboardPeriod
    leaderboard: LeaderboardEntry[]
}
