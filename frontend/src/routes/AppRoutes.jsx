import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import LoginPage from '../pages/LoginPage.jsx'
import SignUpPage from '../pages/SignUpPage.jsx'
import Home from '../pages/Home.jsx'
import CreatorPage from '../pages/CreatorPage.jsx'
import ReelsByCreator from '../pages/ReelsByCreator.jsx'
import UploadReel from '../pages/UploadReel.jsx'
import SavedReels from '../pages/SavedReels.jsx'
import ProfilePage from '../pages/ProfilePage.jsx'
import SearchPage from '../pages/SearchPage.jsx'
import ForgotPasswordPage from '../pages/ForgotPasswordPage.jsx'
import ResetPasswordPage from '../pages/ResetPasswordPage.jsx'
import ProtectedRoute from '../components/ProtectedRoute.jsx'
import PublicRoute from '../components/PublicRoute.jsx'
import MainLayout from '../components/MainLayout.jsx' // Added MainLayout import

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes - Redirect to home if already logged in */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignUpPage /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
        <Route path="/reset-password/:token" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />

        {/* Public Browsing Routes - Wrapped in MainLayout */}
        <Route path="/" element={<MainLayout><Home /></MainLayout>} />
        <Route path="/creator/:username" element={<MainLayout><CreatorPage /></MainLayout>} />
        <Route path="/reels/creator/:username" element={<MainLayout><ReelsByCreator /></MainLayout>} />
        <Route path="/search" element={<MainLayout><SearchPage /></MainLayout>} />

        {/* Protected Routes - Require Authentication (MainLayout included in ProtectedRoute) */}
        <Route path="/upload" element={<ProtectedRoute><UploadReel /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/saved" element={<ProtectedRoute><SavedReels /></ProtectedRoute>} />
      </Routes>
    </Router>
  )
}

export default AppRoutes