import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Header from "./Header"
import Footer from "./Footer"

const Layout = () => {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

export default Layout
