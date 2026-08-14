export type GameMode = "CLASSIC_60S" | "SPRINT_10S" | "MARATHON_120S"
export type GameState = "LOADING" | "READY" | "PLAYING" | "FINISHED"

export interface ApiResponse<T> {
    success: boolean
    message: string
    data: T
}

export interface StartGameSessionRequest {
    mode: GameMode
}

export interface StartGameSessionResponse {
    sessionId: string
    mode: GameMode
    startTime: string
    duration: number
}

export interface ClickBatchRequest {
    sessionId: string
    clicks: number
}

export interface ClickBatchResponse {
    totalClicks: number
}

export interface EndGameSessionRequest {
    sessionId: string
}

export interface EndGameSessionResponse {
    score: Score
}

export interface Score {
    id: string
    sessionId: string
    userId: string
    mode: GameMode
    clickCount: number
    durationMs: number
    cps: number
    createdAt: Date
}
