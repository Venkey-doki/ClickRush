import {
    ArrowLeft,
    AtSign,
    Eye,
    EyeOff,
    KeyRound,
    MousePointerClick,
    UserPlus,
} from "lucide-react"
import { useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import AuthBackground from "../components/AuthBackground"
import { Label } from "../components/ui/label"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { Spinner } from "@/components/ui/spinner"

function SignUpPage() {
    const [emailId, setEmailId] = useState("")
    const [userName, setUserName] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const { signup } = useAuth()
    const navigate = useNavigate()
    const emailIdRef = useRef<HTMLInputElement>(null)
    const userNameRef = useRef<HTMLInputElement>(null)
    const passwordRef = useRef<HTMLInputElement>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSignup = async () => {
        try {
            setLoading(true)
            setError(null)
            await signup(emailId, userName, password)
            navigate("/Dashboard")
        } catch (error: any) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            void handleSignup()
        }
    }

    return (
        <section className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-background px-6 py-12 md:p-10">
            <AuthBackground />

            <Link
                to="/"
                className="absolute top-6 left-6 z-10 inline-flex items-center gap-1.5 rounded-full border border-border bg-card/80 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm transition-colors hover:text-foreground sm:top-8 sm:left-8"
            >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to ClickRush
            </Link>

            <div className="relative z-10 w-full max-w-sm">
                <div className="mb-8 flex flex-col items-center gap-3 text-center">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-foreground text-background">
                        <MousePointerClick className="h-5 w-5" />
                    </span>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Create your account
                        </h1>
                        <p className="mt-1.5 text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link
                                className="font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
                                to="/login"
                            >
                                Log in
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6 shadow-lg shadow-black/[0.03]">
                    {error && (
                        <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <Label className="mb-2 text-sm" htmlFor="Email">
                                Email
                            </Label>
                            <div className="relative">
                                <AtSign className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    aria-invalid={error ? "true" : "false"}
                                    className="pl-9"
                                    ref={emailIdRef}
                                    type="text"
                                    placeholder="you@example.com"
                                    id="Email"
                                    autoComplete="email"
                                    onChange={(e) =>
                                        setEmailId(e.target.value)
                                    }
                                    onKeyDown={handleKeyDown}
                                />
                            </div>
                        </div>

                        <div>
                            <Label className="mb-2 text-sm" htmlFor="UserName">
                                Username
                            </Label>
                            <div className="relative">
                                <UserPlus className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    aria-invalid={error ? "true" : "false"}
                                    className="pl-9"
                                    ref={userNameRef}
                                    type="text"
                                    placeholder="clickmaster99"
                                    id="UserName"
                                    autoComplete="username"
                                    onChange={(e) =>
                                        setUserName(e.target.value)
                                    }
                                    onKeyDown={handleKeyDown}
                                />
                            </div>
                            <p className="mt-1.5 text-xs text-muted-foreground">
                                Minimum 3 characters — letters, numbers, and
                                underscores only.
                            </p>
                        </div>

                        <div>
                            <Label className="mb-2 text-sm" htmlFor="Password">
                                Password
                            </Label>
                            <div className="relative">
                                <KeyRound className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    aria-invalid={error ? "true" : "false"}
                                    className="pr-9 pl-9"
                                    ref={passwordRef}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    id="Password"
                                    autoComplete="new-password"
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    onKeyDown={handleKeyDown}
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword((v) => !v)
                                    }
                                    className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            <p className="mt-1.5 text-xs text-muted-foreground">
                                8 characters minimum.
                            </p>
                        </div>

                        <Button
                            className="mt-2 w-full"
                            onClick={() => void handleSignup()}
                            disabled={loading}
                        >
                            {loading ? (
                                <Spinner className="h-4 w-4 animate-spin" />
                            ) : (
                                <UserPlus className="h-4 w-4" />
                            )}
                            {loading ? "Creating account..." : "Sign up"}
                        </Button>
                    </div>
                </div>

                <p className="mt-6 text-center text-xs text-muted-foreground">
                    By continuing you agree to ClickRush's fair-play
                    guidelines.
                </p>
            </div>
        </section>
    )
}

export default SignUpPage
