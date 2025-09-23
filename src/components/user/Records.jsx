import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRecords } from "../../store/slices/recordsSlice";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Records = () => {
  const dispatch = useDispatch();
  const { records, loading, error } = useSelector((state) => state.records);

  const [search, setSearch] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null); // For rejection reason modal

  // Fetch records on mount
  useEffect(() => {
    dispatch(fetchRecords());
  }, [dispatch]);

  // Toast errors
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Filtering by search
  const filteredRecords = records.filter((r) => {
    return (
      r.nameOfDeceased?.toLowerCase().includes(search.toLowerCase()) ||
      r.causeNo?.toLowerCase().includes(search.toLowerCase())
    );
  });

  if (loading) return <p className="p-4">Loading records...</p>;

  return (
    <div className="p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">
        📜 Records
      </h2>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="🔍 Search by Name or Cause No..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/2 p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Records Table */}
      {filteredRecords.length === 0 ? (
        <p className="text-gray-500 text-center">No matching records found.</p>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-2xl">
          <table className="min-w-full border-collapse">
            <thead className="bg-gradient-to-r from-blue-100 to-blue-200">
              <tr>
                <th className="border p-3 text-left">Court Station</th>
                <th className="border p-3 text-left">Cause No.</th>
                <th className="border p-3 text-left">Name of Deceased</th>
                 <th className="border p-3 text-left">Form 60 Compliance</th>
                 <th className="border p-3 text-left">Reason For Rejection</th>
                <th className="border p-3 text-left">Date Forwarded to G.P</th>
               
                
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((r, idx) => (
                <tr
                  key={r._id || idx}
                  className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition`}
                >
                  <td className="border p-3">{r.courtStation?.name || "N/A"}</td>
                  <td className="border p-3">{r.causeNo}</td>
                  <td className="border p-3">{r.nameOfDeceased}</td>
                  <td
                    className={`border p-3 font-medium ${
                      r.form60Compliance === "Approved"
                        ? "text-green-600"
                        : r.form60Compliance === "Rejected"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {r.form60Compliance}
                  </td>
                  <td className="border p-3 text-center">
                    {r.form60Compliance === "Rejected" && (
                      <button
                        onClick={() => setSelectedRecord(r)}
                        className="text-gray-600 hover:underline"
                      >
                        View Reason
                      </button>
                    )}
                  </td>
                  <td className="border p-3">
                    {r.dateForwardedToGP ? r.dateForwardedToGP.split("T")[0] : "N/A"}
                  </td>
                  
                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {selectedRecord && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div className="w-full max-w-sm rounded-xl border border-red-500 bg-white p-6 shadow-2xl transition-all duration-300 ease-in-out sm:w-96">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-extrabold tracking-tight text-red-600">
          Rejection Reason
        </h3>
        <span className="text-3xl" role="img" aria-label="cross-mark">
          ❌
        </span>
      </div>
      <hr className="my-4 border-t-2 border-red-200" />
      <div className="flex flex-col gap-4">
        <p className="text-base text-gray-800 leading-relaxed">
          {selectedRecord.rejectionReason || "No reason was provided for this rejection."}
        </p>
        <button
          onClick={() => setSelectedRecord(null)}
          className="mt-2 w-full rounded-full bg-red-600 px-6 py-3 text-lg font-semibold text-white transition-all duration-300 ease-in-out hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300"
        >
          Got It
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default Records;
