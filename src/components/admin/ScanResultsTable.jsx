// src/components/Gazette/ScanResultsTable.jsx
import React from "react";
import { useSelector } from "react-redux";
import { Loader2 } from "lucide-react";

const ScanResultsTable = () => {
  const { results, loading, publishedCount, totalRecords, message, error } =
    useSelector((state) => state.gazetteScanner);

  // --- Loading State ---
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
        <p className="mt-3 text-gray-600">Scanning Gazette...</p>
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  // --- No Results State ---
  if (!results || results.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {message || "No scan results available."}
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-xl shadow-md mt-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Scan Results</h2>
        <div className="text-sm text-gray-500">
          Published:{" "}
          <span className="font-medium text-green-600">{publishedCount}</span> /{" "}
          {totalRecords}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold border-b">#</th>
              <th className="px-4 py-2 text-left text-sm font-semibold border-b">Name of Deceased</th>
              <th className="px-4 py-2 text-left text-sm font-semibold border-b">Cause No.</th>
              <th className="px-4 py-2 text-left text-sm font-semibold border-b">Court Station</th>
              <th className="px-4 py-2 text-left text-sm font-semibold border-b">Volume No.</th>
              <th className="px-4 py-2 text-left text-sm font-semibold border-b">Status</th>
              <th className="px-4 py-2 text-left text-sm font-semibold border-b">Date Published</th>
            </tr>
          </thead>

          <tbody>
            {results.map((record, index) => (
              <tr key={record._id || index} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-sm text-gray-600 border-b">{index + 1}</td>
                <td className="px-4 py-2 text-sm text-gray-700 border-b">
                  {record.nameOfDeceased || "Unknown"}
                </td>
                <td className="px-4 py-2 text-sm text-gray-700 border-b">
                  {record.causeNo || "N/A"}
                </td>
                <td className="px-4 py-2 text-sm text-gray-700 border-b">
                  {record.courtStation?.name || "Unknown Station"}
                </td>
                <td className="px-4 py-2 text-sm text-gray-700 border-b">
                  {record.volumeNo || "—"}
                </td>
                <td className="px-4 py-2 text-sm border-b">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      record.status === "Published"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {record.status || "Pending"}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm text-gray-600 border-b">
                  {record.datePublished
                    ? new Date(record.datePublished).toLocaleDateString()
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer message */}
      {message && (
        <p className="mt-4 text-sm text-gray-500 italic text-center">{message}</p>
      )}
    </div>
  );
};

export default ScanResultsTable;
