import Footer from "../components/Footer"
import Game from "../components/Game"
import LeaderBoard from "../components/LeaderBoard"
import ProfileLeaderboardHolder from "../components/ProfileLeaderboardHolder"

function HomePage() {
    return (
        <div className="flex h-dvh flex-col">
            <main className="grid min-h-0 flex-1 grid-cols-12 overflow-hidden grid-rows-[minmax(0,1fr)]">
                <ProfileLeaderboardHolder />
                <Game />
                <LeaderBoard />
            </main>

            <Footer />
        </div>
    )
}

export default HomePage
