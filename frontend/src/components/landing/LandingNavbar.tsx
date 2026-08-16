import { ArrowRight, Menu, Moon, MousePointerClick, Sun, X } from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "../ui/button"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "../theme-provider"

const NAV_LINKS = [
    { label: "How it works", href: "#how-it-works" },
    { label: "Modes", href: "#modes" },
    { label: "Leaderboard", href: "#leaderboard" },
    { label: "Profile", href: "#profile" },
] as const

function LandingNavbar() {
    const { user } = useAuth()
    const [scrolled, setScrolled] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const { theme, setTheme } = useTheme()

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8)
        onScroll()
        window.addEventListener("scroll", onScroll, { passive: true })
        return () => window.removeEventListener("scroll", onScroll)
    }, [])

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark")
    }

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

                    {user ? (
                        <Button
                            size="sm"
                            className="hidden items-center gap-2 md:flex"
                        >
                            <Link to="/dashboard">
                                <span className="relative z-10">
                                    Play Arena
                                </span>
                            </Link>
                            <ArrowRight className="inline h-3 w-4 transition-transform group-hover:translate-x-0.5" />
                        </Button>
                    ) : (
                        <div className="hidden items-center gap-2 md:flex">
                            <Button variant="ghost" size="sm">
                                <Link to="/login">Log in</Link>
                            </Button>
                            <Button
                                size="sm"
                                className="group relative overflow-hidden"
                            >
                                <Link to="/signup">
                                    <span className="relative z-10">
                                        Play free
                                    </span>
                                </Link>
                            </Button>
                        </div>
                    )}
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
                    <div className="px-3 items-center gap-2 md:flex">
                        <div className=" py-2 flex items-center gap-2">
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

                        {user ? (
                            <Button
                                size="sm"
                                className="items-center gap-2 md:flex"
                            >
                                <Link to="/dashboard">
                                    <span className="relative z-10">
                                        Play Arena
                                    </span>
                                </Link>
                                <ArrowRight className="inline h-3 w-4 transition-transform group-hover:translate-x-0.5" />
                            </Button>
                        ) : (
                            <div className="hidden items-center gap-2 md:flex">
                                <Button variant="ghost" size="sm">
                                    <Link to="/login">Log in</Link>
                                </Button>
                                <Button
                                    size="sm"
                                    className="group relative overflow-hidden"
                                >
                                    <Link to="/signup">
                                        <span className="relative z-10">
                                            Play free
                                        </span>
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    )
}

export default LandingNavbar
