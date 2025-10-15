import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { Loader2, Upload, FileText, List } from "lucide-react";

import {
  scanGazette,
  fetchGazettes,
  fetchScanLogs,
  clearScanResults,
} from "../../store/slices/gazetteScannerSlice";

const GazetteScannerPage = () => {
  const dispatch = useDispatch();

  // Local UI state
  const [file, setFile] = useState(null);

  // Redux state
  const {
    loading,
    error,
    message,
    results,
    publishedCount,
    totalRecords,
    gazettes,
    logs,
  } = useSelector((state) => state.gazetteScanner);

  // Fetch gazettes and logs on mount
  useEffect(() => {
    dispatch(fetchGazettes());
    dispatch(fetchScanLogs());
  }, [dispatch]);

  // Handle error or success notifications
  useEffect(() => {
    if (error) toast.error(error);
    if (message && message.includes("completed")) toast.success(message);
  }, [error, message]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleScan = (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please select a PDF file first");
    dispatch(scanGazette(file));
  };

  const handleClearResults = () => {
    dispatch(clearScanResults());
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <FileText className="text-blue-600" /> Gazette Scanner
      </h1>

      {/* ======= Upload Form ======= */}
      <form
        onSubmit={handleScan}
        className="bg-white shadow p-6 rounded-2xl border border-gray-100 space-y-4"
      >
        <label className="block font-medium text-gray-700">
          Upload Gazette PDF
        </label>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="border border-gray-300 rounded-lg w-full p-2"
        />

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" /> Scanning...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" /> Start Scan
              </>
            )}
          </button>

          {results.length > 0 && (
            <button
              type="button"
              onClick={handleClearResults}
              className="text-sm text-gray-600 hover:text-red-600"
            >
              Clear Results
            </button>
          )}
        </div>
      </form>

      {/* ======= Scan Results ======= */}
      {results.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
          <h2 className="font-semibold text-green-700 mb-2">
            Scan Summary
          </h2>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>
              <b>Total Records Scanned Against:</b> {totalRecords}
            </li>
            <li>
              <b>Matched / Published Count:</b> {publishedCount}
            </li>
            <li>
              <b>Extracted Cases:</b> {results.length}
            </li>
          </ul>
        </div>
      )}

      {/* ======= Gazette List ======= */}
      <div className="bg-white shadow p-6 rounded-2xl border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-3">
          <List className="text-blue-600" /> Uploaded Gazettes
        </h2>
        {gazettes.length === 0 ? (
          <p className="text-gray-500 text-sm">No gazettes found.</p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-2 text-left">File Name</th>
                <th className="p-2 text-left">Volume</th>
                <th className="p-2 text-left">Date Published</th>
                <th className="p-2 text-left">Total Records</th>
                <th className="p-2 text-left">Matched Count</th>
                <th className="p-2 text-left">Uploaded By</th>
              </tr>
            </thead>
            <tbody>
              {gazettes.map((gz) => (
                <tr
                  key={gz._id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="p-2">{gz.fileName}</td>
                  <td className="p-2">{gz.volumeNo}</td>
                  <td className="p-2">
                    {new Date(gz.datePublished).toLocaleDateString()}
                  </td>
                  <td className="p-2">{gz.totalRecords}</td>
                  <td className="p-2">{gz.publishedCount}</td>
                  <td className="p-2">{gz.uploadedBy?.name || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ======= Scan Logs ======= */}
      <div className="bg-white shadow p-6 rounded-2xl border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Recent Scan Logs
        </h2>
        {logs.length === 0 ? (
          <p className="text-gray-500 text-sm">No scan logs found.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {logs.map((log) => (
              <li key={log._id} className="py-2 text-sm text-gray-700">
                <span className="font-medium">{log.fileName}</span> —{" "}
                {log.remarks} (
                <b>{log.publishedCount}</b> / {log.totalRecords}) •{" "}
                {new Date(log.datePublished).toLocaleDateString()}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default GazetteScannerPage;
