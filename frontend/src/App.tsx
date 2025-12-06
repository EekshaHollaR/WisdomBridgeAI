
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/DashboardPage';
import ExpertHomePage from './pages/Expert/ExpertHomePage';
import ExpertInterviewPage from './pages/Expert/ExpertInterviewPage';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/Layout/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/expert" element={
            <ProtectedRoute>
              <ExpertHomePage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/expert/session/:id" element={
            <ProtectedRoute>
              <ExpertInterviewPage />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
