import Footer from "../components/Footer"
import FinalCtaSection from "../components/landing/FinalCtaSection"
import HeroSection from "../components/landing/HeroSection"
import HowItWorksSection from "../components/landing/HowItWorksSection"
import LandingNavbar from "../components/landing/LandingNavbar"
import LeaderboardSection from "../components/landing/LeaderboardSection"
import ModesSection from "../components/landing/ModesSection"
import ProfileHistorySection from "../components/landing/ProfileHistorySection"

function LandingPage() {
    return (
        <div className="flex min-h-dvh flex-col bg-background">
            <LandingNavbar />

            <main className="flex-1">
                <HeroSection />
                <HowItWorksSection />
                <ModesSection />
                <LeaderboardSection />
                <ProfileHistorySection />
                <FinalCtaSection />
            </main>

            <Footer />
        </div>
    )
}

export default LandingPage
