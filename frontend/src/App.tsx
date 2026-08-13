import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout';
import ProtectedRoutes from './components/ProtectedRoutes';
import { HomePage, LeaderBoardPage, ProfilePage, LoginPage, SignUpPage } from './pages';


export function App() {
  return (
    <Router>
      <Routes>
        <Route element={<ProtectedRoutes />}>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/LeaderBoard" element={<LeaderBoardPage />} />
            <Route path="/Profile" element={<ProfilePage />} />
          </Route>
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Routes>
    </Router>
  )
}

export default App