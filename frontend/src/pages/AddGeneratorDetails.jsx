import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Cpu,
  Building2,
  User,
  Phone,
  Mail,
  StickyNote,
  Wrench,
  Calendar,
  Save,
  X,
  Server
} from "lucide-react";
import CompanyLogo from "../Components/CompanyLogo";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: 6.9271,
  lng: 79.8612,
};

function AddGeneratorDetails() {
  const navigate = useNavigate();

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "YOUR_GOOGLE_MAP_API_KEY",
  });

  const [marker, setMarker] = useState(null);

  const [form, setForm] = useState({
    topicId: "",
    generatorName: "",
    manufacturer: "",
    address: "",
    lat: "",
    lng: "",
    customerName: "",
    customerCompany: "",
    customerContact: "",
    customerEmail: "",
    notes: "",

    // SERVICE FIELDS
    serviceName: "",
    serviceDate: "",
    nextServiceDate: "",
    technician: "",
    serviceNotes: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleMapClick = useCallback((event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    setMarker({ lat, lng });

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results[0]) {
        setForm((prev) => ({
          ...prev,
          lat,
          lng,
          address: results[0].formatted_address,
        }));
      }
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/generator-details",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            topicId: form.topicId,
            generatorName: form.generatorName,
            manufacturer: form.manufacturer,
            location: {
              lat: Number(form.lat),
              lng: Number(form.lng),
              address: form.address,
            },
            customerName: form.customerName,
            customerCompany: form.customerCompany,
            customerContact: form.customerContact,
            customerEmail: form.customerEmail,
            notes: form.notes,

            // SERVICE HISTORY
            serviceHistory: [
              {
                serviceName: form.serviceName,
                serviceDate: form.serviceDate,
                nextServiceDate: form.nextServiceDate,
                technician: form.technician,
                notes: form.serviceNotes,
              },
            ],
          }),
        },
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed");

      alert("Generator Details Added Successfully");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Error saving generator details");
    }
  };

  if (!isLoaded)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070B14] text-white">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400 font-medium tracking-wide">Initializing Maps...</p>
        </div>
      </div>
    );

  const InputGroup = ({ icon: Icon, label, name, placeholder, type = "text", required = false }) => (
    <div>
      <label className="text-slate-400 text-[0.65rem] font-bold uppercase tracking-widest mb-2 block ml-1">
        {label} {required && <span className="text-cyan-500">*</span>}
      </label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Icon className="h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
        </div>
        <input
          type={type}
          name={name}
          onChange={handleChange}
          required={required}
          value={form[name]}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/50 border border-white/5 text-white placeholder-slate-600 focus:bg-slate-900/80 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all text-sm shadow-inner"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#070B14] text-white p-4 md:p-8 relative overflow-hidden">
      {/* Dynamic Backgrounds */}
      <div className="absolute top-0 right-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none fixed" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[60%] bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none fixed" />

      {/* HEADER CONTENT */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-6 bg-white/[0.02] backdrop-blur-2xl border border-white/5 p-6 rounded-[2rem] shadow-2xl"
      >
        <div className="flex items-center gap-6">
          <CompanyLogo size={60} />
          <div>
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-1">
              Node Registration
            </h2>
            <p className="text-slate-400 text-sm font-medium tracking-wide flex items-center gap-2">
              <Server size={14} className="text-cyan-400" /> Commission New Generator Unit
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 transition-all font-semibold text-sm"
        >
          <ArrowLeft size={16} /> Dashboard
        </button>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="space-y-6 relative z-10 max-w-6xl mx-auto"
      >
        <div className="grid lg:grid-cols-2 gap-6">
          {/* HARDWARE DETAILS */}
          <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 p-6 md:p-8 rounded-3xl shadow-xl space-y-6">
            <h3 className="text-[0.8rem] font-bold text-slate-300 uppercase tracking-widest border-b border-white/5 pb-3 flex items-center gap-2">
              <Server size={16} className="text-cyan-400" /> Hardware Specification
            </h3>
            <div className="space-y-5">
              <InputGroup icon={Cpu} label="System Topic ID" name="topicId" placeholder="e.g. gen-001" required />
              <InputGroup icon={Server} label="Generator Model" name="generatorName" placeholder="Model Name/Number" required />
              <InputGroup icon={Wrench} label="Manufacturer" name="manufacturer" placeholder="e.g. Caterpillar" />
            </div>

            <h3 className="text-[0.8rem] font-bold text-slate-300 uppercase tracking-widest border-b border-white/5 pb-3 pt-4 flex items-center gap-2">
              <User size={16} className="text-cyan-400" /> Client Information
            </h3>
            <div className="grid sm:grid-cols-2 gap-5">
              <InputGroup icon={User} label="Client Name" name="customerName" placeholder="Primary Contact" />
              <InputGroup icon={Building2} label="Company" name="customerCompany" placeholder="Organization" />
              <InputGroup icon={Phone} label="Contact Number" name="customerContact" placeholder="+94 XX XXX XXXX" />
              <InputGroup icon={Mail} label="Email Address" name="customerEmail" type="email" placeholder="contact@company.com" />
            </div>

            <div className="pt-2">
              <label className="text-slate-400 text-[0.65rem] font-bold uppercase tracking-widest mb-2 block ml-1 flex items-center gap-1">
                <StickyNote size={12} /> Remarks
              </label>
              <textarea
                name="notes"
                onChange={handleChange}
                placeholder="Additional installation notes..."
                className="w-full p-4 rounded-xl bg-slate-900/50 border border-white/5 text-white placeholder-slate-600 focus:bg-slate-900/80 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all text-sm shadow-inner min-h-[100px] resize-none"
              />
            </div>
          </div>

          <div className="space-y-6 flex flex-col">
            {/* GEOLOCATION */}
            <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 p-6 md:p-8 rounded-3xl shadow-xl flex-1 flex flex-col">
              <h3 className="text-[0.8rem] font-bold text-slate-300 uppercase tracking-widest border-b border-white/5 pb-3 mb-5 flex items-center gap-2">
                <MapPin size={16} className="text-cyan-400" /> Deployment Geolocation
              </h3>

              <div className="rounded-2xl overflow-hidden border border-white/5 shadow-inner flex-1 min-h-[300px] mb-5">
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={center}
                  zoom={10}
                  onClick={handleMapClick}
                  options={{
                    styles: [
                      { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                      { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                      { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                      { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
                    ]
                  }}
                >
                  {marker && <Marker position={marker} />}
                </GoogleMap>
              </div>

              <div className="relative group mt-auto">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <MapPin className="h-4 w-4 text-cyan-500" />
                </div>
                <input
                  name="address"
                  value={form.address}
                  readOnly
                  placeholder="Click on the map to select location..."
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 text-cyan-100 placeholder-slate-500 outline-none text-sm shadow-[0_0_15px_rgba(8,145,178,0.1)] font-medium"
                />
              </div>
            </div>

            {/* INITIAL SERVICE RECORD */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-cyan-500/20 p-6 md:p-8 rounded-3xl shadow-xl">
              <h3 className="text-[0.8rem] font-bold text-cyan-400 uppercase tracking-widest border-b border-white/5 pb-3 mb-5 flex items-center gap-2">
                <Wrench size={16} /> Initial Maintenance Record
              </h3>

              <div className="grid sm:grid-cols-2 gap-5 mb-5">
                <InputGroup icon={StickyNote} label="Service Event" name="serviceName" placeholder="e.g. Installation Check" />
                <InputGroup icon={User} label="Technician" name="technician" placeholder="Lead Engineer Name" />
                <InputGroup icon={Calendar} label="Date Performed" name="serviceDate" type="date" />
                <InputGroup icon={Calendar} label="Next Due Date" name="nextServiceDate" type="date" />
              </div>

              <div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-top pt-3.5 pointer-events-none">
                    <StickyNote className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    name="serviceNotes"
                    onChange={handleChange}
                    placeholder="Maintenance Remarks..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/50 border border-white/5 text-white placeholder-slate-600 focus:bg-slate-900/80 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all text-sm shadow-inner"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-end pt-8 pb-12"
        >
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl font-bold tracking-wide transition-all text-sm order-2 sm:order-1"
          >
            <X size={18} /> CANCEL
          </button>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-10 py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl font-bold tracking-wide transition-all shadow-[0_0_20px_rgba(8,145,178,0.3)] hover:shadow-[0_0_30px_rgba(8,145,178,0.5)] text-sm order-1 sm:order-2"
          >
            <Save size={18} /> COMMISSION NODE
          </button>
        </motion.div>
      </motion.form>
    </div>
  );
}

export default AddGeneratorDetails;
