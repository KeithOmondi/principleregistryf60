import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchRecords,
  updateRecord,
  deleteRecord,
  resetRecordState,
} from "../../store/slices/recordsSlice";
import { fetchCourts } from "../../store/slices/courtSlice";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RecordPage = () => {
  const dispatch = useDispatch();
  const { records, loading, error, message } = useSelector(
    (state) => state.records
  );
  const { list: courts } = useSelector((state) => state.courts);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [courtFilter, setCourtFilter] = useState("All");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  /* ----------------- Fetch data ----------------- */
  useEffect(() => {
    dispatch(fetchRecords());
    dispatch(fetchCourts());
  }, [dispatch]);

  /* ----------------- Toast & reset ----------------- */
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

  /* ----------------- Auto calculate leadTime ----------------- */
  useEffect(() => {
    if (formData.dateOfReceipt && formData.dateReceived) {
      const received = new Date(formData.dateReceived);
      const receipt = new Date(formData.dateOfReceipt);

      if (!isNaN(received) && !isNaN(receipt)) {
        const diffDays = Math.ceil(
          (receipt - received) / (1000 * 60 * 60 * 24)
        );
        setFormData((prev) => ({
          ...prev,
          leadTime: diffDays >= 0 ? diffDays : 0,
        }));
      }
    }
  }, [formData.dateOfReceipt, formData.dateReceived]);

  /* ----------------- Edit ----------------- */
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

  /* ----------------- Delete ----------------- */
  const handleDelete = (id) => {
    if (window.confirm("⚠️ Are you sure you want to delete this record?")) {
      dispatch(deleteRecord(id));
    }
  };

  /* ----------------- Filtering ----------------- */
const filteredRecords = records.filter((r) => {
  const searchLower = search.toLowerCase();

  const matchesSearch =
    r.nameOfDeceased?.toLowerCase().includes(searchLower) ||
    r.causeNo?.toLowerCase().includes(searchLower) ||
    r.courtStation?.name?.toLowerCase().includes(searchLower);

  const matchesStatus =
    statusFilter === "All" ? true : r.form60Compliance === statusFilter;

  const matchesCourt =
    courtFilter === "All" ? true : r.courtStation?._id === courtFilter;

  return matchesSearch && matchesStatus && matchesCourt;
});


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
      {filteredRecords.length === 0 ? (
        <p className="text-gray-500 text-center">No matching records found.</p>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-2xl border border-[#0a2342]/20">
          <table className="min-w-full border-collapse">
            <thead className="bg-[#0a2342] text-white">
              <tr>
                <th className="border p-3 text-left">Court Station</th>
                <th className="border p-3 text-left">Cause No.</th>
                <th className="border p-3 text-left">Name of Deceased</th>
                <th className="border p-3 text-left">Date Received At PR</th>
                <th className="border p-3 text-left">Date of Receipt</th>
                <th className="border p-3 text-left">Lead Time (Days)</th>
                <th className="border p-3 text-left">Form 60 Compliance</th>
                <th className="border p-3 text-left">Reason For Rejection</th>
                <th className="border p-3 text-left">Date Forwarded to G.P.</th>
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
                    {r.form60Compliance === "Rejected" && (
                      <button
                        onClick={() => setSelectedRecord(r)}
                        className="text-gray-700 hover:underline"
                      >
                        View Reason
                      </button>
                    )}
                  </td>
                  <td className="border p-3">
                    {r.dateForwardedToGP
                      ? r.dateForwardedToGP.split("T")[0]
                      : "N/A"}
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
          <div className="w-full max-w-sm rounded-xl border border-red-500 bg-white p-6 shadow-2xl sm:w-96">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-red-700">
                Rejection Reason
              </h3>
              <span className="text-2xl">❌</span>
            </div>
            <hr className="my-3 border-t border-red-300" />
            <p className="text-gray-800 leading-relaxed">
              {selectedRecord.rejectionReason ||
                "No reason was provided for this rejection."}
            </p>
            <button
              onClick={() => setSelectedRecord(null)}
              className="mt-4 w-full rounded-lg bg-red-700 px-4 py-2 text-white font-semibold hover:bg-red-800"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white w-96 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-[#0a2342]">
              ✏️ Edit Record
            </h3>
            {/* TODO: reuse AddRecord form */}
            <p className="text-gray-500">Edit form goes here...</p>
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
