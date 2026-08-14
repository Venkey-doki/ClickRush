const SOCIAL_LINKS = [
    {
        name: "GitHub",
        href: "https://github.com/Venkey-doki",
    },
    {
        name: "X",
        href: "https://x.com/knox_sama_",
    },
    {
        name: "LinkedIn",
        href: "https://www.linkedin.com/in/doki-venkateswararao/",
    },
] as const

function Footer() {
    return (
        <footer className="mt-4 p-4 shadow-sm sm:p-5">
            <div className="border-t border-border"></div>
            <div className="m-1 flex flex-col items-start justify-center gap-3 sm:flex-row sm:items-center">
                <p className="text-xs text-muted-foreground">
                    Built by{" "}
                    <span className="font-semibold text-foreground">Knox</span>
                </p>

                <div className="text-xs text-muted-foreground"> | </div>

                <div className="flex items-center gap-2">
                    {SOCIAL_LINKS.map(({ name, href }) => (
                        <>
                            <a
                                key={name}
                                href={href}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                                aria-label={name}
                            >
                                {name}
                            </a>

                            <div className="text-xs text-muted-foreground">
                                {" "}
                                |{" "}
                            </div>
                        </>
                    ))}
                </div>
            </div>
        </footer>
    )
}

export default Footer
