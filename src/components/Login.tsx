import React, { useState } from 'react';
import { Lock, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import loginBg from '../assets/login-bg.mp4';
import './Login.css';


interface LoginProps {
  onLogin: () => void;
}
interface LoginResponse {
  message?: string;
  token?: string;
  success?: boolean;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  console.log("API BASE URL =", API_BASE_URL);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid credentials");
        return;
      }

      if (!data.token) {
        setError("Token not received from server");
        return;
      }

      // ✅ SAVE TOKEN
      localStorage.setItem("token", data.token);

      // ✅ Tell App user logged in
      onLogin();

    } catch (err) {
      console.error("NETWORK ERROR:", err);
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };




  return (
    <div className="min-h-screen login-page-container flex items-center justify-center p-4">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src={loginBg} type="video/mp4" />
        </video>
        {/* Dark Overlay - removed blur here to fix focus issues */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      <div className="login-card rounded-lg shadow-2xl w-full max-w-md p-8 relative z-[9999] pointer-events-auto">
        <div className="text-center mb-8">

          {/* Lock above Logo Stack */}
          <div className="flex flex-col items-center justify-center gap-4 mb-6">

            {/* Lock Circle */}
            <div className="w-16 h-16 icon-circle rounded-full flex items-center justify-center shadow-lg">
              <Lock className="w-7 h-7 text-white" />
            </div>

            {/* Logo Image */}
            <img
              src={logo}
              alt="Raju & Prasad Logo"
              className="h-12 object-contain"
            />

          </div>

          {/* Admin Panel Heading */}
          {/* <h1 className="text-2xl font-bold text-white mb-2">
            Admin Panel
          </h1> */}

          {/* <p className="text-[#888888]">
            Raju & Prasad – Chartered Accountants
          </p> */}

        </div>


        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#022683] mb-2">
              Username
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 login-input outline-none transition-all duration-300"
                placeholder="admin@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#022683] mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 login-input outline-none transition-all duration-300"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-[#022683] hover:text-[#022683] transition-colors duration-300 forgot-password-link">
              Forgot Password?
            </Link>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="relative overflow-hidden w-full 
  login-button
  text-white py-3 rounded-lg font-medium
  transition-all duration-300
  disabled:opacity-60 disabled:cursor-not-allowed
  group"
          >
            {/* Shine Layer */}
            <span className="shine-layer">
            </span>

            {/* Text */}
            <span className="relative z-10">
              {loading ? "Logging in..." : "Secure Login"}
            </span>
          </button>

        </form>

        <div className="mt-6 text-center text-xs text-[#022683]">
          © 2026 Raju & Prasad – Chartered Accountants
        </div>
      </div>
    </div>
  );
}
