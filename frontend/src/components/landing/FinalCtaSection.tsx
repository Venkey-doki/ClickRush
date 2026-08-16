import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "../ui/button"

function FinalCtaSection() {
    return (
        <section className="border-t border-border">
            <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
                <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-14 text-center sm:px-12 sm:py-20">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_50%_100%,rgba(255,122,26,0.10),transparent_70%)]" />

                    <div className="relative">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            Your best score is still unset.
                        </h2>
                        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
                            Create a free account and put a number on the
                            board. It takes less time than one Sprint run.
                        </p>
                        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                            <Button size="lg" className="group">
                                <Link to="/signup">
                                    Create your account
                                    <ArrowRight className="h-4 w-4 inline transition-transform group-hover:translate-x-0.5" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline">
                                <Link to="/login">I already have one</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default FinalCtaSection
