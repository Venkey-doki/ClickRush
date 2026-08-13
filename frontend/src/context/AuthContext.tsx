import { useContext, createContext, useState, type ReactNode } from "react";
import api from "../lib/api";
import type { AuthedUser } from "../types/user";
interface AuthContextType {
    user: AuthedUser | null
    login: (emailOrUsername: string, password: string) => Promise<void>
    signup: (username: string, email: string, password: string) => Promise<void>
    logout: (refreshToken: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => { 

    const [user, setUser] = useState<AuthedUser | null>(() => { 
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
    });

    function persist(user: AuthedUser, accessToken: string, refreshToken: string) {
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("AccessToken", accessToken);
        localStorage.setItem("RefreshToken", refreshToken);
        setUser(user);
    }

    async function login(emailOrUsername: string, password: string) {
        try {
            const response = await api.post("/auth/login", {
                emailOrUsername,
                password,
            })
            const { user, accessToken, refreshToken } = response.data.data
            persist(user, accessToken, refreshToken)
        } catch (error) {
            console.error("Login failed:", error)
            throw error
        }
    }

    async function signup(username: string, email: string, password: string) {
        try {
            const response = await api.post("/auth/signup", { username, email, password });
            const { user, accessToken, refreshToken } = response.data.data;
            persist(user, accessToken, refreshToken);
        } catch (error) {
            console.error("Signup failed:", error);
            throw error;
        }
    }

    function logout(refreshToken: string) {
        localStorage.removeItem("user");
        localStorage.removeItem("AccessToken");
        localStorage.removeItem("RefreshToken");
        setUser(null);
        api.post("/auth/logout", { refreshToken }).catch((error) => {
            console.error("Logout failed:", error);
        });
    }

    return (
        <AuthContext.Provider value={{ user, login, signup, logout }}>
            { children }
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}