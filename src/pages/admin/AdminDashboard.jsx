import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminStats, fetchBulkStats } from "../../store/slices/adminSlice";
import { ChevronDown, ChevronRight } from "lucide-react";

// ✅ Collapsible reusable section styled with Judiciary theme
const CollapsibleSection = ({ title, icon, children }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-8">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full bg-[#0a3b1f] text-white px-4 py-2 rounded-lg hover:bg-[#145c32] transition"
      >
        <div className="flex items-center gap-2 text-lg font-semibold">
          {icon} {title}
        </div>
        {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
      </button>

      <div
        className={`transition-all duration-300 overflow-hidden ${
          open ? "max-h-screen mt-3" : "max-h-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const {
    totalRecords,
    approved,
    pending,
    recentRecords,
    totalCases,
    totalCourts,
    byVolume,
    recentBulk,
    loading,
    error,
  } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAdminStats());
    dispatch(fetchBulkStats());
  }, [dispatch]);

  // Judiciary theme applied
  const recordCards = [
    { title: "Total Records", value: totalRecords, color: "bg-[#0a3b1f]" },
    { title: "Approved Records", value: approved, color: "bg-[#b48222]" },
    { title: "Pending Records", value: pending, color: "bg-[#0a3b1f]" },
  ];

  const bulkCards = [
    { title: "Total Bulk Cases", value: totalCases, color: "bg-[#b48222]" },
    { title: "Total Courts Covered", value: totalCourts, color: "bg-[#0a3b1f]" },
  ];

  return (
    <div
      className="p-6 min-h-screen bg-cover bg-fixed bg-center"
      style={{
        backgroundImage: "url('/assets/judicial-bg.png')", // 🔑 Add a subtle branded background pattern
        backgroundColor: "#f9f9f9", // fallback
      }}
    >
      {/* Header with Judiciary Logo */}
      <div className="flex items-center gap-4 mb-8">
        <img
          src="https://judiciary.go.ke/wp-content/uploads/2023/05/logo1-Copy-2.png" // 🔑 Place logo in your public/assets folder
          alt="Judiciary Logo"
          className="h-16 w-auto"
        />
        <h1 className="text-3xl font-bold text-[#0a3b1f]">
          PR Admin Dashboard
        </h1>
      </div>

      {/* Record Stats */}
      <h2 className="text-xl font-semibold mb-4 text-[#b48222]">
        📊 Records Overview
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {recordCards.map((c, idx) => (
          <div
            key={idx}
            className={`${c.color} text-white rounded-lg p-6 shadow-lg`}
          >
            <h2 className="text-lg font-semibold">{c.title}</h2>
            <p className="text-3xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Bulk Stats */}
      <h2 className="text-xl font-semibold mb-4 text-[#b48222]">
        📦 Bulk Gazette Overview
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {bulkCards.map((c, idx) => (
          <div
            key={idx}
            className={`${c.color} text-white rounded-lg p-6 shadow-lg`}
          >
            <h2 className="text-lg font-semibold">{c.title}</h2>
            <p className="text-3xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Collapsible Sections */}
      <CollapsibleSection title="📚 Cases by Volume" icon={<ChevronRight />}>
        {byVolume && Object.keys(byVolume).length > 0 ? (
          <div className="bg-white shadow rounded-lg p-4">
            <ul className="divide-y divide-gray-200">
              {Object.entries(byVolume).map(([volume, count]) => (
                <li
                  key={volume}
                  className="py-2 flex justify-between items-center hover:bg-[#f1f1f1] rounded-md px-2 transition"
                >
                  <span className="font-medium text-[#0a3b1f]">
                    Volume {volume}
                  </span>
                  <span className="text-[#b48222] font-semibold">
                    {count} cases
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-gray-500 italic">No volume breakdown available.</p>
        )}
      </CollapsibleSection>

      <CollapsibleSection title="🕒 Recent Records" icon={<ChevronRight />}>
        {loading ? (
          <p className="text-gray-500">Loading recent records...</p>
        ) : recentRecords.length > 0 ? (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {recentRecords.map((r) => (
                <li
                  key={r._id}
                  className="p-4 hover:bg-[#f1f1f1] flex justify-between transition"
                >
                  <div>
                    <p className="text-sm text-[#0a3b1f] font-medium">
                      {r.courtStation}
                    </p>
                    <p className="text-xs text-gray-600">
                      Cause: {r.causeNo} | Deceased: {r.nameOfDeceased}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      r.statusAtGP === "Approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {r.statusAtGP}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-gray-500 italic">No recent records found.</p>
        )}
      </CollapsibleSection>

      <CollapsibleSection
        title="📰 Recent Bulk Gazette Uploads"
        icon={<ChevronRight />}
      >
        {loading ? (
          <p className="text-gray-500">Loading recent bulk...</p>
        ) : recentBulk.length > 0 ? (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {recentBulk.map((b, idx) => (
                <li
                  key={idx}
                  className="p-4 hover:bg-[#f1f1f1] flex justify-between items-center transition"
                >
                  <div>
                    <p className="font-medium text-[#0a3b1f]">
                      Volume {b.volumeNo}
                    </p>
                    <p className="text-xs text-gray-600">
                      Published:{" "}
                      {b.datePublished
                        ? new Date(b.datePublished).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>
                  <span className="text-[#b48222] font-semibold">
                    {b.totalCases} cases
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-gray-500 italic">No recent bulk uploads found.</p>
        )}
      </CollapsibleSection>

      {/* Error handling */}
      {error && <p className="text-red-600 mt-6 font-semibold">⚠️ {error}</p>}
    </div>
  );
};

export default AdminDashboard;
