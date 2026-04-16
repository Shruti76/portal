import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import IDEEditor from './components/IDEEditor';
import CodeEditor from './components/CodeEditor';
import PackageUpload from './components/PackageUpload';
import PackageDownload from './components/PackageDownload';
import TestExecution from './components/TestExecution';
import WorkflowLogs from './components/WorkflowLogs';
import RoleManagement from './components/RoleManagement';
import Settings from './components/Settings';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/editor" element={<ProtectedRoute><IDEEditor /></ProtectedRoute>} />
      <Route path="/editor-classic" element={<ProtectedRoute><CodeEditor /></ProtectedRoute>} />
      <Route path="/workflows" element={<ProtectedRoute><WorkflowLogs /></ProtectedRoute>} />
      <Route path="/upload" element={<ProtectedRoute><PackageUpload /></ProtectedRoute>} />
      <Route path="/download" element={<ProtectedRoute><PackageDownload /></ProtectedRoute>} />
      <Route path="/tests" element={<ProtectedRoute><TestExecution /></ProtectedRoute>} />
      <Route path="/rbac" element={<ProtectedRoute><RoleManagement /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
