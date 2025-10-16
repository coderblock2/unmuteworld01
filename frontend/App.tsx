

import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import ProfilePage from '@/pages/ProfilePage';
import PublicProfilePage from '@/pages/PublicProfilePage';
import AboutPage from '@/pages/AboutPage';
import CreatePostPage from '@/pages/CreatePostPage';
import CategoryPage from '@/pages/CategoryPage';
import PostDetailPage from '@/pages/PostDetailPage';
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import EditPostPage from '@/pages/EditPostPage';
import SearchPage from '@/pages/SearchPage';
import NotFoundPage from '@/pages/NotFoundPage';
import ProtectedRoute from '@/components/ProtectedRoute';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <HashRouter>
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

              {/* Protected Routes */}
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/profile/:userId" element={<ProtectedRoute><PublicProfilePage /></ProtectedRoute>} />
              <Route path="/create-post" element={<ProtectedRoute><CreatePostPage /></ProtectedRoute>} />
              <Route path="/category/:categoryName" element={<ProtectedRoute><CategoryPage /></ProtectedRoute>} />
              <Route path="/post/:postId" element={<ProtectedRoute><PostDetailPage /></ProtectedRoute>} />
              <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />

              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminDashboardPage /></ProtectedRoute>} />
              <Route path="/admin/edit-post/:postId" element={<ProtectedRoute adminOnly={true}><EditPostPage /></ProtectedRoute>} />
              
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Layout>
        </HashRouter>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;