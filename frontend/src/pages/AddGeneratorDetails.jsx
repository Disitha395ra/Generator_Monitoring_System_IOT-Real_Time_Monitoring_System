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
      <div className="min-h-screen flex items-center justify-center text-white bg-slate-900">
        Loading Map...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-r from-slate-900 to-blue-950 text-white px-12 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-12">
        <CompanyLogo size={60} />
        <button
          onClick={() => navigate("/dashboard")}
          className="px-6 py-2 border border-blue-400 text-blue-300 rounded-md hover:bg-blue-500 hover:text-white transition"
        >
          Back
        </button>
      </div>

      <h2 className="text-3xl font-bold text-blue-400 mb-10">
        Generator Installation Registration
      </h2>

      <form onSubmit={handleSubmit} className="space-y-12">
        {/* Generator Info */}
        <div className="grid md:grid-cols-3 gap-10">
          <div>
            <label className="text-blue-300 text-sm mb-1 block">
              Project / Topic ID
            </label>
            <input
              name="topicId"
              onChange={handleChange}
              required
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="text-blue-300 text-sm mb-1 block">
              Generator Model Name
            </label>
            <input
              name="generatorName"
              onChange={handleChange}
              required
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="text-blue-300 text-sm mb-1 block">
              Manufacturer
            </label>
            <input
              name="manufacturer"
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2"
            />
          </div>
        </div>

        {/* Map */}
        <div>
          <label className="text-blue-300 text-sm mb-3 block">
            Installation Location
          </label>

          <div className="rounded-xl overflow-hidden border border-slate-700">
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={10}
              onClick={handleMapClick}
            >
              {marker && <Marker position={marker} />}
            </GoogleMap>
          </div>

          <input
            name="address"
            value={form.address}
            readOnly
            placeholder="Selected Address"
            className="w-full mt-4 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2"
          />
        </div>

        {/* Customer */}
        <div className="grid md:grid-cols-4 gap-10">
          <input
            name="customerName"
            placeholder="Customer Name"
            onChange={handleChange}
            className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2"
          />

          <input
            name="customerCompany"
            placeholder="Customer Company"
            onChange={handleChange}
            className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2"
          />

          <input
            name="customerContact"
            placeholder="Customer Contact"
            onChange={handleChange}
            className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2"
          />

          <input
            name="customerEmail"
            placeholder="Customer Email"
            onChange={handleChange}
            className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="text-blue-300 text-sm mb-1 block">
            Additional Notes
          </label>
          <textarea
            name="notes"
            onChange={handleChange}
            className="w-full h-28 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2"
          />
        </div>

        {/* SERVICE DETAILS */}
        <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-blue-400 mb-6">
            Service Details
          </h3>

          <div className="grid md:grid-cols-5 gap-6">
            {/* Service Name */}
            <div>
              <label className="block text-sm text-blue-300 mb-1">
                Service Name
              </label>
              <input
                name="serviceName"
                onChange={handleChange}
                placeholder="Service Name"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2"
              />
            </div>

            {/* Service Date */}
            <div>
              <label className="block text-sm text-blue-300 mb-1">
                Service Date
              </label>
              <input
                type="date"
                name="serviceDate"
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2"
              />
            </div>

            {/* Next Service Date */}
            <div>
              <label className="block text-sm text-blue-300 mb-1">
                Next Service Date
              </label>
              <input
                type="date"
                name="nextServiceDate"
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2"
              />
            </div>

            {/* Technician */}
            <div>
              <label className="block text-sm text-blue-300 mb-1">
                Technician
              </label>
              <input
                name="technician"
                onChange={handleChange}
                placeholder="Technician Name"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2"
              />
            </div>

            {/* Service Notes */}
            <div>
              <label className="block text-sm text-blue-300 mb-1">
                Service Notes
              </label>
              <input
                name="serviceNotes"
                onChange={handleChange}
                placeholder="Notes"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-8 pt-8">
          <button
            type="submit"
            className="px-10 py-3 bg-blue-600 hover:bg-blue-500 rounded-md font-semibold"
          >
            Save Details
          </button>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="px-10 py-3 bg-gray-700 hover:bg-gray-600 rounded-md"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddGeneratorDetails;
