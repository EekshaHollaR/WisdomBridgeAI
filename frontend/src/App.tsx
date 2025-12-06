import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardPage from './pages/DashboardPage';
import ExpertHomePage from './pages/Expert/ExpertHomePage';
import ExpertInterviewPage from './pages/Expert/ExpertInterviewPage';
import KnowledgeModulesListPage from './pages/Knowledge/KnowledgeModulesListPage';
import KnowledgeModuleDetailPage from './pages/Knowledge/KnowledgeModuleDetailPage';
import LearningPathsPage from './pages/Knowledge/LearningPathsPage';
import MentorshipHomePage from './pages/Mentorship/MentorshipHomePage';
import MentorshipSessionPage from './pages/Mentorship/MentorshipSessionPage';
import AssessmentListPage from './pages/Assessment/AssessmentListPage';
import AssessmentTakingPage from './pages/Assessment/AssessmentTakingPage';
import AssessmentResultPage from './pages/Assessment/AssessmentResultPage';
import VirtualExpertPage from './pages/Mentorship/VirtualExpertPage';
import AnalyticsDashboardPage from './pages/Analytics/AnalyticsDashboardPage';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/Layout/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />

          <Route path="/dashboard/expert" element={
            <ProtectedRoute>
              <ExpertHomePage />
            </ProtectedRoute>
          } />

          <Route path="/dashboard/expert/interview/:sessionId?" element={
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

          <Route path="/dashboard/mentorship" element={
            <ProtectedRoute>
              <MentorshipHomePage />
            </ProtectedRoute>
          } />

          <Route path="/dashboard/mentorship/session/:id" element={
            <ProtectedRoute>
              <MentorshipSessionPage />
            </ProtectedRoute>
          } />

          {/* Phase 4 Routes */}
          <Route path="/dashboard/assessments" element={
            <ProtectedRoute>
              <AssessmentListPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/assessment/take/:attemptId" element={
            <ProtectedRoute>
              <AssessmentTakingPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/assessment/result/:attemptId" element={
            <ProtectedRoute>
              <AssessmentResultPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/expert/ask" element={
            <ProtectedRoute>
              <VirtualExpertPage />
            </ProtectedRoute>
          } />

          <Route path="/dashboard/analytics" element={
            <ProtectedRoute>
              <AnalyticsDashboardPage />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
