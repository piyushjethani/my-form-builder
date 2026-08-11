import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppLayout from './components/AppLayout.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import FormBuilder from './pages/FormBuilder.jsx';
import PublicForm from './pages/PublicForm.jsx';
import ResponsesDashboard from './pages/ResponsesDashboard.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/admin/forms" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/f/:slug" element={<PublicForm />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute role="admin">
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/forms" replace />} />
              <Route path="forms" element={<Dashboard />} />
              <Route path="forms/new" element={<FormBuilder />} />
              <Route path="forms/:id/edit" element={<FormBuilder />} />
              <Route path="forms/:id/responses" element={<ResponsesDashboard />} />
            </Route>
          </Routes>
          <Toaster position="top-right" />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
