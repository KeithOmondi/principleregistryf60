import React, { useEffect, useState, useMemo } from "react";
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
}
 from "recharts";
import {
  List,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileDown,
  Loader2,
  BarChart,
  TrendingUp,
} from "lucide-react";

// ===================== BRAND COLORS =====================
const COLORS = {
  PRIMARY_GREEN: "#004832",
  ACCENT_GOLD: "#C8A239",
  DARK_GOLD: "#A57C1B",
  ALERT_RED: "#7A1C1C",
  LIGHT_BG: "#F9F9F7",
};

// ===================== CUSTOM TOOLTIP (Updated for Multi-Line Data) =====================
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="p-3 shadow-lg rounded-lg text-sm border-2"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: COLORS.PRIMARY_GREEN, // Use primary color for consistency
          color: COLORS.PRIMARY_GREEN,
        }}
      >
        <p className="font-bold mb-1">{label}</p>
        {payload.map((item, index) => (
            <p key={index} className="text-gray-700 mt-1 flex justify-between gap-4">
                <span className="font-medium" style={{ color: item.stroke }}>{item.name}:</span>
                <span className="font-extrabold" style={{ color: item.stroke }}>{`${item.value}`}</span>
            </p>
        ))}
      </div>
    );
  }
  return null;
};

// ===================== RECENT RECORDS TABLE (Retained) =====================
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

// ===================== MAIN DASHBOARD =====================
const AdminDashboard = () => {
  const dispatch = useDispatch();
  const {
    totalRecords,
    approved,
    rejected,
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
  
  // =======================================================
  // 🎯 DATA TRANSFORMATION FOR GRAPHS (RE-INTRODUCED)
  // =======================================================
  
  const MONTH_NAMES = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // Helper function to format weekly data labels
  const formatWeeklyData = (data) => {
    // Reverse the data so it reads from oldest (left) to newest (right)
    return [...data].reverse().map((w, index) => ({
      ...w,
      // Map the week string to a simple "Week X" label for the XAxis
      weekLabel: `Week ${index + 1}`,
    }));
  };

  // Helper function to format monthly data labels
  const formatMonthlyData = (data) => {
    // Reverse the data so it reads from oldest (left) to newest (right)
    return [...data].reverse().map(m => {
      // Assuming 'month' is formatted as "M/YYYY" (e.g., "11/2025")
      const [monthNum, year] = m.month.split('/').map(Number);
      return {
        ...m,
        // Map the month number to a readable "MMM YYYY" format
        monthLabel: `${MONTH_NAMES[monthNum - 1]} ${year}`,
      };
    });
  };

  // Use useMemo to ensure formatted data is only recalculated when weekly/monthly changes
  const formattedWeeklyData = useMemo(() => formatWeeklyData(weekly), [weekly]);
  const formattedMonthlyData = useMemo(() => formatMonthlyData(monthly), [monthly]);
  
  // =======================================================
  // 🎯 END DATA TRANSFORMATION
  // =======================================================

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
      title: "Rejected Records",
      value: rejected,
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
      <h2 className="text-xl font-semibold mb-5 flex items-center" style={{ color: COLORS.PRIMARY_GREEN }}>
        <BarChart size={24} className="mr-2" style={{ color: COLORS.ACCENT_GOLD }} />
        Records Overview
      </h2>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-10 w-10 animate-spin" style={{ color: COLORS.PRIMARY_GREEN }} />
          <p className="ml-3 text-lg text-gray-600">Loading Dashboard Data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {summaryCards.map((c, idx) => (
            <div
              key={idx}
              className="text-white rounded-xl p-6 shadow-xl flex items-center justify-between transition-transform duration-300 hover:scale-[1.02] transform"
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

      
      <p className="font-bold">Performance Graphs</p>
    

      {/* CHARTS CONTAINER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        
        {/* 1. WEEKLY COMPLIANCE TREND CHART (MULTI-LINE, CLEAN LABELS) */}
        <div className="bg-white p-6 rounded-xl shadow-xl border-t-4" style={{ borderTopColor: COLORS.PRIMARY_GREEN }}>
          <h3 className="text-lg font-bold mb-4 flex items-center" style={{ color: COLORS.PRIMARY_GREEN }}>
            <TrendingUp size={20} className="mr-2" style={{ color: COLORS.ACCENT_GOLD }} />
            Weekly Record Compliance Trend
          </h3>
          {formattedWeeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={formattedWeeklyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                <XAxis 
                  dataKey="weekLabel" // **FIXED: Use formatted data key**
                  stroke="#555" 
                  fontSize={12} 
                  interval={0} 
                  angle={-15} 
                  textAnchor="end" 
                  height={45} 
                />
                <YAxis allowDecimals={false} stroke="#555" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '15px' }} />
                
                {/* Approved Records Line (PRIMARY GREEN) */}
                <Line
                  type="monotone"
                  dataKey="approved" 
                  name="Approved"
                  stroke={COLORS.PRIMARY_GREEN}
                  strokeWidth={3}
                  dot={{ r: 4, fill: COLORS.PRIMARY_GREEN }}
                  activeDot={{ r: 6, stroke: COLORS.ACCENT_GOLD, strokeWidth: 2 }}
                />
                
                {/* Rejected Records Line (ACCENT GOLD) */}
                <Line
                  type="monotone"
                  dataKey="rejected" 
                  name="Rejected"
                  stroke={COLORS.ACCENT_GOLD}
                  strokeWidth={3}
                  dot={{ r: 4, fill: COLORS.ACCENT_GOLD }}
                  activeDot={{ r: 6, stroke: COLORS.PRIMARY_GREEN, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 p-10 text-center italic">No weekly data available for charting.</p>
          )}
        </div>

        {/* 2. MONTHLY COMPLIANCE TREND CHART (MULTI-LINE, CLEAN LABELS) */}
        <div className="bg-white p-6 rounded-xl shadow-xl border-t-4" style={{ borderTopColor: COLORS.ACCENT_GOLD }}>
          <h3 className="text-lg font-bold mb-4 flex items-center" style={{ color: COLORS.DARK_GOLD }}>
            <TrendingUp size={20} className="mr-2" style={{ color: COLORS.DARK_GOLD }} />
            Monthly Record Compliance Trend
          </h3>
          {formattedMonthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={formattedMonthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                <XAxis dataKey="monthLabel" stroke="#555" fontSize={12} /> {/* **FIXED: Use formatted data key** */}
                <YAxis allowDecimals={false} stroke="#555" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '15px' }} />
                
                {/* Approved Records Line (PRIMARY GREEN) */}
                <Line
                  type="monotone"
                  dataKey="approved"
                  name="Approved"
                  stroke={COLORS.PRIMARY_GREEN}
                  strokeWidth={3}
                  dot={{ r: 4, fill: COLORS.PRIMARY_GREEN }}
                  activeDot={{ r: 6, stroke: COLORS.ACCENT_GOLD, strokeWidth: 2 }}
                />
                
                {/* Rejected Records Line (ACCENT GOLD) */}
                <Line
                  type="monotone"
                  dataKey="rejected"
                  name="Rejected"
                  stroke={COLORS.ACCENT_GOLD}
                  strokeWidth={3}
                  dot={{ r: 4, fill: COLORS.ACCENT_GOLD }}
                  activeDot={{ r: 6, stroke: COLORS.PRIMARY_GREEN, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 p-10 text-center italic">No monthly data available for charting.</p>
          )}
        </div>
      </div>

      <p className="font-bold">Monthly Report Generation</p>
      
      {/* DOWNLOAD REPORT */}
      <div className="bg-white p-6 rounded-xl shadow-xl flex flex-wrap items-center gap-4 mb-10 border-l-4" style={{ borderLeftColor: COLORS.PRIMARY_GREEN }}>
        <label className="text-gray-700 font-semibold whitespace-nowrap">Select Report Period:</label>
        
        {/* Month Input */}
        <div className="flex flex-col">
            <span className='text-xs text-gray-500 mb-1'>Month (1-12)</span>
            <input
              type="number"
              min="1"
              max="12"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="border border-gray-300 px-3 py-2 rounded-lg w-20 text-center focus:ring-2 focus:ring-offset-1 focus:outline-none transition duration-150"
              style={{ borderColor: COLORS.ACCENT_GOLD, color: COLORS.PRIMARY_GREEN }}
            />
        </div>
        
        {/* Year Input */}
        <div className="flex flex-col">
            <span className='text-xs text-gray-500 mb-1'>Year</span>
            <input
              type="number"
              min="2020"
              max={new Date().getFullYear()}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="border border-gray-300 px-3 py-2 rounded-lg w-24 text-center focus:ring-2 focus:ring-offset-1 focus:outline-none transition duration-150"
              style={{ borderColor: COLORS.ACCENT_GOLD, color: COLORS.PRIMARY_GREEN }}
            />
        </div>
        
        <button
          onClick={handleDownload}
          disabled={reportDownloading}
          className={`
            text-white px-6 py-2 rounded-lg flex items-center gap-2 font-bold transition duration-300 shadow-md
            ${reportDownloading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-[#004832] hover:bg-[#006442] active:bg-[#003a2a] hover:shadow-lg'
            }
          `}
        >
          {reportDownloading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> Downloading...
            </>
          ) : (
            <>
              <FileDown size={20} /> Download {year}-{month} Report
            </>
          )}
        </button>
        
        {reportError && <p className="text-sm text-red-600 font-medium ml-4">⚠️ Error: {reportError}</p>}
      </div>

      {/* RECENT RECORDS */}
      <RecentRecordsTable records={recentRecords} />

      {error && <p className="text-red-600 mt-6 font-semibold">⚠️ {error}</p>}
    </div>
  );
};

export default AdminDashboard;