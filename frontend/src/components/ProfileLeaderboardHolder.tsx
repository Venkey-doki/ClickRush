import GameHistory from "../components/GameHistory"
import Profile from "../components/Profile"
function ProfileLeaderboardHolder() {
    return (
        <div className="col-span-12 flex min-h-0 min-w-0 flex-col md:col-span-3">
            <Profile />
            <GameHistory />
        </div>
    )
}

export default ProfileLeaderboardHolder
