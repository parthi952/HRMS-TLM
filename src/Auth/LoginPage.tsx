import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../Context/UserContext";
import { 
  Mail, 
  Lock, 
  Shield, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Terminal,
  Volume2,
  VolumeX
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "../ThemeToggle";
import { ConfettiRain } from "./LoginPage/ConfettiRain";
import { InteractiveRobot } from "./LoginPage/InteractiveRobot";

export const LoginPage: React.FC = () => {
  const { login } = useUser();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  
  // Custom states for robot expression controls
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Field helpers
  const [showPassword, setShowPassword] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showDemoPanel, setShowDemoPanel] = useState(false);

  // sound toggle state (with elegant mock notification)
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Simulated keyboard character typist sequence
  const simulateTyping = async (targetEmail: string, targetPass: string) => {
    if (isTyping || loading) return;
    setIsTyping(true);
    setError("");
    setIsError(false);
    
    // Set focus on email field while typing
    setIsEmailFocused(true);
    setEmail("");
    setPassword("");
    await new Promise((resolve) => setTimeout(resolve, 350));

    // Type Email character by character
    for (let i = 1; i <= targetEmail.length; i++) {
      setEmail(targetEmail.slice(0, i));
      if (soundEnabled && i % 3 === 0) {
        // play soft typing tick simulation if required
      }
      await new Promise((resolve) => setTimeout(resolve, 20));
    }

    // Switch focus to password field
    setIsEmailFocused(false);
    setIsPasswordFocused(true);
    await new Promise((resolve) => setTimeout(resolve, 450));

    // Type Password character by character
    for (let i = 1; i <= targetPass.length; i++) {
      setPassword(targetPass.slice(0, i));
      await new Promise((resolve) => setTimeout(resolve, 30));
    }

    await new Promise((resolve) => setTimeout(resolve, 350));
    setIsPasswordFocused(false);
    setIsTyping(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isTyping || loading) return;
    setError("");
    setIsError(false);

    if (!email.trim() || !password.trim()) {
      setError("Please complete all corporate credentials.");
      setIsError(true);
      return;
    }

    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        setIsSuccess(true);
        // let the happy celebrate animation play for 1.2s before redirecting
        setTimeout(() => {
          navigate("/EmployeeManagement", { replace: true });
        }, 1300);
      } else {
        setError("Access denied. Invalid credentials.");
        setIsError(true);
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials or service offline.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  // Stagger entrance transitions
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring" as const, stiffness: 100, damping: 16 }
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-950 font-sans p-4 sm:p-6 overflow-hidden">
      
      {/* 1. Immersive Full-Screen Neon backing glows */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-violet-900/15 blur-[120px] animate-pulse" style={{ animationDuration: "8s" }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-fuchsia-900/15 blur-[120px] animate-pulse" style={{ animationDuration: "12s" }} />
        {/* Retro Grid Lines Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_36px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_80%,transparent_100%)]" />
      </div>

      {/* Confetti Celebration overlay */}
      {isSuccess && <ConfettiRain />}

      {/* Controls: Float Switchers (Theme toggle + Mock Sound Switcher) */}
      <div className="absolute top-4 right-4 z-40 flex items-center gap-3">
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="flex items-center justify-center w-9 h-9 bg-slate-900/80 hover:bg-slate-800/80 text-slate-400 border border-slate-800 rounded-xl transition-all active:scale-90"
          title={soundEnabled ? "Mute Mock Sounds" : "Unmute Mock Sounds"}
        >
          {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
        </button>
        <ThemeToggle />
      </div>

      {/* Main split viewport layout */}
      <div className="relative w-full max-w-[900px] grid grid-cols-1 md:grid-cols-2 gap-8 items-center z-10 py-6">
        
        {/* LEFT PANE: Animated 3D-styled interactive Robot */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 60, damping: 15 }}
          className="flex flex-col items-center justify-center text-center p-4"
        >
          <InteractiveRobot 
            isEmailFocused={isEmailFocused}
            isPasswordFocused={isPasswordFocused}
            isError={isError}
            isSuccess={isSuccess}
          />
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-2 space-y-1.5 hidden md:block"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest">
              <Sparkles size={11} className="animate-spin" style={{ animationDuration: "4s" }} />
              Emotionally Reactive AI
            </span>
            <p className="text-xs font-bold text-slate-400 max-w-[280px]">
              Watch me look around as you move your mouse, or cover my eyes when you type passwords!
            </p>
          </motion.div>
        </motion.div>

        {/* RIGHT PANE: Stylish Dark Glassmorphic Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 50, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 65, damping: 16 }}
          className="relative w-full max-w-[390px] mx-auto bg-slate-900/60 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-slate-800/80 shadow-[0_25px_60px_rgba(0,0,0,0.55)] flex flex-col items-center overflow-hidden"
        >
          {/* Dynamic inner neon light ring */}
          <motion.div 
            animate={{
              boxShadow: isSuccess 
                ? "inset 0 0 20px rgba(16,185,129,0.3)" 
                : isError 
                  ? "inset 0 0 20px rgba(239,68,68,0.3)"
                  : "inset 0 0 20px rgba(99,102,241,0.05)"
            }}
            className="absolute inset-0 rounded-3xl border border-white/5 pointer-events-none z-0 transition-shadow duration-300"
          />

          {/* Portal Branding / Logo */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, type: "spring" }}
            className="flex items-center gap-2.5 mb-5 cursor-pointer z-10"
          >
            <motion.div 
              whileHover={{ rotate: 360, scale: 1.05 }}
              transition={{ duration: 0.7, type: "spring" }}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/20"
            >
              <Shield size={16} />
            </motion.div>
            <div>
              <span className="text-base font-black text-white tracking-tight leading-none block">
                Tibos
              </span>
              <p className="text-[10px] font-black tracking-widest text-indigo-400 uppercase mt-0.5">
                Employee Hub
              </p>
            </div>
          </motion.div>

          {/* Heading */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="text-center mb-6 z-10"
          >
            <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
              Welcome Back!
            </h2>
            <p className="text-xs font-bold text-slate-400 mt-1.5 leading-relaxed max-w-[260px] mx-auto">
              Sign in to attendance, leaves, tasks, and corporate profile management.
            </p>
          </motion.div>

          {/* Form Body */}
          <motion.form 
            onSubmit={handleSubmit}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full space-y-4 z-10"
          >
            {/* Error Alert Box */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                  className="bg-red-950/20 text-red-400 border border-red-900/30 rounded-xl p-3 text-xs font-bold text-center leading-normal shadow-sm"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email input field */}
            <motion.div variants={itemVariants} className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Corporate Email
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                  <Mail size={13} />
                </span>
                <input
                  type="email"
                  placeholder="ravi.mohan@tibos.com"
                  value={email}
                  disabled={isTyping || loading}
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/40 text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all placeholder:text-slate-600 disabled:opacity-75"
                />
              </div>
            </motion.div>

            {/* Password input field */}
            <motion.div variants={itemVariants} className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Security Password
                </label>
                <button
                  type="button"
                  className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer uppercase tracking-wider"
                  onClick={() => setShowDemoPanel(p => !p)}
                >
                  Demo Help?
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                  <Lock size={13} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  disabled={isTyping || loading}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-800 bg-slate-950/40 text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all placeholder:text-slate-600 disabled:opacity-75"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350 transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </motion.div>

            {/* Remember me */}
            <motion.div variants={itemVariants} className="flex items-center gap-2 py-0.5">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                disabled={isTyping || loading}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-indigo-500 focus:ring-indigo-500/20 cursor-pointer disabled:opacity-75"
              />
              <label htmlFor="remember" className="text-xs font-bold text-slate-400 cursor-pointer select-none disabled:opacity-75">
                Keep me signed in
              </label>
            </motion.div>

            {/* Action button */}
            <motion.div variants={itemVariants}>
              <motion.button
                type="submit"
                disabled={loading || isTyping}
                whileHover={{ scale: 1.018 }}
                whileTap={{ scale: 0.982 }}
                className="w-full py-3 rounded-xl font-black text-xs tracking-wider uppercase text-white shadow-md bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-650 hover:to-purple-650 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-0.5 mr-1.5 h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying Credentials...
                  </>
                ) : isTyping ? (
                  <>
                    <Sparkles size={13} className="animate-bounce text-indigo-300" />
                    Autofilling...
                  </>
                ) : (
                  <>
                    Let's Get Started
                    <ArrowRight size={13} />
                  </>
                )}
              </motion.button>
            </motion.div>
          </motion.form>

          {/* Animated Quick-Fill Credentials Console */}
          <AnimatePresence>
            {showDemoPanel && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ type: "spring", stiffness: 120, damping: 18 }}
                className="w-full overflow-hidden z-10"
              >
                <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-900/30 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Terminal size={11} />
                      Sandbox Console
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-indigo-900/50 text-indigo-300 text-[8px] font-black uppercase tracking-wider">
                      Auto-Pilot
                    </span>
                  </div>
                  
                  <p className="text-[10px] font-bold text-slate-400 leading-relaxed">
                    Click below to trigger a fully animated keyboard sequence inputting demo credentials.
                  </p>

                  <div className="grid grid-cols-1 gap-2 pt-0.5">
                    <motion.button
                      type="button"
                      disabled={isTyping || loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => simulateTyping("ravi.mohan@tibos.com", "password123")}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[10px] text-slate-350 font-black hover:border-indigo-500 cursor-pointer disabled:opacity-50 transition-colors shadow-sm"
                    >
                      <div className="flex flex-col items-start text-left">
                        <span className="text-[8px] font-black uppercase tracking-wider text-slate-500 mb-0.5">Corporate Account</span>
                        <span className="font-semibold text-slate-200">ravi.mohan@tibos.com</span>
                      </div>
                      <span className="text-[9px] text-indigo-400 font-black uppercase flex items-center gap-1">
                        Autofill
                        <Sparkles size={9} />
                      </span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};
