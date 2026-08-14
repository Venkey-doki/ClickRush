import GameHistory from "../components/GameHistory"
import Profile from "../components/Profile"
function ProfileLeaderboardHolder() {
    return (
        <div className="col-span-12 flex min-h-[calc(100dvh-2rem)] flex-col md:col-span-3">
            <Profile />
            {/* <LeaderBoard /> */}
            <GameHistory />
        </div>
    )
}

export default ProfileLeaderboardHolder
