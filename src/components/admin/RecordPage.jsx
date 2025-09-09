import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchRecords,
  updateRecord,
  deleteRecord,
  resetRecordState,
} from "../../store/slices/recordsSlice";
import { fetchCourts } from "../../store/slices/courtSlice"; // added
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RecordPage = () => {
  const dispatch = useDispatch();
  const { records, loading, error, message } = useSelector(
    (state) => state.records
  );
  const { list: courts } = useSelector((state) => state.courts); // use fetched courts

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  // Fetch records & courts
  useEffect(() => {
    dispatch(fetchRecords());
    dispatch(fetchCourts()); // fetch courts for dropdowns
  }, [dispatch]);

  // Toast notifications & reset
  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(resetRecordState());
      dispatch(fetchRecords());
    }
    if (error) {
      toast.error(error);
      dispatch(resetRecordState());
    }
  }, [message, error, dispatch]);

  // Auto-calc lead time
  useEffect(() => {
    if (formData.dateReceived && formData.dateOfReceipt) {
      const received = new Date(formData.dateReceived);
      const receipt = new Date(formData.dateOfReceipt);
      if (!isNaN(received) && !isNaN(receipt)) {
        const diffDays = Math.ceil(
          (receipt - received) / (1000 * 60 * 60 * 24)
        );
        setFormData((prev) => ({ ...prev, leadTime: diffDays }));
      }
    }
  }, [formData.dateReceived, formData.dateOfReceipt]);

  /* ----------------- Edit Record ----------------- */
  const handleEditClick = (record) => {
    setFormData({
      ...record,
      courtStation: record.courtStation?._id || "",
    });
    setEditMode(true);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (
      formData.form60Compliance === "Rejected" &&
      !formData.rejectionReason?.trim()
    ) {
      toast.error("⚠️ Please provide a rejection reason");
      return;
    }
    dispatch(updateRecord({ id: formData._id, recordData: formData })).then(
      () => setEditMode(false)
    );
  };

  /* ----------------- Delete Record ----------------- */
  const handleDelete = (id) => {
    if (window.confirm("⚠️ Are you sure you want to delete this record?")) {
      dispatch(deleteRecord(id));
    }
  };

  /* ----------------- Filtering ----------------- */
  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.nameOfDeceased?.toLowerCase().includes(search.toLowerCase()) ||
      r.causeNo?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "All" ? true : r.form60Compliance === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <p className="p-4">Loading records...</p>;

  return (
    <div className="p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">
        📜 Available Records
      </h2>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="🔍 Search by Name or Cause No..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/2 p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="All">All Status</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
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
                <th className="border p-3 text-left">Date Received</th>
                <th className="border p-3 text-left">Date of Receipt</th>
                <th className="border p-3 text-left">
                  Date Forwarded to G.P.
                </th>{" "}
                {/* NEW */}
                <th className="border p-3 text-left">Lead Time(Days)</th>
                <th className="border p-3 text-left">Form 60 Compliance</th>
                <th className="border p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((r, idx) => (
                <tr
                  key={r._id || idx}
                  className={`${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-blue-50 transition`}
                >
                  <td className="border p-3">
                    {r.courtStation?.name || "N/A"}
                  </td>
                  <td className="border p-3">{r.causeNo}</td>
                  <td className="border p-3 font-semibold">
                    {r.nameOfDeceased}
                  </td>
                  <td className="border p-3">
                    {r.dateReceived ? r.dateReceived.split("T")[0] : "N/A"}
                  </td>
                  <td className="border p-3">
                    {r.dateOfReceipt ? r.dateOfReceipt.split("T")[0] : "N/A"}
                  </td>
                  <td className="border p-3">
                    {r.dateForwardedToGP
                      ? r.dateForwardedToGP.split("T")[0]
                      : "N/A"}
                  </td>{" "}
                  {/* NEW */}
                  <td className="border p-3">{r.leadTime}</td>
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
                  <td className="border p-3 text-center space-x-3">
                    <button
                      onClick={() => handleEditClick(r)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(r._id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                    {r.form60Compliance === "Rejected" && (
                      <button
                        onClick={() => setSelectedRecord(r)}
                        className="text-gray-600 hover:underline"
                      >
                        View Reason
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Rejection Modal */}
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
                {selectedRecord.rejectionReason ||
                  "No reason was provided for this rejection."}
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

      {/* Edit Modal Placeholder */}
      {editMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white w-96 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">✏️ Edit Record</h3>
            {/* You can reuse your AddRecord form here and bind formData */}
            <p className="text-gray-500">Edit form goes here...</p>
            <button
              onClick={() => setEditMode(false)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
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
