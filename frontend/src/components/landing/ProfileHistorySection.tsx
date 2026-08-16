import { CalendarDays, Globe2, History, Sun, User } from "lucide-react"

const RANK_ROWS = [
    { icon: Sun, label: "Today", rank: "#4", score: "512" },
    { icon: CalendarDays, label: "Weekly", rank: "#12", score: "560" },
    { icon: Globe2, label: "Global", rank: "#89", score: "581" },
] as const

const HISTORY_ROWS = [
    { mode: "Classic", when: "Today", clicks: 512, cps: "8.53" },
    { mode: "Sprint", when: "Yesterday", clicks: 94, cps: "9.40" },
    { mode: "Marathon", when: "2 days ago", clicks: 940, cps: "7.83" },
] as const

function ProfileHistorySection() {
    return (
        <section id="profile" className="border-t border-border bg-muted/30">
            <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-2 lg:items-center lg:gap-16">
                <div className="order-2 flex justify-center lg:order-1 lg:justify-start">
                    <div className="grid w-full max-w-sm gap-4">
                        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted text-sm font-semibold text-foreground">
                                    YT
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">
                                        you
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Classic mode
                                    </p>
                                </div>
                            </div>
                            <div className="divide-y divide-border rounded-xl border border-border bg-background/70">
                                {RANK_ROWS.map((row) => {
                                    const Icon = row.icon
                                    return (
                                        <div
                                            key={row.label}
                                            className="flex items-center justify-between gap-3 px-4 py-2.5"
                                        >
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Icon className="h-3.5 w-3.5" />
                                                <span className="text-xs">
                                                    {row.label}
                                                </span>
                                            </div>
                                            <div className="text-right leading-tight">
                                                <p className="font-mono text-sm font-semibold text-foreground">
                                                    {row.rank}
                                                </p>
                                                <p className="font-mono text-[10px] text-muted-foreground">
                                                    {row.score}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
                            <p className="mb-3 text-sm font-semibold text-foreground">
                                Recent games
                            </p>
                            <div className="space-y-2">
                                {HISTORY_ROWS.map((row) => (
                                    <div
                                        key={`${row.mode}-${row.when}`}
                                        className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/70 px-3 py-2.5"
                                    >
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium tracking-[0.1em] text-foreground uppercase">
                                                    {row.mode}
                                                </span>
                                                <span className="text-[11px] text-muted-foreground">
                                                    {row.when}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-[11px] text-muted-foreground">
                                                {row.clicks} clicks ·{" "}
                                                {row.cps} CPS
                                            </p>
                                        </div>
                                        <p className="font-mono text-sm font-semibold text-foreground">
                                            #{row.clicks}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="order-1 lg:order-2">
                    <span className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                        Profile & history
                    </span>
                    <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        Track your progress over time
                    </h2>
                    <p className="mt-3 text-muted-foreground">
                        Your profile keeps a running record of how you're
                        doing, so improvement is something you can actually
                        see.
                    </p>

                    <div className="mt-8 space-y-3">
                        <div className="flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3.5">
                            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-foreground">
                                <User className="h-3.5 w-3.5" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground">
                                    Your rank, at a glance
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Daily, weekly, and global rank and score
                                    for every mode, right on your profile.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3.5">
                            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-foreground">
                                <History className="h-3.5 w-3.5" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground">
                                    Every run, remembered
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Your recent games are logged with mode,
                                    click count, CPS, and duration — so you
                                    can spot trends, not just single scores.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ProfileHistorySection
