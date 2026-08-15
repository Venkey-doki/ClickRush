import {
    CalendarDays,
    Flag,
    Globe2,
    LogOut,
    Mail,
    Moon,
    Sun,
    Target,
    Zap,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"
import api from "../lib/api"
import type { ApiResponse, UserRank, UserStatsResponse } from "../types/user"
import { useTheme } from "./theme-provider"
import { Button } from "./ui/button"

const MODES = [
    { key: "classic", label: "Classic", icon: Target },
    { key: "sprint", label: "Sprint", icon: Zap },
    { key: "marathon", label: "Marathon", icon: Flag },
]

const PERIODS = [
    { key: "today", label: "Today", icon: Sun },
    { key: "weekly", label: "Weekly", icon: CalendarDays },
    { key: "global", label: "Global", icon: Globe2 },
]

function Profile() {
    const { user, logout } = useAuth()
    const { theme, setTheme } = useTheme()
    const [classicUserRank, setClassicUserRank] = useState<UserRank | null>(
        null
    )
    const [sprintUserRank, setSprintUserRank] = useState<UserRank | null>(null)
    const [marathonUserRank, setMarathonUserRank] = useState<UserRank | null>(
        null
    )
    const [activeIndex, setActiveIndex] = useState<number>(0)

    const activeKey = MODES[activeIndex].key

    const rankMap = {
        classic: classicUserRank,
        sprint: sprintUserRank,
        marathon: marathonUserRank,
    }

    const modeData = {
        classic: {
            today: {
                rank: rankMap.classic?.todayRank ?? null,
                score: rankMap.classic?.todayScore ?? null,
            },
            weekly: {
                rank: rankMap.classic?.weeklyRank ?? null,
                score: rankMap.classic?.weeklyScore ?? null,
            },
            global: {
                rank: rankMap.classic?.globalRank ?? null,
                score: rankMap.classic?.globalScore ?? null,
            },
        },
        sprint: {
            today: {
                rank: rankMap.sprint?.todayRank ?? null,
                score: rankMap.sprint?.todayScore ?? null,
            },
            weekly: {
                rank: rankMap.sprint?.weeklyRank ?? null,
                score: rankMap.sprint?.weeklyScore ?? null,
            },
            global: {
                rank: rankMap.sprint?.globalRank ?? null,
                score: rankMap.sprint?.globalScore ?? null,
            },
        },
        marathon: {
            today: {
                rank: rankMap.marathon?.todayRank ?? null,
                score: rankMap.marathon?.todayScore ?? null,
            },
            weekly: {
                rank: rankMap.marathon?.weeklyRank ?? null,
                score: rankMap.marathon?.weeklyScore ?? null,
            },
            global: {
                rank: rankMap.marathon?.globalRank ?? null,
                score: rankMap.marathon?.globalScore ?? null,
            },
        },
    }

    const data = modeData[activeKey as keyof typeof modeData]

    useEffect(() => {
        if (!user) return

        const fetchProfileData = async () => {
            try {
                const classicResponse = await api.get<
                    ApiResponse<UserStatsResponse>
                >("/users/me/stats", {
                    params: { mode: "CLASSIC_60S" },
                })
                const sprintResponse = await api.get<
                    ApiResponse<UserStatsResponse>
                >("/users/me/stats", {
                    params: { mode: "SPRINT_10S" },
                })
                const marathonResponse = await api.get<
                    ApiResponse<UserStatsResponse>
                >("/users/me/stats", {
                    params: { mode: "MARATHON_120S" },
                })

                const classicData = classicResponse.data.data
                const sprintData = sprintResponse.data.data
                const marathonData = marathonResponse.data.data

                setClassicUserRank({
                    mode: classicData.mode,
                    todayRank: classicData.todayRank?.rank ?? null,
                    weeklyRank: classicData.weeklyRank?.rank ?? null,
                    globalRank: classicData.globalRank?.rank ?? null,
                    todayScore: classicData.todayRank?.score ?? null,
                    weeklyScore: classicData.weeklyRank?.score ?? null,
                    globalScore: classicData.globalRank?.score ?? null,
                })

                setSprintUserRank({
                    mode: sprintData.mode,
                    todayRank: sprintData.todayRank?.rank ?? null,
                    weeklyRank: sprintData.weeklyRank?.rank ?? null,
                    globalRank: sprintData.globalRank?.rank ?? null,
                    todayScore: sprintData.todayRank?.score ?? null,
                    weeklyScore: sprintData.weeklyRank?.score ?? null,
                    globalScore: sprintData.globalRank?.score ?? null,
                })

                setMarathonUserRank({
                    mode: marathonData.mode,
                    todayRank: marathonData.todayRank?.rank ?? null,
                    weeklyRank: marathonData.weeklyRank?.rank ?? null,
                    globalRank: marathonData.globalRank?.rank ?? null,
                    todayScore: marathonData.todayRank?.score ?? null,
                    weeklyScore: marathonData.weeklyRank?.score ?? null,
                    globalScore: marathonData.globalRank?.score ?? null,
                })
            } catch (error) {
                console.error("Error fetching profile data:", error)
            }
        }

        fetchProfileData()
    }, [user])

    const handleLogout = () => {
        const refreshToken = localStorage.getItem("RefreshToken")
        logout(refreshToken || "")
    }

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark")
    }

    return (
        <>
            <div className="m-4 flex h-fit shrink-0 flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
                <div className="flex items-center gap-3">
                    <Avatar name={user?.username || "User"} />
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                            {user?.username}
                        </p>
                        <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3 shrink-0" />
                            <span className="truncate">{user?.email}</span>
                        </div>
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={toggleTheme}
                            className="rounded-full border border-border bg-background text-foreground shadow-sm hover:bg-muted hover:text-foreground"
                            aria-label="Toggle theme"
                        >
                            {theme === "dark" ? (
                                <Sun className="h-3.5 w-3.5" />
                            ) : (
                                <Moon className="h-3.5 w-3.5" />
                            )}
                        </Button>
                    </div>
                </div>

                <div className="my-5 h-px w-full bg-border" />

                <div className="relative grid grid-cols-3 rounded-lg border border-border bg-muted p-1 text-xs font-medium">
                    <div
                        className="absolute inset-y-1 rounded-md bg-foreground text-background shadow-sm transition-transform duration-300 ease-out"
                        style={{
                            width: `calc(${100 / MODES.length}% - 4px)`,
                            transform: `translateX(calc(${activeIndex * 100}% + ${activeIndex * 4}px))`,
                        }}
                    />
                    {MODES.map((mode, i) => {
                        const Icon = mode.icon
                        const isActive = i === activeIndex
                        return (
                            <button
                                key={mode.key}
                                type="button"
                                onClick={() => setActiveIndex(i)}
                                className={`relative z-10 flex items-center justify-center gap-1.5 rounded-md py-1.5 transition-colors duration-200 ${
                                    isActive
                                        ? "text-background"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                {mode.label}
                            </button>
                        )
                    })}
                </div>

                <div className="mt-4 divide-y divide-border rounded-xl border border-border bg-background/70">
                    {PERIODS.map((period) => {
                        const Icon = period.icon
                        const stat = data[period.key as keyof typeof data]
                        return (
                            <div
                                key={period.key}
                                className="flex items-center justify-between gap-3 px-4 py-3"
                            >
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Icon className="h-3.5 w-3.5 shrink-0" />
                                    <span className="text-xs">
                                        {period.label}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="text-right leading-tight">
                                        <p className="font-mono text-lg font-semibold text-foreground">
                                            {stat.rank === null
                                                ? "—"
                                                : `#${stat.rank}`}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground">
                                            {stat.score === null
                                                ? "No score"
                                                : "score"}{" "}
                                            {stat.score !== null && (
                                                <span className="font-mono text-foreground">
                                                    {stat.score.toLocaleString()}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <Button
                    type="button"
                    onClick={handleLogout}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-muted py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-foreground hover:text-background"
                >
                    <LogOut className="h-4 w-4" />
                    Log out
                </Button>
            </div>
        </>
    )
}

export default Profile

function Avatar({ name }: { name: string }) {
    const initials = name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()

    return (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-sm font-semibold tracking-wide text-foreground">
            {initials}
        </div>
    )
}
