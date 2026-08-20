import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PublicShell from '../components/layout/PublicShell';
import AppShell from '../components/layout/AppShell';
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import HomePage from './public/index';
import DashboardPage from './private/index';
import RequireAuth from './guards/RequireAuth';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <PublicShell>
              <HomePage />
            </PublicShell>
          }
        />

        <Route
          path="/login"
          element={
            <PublicShell>
              <LoginPage />
            </PublicShell>
          }
        />

        <Route
          path="/register"
          element={
            <PublicShell>
              <RegisterPage />
            </PublicShell>
          }
        />

        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardPage />
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
