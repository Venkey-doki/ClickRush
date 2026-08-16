import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoutes from './components/ProtectedRoutes';
import { HomePage, LoginPage, SignUpPage,LandingPage } from './pages';


export function App() {
  return (
    <Router>
      <Routes>
        <Route element={<ProtectedRoutes />}>
            <Route path="/Dashboard" element={<HomePage />} />
        </Route>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Routes>
    </Router>
  )
}

export default App