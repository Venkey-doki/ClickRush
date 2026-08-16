import {
    CalendarDays,
    Globe2,
    LayoutGrid,
    Sparkles,
    Sun,
} from "lucide-react"

const PERIODS = [
    {
        icon: Sun,
        label: "Daily",
        description: "Resets every day. Your best run since midnight.",
    },
    {
        icon: CalendarDays,
        label: "Weekly",
        description: "Resets each week. Your best run over the last 7 days.",
    },
    {
        icon: Globe2,
        label: "Global",
        description: "Never resets. Your best run of all time.",
    },
] as const

const MOCK_LEADERS = [
    { name: "aria_click", score: 641 },
    { name: "no_mercy", score: 598 },
    { name: "you", score: 512, isYou: true },
    { name: "ghostpaw", score: 487 },
    { name: "tempo7", score: 460 },
]

function LeaderboardSection() {
    return (
        <section id="leaderboard" className="border-t border-border">
            <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-2 lg:items-center lg:gap-16">
                <div>
                    <span className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                        Leaderboard
                    </span>
                    <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        See exactly where you stand
                    </h2>
                    <p className="mt-3 text-muted-foreground">
                        Every completed run is ranked against everyone
                        else's. Leaderboards are split two ways: by time
                        period, and by game mode — so you're always compared
                        against the right field.
                    </p>

                    <div className="mt-8 space-y-3">
                        {PERIODS.map((period) => {
                            const Icon = period.icon
                            return (
                                <div
                                    key={period.label}
                                    className="flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3.5"
                                >
                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-foreground">
                                        <Icon className="h-3.5 w-3.5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">
                                            {period.label}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {period.description}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <div className="mt-5 flex items-start gap-3 rounded-xl border border-dashed border-border bg-muted/40 px-4 py-3.5">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-foreground">
                            <LayoutGrid className="h-3.5 w-3.5" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-foreground">
                                Grouped by mode, too
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Classic, Sprint, and Marathon each have their
                                own daily, weekly, and global boards — a fast
                                Sprint score never competes with a Marathon
                                score.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center lg:justify-end">
                    <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-lg shadow-black/[0.03] sm:p-6">
                        <div className="mb-4 flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-muted text-foreground">
                                <Sparkles className="h-3.5 w-3.5" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground">
                                    Leaderboard
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                    Classic · Today
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {MOCK_LEADERS.map((entry, index) => (
                                <div
                                    key={entry.name}
                                    className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 ${
                                        entry.isYou
                                            ? "border-[#FF7A1A]/40 bg-[#FF7A1A]/[0.06]"
                                            : "border-border bg-background/70"
                                    }`}
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-muted font-mono text-[10px] font-semibold text-foreground">
                                            {index + 1}
                                        </div>
                                        <p className="truncate text-sm font-semibold text-foreground">
                                            {entry.name}
                                        </p>
                                    </div>
                                    <p className="shrink-0 font-mono text-sm font-semibold text-foreground">
                                        {entry.score}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default LeaderboardSection
