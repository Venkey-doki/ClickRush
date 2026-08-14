import ProfileLeaderboardHolder from "../components/ProfileLeaderboardHolder"
import Game from "../components/Game"
import LeaderBoard from "../components/LeaderBoard"
import Footer from "../components/Footer"

function HomePage() {
    return (
        <>
            <main className="grid min-h-screen w-full grid-cols-12">
                <ProfileLeaderboardHolder />
                <Game />
                <LeaderBoard />
                {/* <GameHistory /> */}
            </main>
            <Footer />
        </>
    )
}

export default HomePage
