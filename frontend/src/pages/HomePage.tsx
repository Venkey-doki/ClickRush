import ProfileLeaderboardHolder from "../components/ProfileLeaderboardHolder";
import Game from "../components/Game";
import GameHistory from "../components/GameHistory";
import LeaderBoard from "../components/LeaderBoard";

function HomePage() {
  return (
    <main className=" w-full min-h-screen grid grid-cols-12">
      <ProfileLeaderboardHolder />
      <Game />
      <LeaderBoard />
      {/* <GameHistory /> */}
    </main>
  )
}

export default HomePage