
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/DashboardPage';
import ExpertHomePage from './pages/Expert/ExpertHomePage';
import ExpertInterviewPage from './pages/Expert/ExpertInterviewPage';
import KnowledgeModulesListPage from './pages/Knowledge/KnowledgeModulesListPage';
import KnowledgeModuleDetailPage from './pages/Knowledge/KnowledgeModuleDetailPage';
import LearningPathsPage from './pages/Knowledge/LearningPathsPage';
import MentorshipChatPage from './pages/Mentorship/MentorshipChatPage';
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

          <Route path="/dashboard/knowledge/modules" element={
            <ProtectedRoute>
              <KnowledgeModulesListPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/knowledge/modules/:id" element={
            <ProtectedRoute>
              <KnowledgeModuleDetailPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/learning-paths" element={
            <ProtectedRoute>
              <LearningPathsPage />
            </ProtectedRoute>
          } />

          <Route path="/dashboard/mentorship/session/:id" element={
            <ProtectedRoute>
              <MentorshipChatPage />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
