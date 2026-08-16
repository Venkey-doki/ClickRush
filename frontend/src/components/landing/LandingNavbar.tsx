import { Menu, MousePointerClick, X } from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "../ui/button"

const NAV_LINKS = [
    { label: "How it works", href: "#how-it-works" },
    { label: "Modes", href: "#modes" },
    { label: "Leaderboard", href: "#leaderboard" },
    { label: "Profile", href: "#profile" },
] as const

function LandingNavbar() {
    const [scrolled, setScrolled] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8)
        onScroll()
        window.addEventListener("scroll", onScroll, { passive: true })
        return () => window.removeEventListener("scroll", onScroll)
    }, [])

    return (
        <header
            className={`sticky top-0 z-50 w-full border-b transition-colors duration-300 ${
                scrolled
                    ? "border-border bg-background/80 backdrop-blur-md"
                    : "border-transparent bg-transparent"
            }`}
        >
            <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
                <Link to="/" className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-foreground text-background">
                        <MousePointerClick className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-semibold tracking-tight text-foreground">
                        ClickRush
                    </span>
                </Link>

                <nav className="hidden items-center gap-1 md:flex">
                    {NAV_LINKS.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>

                <div className="hidden items-center gap-2 md:flex">
                    <Button variant="ghost" size="sm">
                        <Link to="/login">Log in</Link>
                    </Button>
                    <Button size="sm" className="group relative overflow-hidden">
                        <Link to="/signup">
                            <span className="relative z-10">Play free</span>
                        </Link>
                    </Button>
                </div>

                <button
                    type="button"
                    onClick={() => setMobileOpen((v) => !v)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground md:hidden"
                    aria-label="Toggle menu"
                >
                    {mobileOpen ? (
                        <X className="h-4 w-4" />
                    ) : (
                        <Menu className="h-4 w-4" />
                    )}
                </button>
            </div>

            {mobileOpen && (
                <div className="border-t border-border bg-background px-4 pb-4 md:hidden">
                    <nav className="flex flex-col gap-1 pt-2">
                        {NAV_LINKS.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>
                    <div className="mt-3 flex flex-col gap-2">
                        <Button variant="outline" className="w-full">
                            <Link to="/login">Log in</Link>
                        </Button>
                        <Button className="w-full">
                            <Link to="/signup">Play free</Link>
                        </Button>
                    </div>
                </div>
            )}
        </header>
    )
}

export default LandingNavbar
