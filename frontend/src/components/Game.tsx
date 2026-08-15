import {
    Flag,
    Gauge,
    Play,
    RefreshCw,
    Target,
    Timer,
    Trophy,
    Zap,
} from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import api from "../lib/api"
import type {
    ApiResponse,
    ClickBatchRequest,
    ClickBatchResponse,
    EndGameSessionRequest,
    EndGameSessionResponse,
    GameMode,
    GameState,
    StartGameSessionRequest,
    StartGameSessionResponse,
} from "../types/game"
import { Button } from "./ui/button"
import { Spinner } from "./ui/spinner"

const FLUSH_INTERVAL_MS = 250

const MODE_META: Record<
    GameMode,
    { label: string; subtitle: string; icon: typeof Target }
> = {
    CLASSIC_60S: {
        label: "Classic",
        subtitle: "Balanced 60-second run",
        icon: Target,
    },
    SPRINT_10S: {
        label: "Sprint",
        subtitle: "Burst mode in 10 seconds",
        icon: Zap,
    },
    MARATHON_120S: {
        label: "Marathon",
        subtitle: "Long-focus 120-second grind",
        icon: Flag,
    },
}

function toErrorMessage(error: unknown): string {
    if (typeof error === "object" && error !== null) {
        const maybeError = error as {
            response?: { data?: { message?: string } }
            message?: string
        }

        if (maybeError.response?.data?.message) {
            return maybeError.response.data.message
        }

        if (maybeError.message) {
            return maybeError.message
        }
    }

    return "Something went wrong. Please try again."
}

function formatMode(mode: GameMode): string {
    return mode.replace("_", " ")
}

function Game() {
    const [gameState, setGameState] = useState<GameState>("READY")
    const [gameMode, setGameMode] = useState<GameMode>("CLASSIC_60S")
    const [error, setError] = useState<string | null>(null)
    const [result, setResult] = useState<EndGameSessionResponse | null>(null)

    const [clicks, setClicks] = useState<number>(0)
    const [serverClicks, setServerClicks] = useState<number>(0)
    const [msRemaining, setMsRemaining] = useState<number>(0)
    const [durationMsState, setDurationMsState] = useState<number>(0)
    const [tapPulse, setTapPulse] = useState<boolean>(false)
    const [isEnding, setIsEnding] = useState<boolean>(false)

    const sessionId = useRef<string | null>(null)
    const startedAtMs = useRef<number>(0)
    const durationMs = useRef<number>(0)
    const pendingClicks = useRef<number>(0)

    const flushInterval = useRef<ReturnType<typeof setInterval> | null>(null)
    const tickInterval = useRef<ReturnType<typeof setInterval> | null>(null)
    const pulseTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

    const clearTimers = useCallback(() => {
        if (flushInterval.current) {
            clearInterval(flushInterval.current)
            flushInterval.current = null
        }

        if (tickInterval.current) {
            clearInterval(tickInterval.current)
            tickInterval.current = null
        }

        if (pulseTimeout.current) {
            clearTimeout(pulseTimeout.current)
            pulseTimeout.current = null
        }
    }, [])

    const sendClickBatch = useCallback(async () => {
        if (!sessionId.current || pendingClicks.current <= 0) {
            return
        }

        const clickCount = pendingClicks.current
        pendingClicks.current = 0

        const request: ClickBatchRequest = {
            sessionId: sessionId.current,
            clicks: clickCount,
        }

        try {
            const response = await api.post<ApiResponse<ClickBatchResponse>>(
                "/games/clicks",
                request
            )
            console.log("Click batch sent:", clickCount, "Server total clicks:", response.data.data.totalClicks)
            setServerClicks(response.data.data.totalClicks)
        } catch {
            pendingClicks.current += clickCount
        }
    }, [])

    const endGameSession = useCallback(
        async (id: string) => {
            if (!id || isEnding) {
                return
            }

            setIsEnding(true)
            clearTimers()

            try {
                await sendClickBatch()

                const request: EndGameSessionRequest = { sessionId: id }
                const response = await api.post<
                    ApiResponse<EndGameSessionResponse>
                >("/games/end", request)

                setResult(response.data.data)
                setGameState("FINISHED")
            } catch (err) {
                setError(toErrorMessage(err))
                setGameState("FINISHED")
            } finally {
                setIsEnding(false)
            }
        },
        [clearTimers, isEnding, sendClickBatch]
    )

    const startGameSession = useCallback(async () => {
        if (gameState === "LOADING" || gameState === "PLAYING" || isEnding) {
            return
        }

        clearTimers()
        setError(null)
        setResult(null)
        setGameState("LOADING")
        setClicks(0)
        setServerClicks(0)
        setMsRemaining(0)
        setDurationMsState(0)
        pendingClicks.current = 0

        try {
            const response = await api.post<
                ApiResponse<StartGameSessionResponse>
            >("/games/start", { mode: gameMode } as StartGameSessionRequest)

            const payload = response.data.data
            sessionId.current = payload.sessionId
            durationMs.current = payload.duration
            setDurationMsState(payload.duration)
            startedAtMs.current = new Date(payload.startTime).getTime()

            const initialRemaining = Math.max(
                0,
                durationMs.current - (Date.now() - startedAtMs.current)
            )

            setMsRemaining(initialRemaining)
            setGameState("PLAYING")

            flushInterval.current = setInterval(() => {
                void sendClickBatch()
            }, FLUSH_INTERVAL_MS)

            tickInterval.current = setInterval(() => {
                const remaining =
                    durationMs.current - (Date.now() - startedAtMs.current)

                if (remaining <= 0) {
                    setMsRemaining(0)
                    clearTimers()

                    if (sessionId.current) {
                        void endGameSession(sessionId.current)
                    }
                    return
                }

                setMsRemaining(remaining)
            }, 100)
        } catch (err) {
            setError(toErrorMessage(err))
            setGameState("READY")
        }
    }, [
        clearTimers,
        endGameSession,
        gameMode,
        gameState,
        isEnding,
        sendClickBatch,
    ])

    const handleTap = () => {
        if (gameState !== "PLAYING") {
            return
        }

        setClicks((prev) => prev + 1)
        pendingClicks.current += 1

        setTapPulse(true)
        if (pulseTimeout.current) {
            clearTimeout(pulseTimeout.current)
        }
        pulseTimeout.current = setTimeout(() => {
            setTapPulse(false)
            pulseTimeout.current = null
        }, 110)
    }

    useEffect(() => {
        return () => {
            clearTimers()
        }
    }, [clearTimers])

    const modeMeta = MODE_META[gameMode]
    const ModeIcon = modeMeta.icon

    const secondsRemaining = Math.max(0, Math.ceil(msRemaining / 1000))
    const progressPercent =
        durationMsState > 0
            ? Math.max(0, Math.min(100, (msRemaining / durationMsState) * 100))
            : 0

    const elapsedSeconds = durationMsState
        ? Math.max(0.1, (durationMsState - msRemaining) / 1000)
        : 0.1

    const liveCps = clicks / elapsedSeconds
    const isBusy = gameState === "LOADING" || isEnding

    return (
        <div className="col-span-12 m-4 md:col-span-6">
            <div className="flex min-h-[calc(100dvh-2rem)] flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
                <div className="mb-5 flex items-center justify-between gap-3">
                    <div>
                        <p className="text-sm font-semibold text-foreground">
                            Game arena
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                            Server-authenticated click challenge
                        </p>
                    </div>

                    <div className="rounded-full border border-border bg-muted px-3 py-1 text-[10px] font-medium tracking-[0.12em] text-foreground uppercase">
                        {gameState}
                    </div>
                </div>

                <div className="mb-4 rounded-lg border border-border bg-muted p-1">
                    <div className="grid grid-cols-3 gap-1">
                        {(Object.keys(MODE_META) as GameMode[]).map((mode) => {
                            const meta = MODE_META[mode]
                            const Icon = meta.icon
                            const isActive = mode === gameMode

                            return (
                                <button
                                    key={mode}
                                    type="button"
                                    disabled={gameState === "PLAYING" || isBusy}
                                    onClick={() => setGameMode(mode)}
                                    className={`flex items-center justify-center gap-1.5 rounded-md px-2 py-2 text-[11px] font-medium transition-colors ${
                                        isActive
                                            ? "bg-foreground text-background"
                                            : "text-muted-foreground hover:text-foreground"
                                    } disabled:cursor-not-allowed disabled:opacity-60`}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                    {meta.label}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div className="mb-5 flex items-center justify-between gap-2 rounded-xl border border-border bg-background/70 px-3 py-2">
                    <div className="flex min-w-0 items-center gap-2 text-muted-foreground">
                        <ModeIcon className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate text-[11px] font-medium tracking-[0.12em] uppercase">
                            {formatMode(gameMode)}
                        </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                        {modeMeta.subtitle}
                    </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    <MetricTile
                        icon={Timer}
                        label="Time"
                        value={`${secondsRemaining}s`}
                    />
                    <MetricTile
                        icon={Target}
                        label="Clicks"
                        value={clicks.toLocaleString()}
                    />
                    <MetricTile
                        icon={Gauge}
                        label="CPS"
                        value={liveCps.toFixed(2)}
                    />
                </div>

                <div className="mt-4 rounded-xl border border-border bg-background/70 p-3">
                    <div className="mb-2 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Session progress</span>
                        <span>{Math.round(progressPercent)}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                            className="h-full rounded-full bg-foreground transition-all duration-150"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleTap}
                    disabled={gameState !== "PLAYING"}
                    className={`mt-5 flex w-full flex-1 flex-col items-center justify-center gap-2 rounded-2xl border transition-all ${
                        gameState === "PLAYING"
                            ? tapPulse
                                ? "scale-[0.99] border-foreground bg-foreground text-background"
                                : "border-border bg-background/70 text-foreground hover:border-foreground"
                            : "cursor-not-allowed border-border bg-muted text-muted-foreground"
                    }`}
                >
                    <Zap
                        className={`h-10 w-10 ${tapPulse ? "animate-pulse" : ""}`}
                    />
                    <p className="text-lg font-semibold">Tap Zone</p>
                    <p className="text-xs">
                        {gameState === "PLAYING"
                            ? "Click as fast as you can"
                            : "Start a session to begin"}
                    </p>
                </button>

                <div className="mt-5 flex items-center gap-2">
                    <Button
                        type="button"
                        disabled={isBusy || gameState === "PLAYING"}
                        onClick={() => void startGameSession()}
                        className="flex-1"
                    >
                        {isBusy ? (
                            <>
                                <Spinner className="h-3.5 w-3.5" />
                                Starting...
                            </>
                        ) : (
                            <>
                                <Play className="h-3.5 w-3.5" />
                                Start game
                            </>
                        )}
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        disabled={gameState === "PLAYING" || isBusy}
                        onClick={() => {
                            setError(null)
                            setResult(null)
                            setClicks(0)
                            setServerClicks(0)
                            setMsRemaining(0)
                        }}
                        className="px-3"
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-background/70 px-3 py-2 text-xs text-muted-foreground">
                    <span>Server accepted clicks</span>
                    <span className="font-mono text-foreground">
                        {serverClicks.toLocaleString()}
                    </span>
                </div>

                {error && (
                    <div className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                        {error}
                    </div>
                )}

                {result?.score && (
                    <div className="mt-4 rounded-xl border border-border bg-background/70 p-3">
                        <div className="mb-2 flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-foreground" />
                            <p className="text-sm font-semibold text-foreground">
                                Session result
                            </p>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                            <ResultTile
                                label="Score"
                                value={result.score.clickCount.toLocaleString()}
                            />
                            <ResultTile
                                label="CPS"
                                value={result.score.cps.toFixed(2)}
                            />
                            <ResultTile
                                label="Duration"
                                value={`${Math.round(result.score.durationMs / 1000)}s`}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function MetricTile({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof Timer
    label: string
    value: string
}) {
    return (
        <div className="rounded-xl border border-border bg-background/70 px-3 py-2">
            <div className="mb-1 flex items-center gap-1.5 text-[10px] tracking-[0.1em] text-muted-foreground uppercase">
                <Icon className="h-3.5 w-3.5" />
                {label}
            </div>
            <p className="font-mono text-base font-semibold text-foreground">
                {value}
            </p>
        </div>
    )
}

function ResultTile({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border border-border bg-muted px-2.5 py-2">
            <p className="text-[10px] tracking-[0.1em] text-muted-foreground uppercase">
                {label}
            </p>
            <p className="font-mono text-sm font-semibold text-foreground">
                {value}
            </p>
        </div>
    )
}

export default Game
