import React, { useState } from "react";
import { useDispatch } from "react-redux";
import ScanResultsTable from "./ScanResultsTable";
import { scanGazette } from "../../store/slices/gazetteScannerSlice";

const GazetteScannerPage = () => {
  const [file, setFile] = useState(null);
  const dispatch = useDispatch();

  const handleScan = () => {
    if (!file) return alert("Please select a PDF to scan.");
    dispatch(scanGazette(file));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4 text-gray-800">
        Gazette Scanner
      </h1>

      <div className="flex items-center gap-4 mb-6">
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
          className="border rounded p-2 w-full"
        />
        <button
          onClick={handleScan}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Scan Gazette
        </button>
      </div>

      {/* Scan results table */}
      <ScanResultsTable />
    </div>
  );
};

export default GazetteScannerPage;
