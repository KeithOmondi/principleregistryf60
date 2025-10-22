import { useEffect, useState } from "react";
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

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const {
    totalRecords,
    approved,
    pending,
    weekly,
    monthly,
    recentRecords,
    loading,
    error,
    reportDownloading,
    reportError,
  } = useSelector((state) => state.admin);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    dispatch(fetchAdminStats());
    dispatch(fetchRecentRecords());
  }, [dispatch]);

  const handleDownloadReport = () => {
    dispatch(downloadMonthlyReport({ month: selectedMonth, year: selectedYear }));
  };

  const recordCards = [
    { title: "Total Records", value: totalRecords, color: "bg-[#0a3b1f]" },
    { title: "Approved Records", value: approved, color: "bg-[#b48222]" },
    { title: "Rejected Records", value: pending, color: "bg-[#6b1a1a]" },
  ];

  return (
    <div
      className="p-6 min-h-screen bg-cover bg-fixed bg-center"
      style={{
        backgroundImage: "url('/assets/judicial-bg.png')",
        backgroundColor: "#f9f9f9",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <img
          src="https://judiciary.go.ke/wp-content/uploads/2023/05/logo1-Copy-2.png"
          alt="Judiciary Logo"
          className="h-16 w-auto"
        />
        <h1 className="text-3xl font-bold text-[#0a3b1f]">PR Admin Dashboard</h1>
      </div>

      {/* Summary Cards */}
      <h2 className="text-xl font-semibold mb-4 text-[#b48222]">📊 Records Overview</h2>
      {loading ? (
        <p className="text-gray-500">Loading stats...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {recordCards.map((c, idx) => (
            <div key={idx} className={`${c.color} text-white rounded-lg p-6 shadow-lg`}>
              <h2 className="text-lg font-semibold">{c.title}</h2>
              <p className="text-3xl font-bold">{c.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Weekly Chart */}
      <div className="bg-white p-6 rounded-lg shadow mb-10">
        <h3 className="text-lg font-bold mb-4 text-[#0a3b1f]">📅 Weekly Statistics</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weekly}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total" stroke="#0a3b1f" />
            <Line type="monotone" dataKey="approved" stroke="#b48222" />
            <Line type="monotone" dataKey="rejected" stroke="#6b1a1a" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Chart */}
      <div className="bg-white p-6 rounded-lg shadow mb-10">
        <h3 className="text-lg font-bold mb-4 text-[#0a3b1f]">📆 Monthly Statistics</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total" stroke="#0a3b1f" />
            <Line type="monotone" dataKey="approved" stroke="#b48222" />
            <Line type="monotone" dataKey="rejected" stroke="#6b1a1a" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Report Download */}
      <div className="bg-white p-6 rounded-lg shadow mb-10">
        <h3 className="text-lg font-bold mb-4 text-[#0a3b1f]">📄 Download Monthly Report</h3>
        <div className="flex items-center gap-4">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="border rounded px-3 py-2"
          >
            {[...Array(12).keys()].map((m) => (
              <option key={m + 1} value={m + 1}>
                {new Date(0, m).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border rounded px-3 py-2 w-24"
          />
          <button
            onClick={handleDownloadReport}
            className="bg-[#0a3b1f] text-white px-4 py-2 rounded hover:bg-[#083018]"
            disabled={reportDownloading}
          >
            {reportDownloading ? "Downloading..." : "Download Report"}
          </button>
        </div>
        {reportError && <p className="text-red-600 mt-2">{reportError}</p>}
      </div>

      {/* Recent Records Table */}
      <div className="bg-white p-6 rounded-lg shadow mb-10">
        <h3 className="text-lg font-bold mb-4 text-[#0a3b1f]">📝 Recently Added Records</h3>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg">
            <thead className="bg-[#0a3b1f] text-white">
              <tr>
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Cause No.</th>
                <th className="px-4 py-2">Deceased</th>
                <th className="px-4 py-2">Court</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Date Received</th>
              </tr>
            </thead>
            <tbody>
              {recentRecords.slice(0, 10).map((r, idx) => (
                <tr key={r._id} className="text-center border-b">
                  <td className="px-4 py-2">{idx + 1}</td>
                  <td className="px-4 py-2">{r.causeNo}</td>
                  <td className="px-4 py-2">{r.nameOfDeceased}</td>
                  <td className="px-4 py-2">{r.courtStation?.name}</td>
                  <td
                    className={`px-4 py-2 font-semibold ${
                      r.form60Compliance === "Approved"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {r.form60Compliance}
                  </td>
                  <td className="px-4 py-2">
                    {new Date(r.dateReceived).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {recentRecords.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-gray-500 py-4">
                    No recent records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Error */}
      {error && <p className="text-red-600 mt-6 font-semibold">⚠️ {error}</p>}
    </div>
  );
};

export default AdminDashboard;
