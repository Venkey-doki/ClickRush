import Profile from "../components/Profile";
import LeaderBoard from "../components/LeaderBoard";
import Game from "../components/Game";

function HomePage() {
  return (
    <main className="flex gap-4 justify-between min-h-screen py-2">
      <Profile />
      <Game />
      <LeaderBoard />
    </main>
  )
}

export default HomePage