import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import CompanyLogo from "../Components/CompanyLogo";

const containerStyle = {
  width: "100%",
  height: "380px",
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
      <div className="min-h-screen flex items-center justify-center text-white bg-gradient-to-r from-[#0f172a] to-[#0a2a66]">
        Loading Map...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#0f172a] to-[#0a2a66] text-white px-12 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-12">
        <CompanyLogo size={60} />
        <button
          onClick={() => navigate("/dashboard")}
          className="px-6 py-2 border border-white/30 rounded-md hover:bg-white/10 transition"
        >
          Back
        </button>
      </div>

      <h2 className="text-3xl font-bold text-blue-400 mb-10">
        Generator Installation Registration
      </h2>

      <form onSubmit={handleSubmit} className="space-y-16">
        {/* Row 1 */}
        <div className="grid md:grid-cols-3 gap-10">
          <div>
            <label className="label-style">Project / Topic ID</label>
            <input
              name="topicId"
              onChange={handleChange}
              required
              className="input-style"
            />
          </div>

          <div>
            <label className="label-style">Generator Model Name</label>
            <input
              name="generatorName"
              onChange={handleChange}
              required
              className="input-style"
            />
          </div>

          <div>
            <label className="label-style">Manufacturer</label>
            <input
              name="manufacturer"
              onChange={handleChange}
              className="input-style"
            />
          </div>
        </div>

        {/* Row 2 - Map */}
        <div>
          <label className="label-style mb-4 block">
            Installation Location
          </label>

          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={10}
            onClick={handleMapClick}
          >
            {marker && <Marker position={marker} />}
          </GoogleMap>

          <input
            name="address"
            value={form.address}
            readOnly
            placeholder="Selected Address"
            className="input-style mt-6 w-full"
          />
        </div>

        {/* Row 3 */}
        <div className="grid md:grid-cols-4 gap-10">
          <div>
            <label className="label-style">Customer Name</label>
            <input
              name="customerName"
              onChange={handleChange}
              className="input-style"
            />
          </div>

          <div>
            <label className="label-style">Customer Company</label>
            <input
              name="customerCompany"
              onChange={handleChange}
              className="input-style"
            />
          </div>

          <div>
            <label className="label-style">Customer Contact</label>
            <input
              name="customerContact"
              onChange={handleChange}
              className="input-style"
            />
          </div>

          <div>
            <label className="label-style">Customer Email</label>
            <input
              name="customerEmail"
              onChange={handleChange}
              className="input-style"
            />
          </div>
        </div>

        {/* Row 4 */}
        <div>
          <label className="label-style">Additional Notes</label>
          <textarea
            name="notes"
            onChange={handleChange}
            className="input-style w-full h-28"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-8 pt-8">
          <button
            type="submit"
            className="px-10 py-3 bg-blue-700 hover:bg-blue-600 rounded-md font-semibold transition"
          >
            Save Details
          </button>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="px-10 py-3 bg-gray-700 hover:bg-gray-600 rounded-md font-semibold transition"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Styles */}
      <style>
        {`
          .label-style {
            display: block;
            margin-bottom: 8px;
            font-size: 14px;
            color: #93c5fd;
            font-weight: 500;
          }

          .input-style {
            width: 100%;
            padding: 10px;
            border-radius: 6px;
            background: transparent;
            border-bottom: 1px solid rgba(147,197,253,0.4);
            color: white;
            outline: none;
          }

          .input-style:focus {
            border-bottom: 1px solid #3b82f6;
          }

          .input-style::placeholder {
            color: #cbd5e1;
          }
        `}
      </style>
    </div>
  );
}

export default AddGeneratorDetails;
