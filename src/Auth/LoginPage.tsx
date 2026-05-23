import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../Context/UserContext";
import { Mail, Lock, Shield, ArrowRight } from "lucide-react";

export const LoginPage: React.FC = () => {
  const { login } = useUser();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        navigate("/EmployeeManagement", { replace: true });
      } else {
        setError("Invalid email or password.");
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials or backend service is offline.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 font-sans p-6">
      {/* Sleek, comfortable and beautifully proportioned Login Card */}
      <div className="w-full max-w-[340px] bg-white rounded-2xl p-6 border border-slate-200 shadow-xl flex flex-col items-center">

        {/* Portal Branding / Logo */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7.5 h-7.5 rounded-lg flex items-center justify-center text-white font-black bg-indigo-600 shadow-md shadow-indigo-100">
            <Shield size={14} />
          </div>
          <div>
            <span className="text-sm font-black text-slate-900 tracking-tight leading-none block">Tibos</span>
            <p className="text-[10px] font-extrabold tracking-wider text-indigo-600 uppercase mt-0.5">Employee Hub</p>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-5">
          <div className="text-lg font-black text-slate-800 leading-tight">Welcome Back!</div>
          <p className="text-xs font-semibold text-slate-500 mt-1.5 leading-normal">Sign in to manage attendance, tasks, leaves, and your corporate profile.</p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">

          {/* Error Alert Box */}
          {error && (
            <div className="bg-red-50 text-red-600 border border-red-150 rounded-xl p-2.5 text-xs font-bold text-center leading-normal">
              {error}
            </div>
          )}

          {/* Email input field */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Corporate Email</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                <Mail size={12} />
              </span>
              <input
                type="email"
                placeholder="ravi.mohan@tibos.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-350 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs font-semibold text-slate-800 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Password input field */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Security Password</label>
              <button
                type="button"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                onClick={() => alert("Mock credentials for login:\nEmail: ravi.mohan@tibos.com\nPassword: password123")}
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                <Lock size={12} />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-350 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs font-semibold text-slate-800 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="remember" className="text-xs font-bold text-slate-650 cursor-pointer select-none">
              Keep me signed in
            </label>
          </div>

          {/* Action button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg font-black text-xs tracking-wider uppercase text-white shadow-md bg-indigo-600 hover:bg-indigo-700 transition-all active:scale-98 flex items-center justify-center gap-2 mt-1 cursor-pointer"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-0.5 mr-1.5 h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </>
            ) : (
              <>
                Let's Get Started
                <ArrowRight size={12} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
