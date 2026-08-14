import ProfileLeaderboardHolder from "../components/ProfileLeaderboardHolder";
import Game from "../components/Game";
import GameHistory from "../components/GameHistory";

function HomePage() {
  return (
    <main className="gap-4 w-full min-h-screen grid grid-cols-12">
      <ProfileLeaderboardHolder />
      <Game />
      <GameHistory />
    </main>
  )
}

export default HomePage