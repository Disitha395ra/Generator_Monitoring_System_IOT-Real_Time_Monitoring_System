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
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        Loading generators...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white p-8">
      {/* ================= BRAND HEADER ================= */}
      <div className="bg-black/40 backdrop-blur-xl border border-cyan-500/20 p-6 rounded-3xl shadow-2xl mb-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <CompanyLogo size={70} />
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Generator Monitoring Dashboard
              </h2>
              <p className="text-gray-400 text-sm">
                Real-Time Telemetry • Remote Control • Enterprise Monitoring
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => navigate("/add-generator")}
              className="bg-gradient-to-r from-cyan-600 to-blue-700 px-6 py-2 rounded-xl font-semibold shadow-lg hover:scale-105 transition"
            >
              + Add Generator
            </button>

            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-600 to-red-800 px-6 py-2 rounded-xl font-semibold shadow-lg hover:scale-105 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* ================= SEARCH ================= */}
      <div className="flex justify-center mb-10">
        <input
          placeholder="Search Generator..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-96 px-5 py-3 rounded-xl text-black shadow-lg"
        />
      </div>

      {/* ================= SERVICE ALERTS ================= */}
      {/* ================= SERVICE ALERTS ================= */}
      {serviceAlerts.length > 0 && (
        <div className="mb-8 space-y-4">
          {alertsToShow.map((alert) => (
            <div
              key={alert.topicId}
              className="bg-yellow-500/20 border-l-4 border-yellow-400 text-yellow-300 p-4 rounded-xl"
            >
              <p>
                ⚠️ <strong>{alert.generatorName}</strong> has a next service due
                on{" "}
                <strong>
                  {alert.nextServiceDate
                    ? new Date(alert.nextServiceDate).toLocaleDateString()
                    : "N/A"}
                </strong>
              </p>
              {showAllAlerts && alert.notes && (
                <p className="mt-2 text-yellow-200">{alert.notes}</p>
              )}
            </div>
          ))}

          {serviceAlerts.length > 2 && (
            <button
              onClick={() => setShowAllAlerts(!showAllAlerts)}
              className="text-sm text-cyan-400 hover:underline mt-2"
            >
              {showAllAlerts
                ? "Show Less"
                : `Read more (${serviceAlerts.length - 2} more)`}
            </button>
          )}
        </div>
      )}

      {/* ================= GENERATOR CARDS ================= */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filtered.map((g) => {
          const isRunning = g.state === "ON";

          return (
            <div
              key={g.id}
              className="bg-black/40 backdrop-blur-xl border border-cyan-500/20 p-6 rounded-3xl shadow-2xl"
            >
              {/* Generator Header */}
              <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold">{g.id}</h2>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    isRunning
                      ? "bg-green-500/20 text-green-400 border border-green-400"
                      : "bg-red-500/20 text-red-400 border border-red-400"
                  }`}
                >
                  {isRunning ? "RUNNING" : "OFF"}
                </span>
              </div>

              {/* Customer Details */}
              <div className="bg-blue-900/40 border border-blue-500/30 p-4 rounded-xl mb-4">
                <h3 className="text-blue-300 font-semibold mb-2">
                  Customer Details
                </h3>
                <p>
                  <strong>Name:</strong> {g.generatorName}
                </p>
                <p>
                  <strong>Manufacturer:</strong> {g.manufacturer}
                </p>
                <p>
                  <strong>Company:</strong> {g.customerCompany}
                </p>
                <p>
                  <strong>Location:</strong> {g.location?.address}
                </p>
              </div>

              {/* Telemetry */}
              <div className="bg-cyan-900/30 border border-cyan-500/30 p-4 rounded-xl mb-4">
                <h3 className="text-cyan-300 font-semibold mb-2">
                  Telemetry Data
                </h3>
                <p>Voltage: {Number(g.voltage || 0).toFixed(2)} V</p>
                <p>Current: {Number(g.current || 0).toFixed(2)} A</p>
                <p>Power: {Number(g.power || 0).toFixed(2)} W</p>
                <p>Frequency: {Number(g.frequency || 0).toFixed(2)} Hz</p>
                <p>Fuel Level: {Number(g.fuelLevel || 0).toFixed(2)} %</p>
                <p>Oil Pressure: {Number(g.oilPressure || 0).toFixed(2)} psi</p>
                <p>Temperature: {Number(g.temperature || 0).toFixed(2)} °C</p>
              </div>

              {/* Controls */}
              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => sendCommand(g.id, "ON")}
                  className="flex-1 bg-green-600 py-2 rounded-xl hover:bg-green-500"
                >
                  ON
                </button>
                <button
                  onClick={() => sendCommand(g.id, "OFF")}
                  className="flex-1 bg-red-600 py-2 rounded-xl hover:bg-red-500"
                >
                  OFF
                </button>
              </div>

              <button
                onClick={() => navigate(`/generator/${g.id}`)}
                className="w-full bg-cyan-600 py-2 rounded-xl hover:bg-cyan-500"
              >
                View Details
              </button>

              {/* Voltage Chart */}
              <div className="h-52 mt-5">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={g.history}>
                    <CartesianGrid stroke="#0ea5e9" />
                    <XAxis dataKey="time" stroke="#ccc" />
                    <YAxis stroke="#ccc" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="voltage"
                      stroke="#22d3ee"
                      strokeWidth={3}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Dashboard;
