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
import logo from "../assets/logo.png";

const socket = io("http://localhost:5000");

function GeneratorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [generator, setGenerator] = useState({});
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ===============================
     LOAD DATA
  =============================== */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`http://localhost:5000/api/generators/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        const details = data?.details || {};
        const latestTelemetry = data?.history?.[0] || {};

        setGenerator({
          id,
          ...details,
          ...latestTelemetry,
        });

        setHistory(
          (data?.history || [])
            .slice()
            .reverse()
            .map((item) => ({
              time: new Date(item.timestamp).toLocaleTimeString(),
              voltage: item.voltage || 0,
            })),
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  /* ===============================
     SOCKET LIVE UPDATE
  =============================== */
  useEffect(() => {
    const handleUpdate = (g) => {
      if (g.id === id) {
        setGenerator((prev) => ({
          ...prev,
          ...g,
        }));

        setHistory((prev) => [
          ...prev.slice(-19),
          {
            time: new Date().toLocaleTimeString(),
            voltage: g.voltage || 0,
          },
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

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        Loading...
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
        ? `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=15&output=embed`
        : null;

  /* ===============================
     Animated Counter
  =============================== */
  const Counter = ({ label, value, unit }) => {
    const [display, setDisplay] = useState(0);

    useEffect(() => {
      let start = 0;
      const end = Number(value || 0);
      const duration = 500;
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
      <div className="flex justify-between border-b border-white/10 pb-2">
        <span className="text-slate-300">{label}</span>
        <span className="font-semibold text-cyan-300">
          {display.toFixed(2)} {unit}
        </span>
      </div>
    );
  };

  const Detail = ({ label, value }) => (
    <div className="flex justify-between border-b border-white/10 pb-2">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium text-white">{value || "N/A"}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-blue-800 text-white p-8">
      {/* COMPANY BRANDING */}
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-white p-2 rounded-xl shadow-lg">
          <img
            src={logo}
            alt="S & S Power Solutions Lanka Logo"
            className="h-14 w-auto object-contain"
          />
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-wide">
            S & S Power Solutions Lanka
          </h1>
          <p className="text-sm text-gray-400">(Pvt) Ltd</p>
        </div>
      </div>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-10">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-5 py-2 rounded-xl transition border border-cyan-400/20"
        >
          ← Back
        </button>

        {/* 🔥 Status + ON/OFF buttons */}
        <div className="text-right">
          <h1 className="text-3xl font-bold tracking-wide">
            ⚡ Generator {generator.generatorName || id}
          </h1>

          <span
            className={`inline-block mt-2 px-4 py-1 rounded-full text-sm font-semibold
            ${
              isRunning
                ? "bg-green-500/20 text-green-400 border border-green-400 animate-pulse"
                : "bg-red-500/20 text-red-400 border border-red-400"
            }`}
          >
            {isRunning ? "● RUNNING" : "● OFF"}
          </span>

          {/* ON / OFF BUTTONS */}
          <div className="mt-4 flex justify-end gap-4">
            <button
              onClick={() => sendCommand("ON")}
              disabled={isRunning}
              className="px-5 py-2 rounded-xl bg-green-500/20 text-green-400 border border-green-400 hover:bg-green-500/40 transition disabled:opacity-40"
            >
              ON
            </button>

            <button
              onClick={() => sendCommand("OFF")}
              disabled={!isRunning}
              className="px-5 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-400 hover:bg-red-500/40 transition disabled:opacity-40"
            >
              OFF
            </button>
          </div>
        </div>
      </div>

      {/* GENERATOR INFO */}
      <div className="bg-black/40 backdrop-blur-xl border border-cyan-500/20 p-8 rounded-3xl mb-8 shadow-2xl">
        <h3 className="text-xl font-semibold mb-6">Generator Information</h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Detail label="Manufacturer" value={generator.manufacturer} />
            <Detail label="Company" value={generator.customerCompany} />
            <Detail label="Customer" value={generator.customerName} />
          </div>
          <div className="space-y-4">
            <Detail label="Contact" value={generator.customerContact} />
            <Detail label="Email" value={generator.customerEmail} />
          </div>
        </div>
      </div>

      {/* LOCATION + MAP */}
      <div className="bg-black/40 backdrop-blur-xl border border-cyan-500/20 p-8 rounded-3xl mb-8 shadow-2xl">
        <h3 className="text-xl font-semibold mb-6 border-b border-white/10 pb-3">
          📍 Location Details
        </h3>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Detail label="Address" value={address} />
            <Detail label="Latitude" value={latitude} />
            <Detail label="Longitude" value={longitude} />
          </div>

          <div className="h-64 rounded-2xl overflow-hidden border border-cyan-400/20 shadow-lg">
            {mapSrc ? (
              <iframe
                title="Generator Location"
                src={mapSrc}
                width="100%"
                height="100%"
                loading="lazy"
                className="rounded-2xl"
              ></iframe>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                Location not available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ELECTRICAL DATA */}
      <div className="bg-black/40 backdrop-blur-xl border border-cyan-500/20 p-8 rounded-3xl mb-8 shadow-2xl">
        <div className="grid md:grid-cols-2 gap-8">
          {/* GLOWING VOLTAGE */}
          <div className="bg-blue-900/30 p-6 rounded-2xl border border-cyan-400/20">
            <p className="text-slate-400 mb-2">Voltage</p>
            <p className="text-4xl font-bold text-cyan-400 animate-pulse drop-shadow-[0_0_15px_#22d3ee]">
              {Number(generator.voltage || 0).toFixed(2)} V
            </p>
          </div>

          <div className="space-y-4">
            <Counter label="Current" value={generator.current} unit="A" />
            <Counter label="Power" value={generator.power} unit="W" />
            <Counter label="Frequency" value={generator.frequency} unit="Hz" />

            {/* Temperature Warning */}
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-slate-300">Temperature</span>
              <span
                className={`font-semibold ${
                  temperature > 80
                    ? "text-red-500 animate-pulse"
                    : temperature > 60
                      ? "text-yellow-400"
                      : "text-cyan-300"
                }`}
              >
                {temperature.toFixed(2)} °C
              </span>
            </div>
          </div>
        </div>

        {/* Fuel Bar */}
        <div className="mt-8">
          <div className="flex justify-between mb-2">
            <span className="text-slate-400">Fuel Level</span>
            <span className="text-cyan-300 font-semibold">
              {fuelLevel.toFixed(2)}%
            </span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">
            <div
              className={`h-4 transition-all duration-700 ${
                fuelLevel > 60
                  ? "bg-cyan-400"
                  : fuelLevel > 30
                    ? "bg-yellow-400"
                    : "bg-red-500"
              }`}
              style={{ width: `${fuelLevel}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* CHART */}
      <div className="bg-black/40 backdrop-blur-xl border border-cyan-500/20 p-8 rounded-3xl shadow-2xl h-80">
        <h3 className="text-xl font-semibold mb-4">Voltage History</h3>

        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history}>
            <CartesianGrid stroke="#0ea5e9" />
            <XAxis dataKey="time" stroke="#cbd5e1" />
            <YAxis stroke="#cbd5e1" />
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
}

export default GeneratorDetails;
