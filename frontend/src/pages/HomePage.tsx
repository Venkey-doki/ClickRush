import Footer from "../components/Footer"
import Game from "../components/Game"
import LeaderBoard from "../components/LeaderBoard"
import ProfileLeaderboardHolder from "../components/ProfileLeaderboardHolder"

function HomePage() {
    return (
        <div className="flex min-h-dvh flex-col md:h-dvh md:overflow-hidden">
            <main className="flex flex-1 flex-col md:grid md:min-h-0 md:grid-cols-12 md:grid-rows-[minmax(0,1fr)] md:overflow-hidden">
                <ProfileLeaderboardHolder />
                <Game />
                <LeaderBoard />
            </main>

            <Footer />
        </div>
    )
}

export default HomePage
