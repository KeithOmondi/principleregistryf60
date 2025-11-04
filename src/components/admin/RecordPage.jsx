import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllRecordsForAdmin,
  deleteRecord,
  resetRecordState,
  updateMultipleRecordsDateForwarded,
  setFilters,
  setPage,
  setPageSize,
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
    totalPages,
    pageSize,
    search,
    status,
    court,
    loading,
    error,
    message,
  } = useSelector((state) => state.records);

  const { list: courts } = useSelector((state) => state.courts);

  // Local state for modal & bulk update
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDate, setBulkDate] = useState("");

  /* ---------------- Lead Time Calculations ---------------- */
  const calcReceivingLead = (start, end) => {
    if (!start || !end) return "";
    const diff = new Date(end) - new Date(start);
    return Math.abs(Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const calcForwardingLead = (start, end) => {
    if (!start || !end) return "-";
    const diff = new Date(end) - new Date(start);
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  /* ---------------- Fetch Courts ---------------- */
  useEffect(() => {
    dispatch(fetchCourts());
  }, [dispatch]);

  /* ---------------- Fetch Records ---------------- */
  const fetchRecords = () => {
    dispatch(
      fetchAllRecordsForAdmin({
        page: currentPage,
        limit: pageSize,
        search,
        status,
        court,
      })
    );
  };

  useEffect(() => {
    fetchRecords();
  }, [search, status, court, currentPage, pageSize]);

  /* ---------------- Toast & Reset ---------------- */
  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(resetRecordState());
      setSelectedIds([]);
    }
    if (error) {
      toast.error(error);
      dispatch(resetRecordState());
    }
  }, [message, error, dispatch]);

  /* ---------------- Handlers ---------------- */
  const handleFilterChange = (filterName, value) => {
    dispatch(setFilters({ [filterName]: value }));
    dispatch(setPage(1));
  };

  const handlePageChange = (newPage) => dispatch(setPage(newPage));
  const handlePageSizeChange = (newSize) => dispatch(setPageSize(newSize));

  const handleEditClick = (record) => {
    setSelectedRecord(record);
    setEditMode(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("⚠️ Are you sure you want to delete this record?")) {
      dispatch(deleteRecord(id));
    }
  };

  const handleSelectRecord = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds(
      selectedIds.length === records.length ? [] : records.map((r) => r._id)
    );
  };

  const handleBulkUpdate = () => {
    if (!bulkDate) return toast.warn("⚠️ Please select a date before updating.");
    if (!selectedIds.length)
      return toast.warn("⚠️ Please select at least one record.");

    dispatch(updateMultipleRecordsDateForwarded({ ids: selectedIds, date: bulkDate }));
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="p-6 bg-gray-50 min-h-screen relative">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2 className="text-3xl font-bold mb-6 text-center text-[#0a2342]">
        📜 ORHC URITHI RECORDS
      </h2>

      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="🔍 Search by Name or Cause No..."
          value={search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          className="w-full md:w-1/3 p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#b48222]"
        />
        <select
          value={status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
          className="p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#b48222]"
        >
          <option value="All">All Status</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
        <select
          value={court}
          onChange={(e) => handleFilterChange("court", e.target.value)}
          className="p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#b48222]"
        >
          <option value="All">All Courts</option>
          {courts.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Bulk Update */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={bulkDate}
            onChange={(e) => setBulkDate(e.target.value)}
            className="border rounded p-2"
          />
          <button
            onClick={handleBulkUpdate}
            disabled={loading}
            className="bg-[#0a2342] text-white px-4 py-2 rounded hover:bg-[#0a2342]/90 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Selected Forwarded Date"}
          </button>
        </div>
        <p className="text-sm text-gray-600">
          Selected: {selectedIds.length} record{selectedIds.length !== 1 && "s"}
        </p>
      </div>

      {/* Records Table */}
      <div className="relative overflow-x-auto shadow-lg rounded-2xl border border-[#0a2342]/20">
        {loading && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
            <p className="text-gray-600">Fetching records...</p>
          </div>
        )}

        {records.length === 0 ? (
          <p className="text-gray-500 text-center p-6">No records found.</p>
        ) : (
          <table className="min-w-full border-collapse">
            <thead className="bg-[#0a3b1f] text-white">
              <tr>
                <th className="border p-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === records.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="border p-3 text-left">Court Station</th>
                <th className="border p-3 text-left">Cause No.</th>
                <th className="border p-3 text-left">Name of Deceased</th>
                <th className="border p-3 text-left">Date Received At PR</th>
                <th className="border p-3 text-left">Date of E-Citizen Receipt</th>
                <th className="border p-3 text-center">Receiving Lead Time To PR</th>
                <th className="border p-3 text-left">Date Forwarded To GP</th>
                <th className="border p-3 text-center">Forwarding Lead Time To GP</th>
                <th className="border p-3 text-left">Form 60 Compliance</th>
                <th className="border p-3 text-left">Rejection Reason</th>
                <th className="border p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, idx) => (
                <tr
                  key={r._id || idx}
                  className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-100"} hover:bg-[#b48222]/10 transition`}
                >
                  <td className="border p-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(r._id)}
                      onChange={() => handleSelectRecord(r._id)}
                    />
                  </td>
                  <td className="border p-3">{r.courtStation?.name || "N/A"}</td>
                  <td className="border p-3">{r.causeNo}</td>
                  <td className="border p-3 font-semibold text-[#0a2342]">{r.nameOfDeceased}</td>
                  <td className="border p-3">{r.dateReceived?.split("T")[0] || "N/A"}</td>
                  <td className="border p-3">{r.dateOfReceipt?.split("T")[0] || "N/A"}</td>
                  <td className="border p-3 text-center">{calcReceivingLead(r.dateReceived, r.dateOfReceipt)}</td>
                  <td className="border p-3">{r.dateForwardedToGP?.split("T")[0] || "N/A"}</td>
                  <td className="border p-3 text-center">{calcForwardingLead(r.dateReceived, r.dateForwardedToGP)}</td>
                  <td className={`border p-3 font-medium ${
                    r.form60Compliance === "Approved" ? "text-green-700" :
                    r.form60Compliance === "Rejected" ? "text-red-700" : "text-yellow-600"
                  }`}>
                    {r.form60Compliance}
                  </td>
                  <td className="border p-3">{r.form60Compliance === "Rejected" ? r.rejectionReason || "N/A" : "-"}</td>
                  <td className="border p-3 text-center space-x-3">
                    <button onClick={() => handleEditClick(r)} className="text-[#0a2342] hover:underline">Edit</button>
                    <button onClick={() => handleDelete(r._id)} className="text-red-700 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <div>
          <label className="mr-2">Rows per page:</label>
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="border rounded p-1"
          >
            {[10, 25, 30, 50, 100].map((num) => (
              <option key={num} value={num}>{num}</option>
            ))}
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
          <span>Page {currentPage} of {totalPages || 1}</span>
          <button
            disabled={currentPage >= (totalPages || 1)}
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
            <h3 className="text-xl font-bold mb-4 text-[#0a2342]">✏️ Edit Record</h3>
            <EditRecord record={selectedRecord} onClose={() => setEditMode(false)} />
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
