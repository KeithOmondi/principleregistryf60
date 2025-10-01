// src/pages/admin/RecordPage.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllRecordsForAdmin,
  deleteRecord,
  resetRecordState,
} from "../../store/slices/recordsSlice";
import { fetchCourts } from "../../store/slices/courtSlice";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EditRecord from "../../pages/admin/EditRecord";

const RecordPage = () => {
  const dispatch = useDispatch();

  const {
    records,
    totalRecords,
    currentPage,
    pageSize,
    loading,
    error,
    message,
  } = useSelector((state) => state.records);

  const { list: courts } = useSelector((state) => state.courts);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [courtFilter, setCourtFilter] = useState("All");

  // Modal state
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editMode, setEditMode] = useState(false);

  /* ----------------- Fetch Courts ----------------- */
  useEffect(() => {
    dispatch(fetchCourts());
  }, [dispatch]);

  /* ----------------- Fetch Records (with filters) ----------------- */
  const fetchRecords = (page = 1, limit = pageSize) => {
    dispatch(
      fetchAllRecordsForAdmin({
        page,
        limit,
        search,
        status: statusFilter,
        court: courtFilter,
      })
    );
  };

  // Debounce only search
useEffect(() => {
  const delayDebounce = setTimeout(() => {
    fetchRecords(1, pageSize);
  }, 500);

  return () => clearTimeout(delayDebounce);
}, [search]);

// Instant fetch for filters
useEffect(() => {
  fetchRecords(1, pageSize);
}, [statusFilter, courtFilter]);


  /* ----------------- Toast & Reset ----------------- */
  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(resetRecordState());
      fetchRecords(currentPage, pageSize);
    }
    if (error) {
      toast.error(error);
      dispatch(resetRecordState());
    }
  }, [message, error]);

  /* ----------------- Handlers ----------------- */
  const handlePageChange = (newPage) => {
    fetchRecords(newPage, pageSize);
  };

  const handlePageSizeChange = (newSize) => {
    fetchRecords(1, newSize);
  };

  const handleEditClick = (record) => {
    setSelectedRecord(record);
    setEditMode(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("⚠️ Are you sure you want to delete this record?")) {
      dispatch(deleteRecord(id));
    }
  };

  /* ----------------- UI ----------------- */
  if (loading) return <p className="p-4">Loading records...</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />

      <h2 className="text-3xl font-bold mb-6 text-center text-[#0a2342]">
        📜 Judicial Records
      </h2>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="🔍 Search by Name or Cause No..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/3 p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#b48222]"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#b48222]"
        >
          <option value="All">All Status</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>

        <select
          value={courtFilter}
          onChange={(e) => setCourtFilter(e.target.value)}
          className="p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#b48222]"
        >
          <option value="All">All Courts</option>
          {courts.map((court) => (
            <option key={court._id} value={court._id}>
              {court.name}
            </option>
          ))}
        </select>
      </div>

      {/* Records Table */}
      {records.length === 0 ? (
        <p className="text-gray-500 text-center">No records found.</p>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-2xl border border-[#0a2342]/20">
          <table className="min-w-full border-collapse">
            <thead className="bg-[#0a3b1f] text-white">
              <tr>
                <th className="border p-3 text-left"></th>
                <th className="border p-3 text-left">Court Station</th>
                <th className="border p-3 text-left">Cause No.</th>
                <th className="border p-3 text-left">Name of Deceased</th>
                <th className="border p-3 text-left">Date Received At PR</th>
                <th className="border p-3 text-left">Date of Receipt</th>
                <th className="border p-3 text-left">Lead Time (Days)</th>
                <th className="border p-3 text-left">Form 60 Compliance</th>
                <th className="border p-3 text-left">Reason For Rejection</th>
                <th className="border p-3 text-left">Date Forwarded to G.P.</th>
                <th className="border p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, idx) => (
                <tr
                  key={r._id || idx}
                  className={`${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-100"
                  } hover:bg-[#b48222]/10 transition`}
                >
                  <td className="border p-3">
                    {(currentPage - 1) * pageSize + idx + 1}
                  </td>
                  <td className="border p-3">{r.courtStation?.name || "N/A"}</td>
                  <td className="border p-3">{r.causeNo}</td>
                  <td className="border p-3 font-semibold text-[#0a2342]">
                    {r.nameOfDeceased}
                  </td>
                  <td className="border p-3">
                    {r.dateReceived ? r.dateReceived.split("T")[0] : "N/A"}
                  </td>
                  <td className="border p-3">
                    {r.dateOfReceipt ? r.dateOfReceipt.split("T")[0] : "N/A"}
                  </td>
                  <td className="border p-3">{r.leadTime}</td>
                  <td
                    className={`border p-3 font-medium ${
                      r.form60Compliance === "Approved"
                        ? "text-green-700"
                        : r.form60Compliance === "Rejected"
                        ? "text-red-700"
                        : "text-yellow-600"
                    }`}
                  >
                    {r.form60Compliance}
                  </td>
                  <td className="border p-3">
                    {r.form60Compliance === "Rejected"
                      ? r.rejectionReason || "N/A"
                      : "-"}
                  </td>
                  <td className="border p-3">
                    {r.dateForwardedToGP
                      ? r.dateForwardedToGP.split("T")[0]
                      : "N/A"}
                  </td>
                  <td className="border p-3 text-center space-x-3">
                    <button
                      onClick={() => handleEditClick(r)}
                      className="text-[#0a2342] hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(r._id)}
                      className="text-red-700 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-6">
        <div>
          <label className="mr-2">Rows per page:</label>
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="border rounded p-1"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div className="flex space-x-2">
          <button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span>
            Page {currentPage} of {Math.ceil(totalRecords / pageSize)}
          </span>
          <button
            disabled={currentPage >= Math.ceil(totalRecords / pageSize)}
            onClick={() => handlePageChange(currentPage + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {editMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white w-96 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-[#0a2342]">
              ✏️ Edit Record
            </h3>

            <EditRecord
              record={selectedRecord}
              onClose={() => setEditMode(false)}
            />

            <button
              onClick={() => setEditMode(false)}
              className="mt-4 bg-[#0a2342] text-white px-4 py-2 rounded-lg hover:bg-[#0a2342]/90"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordPage;
