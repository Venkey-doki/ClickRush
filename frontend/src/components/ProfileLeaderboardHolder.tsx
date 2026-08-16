import GameHistory from "../components/GameHistory"
import Profile from "../components/Profile"
function ProfileLeaderboardHolder() {
    return (
        <div className="order-3 flex min-w-0 flex-col md:order-0 md:col-span-3 md:min-h-0">
            <Profile />
            <GameHistory />
        </div>
    )
}

export default ProfileLeaderboardHolder
