import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";

import Navbar from "./components/Layout/Navbar";
import Dashboard from "./pages/Dashboard"; 
import AuthPages from "./Auth/LoginForm.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

import { useAuthStore } from "./context/useAuthStore.js";

import { Toaster } from "react-hot-toast";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-base-100 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-3 h-3 bg-base-100 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-3 h-3 bg-base-100 rounded-full animate-bounce" />
        </div>
      </div>
    );
  }

  return (
    <div data-theme="light">
      <Navbar />
      <Routes>
        <Route path="/" element={authUser ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/login" element={!authUser ? <AuthPages /> : <Navigate to="/" />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
      <Toaster />
    </div>
  );
};

export default App;
