import axios from "axios"

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
})

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("AccessToken")

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    },
    (error) => Promise.reject(error)
)

api.interceptors.response.use(
    (response) => response,

    async (error) => {
        console.log("interceptor called")
        const originalRequest = error.config

        if (!error.response) {
            return Promise.reject(error)
        }

        // Only handle 401 responses
        if (error.response.status !== 401) {
            console.log("not 401 error", error.response.status)
            return Promise.reject(error)
        }

        // Don't refresh on auth endpoints
        if (
            originalRequest.url?.includes("/auth/login") ||
            originalRequest.url?.includes("/auth/refresh")
        ) {
            return Promise.reject(error)
        }

        // Prevent infinite retry loop
        if (originalRequest._retry) {
            return Promise.reject(error)
        }

        originalRequest._retry = true

        const refreshToken = localStorage.getItem("RefreshToken")

        if (!refreshToken) {
            return Promise.reject(error)
        }

        try {
            const response = await api.post("/auth/refresh", {
                refreshToken,
            })

            const {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            } = response.data.data
            console.log("New tokens received:", newAccessToken, newRefreshToken)
            localStorage.setItem("AccessToken", newAccessToken)
            localStorage.setItem("RefreshToken", newRefreshToken)

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

            return api(originalRequest)
        } catch (refreshError) {
            console.error("Token refresh failed:", refreshError)
            localStorage.removeItem("user")
            localStorage.removeItem("AccessToken")
            localStorage.removeItem("RefreshToken")

            return Promise.reject(refreshError)
        }
    }
)

export default api
