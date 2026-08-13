import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoutes from './components/ProtectedRoutes';
import { HomePage, LoginPage, SignUpPage } from './pages';


export function App() {
  return (
    <Router>
      <Routes>
        <Route element={<ProtectedRoutes />}>
            <Route path="/" element={<HomePage />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Routes>
    </Router>
  )
}

export default App