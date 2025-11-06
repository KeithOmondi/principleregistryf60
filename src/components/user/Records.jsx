import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRecords } from "../../store/slices/recordsSlice";
import { fetchCourts } from "../../store/slices/courtSlice";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Records = () => {
  const dispatch = useDispatch();

  /* =========================================================
  🔹 Redux State
  ========================================================= */
  const { records, loading, error, search, court, status } = useSelector(
    (state) => state.records
  );
  const { list: courts } = useSelector((state) => state.courts);

  /* =========================================================
  🔹 Local State
  ========================================================= */
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCourt, setFilterCourt] = useState("All");

  /* =========================================================
  🔹 Data Fetching
  ========================================================= */
  useEffect(() => {
    dispatch(fetchCourts());
  }, [dispatch]);

  const fetchData = useCallback(() => {
    dispatch(fetchRecords());
  }, [dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* =========================================================
  🔹 Notifications
  ========================================================= */
  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  /* =========================================================
  🔹 Filtering Logic
  ========================================================= */
  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.nameOfDeceased?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.causeNo?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "All" || r.form60Compliance === filterStatus;

    const matchesCourt =
      filterCourt === "All" || r.courtStation?._id === filterCourt;

    return matchesSearch && matchesStatus && matchesCourt;
  });

  /* =========================================================
  🔹 UI
  ========================================================= */
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <h2 className="text-3xl font-bold mb-6 text-center text-[#0a2342]">
        ⚖️ URITHI 
      </h2>

      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="🔍 Search by Name or Cause No..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-[#b48222]"
        />

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-[#b48222]"
        >
          <option value="All">All Status</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Pending">Pending</option>
        </select>

        <select
          value={filterCourt}
          onChange={(e) => setFilterCourt(e.target.value)}
          className="p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-[#b48222]"
        >
          <option value="All">All Courts</option>
          {courts.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Records Table */}
      <div className="relative overflow-x-auto shadow-lg rounded-2xl border border-[#0a2342]/20">
        {loading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
            <p className="text-gray-600">Fetching records...</p>
          </div>
        )}

        {filteredRecords.length === 0 ? (
          <p className="text-gray-500 text-center p-6">No records found.</p>
        ) : (
          <table className="min-w-full border-collapse text-sm md:text-base">
            <thead className="bg-[#0a3b1f] text-white">
              <tr>
                <th className="p-3 text-left">Court Station</th>
                <th className="p-3 text-left">Cause No.</th>
                <th className="p-3 text-left">Name of Deceased</th>
                <th className="p-3 text-left">Form 60 Compliance</th>
                <th className="p-3 text-left">Rejection Reason</th>
                <th className="p-3 text-left">Date Forwarded To GP</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((r, idx) => (
                <tr
                  key={r._id || idx}
                  className={`${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-100"
                  } hover:bg-[#b48222]/10 transition`}
                >
                  <td className="p-3">{r.courtStation?.name || "N/A"}</td>
                  <td className="p-3">{r.causeNo}</td>
                  <td className="p-3 font-semibold text-[#0a2342]">
                    {r.nameOfDeceased}
                  </td>
                  <td
                    className={`p-3 font-medium ${
                      r.form60Compliance === "Approved"
                        ? "text-green-700"
                        : r.form60Compliance === "Rejected"
                        ? "text-red-700"
                        : "text-yellow-600"
                    }`}
                  >
                    {r.form60Compliance || "Pending"}
                  </td>
                  <td className="p-3">
                    {r.form60Compliance === "Rejected" ? (
                      <button
                        onClick={() => setSelectedRecord(r)}
                        className="text-[#0a2342] hover:underline"
                      >
                        View Reason
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="p-3">
                    {r.dateForwardedToGP?.split("T")[0] || "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Rejection Reason Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-20">
          <div className="bg-white w-[90%] md:w-[400px] rounded-lg shadow-lg p-6 relative">
            <h3 className="text-xl font-bold mb-4 text-red-700 flex items-center justify-between">
              <span>❌ Rejection Reason</span>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✖
              </button>
            </h3>
            <p className="text-gray-800 leading-relaxed">
              {selectedRecord.rejectionReason ||
                "No reason provided for this rejection."}
            </p>
            <button
              onClick={() => setSelectedRecord(null)}
              className="mt-6 w-full bg-[#0a2342] text-white px-4 py-2 rounded hover:bg-[#0a2342]/90"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Records;
