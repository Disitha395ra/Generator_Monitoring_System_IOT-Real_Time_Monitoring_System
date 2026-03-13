import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Power,
  Cpu,
  MapPin,
  Wrench,
  Zap,
  Activity,
  Thermometer,
  Droplets,
  PlusCircle,
  Building2,
  User,
  Phone,
  Mail,
  Gauge,
  Server,
  Calendar,
  Clock
} from "lucide-react";

const socket = io("http://localhost:5000");

function GeneratorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [generator, setGenerator] = useState({});
  const [history, setHistory] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newService, setNewService] = useState({
    serviceName: "",
    serviceDate: "",
    nextServiceDate: "",
    technician: "",
    notes: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Generator details
        const res = await fetch(`http://localhost:5000/api/generators/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const details = data?.details || {};
        const latestTelemetry = data?.history?.[0] || {};

        setGenerator({ id, ...details, ...latestTelemetry });

        setHistory(
          (data?.history || [])
            .slice()
            .reverse()
            .map((item) => ({
              time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              voltage: item.voltage || 0,
            })),
        );

        // Service history
        const serviceRes = await fetch(
          `http://localhost:5000/api/generator-details/service/history/${id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const serviceData = await serviceRes.json();
        setServices(Array.isArray(serviceData) ? serviceData : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // SOCKET LIVE UPDATE
  useEffect(() => {
    const handleUpdate = (g) => {
      if (g.id === id) {
        setGenerator((prev) => ({ ...prev, ...g }));
        setHistory((prev) => [
          ...prev.slice(-19),
          { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), voltage: g.voltage || 0 },
        ]);
      }
    };
    socket.on("generatorUpdate", handleUpdate);
    return () => socket.off("generatorUpdate", handleUpdate);
  }, [id]);

  const sendCommand = async (state) => {
    const token = localStorage.getItem("token");
    await fetch("http://localhost:5000/api/generators/control", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id, state }),
    });
  };

  const addService = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/generator-details/service/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newService),
        },
      );
      if (!res.ok) throw new Error("Failed to add service");
      const added = await res.json();
      setServices((prev) => [added, ...prev]);
      setNewService({
        serviceName: "",
        serviceDate: "",
        nextServiceDate: "",
        technician: "",
        notes: "",
      });
    } catch (err) {
      console.error(err);
      alert("Error adding service data");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050810] text-white">
        <div className="flex flex-col items-center">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <Zap className="absolute inset-0 m-auto text-cyan-400 w-6 h-6 animate-pulse" />
          </div>
          <p className="text-slate-400 font-medium tracking-widest text-sm uppercase">Acquiring Node Link...</p>
        </div>
      </div>
    );

  const isRunning = generator.status === "ON";
  const fuelLevel = Number(generator.fuelLevel || 0);
  const temperature = Number(generator.temperature || 0);

  const latitude = generator.location?.latitude;
  const longitude = generator.location?.longitude;
  const address = generator.location?.address;

  const mapSrc =
    latitude && longitude
      ? `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`
      : address
        ? `https://maps.google.com/maps?q=${encodeURIComponent(
          address,
        )}&z=15&output=embed`
        : null;

  const CounterWidget = ({ icon: Icon, label, value, unit, colorClass, gradientFrom, gradientTo }) => {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
      let start = 0;
      const end = Number(value || 0);
      const duration = 500;
      if (end === 0) { setDisplay(0); return; }
      const increment = end / (duration / 16);
      const counter = setInterval(() => {
        start += increment;
        if (start >= end) {
          start = end;
          clearInterval(counter);
        }
        setDisplay(start);
      }, 16);
      return () => clearInterval(counter);
    }, [value]);

    return (
      <div className="relative overflow-hidden bg-slate-900/40 border border-slate-700/50 p-5 rounded-2xl flex flex-col gap-2 group hover:bg-slate-800/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/10">
        <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${gradientFrom} ${gradientTo} opacity-10 group-hover:opacity-20 transition-opacity blur-2xl block`}></div>
        <div className="flex items-center justify-between z-10">
          <p className="text-[0.65rem] text-slate-400 uppercase font-bold tracking-widest">{label}</p>
          <Icon size={16} className={`${colorClass} opacity-70`} />
        </div>
        <div className="flex items-baseline gap-1 mt-1 z-10">
          <span className={`text-3xl font-black tracking-tight ${colorClass} drop-shadow-sm`}>{display.toFixed(1)}</span>
          <span className="text-sm text-slate-500 font-medium uppercase tracking-wider">{unit}</span>
        </div>
      </div>
    );
  };

  const DetailRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-center justify-between py-3 border-b border-white/[0.03] group">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-800/50 rounded-lg text-slate-400 group-hover:text-cyan-400 transition-colors">
          <Icon size={15} />
        </div>
        <span className="text-[0.7rem] uppercase font-bold text-slate-500 tracking-wider">
          {label}
        </span>
      </div>
      <span className="text-sm font-semibold text-slate-300 text-right max-w-[60%] truncate">
        {value || "N/A"}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050810] text-white p-4 md:p-8 relative overflow-hidden flex flex-col items-center">
      {/* Dynamic Background Layout */}
      <div className="absolute top-0 right-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[60%] bg-indigo-900/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-cyan-900/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[1400px]">
        {/* HEADER SECTION */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-6 bg-white/[0.01] backdrop-blur-3xl border border-white/[0.05] p-6 rounded-[2rem] shadow-2xl"
        >
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center justify-center p-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/50 rounded-2xl transition-all shadow-lg hover:shadow-cyan-500/10"
            >
              <ArrowLeft size={20} className="text-slate-300" />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  GEN-{generator.generatorName || id}
                </h1>
                <span
                  className={`px-3 py-1.5 rounded-full text-[0.65rem] font-bold tracking-widest flex items-center gap-1.5 shadow-lg ${isRunning
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-emerald-500/10"
                    : "bg-red-500/10 text-red-400 border border-red-500/20 shadow-red-500/10"
                    }`}
                >
                  <div className={`w-2 h-2 rounded-full ${isRunning ? "bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" : "bg-red-500"}`} />
                  {isRunning ? "SYSTEM ONLINE" : "SYSTEM OFFLINE"}
                </span>
              </div>
              <p className="text-slate-400 text-sm flex items-center gap-2 font-medium tracking-wide">
                <Server size={14} className="text-cyan-500" /> Advanced Diagnostic View
              </p>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={() => sendCommand("ON")}
              disabled={isRunning}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600/20 to-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:from-emerald-500/30 hover:to-emerald-400/20 transition-all shadow-lg shadow-emerald-500/5 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-sm tracking-wide"
            >
              <Power size={18} /> IGNITE
            </button>
            <button
              onClick={() => sendCommand("OFF")}
              disabled={!isRunning}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600/20 to-red-500/10 text-red-400 border border-red-500/30 hover:from-red-500/30 hover:to-red-400/20 transition-all shadow-lg shadow-red-500/5 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-sm tracking-wide"
            >
              <Power size={18} /> SHUTDOWN
            </button>
          </div>
        </motion.div>

        {/* TOP ROW GRID */}
        <div className="grid lg:grid-cols-4 gap-6 relative z-10 mb-6">
          {/* NODE PROFILE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white/[0.015] backdrop-blur-2xl border border-white/[0.05] p-6 lg:p-8 rounded-[2rem] shadow-2xl flex flex-col"
          >
            <h3 className="text-[0.7rem] font-black text-slate-400 uppercase tracking-widest border-b border-white/5 pb-4 mb-2 flex items-center gap-2">
              <Cpu size={14} className="text-indigo-400" /> Asset Profile
            </h3>
            <div className="flex-1 flex flex-col justify-center">
              <DetailRow icon={Building2} label="Manufacturer" value={generator.manufacturer} />
              <DetailRow icon={Building2} label="Company" value={generator.customerCompany} />
              <DetailRow icon={User} label="Client" value={generator.customerName} />
              <DetailRow icon={Phone} label="Contact" value={generator.customerContact} />
              <DetailRow icon={Mail} label="Email" value={generator.customerEmail} />
            </div>
          </motion.div>

          {/* CORE TELEMETRY METRICS */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/[0.015] backdrop-blur-2xl border border-white/[0.05] p-6 lg:p-8 rounded-[2rem] shadow-2xl lg:col-span-3 flex flex-col"
          >
            <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
              <h3 className="text-[0.7rem] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Activity size={14} className="text-cyan-400" /> Live Metrics Dashboard
              </h3>
              <span className="flex items-center gap-1.5 text-[0.65rem] font-bold text-cyan-500 uppercase tracking-widest bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                <Clock size={12} /> Syncing
              </span>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              <CounterWidget icon={Activity} label="Voltage" value={generator.voltage} unit="V" colorClass="text-cyan-400" gradientFrom="from-cyan-500" gradientTo="to-blue-500" />
              <CounterWidget icon={Zap} label="Current" value={generator.current} unit="A" colorClass="text-indigo-400" gradientFrom="from-indigo-500" gradientTo="to-purple-500" />
              <CounterWidget icon={Activity} label="Freq" value={generator.frequency} unit="Hz" colorClass="text-emerald-400" gradientFrom="from-emerald-500" gradientTo="to-teal-500" />
              <CounterWidget icon={Thermometer} label="Engine Temp" value={temperature} unit="°C" colorClass={temperature > 80 ? "text-red-400" : "text-amber-400"} gradientFrom={temperature > 80 ? "from-red-500" : "from-amber-500"} gradientTo={temperature > 80 ? "to-pink-500" : "to-orange-500"} />
              <CounterWidget icon={Gauge} label="Oil Press" value={generator.oilPressure} unit="PSI" colorClass="text-fuchsia-400" gradientFrom="from-fuchsia-500" gradientTo="to-pink-500" />
              <CounterWidget icon={Zap} label="Power Output" value={generator.power} unit="KW" colorClass="text-blue-400" gradientFrom="from-blue-500" gradientTo="to-cyan-500" />
            </div>

            {/* FUEL MONITOR */}
            <div className="mt-auto bg-slate-900/60 border border-slate-700/50 p-6 rounded-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <h4 className="text-[0.75rem] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  <Droplets size={16} className="text-blue-400" /> Fuel Reserve Status
                </h4>
                <span className="text-2xl font-black text-white">{fuelLevel.toFixed(1)}<span className="text-sm text-slate-500 ml-1">%</span></span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-4 overflow-hidden border border-slate-800 shadow-inner relative z-10 relative">
                {/* Markers */}
                <div className="absolute left-[30%] top-0 bottom-0 w-px bg-red-500/50 z-20"></div>
                <div className="absolute left-[60%] top-0 bottom-0 w-px bg-yellow-500/50 z-20"></div>
                <div
                  className={`h-full transition-all duration-1000 relative shadow-[0_0_15px_rgba(255,255,255,0.2)] ${fuelLevel > 60 ? "bg-gradient-to-r from-blue-600 to-cyan-400" : fuelLevel > 30 ? "bg-gradient-to-r from-amber-600 to-yellow-400" : "bg-gradient-to-r from-red-600 to-rose-400"
                    }`}
                  style={{ width: `${fuelLevel}%` }}
                >
                  <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] bg-[length:200%_100%] animate-[shimmer_2s_infinite_linear]" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* BOTTOM ROW GRID */}
        <div className="grid xl:grid-cols-2 gap-6 relative z-10 mb-6">
          {/* GRAPH VIEW */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/[0.015] backdrop-blur-2xl border border-white/[0.05] p-6 lg:p-8 rounded-[2rem] shadow-2xl h-[450px] flex flex-col"
          >
            <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
              <h3 className="text-[0.7rem] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Activity size={14} className="text-cyan-400" /> Voltage Analytics Waveform
              </h3>
            </div>
            <div className="flex-1 -ml-6 -mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="colorVoltage" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#818cf8" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="time" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} dx={-10} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(5, 8, 16, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', padding: '12px' }}
                    itemStyle={{ color: '#38bdf8', fontSize: '14px', fontWeight: 'bold' }}
                    labelStyle={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="voltage"
                    stroke="url(#lineGrad)"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorVoltage)"
                    activeDot={{ r: 8, fill: '#38bdf8', stroke: '#070B14', strokeWidth: 3 }}
                    style={{ filter: "drop-shadow(0px 10px 10px rgba(56, 189, 248, 0.2))" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* MAP VIEW */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/[0.015] backdrop-blur-2xl border border-white/[0.05] p-6 lg:p-8 rounded-[2rem] shadow-2xl h-[450px] flex flex-col"
          >
            <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
              <h3 className="text-[0.7rem] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <MapPin size={14} className="text-rose-400" /> Geographic Deployment
              </h3>
            </div>
            <div className="flex-1 rounded-[1.5rem] overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.4)] relative group">
              {mapSrc ? (
                <iframe
                  title="Generator Location"
                  src={mapSrc}
                  width="100%"
                  height="100%"
                  loading="lazy"
                  className="absolute inset-0 grayscale contrast-125 brightness-75 group-hover:grayscale-0 transition-all duration-700"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 text-slate-500 font-medium">
                  Geodata unavailable
                </div>
              )}
              <div className="absolute bottom-5 left-5 right-5 bg-slate-900/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                <p className="text-xs text-slate-300 line-clamp-2 md:text-sm font-medium leading-relaxed">{address || "Coordinates recorded but semantic address unavailable"}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* SERVICE HISTORY TABLE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/[0.015] backdrop-blur-2xl border border-white/[0.05] p-6 lg:p-8 rounded-[2rem] shadow-2xl relative z-10"
        >
          <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-8">
            <h3 className="text-[0.7rem] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Wrench size={14} className="text-amber-400" /> Maintenance & Lifecycles
            </h3>
          </div>

          <div className="grid xl:grid-cols-4 gap-8">
            {/* ADD LOG FORM */}
            <div className="xl:col-span-1 p-6 bg-slate-900/40 rounded-[1.5rem] border border-white/[0.03] shadow-inner h-fit">
              <h4 className="text-[0.75rem] text-cyan-400 font-black mb-6 uppercase tracking-widest flex items-center gap-2">
                <PlusCircle size={16} /> New Entry
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="text-[0.6rem] text-slate-500 uppercase font-bold tracking-widest mb-1.5 block pl-1">Service Event</label>
                  <input
                    type="text"
                    placeholder="e.g. Filter Change"
                    value={newService.serviceName}
                    onChange={(e) => setNewService((prev) => ({ ...prev, serviceName: e.target.value }))}
                    className="w-full bg-slate-950/50 border border-slate-800 px-4 py-3 rounded-xl text-sm placeholder-slate-600 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all shadow-inner text-white font-medium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[0.6rem] text-slate-500 uppercase font-bold tracking-widest mb-1.5 block pl-1">Performed On</label>
                    <input
                      type="date"
                      value={newService.serviceDate}
                      onChange={(e) => setNewService((prev) => ({ ...prev, serviceDate: e.target.value }))}
                      className="w-full bg-slate-950/50 border border-slate-800 px-4 py-3 rounded-xl text-sm text-slate-300 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all shadow-inner font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[0.6rem] text-slate-500 uppercase font-bold tracking-widest mb-1.5 block pl-1">Next Due</label>
                    <input
                      type="date"
                      value={newService.nextServiceDate}
                      onChange={(e) => setNewService((prev) => ({ ...prev, nextServiceDate: e.target.value }))}
                      className="w-full bg-slate-950/50 border border-slate-800 px-4 py-3 rounded-xl text-sm text-slate-300 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all shadow-inner font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[0.6rem] text-slate-500 uppercase font-bold tracking-widest mb-1.5 block pl-1">Technician</label>
                  <input
                    type="text"
                    placeholder="Assignee Name"
                    value={newService.technician}
                    onChange={(e) => setNewService((prev) => ({ ...prev, technician: e.target.value }))}
                    className="w-full bg-slate-950/50 border border-slate-800 px-4 py-3 rounded-xl text-sm placeholder-slate-600 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all shadow-inner text-white font-medium"
                  />
                </div>
                <div>
                  <label className="text-[0.6rem] text-slate-500 uppercase font-bold tracking-widest mb-1.5 block pl-1">Remarks</label>
                  <textarea
                    placeholder="Additional observations..."
                    value={newService.notes}
                    onChange={(e) => setNewService((prev) => ({ ...prev, notes: e.target.value }))}
                    className="w-full h-24 bg-slate-950/50 border border-slate-800 px-4 py-3 rounded-xl text-sm placeholder-slate-600 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all resize-none shadow-inner text-white font-medium"
                  />
                </div>
                <button
                  onClick={addService}
                  className="w-full mt-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-3.5 rounded-xl font-black text-[0.75rem] tracking-widest transition-all uppercase shadow-[0_0_20px_rgba(8,145,178,0.3)] hover:shadow-[0_0_30px_rgba(8,145,178,0.5)] scale-100 hover:scale-[1.02]"
                >
                  Log Record
                </button>
              </div>
            </div>

            {/* TABLE LOGS */}
            <div className="xl:col-span-3">
              {services.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4 min-h-[300px] bg-slate-900/20 rounded-[1.5rem] border border-slate-800 border-dashed">
                  <div className="p-4 bg-slate-800/50 rounded-full">
                    <Wrench size={40} className="text-slate-600" />
                  </div>
                  <p className="text-sm font-medium tracking-wide">No maintenance records found in registry</p>
                </div>
              ) : (
                <div className="rounded-[1.5rem] border border-white/5 overflow-hidden bg-slate-900/30">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-950/80 border-b border-white/5 shadow-sm">
                        <th className="px-6 py-5 text-[0.65rem] font-black text-cyan-500 uppercase tracking-widest">Event Description</th>
                        <th className="px-6 py-5 text-[0.65rem] font-black text-cyan-500 uppercase tracking-widest">Performed</th>
                        <th className="px-6 py-5 text-[0.65rem] font-black text-cyan-500 uppercase tracking-widest">Next Due</th>
                        <th className="px-6 py-5 text-[0.65rem] font-black text-cyan-500 uppercase tracking-widest">Tech</th>
                        <th className="px-6 py-5 text-[0.65rem] font-black text-cyan-500 uppercase tracking-widest hidden sm:table-cell">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {services.map((s, i) => (
                        <tr key={s._id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-6 py-5 font-semibold text-slate-200 text-sm flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-cyan-500/50 group-hover:bg-cyan-400"></div>
                            {s.serviceName || "-"}
                          </td>
                          <td className="px-6 py-5 text-slate-400 text-sm font-medium">
                            {s.serviceDate ? (
                              <span className="flex items-center gap-2"><Calendar size={14} className="text-slate-500" /> {new Date(s.serviceDate).toLocaleDateString()}</span>
                            ) : "-"}
                          </td>
                          <td className="px-6 py-5 text-slate-400 text-sm font-medium">
                            {s.nextServiceDate ? (
                              <span className="flex items-center gap-2"><Calendar size={14} className="text-slate-500" /> {new Date(s.nextServiceDate).toLocaleDateString()}</span>
                            ) : "-"}
                          </td>
                          <td className="px-6 py-5 text-slate-300 text-sm font-medium">
                            {s.technician ? (
                              <span className="flex items-center gap-2 bg-slate-800/50 px-2.5 py-1 rounded-md border border-white/5 w-fit"><User size={12} className="text-indigo-400" /> {s.technician}</span>
                            ) : "-"}
                          </td>
                          <td className="px-6 py-5 text-slate-400 text-sm hidden sm:table-cell max-w-[250px] truncate leading-relaxed">
                            {s.notes || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default GeneratorDetails;
