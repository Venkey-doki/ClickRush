import {
    CalendarDays,
    Flag,
    Globe2,
    Sparkles,
    Sun,
    Target,
    Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import type {
    ApiResponse,
    LeaderboardData,
    LeaderboardEntry,
    LeaderboardMode,
    LeaderboardPeriod,
} from "../types/leaderboard";
// import { Button } from "./ui/button";

const MODES: { key: LeaderboardMode; label: string; icon: typeof Target }[] = [
    { key: "CLASSIC_60S", label: "Classic", icon: Target },
    { key: "SPRINT_10S", label: "Sprint", icon: Zap },
    { key: "MARATHON_120S", label: "Marathon", icon: Flag },
]

const PERIODS: { key: LeaderboardPeriod; label: string; icon: typeof Sun }[] = [
    { key: "daily", label: "Today", icon: Sun },
    { key: "weekly", label: "Weekly", icon: CalendarDays },
    { key: "global", label: "Global", icon: Globe2 },
]

function LeaderBoard() {
    const [activeMode, setActiveMode] = useState<LeaderboardMode>("CLASSIC_60S")
    const [activePeriod, setActivePeriod] = useState<LeaderboardPeriod>("daily")
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        console.log("leaderBoard component mounted")
        const fetchLeaderboard = async () => {
            setIsLoading(true)

            try {
                const response = await api.get<ApiResponse<LeaderboardData>>(
                    "/leaderboards",
                    {
                        params: {
                            mode: activeMode,
                            period: activePeriod,
                            limit: 50,
                        },
                    }
                )

                setLeaderboard(response.data.data.leaderboard)
            } catch (error) {
                console.error("Error fetching leaderboard:", error)
                setLeaderboard([])
            } finally {
                setIsLoading(false)
            }
        }

        fetchLeaderboard()
    }, [activeMode])

    const currentModeMeta = useMemo(
        () => MODES.find((mode) => mode.key === activeMode) ?? MODES[0],
        [activeMode]
    )

    const CurrentModeIcon = currentModeMeta.icon

    return (
        <div className="col-span-12 m-4 md:col-span-3">
            <div className="flex h-[calc(100dvh-2rem)] min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
                {/* Header */}
                <div className="mb-4 flex shrink-0 items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-muted text-foreground">
                            <Sparkles className="h-3.5 w-3.5" />
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-foreground">
                                Leaderboard
                            </p>
                        </div>
                    </div>

                    {/* <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-[11px] text-muted-foreground"
            >
                Full board
            </Button> */}
                </div>

                {/* Mode selector */}
                <div className="mb-4 shrink-0 rounded-lg border border-border bg-muted p-1">
                    <div className="grid grid-cols-3 gap-1">
                        {MODES.map((mode) => {
                            const Icon = mode.icon
                            const isActive = mode.key === activeMode

                            return (
                                <button
                                    key={mode.key}
                                    type="button"
                                    onClick={() => setActiveMode(mode.key)}
                                    className={`flex items-center justify-center gap-1.5 rounded-md px-2 py-2 text-[11px] font-medium transition-colors ${
                                        isActive
                                            ? "bg-foreground text-background"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                    {mode.label}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Period selector */}
                <div className="mb-4 flex shrink-0 items-center justify-between gap-2 rounded-xl border border-border bg-background/70 px-3 py-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <CurrentModeIcon className="h-3.5 w-3.5" />

                        <span className="text-[11px] font-medium tracking-[0.12em] uppercase">
                            {activeMode.replace("_", " ")}
                        </span>
                    </div>

                    <div className="flex items-center gap-1">
                        {PERIODS.map((period) => {
                            const Icon = period.icon
                            const isActive = period.key === activePeriod

                            return (
                                <button
                                    key={period.key}
                                    type="button"
                                    onClick={() => setActivePeriod(period.key)}
                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium transition-colors ${
                                        isActive
                                            ? "bg-foreground text-background"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    <Icon className="h-3 w-3" />
                                    {period.label}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Leaderboard content */}
                <div className="flex min-h-0 flex-1 flex-col">
                    {isLoading ? (
                        <div className="min-h-0 flex-1 space-y-2 overflow-hidden">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="flex animate-pulse items-center justify-between rounded-xl border border-border bg-background/60 px-3 py-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-5 w-5 rounded-full bg-muted" />

                                        <div className="h-3 w-20 rounded bg-muted" />
                                    </div>

                                    <div className="h-3 w-12 rounded bg-muted" />
                                </div>
                            ))}
                        </div>
                    ) : leaderboard.length === 0 ? (
                        <div className="flex min-h-0 flex-1 items-center justify-center rounded-xl border border-dashed border-border bg-background/70 px-4 py-8 text-center text-sm text-muted-foreground">
                            No leaderboard data yet.
                        </div>
                    ) : (
                        <div className="min-h-0 flex-1 scrollbar-none space-y-2 overflow-y-auto">
                            {leaderboard.map((entry, index) => (
                                <div
                                    key={`${entry.userId}-${entry.rank}`}
                                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/70 px-3 py-3"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-muted font-mono text-[10px] font-semibold text-foreground">
                                            {index + 1}
                                        </div>

                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-foreground">
                                                {entry.username}
                                            </p>

                                            <p className="text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
                                                #{entry.rank}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="shrink-0 text-right">
                                        <p className="font-mono text-sm font-semibold text-foreground">
                                            {entry.score.toLocaleString()}
                                        </p>

                                        <p className="text-[10px] text-muted-foreground">
                                            points
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default LeaderBoard
