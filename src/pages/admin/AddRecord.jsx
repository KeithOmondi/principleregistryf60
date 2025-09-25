// src/pages/admin/AddRecord.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addRecord, resetRecordState } from "../../store/slices/recordsSlice";
import { fetchCourts } from "../../store/slices/courtSlice";
import { toast, ToastContainer } from "react-toastify";
import Select from "react-select";
import "react-toastify/dist/ReactToastify.css";

const rejectionReasons = [
  // ... your array of rejection reasons ...
];

const AddRecord = () => {
  const dispatch = useDispatch();
  const { list: courts, loading: courtsLoading } = useSelector(
    (state) => state.courts
  );
  const { loading, message, error } = useSelector((state) => state.records);

  const [formData, setFormData] = useState({
    courtStation: "",
    causeNo: "",
    nameOfDeceased: "",
    dateReceived: "",
    dateOfReceipt: "", // optional
    leadTime: 0,
    dateForwardedToGP: "",
    form60Compliance: "Approved",
    rejectionReason: "",
    customRejection: "",
  });

  // Fetch courts if not loaded
  useEffect(() => {
    if (!courts.length) dispatch(fetchCourts());
  }, [dispatch, courts.length]);

  const courtOptions = useMemo(
    () => courts.map((c) => ({ value: c._id, label: c.name })),
    [courts]
  );

  // Auto-calc lead time (only if dateOfReceipt is provided)
  // Auto-calc lead time
useEffect(() => {
  const { dateReceived, dateOfReceipt } = formData;
  if (dateReceived) {
    const received = new Date(dateReceived);
    if (!isNaN(received)) {
      let diffDays = 0;

      if (dateOfReceipt) {
        const receipt = new Date(dateOfReceipt);
        if (!isNaN(receipt)) {
          diffDays = Math.abs(Math.ceil((receipt - received) / (1000 * 60 * 60 * 24)));
        }
      }

      // Optional: if dateOfReceipt is missing, you could calculate leadTime up to today:
      // else {
      //   const today = new Date();
      //   diffDays = Math.abs(Math.ceil((today - received) / (1000 * 60 * 60 * 24)));
      // }

      setFormData((prev) => ({ ...prev, leadTime: diffDays }));
    }
  }
}, [formData.dateReceived, formData.dateOfReceipt]);


  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      courtStation,
      causeNo,
      nameOfDeceased,
      dateReceived,
      dateOfReceipt, // optional
      dateForwardedToGP,
      form60Compliance,
      rejectionReason,
      customRejection,
      leadTime,
    } = formData;

    // Only required fields
    if (!courtStation || !causeNo || !nameOfDeceased || !dateReceived) {
      toast.error("⚠️ Please fill in all required fields");
      return;
    }

    let finalRejectionReason = rejectionReason;
    if (form60Compliance === "Rejected") {
      if (!rejectionReason) {
        toast.error("⚠️ Please select a rejection reason");
        return;
      }
      if (rejectionReason === "Other" && !customRejection.trim()) {
        toast.error("⚠️ Please specify the rejection reason");
        return;
      }
      if (rejectionReason === "Other")
        finalRejectionReason = customRejection.trim();
    }

    try {
      await dispatch(
        addRecord({
          courtStation,
          causeNo,
          nameOfDeceased,
          dateReceived,
          ...(dateOfReceipt ? { dateOfReceipt } : {}), // optional
          leadTime,
          dateForwardedToGP,
          form60Compliance,
          rejectionReason: finalRejectionReason,
        })
      ).unwrap();

      setFormData({
        courtStation: "",
        causeNo: "",
        nameOfDeceased: "",
        dateReceived: "",
        dateOfReceipt: "",
        leadTime: 0,
        dateForwardedToGP: "",
        form60Compliance: "Approved",
        rejectionReason: "",
        customRejection: "",
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Show toast messages
  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(resetRecordState());
    }
    if (error) {
      toast.error(error);
      dispatch(resetRecordState());
    }
  }, [message, error, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#C5A572] to-[#2E2E2E] p-8">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8 space-y-8">
        <h2 className="text-2xl font-bold mb-6 text-[#2E2E2E]">
          ✍️ Add New Court Record
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {/* Court Station */}
          <div>
            <label className="block mb-1 font-medium text-[#2E2E2E]">
              Court Station
            </label>
            <Select
              options={courtOptions}
              isLoading={courtsLoading}
              isClearable
              placeholder="Search or select a court..."
              value={
                formData.courtStation
                  ? courtOptions.find((c) => c.value === formData.courtStation)
                  : null
              }
              onChange={(selected) =>
                setFormData((prev) => ({
                  ...prev,
                  courtStation: selected ? selected.value : "",
                }))
              }
            />
          </div>

          {/* Cause No */}
          <div>
            <label className="block mb-1 font-medium text-[#2E2E2E]">
              Cause No.
            </label>
            <input
              type="text"
              name="causeNo"
              value={formData.causeNo}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>

          {/* Name of Deceased */}
          <div>
            <label className="block mb-1 font-medium text-[#2E2E2E]">
              Name of Deceased
            </label>
            <input
              type="text"
              name="nameOfDeceased"
              value={formData.nameOfDeceased}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>

          {/* Date Received */}
          <div>
            <label className="block mb-1 font-medium text-[#2E2E2E]">
              Date Received
            </label>
            <input
              type="date"
              name="dateReceived"
              value={formData.dateReceived}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>

          {/* Date of Receipt (optional) */}
          <div>
            <label className="block mb-1 font-medium text-[#2E2E2E]">
              Date of Receipt (Optional)
            </label>
            <input
              type="date"
              name="dateOfReceipt"
              value={formData.dateOfReceipt}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          {/* Lead Time */}
          <div>
            <label className="block mb-1 font-medium text-[#2E2E2E]">
              Lead Time (days)
            </label>
            <input
              type="number"
              name="leadTime"
              value={formData.leadTime}
              readOnly
              className="w-full border px-3 py-2 rounded bg-gray-100"
            />
          </div>

          {/* Date Forwarded */}
          <div>
            <label className="block mb-1 font-medium text-[#2E2E2E]">
              Date Forwarded to G.P.
            </label>
            <input
              type="date"
              name="dateForwardedToGP"
              value={formData.dateForwardedToGP}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          {/* Form 60 Compliance */}
          <div>
            <label className="block mb-1 font-medium text-[#2E2E2E]">
              Form 60 Compliance
            </label>
            <select
              name="form60Compliance"
              value={formData.form60Compliance}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Rejection Reason */}
          {formData.form60Compliance === "Rejected" && (
            <div className="md:col-span-2">
              <label className="block mb-1 font-medium text-red-600">
                Reason for Rejection
              </label>
              <select
                name="rejectionReason"
                value={formData.rejectionReason}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                required
              >
                <option value="">-- Select Reason --</option>
                {rejectionReasons.map((reason, idx) => (
                  <option key={idx} value={reason}>
                    {reason}
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>

              {formData.rejectionReason === "Other" && (
                <input
                  type="text"
                  name="customRejection"
                  value={formData.customRejection}
                  onChange={handleChange}
                  placeholder="Please specify..."
                  className="w-full border mt-3 px-3 py-2 rounded"
                  required
                />
              )}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-[#2E2E2E] hover:bg-[#C5A572] text-white px-6 py-2 rounded font-semibold transition-colors ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Adding..." : "Add Record"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddRecord;
