import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, User } from "lucide-react";
import logo from "../assets/logo.png";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        navigate("/dashboard");
      } else {
        alert("Invalid Credentials");
      }
    } catch (err) {
      console.error(err);
      alert("Server Error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070B14] relative overflow-hidden px-4">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-[420px] bg-white/[0.02] backdrop-blur-3xl border border-white/5 p-10 rounded-[2rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] text-white relative z-10"
      >
        <div className="text-center mb-10">
          <motion.img
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
            src={logo}
            alt="Logo"
            className="h-[72px] mx-auto mb-6 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.05)]"
          />
          <h1 className="text-[1.35rem] font-bold tracking-wide text-white mb-2 leading-tight">
            S & S Power Solutions Lanka
          </h1>
          <p className="text-[0.65rem] text-yellow-500 font-bold tracking-[0.25em] uppercase mb-4 opacity-90">
            (Pvt) Ltd
          </p>
          <div className="w-10 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 mx-auto rounded-full mb-5" />
          <p className="text-slate-400 text-sm font-medium">
            Smart Generator Monitoring
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[0.8rem] font-medium text-slate-400 ml-1 uppercase tracking-wider">Username</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
              </div>
              <input
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-900/50 border border-white/5 text-white placeholder-slate-600 focus:border-cyan-500/50 focus:bg-slate-900/80 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all text-sm"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[0.8rem] font-medium text-slate-400 ml-1 uppercase tracking-wider">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
              </div>
              <input
                type="password"
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-900/50 border border-white/5 text-white placeholder-slate-600 focus:border-cyan-500/50 focus:bg-slate-900/80 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all text-sm"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full py-4 mt-6 rounded-2xl font-bold tracking-wide text-white bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 transition-all shadow-[0_0_20px_rgba(8,145,178,0.2)] hover:shadow-[0_0_30px_rgba(8,145,178,0.4)] flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed text-sm"
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : "SECURE LOGIN"}
          </motion.button>
        </form>

        <div className="text-center mt-8 text-[0.65rem] font-medium text-slate-600 tracking-wider">
          © {new Date().getFullYear()} S & S Power Solutions. All rights reserved.
        </div>
      </motion.div>
    </div>
  );
}

export default Login;
