import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminStats, fetchBulkStats } from "../../store/slices/adminSlice";
import { ChevronDown, ChevronRight } from "lucide-react";

// ✅ Collapsible reusable section
const CollapsibleSection = ({ title, icon, children }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-8">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
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

  // Fetch both record stats and bulk stats
  useEffect(() => {
    dispatch(fetchAdminStats());
    dispatch(fetchBulkStats());
  }, [dispatch]);

  const recordCards = [
    { title: "Total Records", value: totalRecords, color: "bg-blue-500" },
    { title: "Approved Records", value: approved, color: "bg-green-500" },
    { title: "Pending Records", value: pending, color: "bg-yellow-500" },
  ];

  const bulkCards = [
    { title: "Total Bulk Cases", value: totalCases, color: "bg-purple-500" },
    { title: "Total Courts Covered", value: totalCourts, color: "bg-pink-500" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Record Stats */}
      <h2 className="text-xl font-semibold mb-4">📊 Records Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {recordCards.map((c, idx) => (
          <div
            key={idx}
            className={`${c.color} text-white rounded-lg p-6 shadow-md`}
          >
            <h2 className="text-lg font-semibold">{c.title}</h2>
            <p className="text-3xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Bulk Stats */}
      <h2 className="text-xl font-semibold mb-4">📦 Bulk Gazette Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {bulkCards.map((c, idx) => (
          <div
            key={idx}
            className={`${c.color} text-white rounded-lg p-6 shadow-md`}
          >
            <h2 className="text-lg font-semibold">{c.title}</h2>
            <p className="text-3xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Collapsible Sections */}
      <CollapsibleSection title="📚 Cases by Volume">
        {byVolume && Object.keys(byVolume).length > 0 ? (
          <div className="bg-white shadow rounded-lg p-4">
            <ul className="divide-y divide-gray-200">
              {Object.entries(byVolume).map(([volume, count]) => (
                <li
                  key={volume}
                  className="py-2 flex justify-between items-center hover:bg-gray-50 rounded-md px-2 transition"
                >
                  <span className="font-medium text-gray-700">
                    Volume {volume}
                  </span>
                  <span className="text-blue-600 font-semibold">
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

      <CollapsibleSection title="🕒 Recent Records">
        {loading ? (
          <p className="text-gray-500">Loading recent records...</p>
        ) : recentRecords.length > 0 ? (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {recentRecords.map((r) => (
                <li
                  key={r._id}
                  className="p-4 hover:bg-gray-50 flex justify-between transition"
                >
                  <div>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">{r.courtStation}</span>
                    </p>
                    <p className="text-xs text-gray-500">
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

      <CollapsibleSection title="📰 Recent Bulk Gazette Uploads">
        {loading ? (
          <p className="text-gray-500">Loading recent bulk...</p>
        ) : recentBulk.length > 0 ? (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {recentBulk.map((b, idx) => (
                <li
                  key={idx}
                  className="p-4 hover:bg-gray-50 flex justify-between items-center transition"
                >
                  <div>
                    <p className="font-medium text-gray-700">
                      Volume {b.volumeNo}
                    </p>
                    <p className="text-xs text-gray-500">
                      Published:{" "}
                      {b.datePublished
                        ? new Date(b.datePublished).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>
                  <span className="text-blue-600 font-semibold">
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
      {error && <p className="text-red-500 mt-6">⚠️ {error}</p>}
    </div>
  );
};

export default AdminDashboard;
