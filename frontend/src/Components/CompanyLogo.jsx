import logo from "../assets/logo.png"; // adjust path if needed

function CompanyLogo({ size = 70 }) {
  return (
    <div className="flex items-center gap-4">
      {/* LOGO IMAGE */}
      <div
        className="rounded-2xl overflow-hidden shadow-xl bg-white p-2 flex items-center justify-center"
        style={{
          width: size,
          height: size,
        }}
      >
        <img
          src={logo}
          alt="S & S Power Solutions Lanka Logo"
          className="object-contain w-full h-full"
        />
      </div>

      {/* COMPANY NAME */}
      <div className="leading-tight">
        <h1 className="text-2xl font-bold tracking-wide text-white">
          S & S Power Solutions Lanka
        </h1>
        <p className="text-sm text-gray-400">(Pvt) Ltd</p>
        <p className="text-xs text-cyan-400 mt-1">
          Generator Monitoring & Power Engineering Solutions
        </p>
      </div>
    </div>
  );
}

export default CompanyLogo;
