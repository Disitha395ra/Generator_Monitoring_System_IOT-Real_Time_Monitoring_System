import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

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
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center 
    bg-gradient-to-br from-[#0f172a] via-[#0a1f44] to-[#1e3a8a] px-4"
    >
      <div
        className="w-full max-w-md bg-white/5 backdrop-blur-xl 
      border border-white/10 p-10 rounded-3xl shadow-2xl text-white"
      >
        {/* COMPANY BRAND HEADER */}
        <div className="text-center mb-8">
          <img
            src={logo}
            alt="S & S Power Solutions Lanka Logo"
            className="h-20 mx-auto mb-4 object-contain"
          />

          <h1 className="text-xl font-bold tracking-wide text-white">
            S & S Power Solutions Lanka
          </h1>

          <p className="text-sm text-yellow-400 font-semibold tracking-wider">
            (Pvt) Ltd
          </p>

          <div className="w-16 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto mt-3 rounded-full"></div>

          <p className="text-gray-300 text-sm mt-4">
            Smart Generator Monitoring Platform
          </p>
        </div>

        {/* LOGIN FORM */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-sm text-gray-300">Username</label>
            <input
              className="w-full mt-1 px-4 py-3 rounded-xl bg-white text-black 
              focus:ring-2 focus:ring-yellow-400 outline-none transition"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-300">Password</label>
            <input
              type="password"
              className="w-full mt-1 px-4 py-3 rounded-xl bg-white text-black 
              focus:ring-2 focus:ring-yellow-400 outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl font-semibold text-white 
            bg-gradient-to-r from-yellow-500 to-yellow-600 
            hover:from-yellow-400 hover:to-yellow-500 
            transition duration-300 shadow-lg"
          >
            Secure Login
          </button>
        </form>

        {/* FOOTER */}
        <div className="text-center mt-8 text-xs text-gray-400">
          © {new Date().getFullYear()} S & S Power Solutions Lanka (Pvt) Ltd
        </div>
      </div>
    </div>
  );
}

export default Login;
