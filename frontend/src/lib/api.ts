import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.API_URL,
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("AccessToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add a response interceptor to handle 401 errors by making a request to the refresh token endpoint and retrying the original request
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    if (error.response && error.response.status === 401) {
      const originalRequest = error.config

      if (error.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true
        const refreshToken = localStorage.getItem("RefreshToken")
        if (refreshToken) {
          try {
            const response = await axios.post(
              `${import.meta.env.API_URL}/auth/refresh`,
              { refreshToken }
            )
            const newAccessToken = response.data.accessToken
            const newRefreshToken = response.data.refreshToken
            localStorage.setItem("RefreshToken", newRefreshToken)
            localStorage.setItem("AccessToken", newAccessToken)
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
            return api(originalRequest)
          } catch (refreshError) {
            console.error("Refresh token request failed:", refreshError)
            // Optionally, you can log the user out or redirect to the login page here
          }
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api
