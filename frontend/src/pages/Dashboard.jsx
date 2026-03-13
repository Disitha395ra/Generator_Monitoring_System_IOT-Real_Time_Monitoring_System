import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Power,
  Settings,
  LogOut,
  AlertTriangle,
  Zap,
  Activity,
  Thermometer,
  Droplets,
  MapPin,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import CompanyLogo from "../Components/CompanyLogo";

const socket = io("http://localhost:5000");

function Dashboard() {
  const [generators, setGenerators] = useState({});
  const [serviceAlerts, setServiceAlerts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /* ---------------- SERVICE ALERTS ---------------- */
  const [showAllAlerts, setShowAllAlerts] = useState(false);

  const alertsToShow = showAllAlerts
    ? serviceAlerts
    : serviceAlerts.slice(0, 1);

  /* ---------------- AUTH CHECK ---------------- */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/");

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        navigate("/");
      }
    } catch {
      localStorage.removeItem("token");
      navigate("/");
    }
  }, [navigate]);

  /* ---------------- FETCH GENERATORS ---------------- */
  useEffect(() => {
    const fetchGenerators = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/generators", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) return;

        const data = await res.json();
        if (!Array.isArray(data)) return;

        const map = {};
        data.forEach((g) => {
          const generatorId = g.id || g._id;
          map[generatorId] = {
            ...g,
            id: generatorId,
            history: [
              {
                time: new Date().toLocaleTimeString(),
                voltage: g.voltage || 0,
              },
            ],
          };
        });

        setGenerators(map);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGenerators();
  }, []);

  /* ---------------- FETCH SERVICE ALERTS ---------------- */
  useEffect(() => {
    const fetchServiceAlerts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          "http://localhost:5000/api/generator-details/service/alerts/next",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!res.ok) return;

        const data = await res.json();
        if (Array.isArray(data)) {
          setServiceAlerts(data);
        }
      } catch (err) {
        console.error("Failed to fetch service alerts:", err);
      }
    };

    fetchServiceAlerts();
  }, []);

  /* ---------------- SOCKET UPDATES ---------------- */
  useEffect(() => {
    const handleUpdate = (g) => {
      setGenerators((prev) => {
        const generatorId = g.id || g._id;
        const prevHistory = prev[generatorId]?.history || [];
        return {
          ...prev,
          [generatorId]: {
            ...(prev[generatorId] || {}),
            ...g,
            id: generatorId,
            history: [
              ...prevHistory.slice(-19),
              {
                time: new Date().toLocaleTimeString(),
                voltage: g.voltage || 0,
              },
            ],
          },
        };
      });
    };

    socket.on("generatorUpdate", handleUpdate);
    return () => socket.off("generatorUpdate", handleUpdate);
  }, []);

  const sendCommand = async (id, state) => {
    try {
      const token = localStorage.getItem("token");

      await fetch("http://localhost:5000/api/generators/control", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, state }),
      });
    } catch (err) {
      console.error("Control error:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const filtered = Object.values(generators).filter((g) =>
    (g.id || "").toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070B14] text-white">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400 font-medium tracking-wide">Initializing Telemetry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070B14] text-white p-4 md:p-8 relative overflow-hidden">
      {/* Dynamic Backgrounds */}
      <div className="absolute top-0 left-[-10%] w-[50%] h-[40%] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* ================= BRAND HEADER ================= */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/[0.02] backdrop-blur-2xl border border-white/5 p-6 rounded-[2rem] shadow-2xl mb-8 relative z-10"
      >
        <div className="flex flex-col xl:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <CompanyLogo size={60} />
            <div>
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-1">
                Generator Control Center
              </h2>
              <p className="text-slate-400 text-sm font-medium tracking-wide flex items-center gap-2">
                <Activity size={14} className="text-cyan-400" /> Real-Time Telemetry & Enterprise Monitoring
              </p>
            </div>
          </div>

          <div className="flex gap-4 w-full xl:w-auto">
            <button
              onClick={() => navigate("/add-generator")}
              className="flex-1 xl:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-2.5 rounded-xl font-semibold shadow-[0_0_15px_rgba(8,145,178,0.2)] hover:shadow-[0_0_25px_rgba(8,145,178,0.4)] hover:scale-[1.02] transition-all text-sm"
            >
              <Settings size={18} /> Configure New
            </button>

            <button
              onClick={handleLogout}
              className="flex-1 xl:flex-none flex items-center justify-center gap-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 px-6 py-2.5 rounded-xl font-semibold text-slate-300 hover:text-white transition-all text-sm"
            >
              <LogOut size={18} /> Disconnect
            </button>
          </div>
        </div>
      </motion.div>

      {/* ================= SEARCH ================= */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex justify-center mb-10 relative z-10"
      >
        <div className="relative w-full max-w-xl group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
          </div>
          <input
            placeholder="Search active generators..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-5 py-3.5 rounded-2xl bg-white/[0.03] border border-white/5 text-white placeholder-slate-500 focus:bg-white/[0.05] focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all shadow-[0_4px_20px_rgba(0,0,0,0.2)] text-sm"
          />
        </div>
      </motion.div>

      {/* ================= SERVICE ALERTS ================= */}
      <AnimatePresence>
        {serviceAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-10 space-y-3 relative z-10"
          >
            {alertsToShow.map((alert) => (
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                key={alert.topicId}
                className="bg-yellow-500/10 border border-yellow-500/20 backdrop-blur-md p-4 rounded-2xl flex items-start gap-4 shadow-lg"
              >
                <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-500">
                  <AlertTriangle size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-yellow-100/90 text-sm">
                    <strong className="text-yellow-400 text-base">{alert.generatorName}</strong> requires immediate attention. Next service due on{" "}
                    <strong className="text-white">
                      {alert.nextServiceDate
                        ? new Date(alert.nextServiceDate).toLocaleDateString()
                        : "N/A"}
                    </strong>
                  </p>
                  {showAllAlerts && alert.notes && (
                    <p className="mt-2 text-yellow-200/70 text-sm italic">{alert.notes}</p>
                  )}
                </div>
              </motion.div>
            ))}

            {serviceAlerts.length > 1 && (
              <button
                onClick={() => setShowAllAlerts(!showAllAlerts)}
                className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors mt-2 uppercase tracking-wider"
              >
                {showAllAlerts ? (
                  <><ChevronUp size={14} /> Show Less</>
                ) : (
                  <><ChevronDown size={14} /> View {serviceAlerts.length - 1} more alert{serviceAlerts.length - 1 > 1 ? 's' : ''}</>
                )}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= GENERATOR CARDS ================= */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 relative z-10">
        <AnimatePresence>
          {filtered.map((g, idx) => {
            const isRunning = g.state === "ON";

            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={g.id}
                className="group bg-white/[0.02] hover:bg-white/[0.03] backdrop-blur-xl border border-white/5 hover:border-cyan-500/30 p-6 rounded-[2rem] shadow-xl hover:shadow-[0_8px_32px_0_rgba(8,145,178,0.1)] transition-all flex flex-col h-full"
              >
                {/* Header Section */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1 tracking-wide">{g.id}</h2>
                    <p className="text-slate-400 text-xs font-medium flex items-center gap-1">
                      <MapPin size={12} /> {g.location?.address?.substring(0, 30) || 'Unknown Location'}...
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-[0.7rem] font-bold tracking-widest flex items-center gap-1.5 ${isRunning
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                        : "bg-slate-800/50 text-slate-400 border border-slate-700/50"
                      }`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${isRunning ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
                    {isRunning ? "ONLINE" : "OFFLINE"}
                  </div>
                </div>

                {/* Telemetry Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-slate-900/50 rounded-xl p-3 border border-white/5 flex items-center gap-3 hover:bg-slate-800/50 transition-colors">
                    <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg"><Zap size={16} /></div>
                    <div>
                      <p className="text-[0.65rem] text-slate-500 uppercase font-bold tracking-wider">Voltage</p>
                      <p className="text-sm font-semibold text-slate-200">{Number(g.voltage || 0).toFixed(1)} <span className="text-xs text-slate-500">V</span></p>
                    </div>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-3 border border-white/5 flex items-center gap-3 hover:bg-slate-800/50 transition-colors">
                    <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg"><Activity size={16} /></div>
                    <div>
                      <p className="text-[0.65rem] text-slate-500 uppercase font-bold tracking-wider">Current</p>
                      <p className="text-sm font-semibold text-slate-200">{Number(g.current || 0).toFixed(1)} <span className="text-xs text-slate-500">A</span></p>
                    </div>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-3 border border-white/5 flex items-center gap-3 hover:bg-slate-800/50 transition-colors">
                    <div className="p-2 bg-orange-500/10 text-orange-400 rounded-lg"><Thermometer size={16} /></div>
                    <div>
                      <p className="text-[0.65rem] text-slate-500 uppercase font-bold tracking-wider">Temp</p>
                      <p className="text-sm font-semibold text-slate-200">{Number(g.temperature || 0).toFixed(1)} <span className="text-xs text-slate-500">°C</span></p>
                    </div>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-3 border border-white/5 flex items-center gap-3 hover:bg-slate-800/50 transition-colors">
                    <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg"><Droplets size={16} /></div>
                    <div>
                      <p className="text-[0.65rem] text-slate-500 uppercase font-bold tracking-wider">Fuel</p>
                      <p className="text-sm font-semibold text-slate-200">{Number(g.fuelLevel || 0).toFixed(1)} <span className="text-xs text-slate-500">%</span></p>
                    </div>
                  </div>
                </div>

                {/* Chart Section */}
                <div className="h-32 mb-6 w-full -ml-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={g.history}>
                      <defs>
                        <linearGradient id={`gradient-${g.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Tooltip
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        itemStyle={{ color: '#22d3ee', fontSize: '12px' }}
                        labelStyle={{ display: 'none' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="voltage"
                        stroke="#22d3ee"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                        style={{ filter: "drop-shadow(0px 4px 6px rgba(34, 211, 238, 0.4))" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Action Controls */}
                <div className="mt-auto grid grid-cols-2 gap-3 mb-3">
                  <button
                    onClick={() => sendCommand(g.id, "ON")}
                    disabled={isRunning}
                    className="flex justify-center items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 py-2.5 rounded-xl font-semibold transition-all shadow-[0_0_10px_rgba(16,185,129,0)] hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] disabled:opacity-40 disabled:cursor-not-allowed text-xs"
                  >
                    <Power size={14} /> START
                  </button>
                  <button
                    onClick={() => sendCommand(g.id, "OFF")}
                    disabled={!isRunning}
                    className="flex justify-center items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 py-2.5 rounded-xl font-semibold transition-all shadow-[0_0_10px_rgba(239,68,68,0)] hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] disabled:opacity-40 disabled:cursor-not-allowed text-xs"
                  >
                    <Power size={14} /> STOP
                  </button>
                </div>

                <button
                  onClick={() => navigate(`/generator/${g.id}`)}
                  className="w-full bg-slate-800/40 hover:bg-cyan-600/20 border border-white/5 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-400 py-3 rounded-xl font-bold tracking-wide transition-all text-xs uppercase flex justify-center items-center gap-2"
                >
                  <Settings size={14} /> View Telemetry Details
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Dashboard;
