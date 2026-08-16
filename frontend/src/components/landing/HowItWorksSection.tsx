import { LineChart, ListChecks, Play, UserPlus } from "lucide-react"

const STEPS = [
    {
        icon: UserPlus,
        title: "Create your account",
        description:
            "Sign up with an email and username. Takes a few seconds — no downloads, nothing to configure.",
    },
    {
        icon: ListChecks,
        title: "Pick a mode",
        description:
            "Choose Classic, Sprint, or Marathon depending on how long you want to go for.",
    },
    {
        icon: Play,
        title: "Tap as fast as you can",
        description:
            "Hit start and click the tap zone as many times as possible before the timer hits zero.",
    },
    {
        icon: LineChart,
        title: "See where you rank",
        description:
            "Your score lands on the leaderboard instantly, and gets added to your personal history.",
    },
] as const

function HowItWorksSection() {
    return (
        <section id="how-it-works" className="border-t border-border">
            <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
                <div className="mx-auto mb-14 max-w-xl text-center">
                    <span className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                        How it works
                    </span>
                    <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        Four steps. No learning curve.
                    </h2>
                    <p className="mt-3 text-muted-foreground">
                        There's no strategy to memorize — just speed,
                        consistency, and a countdown clock.
                    </p>
                </div>

                <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="pointer-events-none absolute top-9 right-0 left-0 hidden h-px bg-border lg:block" />

                    {STEPS.map((step, index) => {
                        const Icon = step.icon
                        return (
                            <div
                                key={step.title}
                                className="relative flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted text-foreground">
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <span className="font-mono text-xs text-muted-foreground">
                                        {String(index + 1).padStart(2, "0")}
                                    </span>
                                </div>
                                <p className="text-sm font-semibold text-foreground">
                                    {step.title}
                                </p>
                                <p className="mt-1.5 text-sm text-muted-foreground">
                                    {step.description}
                                </p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

export default HowItWorksSection
