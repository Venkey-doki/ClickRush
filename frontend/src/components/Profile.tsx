import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import api from "../lib/api"
import type { UserRank } from "../types/user"

interface UserScore {
    id: string
    mode: string
    clickCount: number
    cps: number
    durationMs: number
    createdAt: string
}

function Profile() {
    const { user } = useAuth()
    const [classicUserRank, setClassicUserRank] = useState<UserRank | null>(
        null
    )
    const [sprintUserRank, setSprintUserRank] = useState<UserRank | null>(null)
    const [marathonUserRank, setMarathonUserRank] = useState<UserRank | null>(
        null
    )
    const [userHistory, setUserHistory] = useState<UserScore[]>([])

    useEffect(() => {
        console.log("componenet mounted")

        // setInterval(() => { 
        //     console.log("setTimeout Called after 30s")
        //     api.get("/users/me/stats", {
        //         params: { mode: "CLASSIC_60S" },
        //     }).then((response) => { 
        //         console.log("response after 30s", response.data.data)
        //     })
        // },30000)
        if (user) {
            api.get("/users/me/stats", {
                params: { mode: "CLASSIC_60S" },
            })
                .then((response) => {
                    setClassicUserRank(response.data.data)
                })
                .catch((error) => {
                    console.error("Error fetching user rank:", error)
                })

            api.get("/users/me/stats", {
                params: { mode: "SPRINT_10S" },
            })
                .then((response) => {
                    setSprintUserRank(response.data.data)
                })
                .catch((error) => {
                    console.error("Error fetching user rank:", error)
                })

            api.get("/users/me/stats", {
                params: { mode: "MARATHON_120S" },
            })
                .then((response) => {
                    setMarathonUserRank(response.data.data)
                })
                .catch((error) => {
                    console.error("Error fetching user rank:", error)
                })

            api.get("/users/me/games")
                .then((response) => {
                    setUserHistory(response.data.data.history)
                })
                .catch((error) => {
                    console.error("Error fetching user history:", error)
                })
        }
    }, [])

    const handleLogout = () => {
        const refreshToken = localStorage.getItem("RefreshToken")
        if (refreshToken) {
            api.post("/auth/logout", { refreshToken })
                .then(() => {
                    localStorage.removeItem("user")
                    localStorage.removeItem("AccessToken")
                    localStorage.removeItem("RefreshToken")
                    window.location.reload()
                })
                .catch((error) => {
                    console.error("Logout failed:", error)
                })
        }
    }

    return (
        <div>
            <h2 className="mb-4 text-2xl font-bold">Profile</h2>
            <button onClick={handleLogout}>logout</button>
            {user && (
                <div className="mb-4">
                    <p>
                        <strong>Username:</strong> {user.username}
                    </p>
                    <p>
                        <strong>Email:</strong> {user.email}
                    </p>
                </div>
            )}

            {classicUserRank && (
                <div className="mb-4">
                    <h3 className="mb-2 text-xl font-semibold">Rank</h3>
                    <p>
                        <strong>Mode:</strong> {classicUserRank.mode}
                    </p>
                    <p>
                        <strong>Today's Rank:</strong>{" "}
                        {classicUserRank.todayRank}
                    </p>
                    <p>
                        <strong>Weekly Rank:</strong>{" "}
                        {classicUserRank.weeklyRank}
                    </p>
                    <p>
                        <strong>Global Rank:</strong>{" "}
                        {classicUserRank.globalRank}
                    </p>
                </div>
            )}

            {sprintUserRank && (
                <div className="mb-4">
                    <h3 className="mb-2 text-xl font-semibold">Rank</h3>
                    <p>
                        <strong>Mode:</strong> {sprintUserRank.mode}
                    </p>
                    <p>
                        <strong>Today's Rank:</strong>{" "}
                        {sprintUserRank.todayRank}
                    </p>
                    <p>
                        <strong>Weekly Rank:</strong>{" "}
                        {sprintUserRank.weeklyRank}
                    </p>
                    <p>
                        <strong>Global Rank:</strong>{" "}
                        {sprintUserRank.globalRank}
                    </p>
                </div>
            )}

            {marathonUserRank && (
                <div className="mb-4">
                    <h3 className="mb-2 text-xl font-semibold">Rank</h3>
                    <p>
                        <strong>Mode:</strong> {marathonUserRank.mode}
                    </p>
                    <p>
                        <strong>Today's Rank:</strong>{" "}
                        {marathonUserRank.todayRank}
                    </p>
                    <p>
                        <strong>Weekly Rank:</strong>{" "}
                        {marathonUserRank.weeklyRank}
                    </p>
                    <p>
                        <strong>Global Rank:</strong>{" "}
                        {marathonUserRank.globalRank}
                    </p>
                </div>
            )}

            {userHistory.length > 0 && (
                <div>
                    <h3 className="mb-2 text-xl font-semibold">History</h3>
                    <ul>
                        {userHistory.map((score) => (
                            <li key={score.id}>
                                <p>
                                    <strong>Mode:</strong> {score.mode}
                                </p>
                                <p>
                                    <strong>Click Count:</strong>{" "}
                                    {score.clickCount}
                                </p>
                                <p>
                                    <strong>CPS:</strong> {score.cps}
                                </p>
                                <p>
                                    <strong>Duration:</strong>{" "}
                                    {Math.floor(score.durationMs / 1000)}{" "}
                                    seconds
                                </p>
                                <p>
                                    <strong>Date:</strong>{" "}
                                    {new Date(score.createdAt).toLocaleString()}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}

export default Profile
