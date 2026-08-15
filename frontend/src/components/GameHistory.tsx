import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"
import api from "../lib/api"
import type {
    ApiResponse,
    UserHistoryEntry,
    UserHistoryResponse,
} from "../types/user"
// import { Button } from "./ui/button"

const formatModeLabel = (mode: string) => {
    const map: Record<string, string> = {
        CLASSIC_60S: "Classic",
        SPRINT_10S: "Sprint",
        MARATHON_120S: "Marathon",
    }

    return map[mode] ?? mode
}

const formatDuration = (durationMs: number) => {
    const totalSeconds = Math.max(1, Math.round(durationMs / 1000))
    return `${totalSeconds}s`
}

function GameHistory() {
    const { user } = useAuth()

    const [userHistory, setUserHistory] = useState<UserHistoryEntry[]>([])

    useEffect(() => {
        if (!user) {
            setUserHistory([])
            return
        }

        const fetchUserHistory = async () => {
            try {
                const historyResponse =
                    await api.get<ApiResponse<UserHistoryResponse>>(
                        "/users/me/games"
                    )
                setUserHistory(historyResponse.data.data.history)
            } catch (error) {
                console.error("Error fetching user history:", error)
            }
        }

        fetchUserHistory()
    }, [user])

    return (
        <div className="m-4 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
            <div className="mb-4 flex shrink-0 items-center justify-between gap-2">
                <div>
                    <p className="text-sm font-semibold text-foreground">
                        Recent games
                    </p>
                </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                {!userHistory.length ? (
                    <div className="flex min-h-0 flex-1 items-center justify-center rounded-xl border border-dashed border-border bg-background/70 px-4 py-8 text-center text-sm text-muted-foreground">
                        No games played yet.
                    </div>
                ) : (
                    <div className="min-h-0 flex-1 scrollbar-none space-y-2 overflow-y-auto">
                        {userHistory.map((entry) => (
                            <div
                                key={entry.id}
                                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/70 px-3 py-3"
                            >
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium tracking-[0.12em] text-foreground uppercase">
                                            {formatModeLabel(entry.mode)}
                                        </span>

                                        <span className="text-[11px] text-muted-foreground">
                                            {new Date(
                                                entry.createdAt
                                            ).toLocaleDateString(undefined, {
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </span>
                                    </div>

                                    <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                                        <span>{entry.clickCount} clicks</span>

                                        <span>{entry.cps.toFixed(2)} CPS</span>

                                        <span>
                                            {formatDuration(entry.durationMs)}
                                        </span>
                                    </div>
                                </div>

                                <div className="shrink-0 text-right">
                                    <p className="font-mono text-sm font-semibold text-foreground">
                                        #{entry.clickCount}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default GameHistory
