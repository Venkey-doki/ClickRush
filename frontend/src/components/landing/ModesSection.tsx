import { Flag, Gauge, Target, Timer, Zap } from "lucide-react"

const MODES = [
    {
        key: "CLASSIC_60S",
        label: "Classic",
        duration: "60 seconds",
        icon: Target,
        description:
            "The standard ClickRush run. Long enough to find a rhythm, short enough to stay sharp the whole way through.",
        tag: "Most played",
    },
    {
        key: "SPRINT_10S",
        label: "Sprint",
        duration: "10 seconds",
        icon: Zap,
        description:
            "All-out, no pacing. A short burst that rewards raw speed over endurance.",
        tag: "High intensity",
    },
    {
        key: "MARATHON_120S",
        label: "Marathon",
        duration: "120 seconds",
        icon: Flag,
        description:
            "The long game. Holding a fast pace for two full minutes is a different challenge entirely.",
        tag: "Endurance",
    },
] as const

function ModesSection() {
    return (
        <section id="modes" className="border-t border-border bg-muted/30">
            <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
                <div className="mx-auto mb-14 max-w-xl text-center">
                    <span className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                        Game modes
                    </span>
                    <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        Three ways to play
                    </h2>
                    <p className="mt-3 text-muted-foreground">
                        Every mode tracks the same three things — clicks,
                        time, and clicks per second — just at a different
                        pace.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {MODES.map((mode) => {
                        const Icon = mode.icon
                        return (
                            <div
                                key={mode.key}
                                className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                            >
                                <div className="mb-5 flex items-center justify-between">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted text-foreground">
                                        <Icon className="h-4.5 w-4.5" />
                                    </div>
                                    <span className="rounded-full border border-border bg-background px-2.5 py-1 text-[10px] font-medium tracking-[0.1em] text-muted-foreground uppercase">
                                        {mode.tag}
                                    </span>
                                </div>

                                <p className="text-lg font-semibold text-foreground">
                                    {mode.label}
                                </p>
                                <p className="mt-1 flex items-center gap-1.5 font-mono text-sm text-muted-foreground">
                                    <Timer className="h-3.5 w-3.5" />
                                    {mode.duration}
                                </p>

                                <p className="mt-4 flex-1 text-sm text-muted-foreground">
                                    {mode.description}
                                </p>

                                <div className="mt-5 flex items-center gap-1.5 border-t border-border pt-4 text-xs text-muted-foreground">
                                    <Gauge className="h-3.5 w-3.5" />
                                    Tracks clicks, CPS, and final score
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

export default ModesSection
