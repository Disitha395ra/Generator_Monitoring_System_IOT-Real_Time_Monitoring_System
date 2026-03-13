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
  Gauge
} from "lucide-react";
import logo from "../assets/logo.png";

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
              time: new Date(item.timestamp).toLocaleTimeString(),
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
          { time: new Date().toLocaleTimeString(), voltage: g.voltage || 0 },
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
      <div className="min-h-screen flex items-center justify-center bg-[#070B14] text-white">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400 font-medium tracking-wide">Loading Telemetry Context...</p>
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

  const Counter = ({ icon: Icon, label, value, unit, colorClass = "text-cyan-400", bgClass = "bg-cyan-500/10" }) => {
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
      <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl flex items-center gap-4 hover:bg-white/[0.04] transition-colors">
        <div className={`p-3 rounded-xl ${bgClass} ${colorClass}`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-[0.65rem] text-slate-400 uppercase font-bold tracking-widest">{label}</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-2xl font-bold ${colorClass}`}>{display.toFixed(1)}</span>
            <span className="text-sm text-slate-500 font-medium">{unit}</span>
          </div>
        </div>
      </div>
    );
  };

  const Detail = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-3">
      <div className="p-2 bg-slate-800/50 rounded-lg text-slate-400">
        <Icon size={16} />
      </div>
      <div className="flex flex-col">
        <span className="text-[0.65rem] uppercase font-bold text-slate-500 tracking-wider">
          {label}
        </span>
        <span className="text-sm font-medium text-slate-200">
          {value || "N/A"}
        </span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#070B14] text-white p-4 md:p-8 relative overflow-hidden">
      {/* Dynamic Backgrounds */}
      <div className="absolute top-0 right-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[60%] bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* HEADER + CONTROLS */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-6"
      >
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center justify-center p-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-xl transition-all"
          >
            <ArrowLeft size={20} className="text-slate-300" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold tracking-wide">
                GEN-{generator.generatorName || id}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-[0.65rem] font-bold tracking-widest flex items-center gap-1.5 ${isRunning
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                    : "bg-slate-800/50 text-slate-400 border border-slate-700/50"
                  }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${isRunning ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
                {isRunning ? "ONLINE" : "OFFLINE"}
              </span>
            </div>
            <p className="text-slate-400 text-sm flex items-center gap-2">
              <Cpu size={14} className="text-cyan-500" /> Advanced Node Details
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => sendCommand("ON")}
            disabled={isRunning}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)] disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-sm"
          >
            <Power size={16} /> START GENERATOR
          </button>
          <button
            onClick={() => sendCommand("OFF")}
            disabled={!isRunning}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-all shadow-[0_0_15px_rgba(239,68,68,0.1)] disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-sm"
          >
            <Power size={16} /> STOP GENERATOR
          </button>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6 relative z-10 mb-6">
        {/* GENERATOR INFO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/[0.02] backdrop-blur-xl border border-white/5 p-6 rounded-3xl shadow-xl flex flex-col gap-6"
        >
          <h3 className="text-[0.8rem] font-bold text-slate-300 uppercase tracking-widest border-b border-white/5 pb-3">Node Information</h3>
          <div className="space-y-4">
            <Detail icon={Cpu} label="Manufacturer" value={generator.manufacturer} />
            <Detail icon={Building2} label="Company" value={generator.customerCompany} />
            <Detail icon={User} label="Customer" value={generator.customerName} />
            <Detail icon={Phone} label="Contact" value={generator.customerContact} />
            <Detail icon={Mail} label="Email" value={generator.customerEmail} />
          </div>
        </motion.div>

        {/* ELECTRICAL DATA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/[0.02] backdrop-blur-xl border border-white/5 p-6 rounded-3xl shadow-xl lg:col-span-2 flex flex-col"
        >
          <h3 className="text-[0.8rem] font-bold text-slate-300 uppercase tracking-widest border-b border-white/5 pb-3 mb-6">Telemetry & Status</h3>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <Counter icon={Zap} label="Voltage" value={generator.voltage} unit="V" colorClass="text-blue-400" bgClass="bg-blue-500/10" />
            <Counter icon={Activity} label="Current" value={generator.current} unit="A" colorClass="text-cyan-400" bgClass="bg-cyan-500/10" />
            <Counter icon={Zap} label="Power" value={generator.power} unit="W" colorClass="text-indigo-400" bgClass="bg-indigo-500/10" />
            <Counter icon={Activity} label="Frequency" value={generator.frequency} unit="Hz" colorClass="text-emerald-400" bgClass="bg-emerald-500/10" />
            <Counter icon={Thermometer} label="Temperature" value={temperature} unit="°C" colorClass={temperature > 80 ? "text-red-400" : temperature > 60 ? "text-orange-400" : "text-yellow-400"} bgClass={temperature > 80 ? "bg-red-500/10" : "bg-orange-500/10"} />
            <Counter icon={Gauge} label="Oil Press." value={generator.oilPressure} unit="psi" colorClass="text-purple-400" bgClass="bg-purple-500/10" />
          </div>

          <div className="mt-auto bg-slate-900/50 border border-white/5 p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[0.7rem] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Droplets size={14} /> Fuel Capacity</span>
              <span className="text-cyan-400 font-bold">{fuelLevel.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden shadow-inner">
              <div
                className={`h-full transition-all duration-1000 relative ${fuelLevel > 60 ? "bg-gradient-to-r from-cyan-600 to-cyan-400" : fuelLevel > 30 ? "bg-gradient-to-r from-yellow-600 to-yellow-400" : "bg-gradient-to-r from-red-600 to-red-400"
                  }`}
                style={{ width: `${fuelLevel}%` }}
              >
                <div className="absolute top-0 left-0 w-full h-full bg-white/20" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)', backgroundSize: '200% 100%', animation: 'shimmer 2s infinite linear' }} />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 relative z-10 mb-6">
        {/* VOLTAGE HISTORY */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/[0.02] backdrop-blur-xl border border-white/5 p-6 rounded-3xl shadow-xl h-96 flex flex-col"
        >
          <h3 className="text-[0.8rem] font-bold text-slate-300 uppercase tracking-widest border-b border-white/5 pb-3 mb-6">Voltage History Logs</h3>
          <div className="flex-1 -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <defs>
                  <linearGradient id="colorVoltage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: '#38bdf8', fontSize: '13px', fontWeight: 'bold' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '11px', marginBottom: '4px' }}
                />
                <Line
                  type="monotone"
                  dataKey="voltage"
                  stroke="#38bdf8"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, fill: '#38bdf8', stroke: '#0f172a', strokeWidth: 2 }}
                  style={{ filter: "drop-shadow(0px 4px 8px rgba(56, 189, 248, 0.5))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* LOCATION SETUP */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/[0.02] backdrop-blur-xl border border-white/5 p-6 rounded-3xl shadow-xl h-96 flex flex-col"
        >
          <h3 className="text-[0.8rem] font-bold text-slate-300 uppercase tracking-widest border-b border-white/5 pb-3 mb-6 flex items-center gap-2"><MapPin size={16} /> Location Details</h3>
          <div className="flex-1 rounded-2xl overflow-hidden border border-white/5 shadow-[0_0_20px_rgba(0,0,0,0.3)] relative">
            {mapSrc ? (
              <iframe
                title="Generator Location"
                src={mapSrc}
                width="100%"
                height="100%"
                loading="lazy"
                className="absolute inset-0"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 text-slate-500 font-medium">
                Location data unavailable
              </div>
            )}
            <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-xl">
              <p className="text-xs text-slate-300 line-clamp-2">{address || "Coordinates recorded but address unavailable"}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* SERVICE HISTORY */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white/[0.02] backdrop-blur-xl border border-white/5 p-6 rounded-3xl shadow-xl relative z-10"
      >
        <h3 className="text-[0.8rem] font-bold text-slate-300 uppercase tracking-widest border-b border-white/5 pb-3 mb-6 flex items-center gap-2"><Wrench size={16} /> Service Registry</h3>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* ADD SERVICE FORM */}
          <div className="p-5 bg-slate-900/50 rounded-2xl border border-white/5 h-fit">
            <h4 className="text-sm text-cyan-400 font-bold mb-4 uppercase tracking-wider flex items-center gap-2"><PlusCircle size={16} /> Log Maintenance</h4>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Service Event Name"
                value={newService.serviceName}
                onChange={(e) => setNewService((prev) => ({ ...prev, serviceName: e.target.value }))}
                className="w-full bg-slate-800/80 border border-white/5 px-4 py-2.5 rounded-xl text-sm placeholder-slate-500 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  placeholder="Service Date"
                  value={newService.serviceDate}
                  onChange={(e) => setNewService((prev) => ({ ...prev, serviceDate: e.target.value }))}
                  className="w-full bg-slate-800/80 border border-white/5 px-4 py-2.5 rounded-xl text-sm text-slate-300 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all"
                />
                <input
                  type="date"
                  placeholder="Next Due"
                  value={newService.nextServiceDate}
                  onChange={(e) => setNewService((prev) => ({ ...prev, nextServiceDate: e.target.value }))}
                  className="w-full bg-slate-800/80 border border-white/5 px-4 py-2.5 rounded-xl text-sm text-slate-300 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all"
                />
              </div>
              <input
                type="text"
                placeholder="Assigned Technician"
                value={newService.technician}
                onChange={(e) => setNewService((prev) => ({ ...prev, technician: e.target.value }))}
                className="w-full bg-slate-800/80 border border-white/5 px-4 py-2.5 rounded-xl text-sm placeholder-slate-500 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all"
              />
              <textarea
                placeholder="Maintenance Notes"
                value={newService.notes}
                onChange={(e) => setNewService((prev) => ({ ...prev, notes: e.target.value }))}
                className="w-full h-24 bg-slate-800/80 border border-white/5 px-4 py-2.5 rounded-xl text-sm placeholder-slate-500 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all resize-none"
              />
              <button
                onClick={addService}
                className="w-full bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-400 border border-cyan-500/30 py-3 rounded-xl font-bold text-sm tracking-wide transition-all uppercase"
              >
                Submit Record
              </button>
            </div>
          </div>

          {/* TABLE LOGS */}
          <div className="lg:col-span-2 overflow-x-auto">
            {services.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2 min-h-[200px] bg-slate-900/20 rounded-2xl border border-white/5 border-dashed">
                <Wrench size={32} className="opacity-50" />
                <p className="text-sm font-medium">No service history recorded yet</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/5 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900/80 text-cyan-400 uppercase tracking-widest text-[0.65rem] border-b border-white/5">
                    <tr>
                      <th className="px-5 py-4 font-bold">Event Log</th>
                      <th className="px-5 py-4 font-bold">Completed On</th>
                      <th className="px-5 py-4 font-bold">Next Due</th>
                      <th className="px-5 py-4 font-bold">Tech</th>
                      <th className="px-5 py-4 font-bold hidden sm:table-cell">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 bg-slate-900/30">
                    {services.map((s) => (
                      <tr key={s._id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-5 py-4 font-medium text-slate-200">{s.serviceName || "-"}</td>
                        <td className="px-5 py-4 text-slate-400">
                          {s.serviceDate ? new Date(s.serviceDate).toLocaleDateString() : "-"}
                        </td>
                        <td className="px-5 py-4 text-slate-400">
                          {s.nextServiceDate ? new Date(s.nextServiceDate).toLocaleDateString() : "-"}
                        </td>
                        <td className="px-5 py-4 text-slate-400">{s.technician || "-"}</td>
                        <td className="px-5 py-4 text-slate-400 hidden sm:table-cell max-w-[200px] truncate">{s.notes || "-"}</td>
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
  );
}

export default GeneratorDetails;
