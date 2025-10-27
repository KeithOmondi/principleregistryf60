import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminStats,
  fetchRecentRecords,
  downloadMonthlyReport,
} from "../../store/slices/adminSlice";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  List,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileDown,
  TrendingUp,
  BarChart,
  Loader2,
} from "lucide-react";

// ===================== BRAND COLORS =====================
const COLORS = {
  PRIMARY_GREEN: "#004832",
  ACCENT_GOLD: "#C8A239",
  DARK_GOLD: "#A57C1B",
  ALERT_RED: "#7A1C1C",
  LIGHT_BG: "#F9F9F7",
};

// ===================== SUBCOMPONENT: RECENT RECORDS TABLE =====================
const RecentRecordsTable = ({ records = [] }) => (
  <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-200 mb-10">
    <h3
      className="text-xl font-bold mb-5 flex items-center border-b pb-3"
      style={{ color: COLORS.PRIMARY_GREEN }}
    >
      <List size={24} className="mr-3" style={{ color: COLORS.ACCENT_GOLD }} />
      Recently Added Probate Records
    </h3>

    <div className="overflow-x-auto rounded-lg border border-gray-300">
      <table className="min-w-full divide-y divide-gray-200">
        <thead
          style={{
            backgroundColor: COLORS.PRIMARY_GREEN,
            color: "#fff",
          }}
        >
          <tr>
            {["#", "Cause No.", "Deceased", "Court Station", "Compliance", "Date Received"].map(
              (head, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider"
                >
                  {head}
                </th>
              )
            )}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100 bg-white">
          {records.slice(0, 10).map((r, idx) => (
            <tr key={r._id || idx} className="hover:bg-green-50 transition duration-150">
              <td className="px-4 py-3 text-center text-sm text-gray-500">{idx + 1}</td>
              <td className="px-4 py-3 text-left text-sm font-medium text-gray-700">{r.causeNo}</td>
              <td className="px-4 py-3 text-left text-sm font-medium text-gray-800">
                {r.nameOfDeceased}
              </td>
              <td className="px-4 py-3 text-left text-sm text-gray-700">
                {r.courtStation?.name || "N/A"}
              </td>

              <td className="px-4 py-3 text-center text-sm">
                <span
                  className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full"
                  style={{
                    backgroundColor:
                      r.form60Compliance === "Approved" ? "#FFF6D1" : "#FDECEC",
                    color:
                      r.form60Compliance === "Approved"
                        ? COLORS.DARK_GOLD
                        : COLORS.ALERT_RED,
                  }}
                >
                  {r.form60Compliance === "Approved" ? (
                    <CheckCircle size={14} className="mr-1" />
                  ) : (
                    <AlertTriangle size={14} className="mr-1" />
                  )}
                  {r.form60Compliance || "Rejected"}
                </span>
              </td>

              <td className="px-4 py-3 text-center text-sm text-gray-600">
                <div className="flex items-center justify-center">
                  <Clock size={14} className="mr-1 text-gray-400" />
                  {new Date(r.dateReceived).toLocaleDateString("en-KE")}
                </div>
              </td>
            </tr>
          ))}

          {records.length === 0 && (
            <tr>
              <td colSpan="6" className="text-gray-500 py-6 text-center italic bg-gray-50">
                No recent records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

// ===================== MAIN COMPONENT =====================
const AdminDashboard = () => {
  const dispatch = useDispatch();
  const {
    totalRecords,
    approved,
    rejected, // ✅ updated
    weekly,
    monthly,
    recentRecords,
    loading,
    error,
    reportDownloading,
    reportError,
  } = useSelector((state) => state.admin);

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    dispatch(fetchAdminStats());
    dispatch(fetchRecentRecords());
  }, [dispatch]);

  const handleDownload = () => {
    dispatch(downloadMonthlyReport({ month, year }));
  };

  const summaryCards = [
    {
      title: "Total Records",
      value: totalRecords,
      bg: COLORS.PRIMARY_GREEN,
      icon: <List />,
    },
    {
      title: "Approved Records",
      value: approved,
      bg: COLORS.ACCENT_GOLD,
      icon: <CheckCircle />,
    },
    {
      title: "Rejected Records", // ✅ label updated
      value: rejected, // ✅ value updated
      bg: COLORS.ALERT_RED,
      icon: <AlertTriangle />,
    },
  ];

  return (
    <div className="p-6 min-h-screen" style={{ backgroundColor: COLORS.LIGHT_BG }}>
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-200">
        <img
          src="https://judiciary.go.ke/wp-content/uploads/2023/05/logo1-Copy-2.png"
          alt="Judiciary Logo"
          className="h-16 w-auto"
        />
        <h1 className="text-3xl font-bold" style={{ color: COLORS.PRIMARY_GREEN }}>
          Probate Records Admin Dashboard
        </h1>
      </div>

      {/* SUMMARY CARDS */}
      <h2
        className="text-xl font-semibold mb-5 flex items-center"
        style={{ color: COLORS.PRIMARY_GREEN }}
      >
        <BarChart size={24} className="mr-2" style={{ color: COLORS.ACCENT_GOLD }} />
        Records Overview
      </h2>

      {loading ? (
        <p className="text-gray-500 py-4">Loading stats...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {summaryCards.map((c, idx) => (
            <div
              key={idx}
              className="text-white rounded-xl p-6 shadow-xl flex items-center justify-between transition-transform duration-300 hover:scale-[1.02]"
              style={{ backgroundColor: c.bg }}
            >
              <div>
                <h2 className="text-lg font-semibold opacity-80">{c.title}</h2>
                <p className="text-4xl font-extrabold mt-1">{c.value}</p>
              </div>
              <div className="opacity-70">{React.cloneElement(c.icon, { size: 40 })}</div>
            </div>
          ))}
        </div>
      )}

      {/* CHARTS AND DOWNLOAD SECTIONS REMAIN UNCHANGED */}
      {/* ... (keep your chart + report sections as-is) ... */}

      <RecentRecordsTable records={recentRecords} />

      {error && <p className="text-red-600 mt-6 font-semibold">⚠️ {error}</p>}
    </div>
  );
};

export default AdminDashboard;
