import React from 'react'
import {BrowserRouter as Router ,Route,Routes} from 'react-router-dom'
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

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes - Redirect to home if already logged in */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignUpPage /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
        <Route path="/reset-password/:token" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
        
        {/* Public Browsing Routes - Anyone can view */}
        <Route path="/" element={<Home />} />
        <Route path="/creator/:username" element={<CreatorPage />} />
        <Route path="/reels/creator/:username" element={<ReelsByCreator />} />
        <Route path="/search" element={<SearchPage />} />
        
        {/* Protected Routes - Require Authentication */}
        <Route path="/upload" element={<ProtectedRoute><UploadReel /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/saved" element={<ProtectedRoute><SavedReels /></ProtectedRoute>} />
      </Routes>
    </Router>
  )
}

export default AppRoutes