import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios"

type RetryableRequestConfig = InternalAxiosRequestConfig & {
    _retry?: boolean
}

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
})

/**
 * Holds the currently running refresh operation.
 *
 * If multiple requests receive 401 at the same time,
 * they all wait for this same Promise instead of
 * sending multiple refresh requests.
 */
let refreshPromise: Promise<string> | null = null

const clearAuth = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("AccessToken")
    localStorage.removeItem("RefreshToken")
}

const refreshAccessToken = async (): Promise<string> => {
    const refreshToken = localStorage.getItem("RefreshToken")

    if (!refreshToken) {
        throw new Error("No refresh token available")
    }

    /*
     * IMPORTANT:
     *
     * We use `api` here, but the response interceptor
     * explicitly ignores /auth/refresh, so this won't
     * cause a refresh loop.
     */
    const response = await api.post("/auth/refresh", {
        refreshToken,
    })

    const { accessToken, refreshToken: newRefreshToken } = response.data.data

    if (!accessToken || !newRefreshToken) {
        throw new Error("Invalid refresh response from server")
    }

    localStorage.setItem("AccessToken", accessToken)

    localStorage.setItem("RefreshToken", newRefreshToken)

    return accessToken
}

/**
 * REQUEST INTERCEPTOR
 *
 * Attach the current access token to every request.
 */
api.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem("AccessToken")

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`
        }

        return config
    },
    (error) => Promise.reject(error)
)

/**
 * RESPONSE INTERCEPTOR
 */
api.interceptors.response.use(
    (response) => response,

    async (error: AxiosError) => {
        const originalRequest = error.config as
            RetryableRequestConfig | undefined

        /*
         * Network error / no response from server.
         */
        if (!error.response || !originalRequest) {
            return Promise.reject(error)
        }

        /*
         * Only handle 401.
         */
        if (error.response.status !== 401) {
            return Promise.reject(error)
        }

        /*
         * Never attempt refresh for authentication endpoints.
         */
        const url = originalRequest.url ?? ""

        if (
            url.includes("/auth/login") ||
            url.includes("/auth/refresh") ||
            url.includes("/auth/signup")
        ) {
            return Promise.reject(error)
        }

        /*
         * Prevent infinite retry loops.
         */
        if (originalRequest._retry) {
            return Promise.reject(error)
        }

        originalRequest._retry = true

        try {
            /*
             * SINGLE-FLIGHT REFRESH
             *
             * If another request is already refreshing,
             * wait for it.
             *
             * Otherwise start a new refresh.
             */
            console.log("AccessToken expired. Refreshing access token...")
            if (!refreshPromise) {
                refreshPromise = refreshAccessToken().finally(() => {
                    refreshPromise = null
                })
            }

            const newAccessToken = await refreshPromise

            /*
             * Retry the original request using
             * the newly generated access token.
             */
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

            return api(originalRequest)
        } catch (refreshError) {
            /*
             * Refresh token is invalid/expired/revoked.
             *
             * User must authenticate again.
             */
            clearAuth()

            return Promise.reject(refreshError)
        }
    }
)

export default api
