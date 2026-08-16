import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios"
import type { ApiErrorPayload } from "../types/apiError"

type RetryableRequestConfig = InternalAxiosRequestConfig & {
    _retry?: boolean
}

export const getApiErrorMessage = (error: unknown): string => {
    if (typeof error !== "object" || error === null) {
        return "Something went wrong. Please try again."
    }

    const maybeError = error as {
        response?: {
            status?: number
            data?: Partial<ApiErrorPayload> & {
                message?: string
                error?: {
                    details?: Array<{ field?: string; message?: string }>
                    code?: string
                }
            }
        }
        message?: string
    }

    const status = maybeError.response?.status
    const serverMessage = maybeError.response?.data?.message
    const details = maybeError.response?.data?.error?.details ?? []
    const fieldSpecificMessage = details.find(
        (detail) => typeof detail?.message === "string" && detail.message.trim()
    )

    if (status && status >= 400 && status < 500) {
        if (fieldSpecificMessage?.message) {
            const fieldName = fieldSpecificMessage.field
            const message = fieldSpecificMessage.message

            if (fieldName) {
                const normalizedField = fieldName
                    .split(".")
                    .at(-1)
                    ?.replace(/_/g, " ")
                    ?.replace(/\b\w/g, (char) => char.toUpperCase())

                if (normalizedField && message.toLowerCase().includes("only")) {
                    return `${normalizedField} should contain only letters, numbers, and underscores. No spaces or special symbols.`
                }

                return `${normalizedField ?? "Field"} ${message.toLowerCase()}`
            }

            return message
        }

        if (serverMessage && serverMessage !== "Internal Server Error")
            return serverMessage

        if (status === 401)
            return "Your session has expired. Please log in again."
        if (status === 403) return "You do not have permission to do that."
        if (status === 404) return "We couldn't find that resource."
        if (status === 409)
            return "This action can't be completed right now. Please try again."
        if (status === 422)
            return "Please check the information you entered and try again."

        return "Please check your input and try again."
    }

    if (status && status >= 500) {
        return "Something went wrong. Please try again."
    }

    if (typeof maybeError.message === "string" && maybeError.message.trim()) {
        return maybeError.message
    }

    return "Something went wrong. Please try again."
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
