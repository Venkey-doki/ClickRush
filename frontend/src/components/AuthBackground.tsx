import {
    CalendarDays,
    Flag,
    MousePointerClick,
    Target,
    Timer,
    Zap,
} from "lucide-react"

/**
 * Ambient background: a soft accent glow plus slowly drifting icons
 * from the game's own vocabulary (clock, cursor, target). Purely
 * decorative — sits behind the form via `absolute inset-0`, so the
 * parent must be `relative`.
 */
function AuthBackground() {
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_50%_0%,rgba(255,122,26,0.10),transparent_65%)]" />

            <Timer
                className="auth-float absolute top-[10%] left-[10%] h-14 w-14 text-foreground/[0.06] sm:h-16 sm:w-16"
                style={{ animationDelay: "0s" }}
            />
            <MousePointerClick
                className="auth-float absolute top-[18%] right-[12%] h-10 w-10 text-foreground/[0.07]"
                style={{ animationDelay: "1.1s" }}
            />
            <Zap
                className="auth-float absolute bottom-[22%] left-[8%] h-11 w-11 text-[#FF7A1A]/[0.12] sm:h-12 sm:w-12"
                style={{ animationDelay: "0.6s" }}
            />
            <Target
                className="auth-float absolute right-[16%] bottom-[16%] h-9 w-9 text-foreground/[0.06]"
                style={{ animationDelay: "1.6s" }}
            />
            <Flag
                className="auth-float absolute top-[46%] right-[6%] hidden h-8 w-8 text-foreground/[0.06] sm:block"
                style={{ animationDelay: "0.3s" }}
            />
            <CalendarDays
                className="auth-float absolute top-[42%] left-[6%] hidden h-7 w-7 text-foreground/[0.06] sm:block"
                style={{ animationDelay: "2s" }}
            />

            <style>{`
                @keyframes auth-float-kf {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                .auth-float {
                    animation: auth-float-kf 6.5s ease-in-out infinite;
                }
                @media (prefers-reduced-motion: reduce) {
                    .auth-float { animation: none; }
                }
            `}</style>
        </div>
    )
}

export default AuthBackground
