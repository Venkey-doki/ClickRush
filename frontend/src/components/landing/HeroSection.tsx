import { ArrowRight, Gauge, RotateCcw, Target, Timer, Zap } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "../ui/button"

const DEMO_DURATION_MS = 5000

/**
 * A self-contained, client-only replica of the in-game tap zone.
 * No network calls, no accounts — just lets a visitor feel the
 * core mechanic (tap fast, watch CPS climb) in the first five seconds
 * on the page.
 */
function LiveTapDemo() {
    const [state, setState] = useState<"idle" | "running" | "done">("idle")
    const [clicks, setClicks] = useState(0)
    const [msRemaining, setMsRemaining] = useState(DEMO_DURATION_MS)
    const [pulse, setPulse] = useState(false)
    const [bestCps, setBestCps] = useState<number | null>(null)

    const startedAt = useRef(0)
    const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const pulseTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

    const elapsedS = (DEMO_DURATION_MS - msRemaining) / 1000
    const cps = elapsedS > 0 ? clicks / elapsedS : 0
    const progress = ((DEMO_DURATION_MS - msRemaining) / DEMO_DURATION_MS) * 100

    const stop = useCallback((finalClicks: number, finalMs: number) => {
        if (tickRef.current) clearInterval(tickRef.current)
        const finalCps = finalClicks / (finalMs / 1000)
        setBestCps((prev) => (prev === null ? finalCps : Math.max(prev, finalCps)))
        setState("done")
    }, [])

    const start = () => {
        if (tickRef.current) clearInterval(tickRef.current)
        setClicks(0)
        setMsRemaining(DEMO_DURATION_MS)
        startedAt.current = Date.now()
        setState("running")

        tickRef.current = setInterval(() => {
            const remaining = Math.max(
                0,
                DEMO_DURATION_MS - (Date.now() - startedAt.current)
            )
            setMsRemaining(remaining)
            if (remaining <= 0) {
                if (tickRef.current) clearInterval(tickRef.current)
            }
        }, 50)
    }

    useEffect(() => {
        if (state === "running" && msRemaining <= 0) {
            stop(clicks, DEMO_DURATION_MS)
        }
    }, [msRemaining, state, clicks, stop])

    useEffect(() => {
        return () => {
            if (tickRef.current) clearInterval(tickRef.current)
            if (pulseTimeout.current) clearTimeout(pulseTimeout.current)
        }
    }, [])

    const handleTap = () => {
        if (state !== "running") return
        setClicks((c) => c + 1)
        setPulse(true)
        if (pulseTimeout.current) clearTimeout(pulseTimeout.current)
        pulseTimeout.current = setTimeout(() => setPulse(false), 90)
    }

    const secondsLeft = Math.ceil(msRemaining / 1000)

    return (
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-lg shadow-black/[0.03] sm:p-6 lg:mx-16">
            <div className="mb-4 flex items-center justify-between lg:w-80">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                    Try it now
                </span>
                <span className="rounded-full border border-border bg-background px-2.5 py-1 text-[10px] font-medium tracking-[0.1em] text-muted-foreground uppercase">
                    {state === "idle"
                        ? "Ready"
                        : state === "running"
                          ? "Live"
                          : "Done"}
                </span>
            </div>

            <div className="mb-4 grid grid-cols-3 gap-2">
                <DemoTile icon={Timer} label="Time" value={`${secondsLeft}s`} />
                <DemoTile
                    icon={Target}
                    label="Taps"
                    value={clicks.toLocaleString()}
                />
                <DemoTile
                    icon={Gauge}
                    label="CPS"
                    value={cps.toFixed(1)}
                    accent
                />
            </div>

            <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                    className="h-full rounded-full bg-[#FF7A1A] transition-[width] duration-100"
                    style={{ width: `${state === "idle" ? 0 : progress}%` }}
                />
            </div>

            <button
                type="button"
                onClick={
                    state === "idle" || state === "done" ? start : handleTap
                }
                className={`relative flex h-40 w-full flex-col items-center justify-center gap-1.5 overflow-hidden rounded-xl border text-center transition-all select-none ${
                    state === "running"
                        ? pulse
                            ? "scale-[0.98] border-[#FF7A1A] bg-[#FF7A1A]/10"
                            : "border-border bg-background/70 hover:border-[#FF7A1A]/50"
                        : "border-border bg-muted hover:border-foreground/30"
                }`}
            >
                {state !== "running" && (
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,122,26,0.10),transparent_65%)]" />
                )}
                <Zap
                    className={`h-8 w-8 transition-colors ${
                        pulse ? "text-[#FF7A1A]" : "text-foreground"
                    }`}
                />
                <p className="text-sm font-semibold text-foreground">
                    {state === "idle" && "Tap to start · 5s"}
                    {state === "running" && "Tap as fast as you can"}
                    {state === "done" && "Nice — tap to try again"}
                </p>
                {state === "done" && (
                    <p className="font-mono text-xs text-muted-foreground">
                        {clicks} taps · {cps.toFixed(2)} CPS
                    </p>
                )}
            </button>

            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                    Best this round
                    {bestCps !== null && (
                        <span className="ml-1.5 font-mono text-foreground">
                            {bestCps.toFixed(2)} CPS
                        </span>
                    )}
                </span>
                {state === "done" && (
                    <button
                        type="button"
                        onClick={start}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-medium text-foreground hover:bg-muted"
                    >
                        <RotateCcw className="h-3 w-3" />
                        Retry
                    </button>
                )}
            </div>
        </div>
    )
}

function DemoTile({
    icon: Icon,
    label,
    value,
    accent,
}: {
    icon: typeof Timer
    label: string
    value: string
    accent?: boolean
}) {
    return (
        <div className="rounded-lg border border-border bg-background/70 px-2.5 py-2">
            <div className="mb-0.5 flex items-center gap-1 text-[9px] font-medium tracking-[0.1em] text-muted-foreground uppercase">
                <Icon className="h-3 w-3" />
                {label}
            </div>
            <p
                className={`font-mono text-sm font-semibold ${
                    accent ? "text-[#FF7A1A]" : "text-foreground"
                }`}
            >
                {value}
            </p>
        </div>
    )
}

function HeroSection() {
    return (
        <section className="relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(255,122,26,0.08),transparent_70%)]" />

            <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-14 px-4 pt-16 pb-20 sm:px-6 sm:pt-20 sm:pb-28 lg:flex-row lg:items-center lg:gap-10 lg:pt-24">
                <div className="flex max-w-xl flex-col items-center text-center lg:items-start lg:text-left">
                    <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-[11px] font-medium tracking-[0.1em] text-muted-foreground uppercase">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#FF7A1A]" />
                        Score is verified, every run
                    </span>

                    <h1 className="text-4xl leading-[1.05] font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                        How fast can{" "}
                        <span className="whitespace-nowrap">
                            your finger
                        </span>{" "}
                        go?
                    </h1>

                    <p className="mt-5 text-base text-muted-foreground sm:text-lg">
                        ClickRush is a fast, focused clicking challenge.
                        Pick a mode, tap as many times as you can before the
                        timer runs out, and see exactly where you land — today,
                        this week, and all-time.
                    </p>

                    <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                        <Button size="lg" className="group">
                            <Link to="/signup">
                                Start clicking
                                <ArrowRight className="h-3 w-4 inline transition-transform group-hover:translate-x-0.5" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline">
                            <a href="#how-it-works">See how it works</a>
                        </Button>
                    </div>

                    <div className="mt-8 flex items-center gap-5 text-xs text-muted-foreground">
                        <span>3 game modes</span>
                        <span className="h-1 w-1 rounded-full bg-border" />
                        <span>Daily · weekly · global ranks</span>
                        <span className="h-1 w-1 rounded-full bg-border" />
                        <span>Free to play</span>
                    </div>
                </div>

                <div className="flex w-full justify-center lg:w-auto lg:shrink-0">
                    <LiveTapDemo />
                </div>
            </div>
        </section>
    )
}

export default HeroSection
