import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import NewPatient from './pages/NewPatient';
import PatientProfile from './pages/PatientProfile';
import NewConsultation from './pages/NewConsultation';
import NewMealPlan from './pages/NewMealPlan';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public/Inverse Routes (Login & Signup) */}
            <Route 
              path="/login" 
              element={
                <ProtectedRoute inverse>
                  <Login />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/signup" 
              element={
                <ProtectedRoute inverse>
                  <Signup />
                </ProtectedRoute>
              } 
            />

            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/pacientes" 
              element={
                <ProtectedRoute>
                  <Patients />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/pacientes/novo" 
              element={
                <ProtectedRoute>
                  <NewPatient />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/pacientes/:id" 
              element={
                <ProtectedRoute>
                  <PatientProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/pacientes/:id/consulta/nova" 
              element={
                <ProtectedRoute>
                  <NewConsultation />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/pacientes/:id/plano/novo" 
              element={
                <ProtectedRoute>
                  <NewMealPlan />
                </ProtectedRoute>
              } 
            />

            {/* Fallback */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
