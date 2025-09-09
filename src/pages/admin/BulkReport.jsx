// components/admin/BulkReport.jsx
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBulkReport } from "../../store/slices/bulkReportSlice";

const BulkReport = () => {
  const dispatch = useDispatch();
  const { report, loading, error } = useSelector((state) => state.admin);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleFetch = () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates");
      return;
    }
    dispatch(fetchBulkReport({ startDate, endDate }));
  };

  const handleClear = () => {
    dispatch(clearReport());
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">📑 Bulk Gazette Report</h1>

      {/* Date filters */}
      <div className="flex gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          />
        </div>
        <button
          onClick={handleFetch}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Generate
        </button>
        <button
          onClick={handleClear}
          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
        >
          Clear
        </button>
      </div>

      {/* Report results */}
      {loading && <p className="text-gray-500">Loading report...</p>}
      {error && <p className="text-red-500">⚠ {error}</p>}

      {report && report.report && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4">
            Report from{" "}
            {new Date(report.startDate).toLocaleDateString()} to{" "}
            {new Date(report.endDate).toLocaleDateString()}
          </h2>

          <div className="space-y-6">
            {report.report.map((court, idx) => (
              <div
                key={idx}
                className="border rounded-lg shadow-sm p-4 bg-white"
              >
                <h3 className="text-lg font-bold mb-2">
                  {court._id} ({court.totalCases} cases)
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  {court.volumes.map((v, vIdx) => (
                    <li key={vIdx}>
                      <span className="font-medium">{v.volume}:</span>{" "}
                      {v.totalCases} cases
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkReport;
