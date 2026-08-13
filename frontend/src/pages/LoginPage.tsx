import { useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Label } from "../components/ui/label"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { Spinner } from "@/components/ui/spinner";

function LoginPage() {
    const [loginId, setLoginId] = useState("")
    const [password, setPassword] = useState("")
    const { login } = useAuth()
    const navigate = useNavigate()
    const loginIdRef = useRef<HTMLInputElement>(null)
    const passwordRef = useRef<HTMLInputElement>(null)
    const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)

    const handleLogin = async () => {
        try {
            setLoading(true)
            setError(null)
            await login(loginId, password)
            navigate("/")
        } catch (err) {
            setError(
                "Login failed Please check your credentials and try again."
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col items-center gap-2 text-center">
                        <h1 className="m-1 text-2xl font-bold">
                            Welcome to ClickRush
                        </h1>
                        <p className="text-md text-gray-600">
                            Don't have an account?
                            <Link
                                className="mx-0.5 text-gray-500 hover:text-gray-300 hover:underline"
                                to="/signup"
                            >
                                Sign up
                            </Link>
                        </p>
                    </div>
                    <div>
                        {error && (
                            <p className="mb-2 font-bold text-red-500">
                                {error}
                            </p>
                        )}
                        <Label
                            className="mb-3 text-sm"
                            htmlFor="UserNameOrEmail"
                        >
                            LoginId
                        </Label>
                        <Input
                            aria-invalid={error ? "true" : "false"}
                            className="mb-4"
                            ref={loginIdRef}
                            type="text"
                            placeholder="Email Or UserName"
                            id="UserNameOrEmail"
                            onChange={(e) => setLoginId(e.target.value)}
                        />
                        <Label className="mb-3 text-sm" htmlFor="Password">
                            Password
                        </Label>
                        <Input
                            aria-invalid={error ? "true" : "false"}
                            className="mb-4"
                            ref={passwordRef}
                            type="password"
                            placeholder="Password"
                            id="Password"
                            onChange={(e) => setPassword(e.target.value)}
                        />
						<Button className="mt-2 w-full" onClick={handleLogin}>
							{ loading ? <Spinner className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {loading ? "Logging in..." : "Login"}
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default LoginPage