// src/components/Gazette/ScanResultsTable.jsx
import React from "react";
import { useSelector } from "react-redux";
import { Loader2, Zap, AlertTriangle, CheckCircle, FileText } from "lucide-react";

// --- Judiciary Color Palette ---
const PRIMARY_NAVY = "text-blue-900";
const PRIMARY_ACCENT_BG = "bg-amber-100";
const PRIMARY_ACCENT_TEXT = "text-amber-800";

const ScanResultsTable = () => {
  const { results, loading, publishedCount, totalRecords, message, error } =
    useSelector((state) => state.gazetteScanner);

  // --- Loading State ---
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl shadow-lg border border-blue-100 mt-6">
        <Loader2 className={`animate-spin w-8 h-8 ${PRIMARY_NAVY}`} />
        <p className="mt-4 text-lg font-medium text-gray-700">
          <Zap size={20} className="inline mr-2 text-amber-500" /> Analyzing Official Gazette Data...
        </p>
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="text-center py-10 bg-red-50 border border-red-300 rounded-xl mt-6">
        <AlertTriangle size={32} className="mx-auto text-red-600 mb-3" />
        <h3 className="text-xl font-semibold text-red-800">Scan Error Encountered</h3>
        <p className="text-red-600 mt-2 max-w-lg mx-auto">{error}</p>
      </div>
    );
  }

  // --- No Results State ---
  if (!results || results.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-100 border border-gray-300 rounded-xl mt-6">
        <FileText size={32} className="mx-auto text-gray-500 mb-3" />
        <p className="text-lg text-gray-700 font-medium">
          {message || "No scan results available. Initiate a new search."}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-2xl border border-blue-100 mt-6">
      
      {/* Header with Statistics */}
      <div className="flex justify-between items-center mb-5 pb-3 border-b border-blue-100">
        <h2 className={`text-2xl font-bold ${PRIMARY_NAVY} flex items-center`}>
          <CheckCircle size={24} className={`mr-2 text-amber-500`} /> Gazette Scan Results
        </h2>
        <div className="text-sm text-gray-600 font-semibold">
          Records Found:{" "}
          <span className={`font-extrabold ${PRIMARY_NAVY}`}>
            {results.length}
          </span>{" "}
          / Total Records:{" "}
          <span className="font-extrabold text-gray-800">{totalRecords}</span>
          <span className="ml-4 text-green-700">
            Published: {publishedCount}
          </span>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto border border-blue-200 rounded-lg">
        <table className="min-w-full divide-y divide-blue-100">
          {/* Table Header */}
          <thead className="bg-blue-900 text-white">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider">#</th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider">Name of Deceased</th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider">Cause No.</th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider">Court Station</th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider">Volume No.</th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider">Date Published</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="bg-white divide-y divide-blue-50">
            {results.map((record, index) => (
              <tr 
                key={record._id || index} 
                className="hover:bg-blue-50 transition duration-150"
              >
                <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                
                {/* Deceased Name */}
                <td className="px-5 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                  {record.nameOfDeceased || "Unknown"}
                </td>
                
                {/* Cause No. */}
                <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-700">
                  {record.causeNo || "N/A"}
                </td>
                
                {/* Court Station */}
                <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-700">
                  {record.courtStation?.name || "Unknown Station"}
                </td>
                
                {/* Volume No. */}
                <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-700">
                  {record.volumeNo || "—"}
                </td>
                
                {/* Status Badge */}
                <td className="px-5 py-3 whitespace-nowrap text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase ${
                      record.status === "Published"
                        ? "bg-green-500 text-white" // Use a strong success green
                        : `${PRIMARY_ACCENT_BG} ${PRIMARY_ACCENT_TEXT}` // Use Gold/Amber accent
                    }`}
                  >
                    {record.status || "Pending"}
                  </span>
                </td>
                
                {/* Date Published */}
                <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-600">
                  {record.datePublished
                    ? new Date(record.datePublished).toLocaleDateString("en-KE")
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer message */}
      {message && (
        <p className="mt-5 text-sm text-blue-800 italic text-center border-t border-blue-100 pt-4">
          *Note: {message}
        </p>
      )}
    </div>
  );
};

export default ScanResultsTable;