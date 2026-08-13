interface UserRank {
    mode: string
    todayRank: number
    weeklyRank: number
    globalRank: number
}

interface AuthedUser {
    id: string
    username: string
    email: string
}

export type { UserRank, AuthedUser }