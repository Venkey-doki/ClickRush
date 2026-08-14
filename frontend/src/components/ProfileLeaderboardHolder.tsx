import Profile from "../components/Profile";
import LeaderBoard from "../components/LeaderBoard";
function ProfileLeaderboardHolder() {
  return (
    <div className="col-span-3 gap-4 flex flex-col">
      <Profile />
      <LeaderBoard />
    </div>
  )
}

export default ProfileLeaderboardHolder