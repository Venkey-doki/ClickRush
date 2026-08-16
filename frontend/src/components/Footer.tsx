import { FaGithub, FaLinkedin } from "react-icons/fa"
import { FaXTwitter } from "react-icons/fa6"

const SOCIAL_LINKS = [
    {
        name: "GitHub",
        href: "https://github.com/Venkey-doki",
        icon: FaGithub,
    },
    {
        name: "X",
        href: "https://x.com/knox_sama_",
        icon: FaXTwitter,
    },
    {
        name: "LinkedIn",
        href: "https://www.linkedin.com/in/doki-venkateswararao/",
        icon: FaLinkedin,
    },
] as const

function Footer() {
    return (
        <footer className="border-t border-border">
            <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-2 py-2 sm:flex-row sm:items-center sm:justify-center sm:px-6">
                <div>
                    <p className="text-sm font-medium text-foreground">
                        Built by Knox
                        <span className="mt-1 mx-2 text-xs text-muted-foreground">
                            © {new Date().getFullYear()} All rights reserved.
                        </span>
                    </p>
                </div>

                <nav
                    aria-label="Social links"
                    className="flex flex-wrap items-center"
                >
                    {SOCIAL_LINKS.map(({ name, href, icon: Icon }) => (
                        <a
                            key={name}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            aria-label={name}
                        >
                            <Icon className="size-4" />
                            <span>{name}</span>
                        </a>
                    ))}
                </nav>
            </div>
        </footer>
    )
}

export default Footer
