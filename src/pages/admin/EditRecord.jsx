import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateRecord, resetRecordState } from "../../store/slices/recordsSlice";
import { fetchCourts } from "../../store/slices/courtSlice";
import { toast, ToastContainer } from "react-toastify";
import Select from "react-select";
import "react-toastify/dist/ReactToastify.css";

const rejectionReasons = [
  "No Stamp or Seal/Note Dated",
  "Conflicting Case Number between the E Citizen Print Receipt and the Form 60 Notice",
  "Lack of Deputy and or District Registrars' Signature and Name",
  "Prepare a corrigenda",
  "Proof of gazette fees payment not attached NO receipt attached",
  "No Case Number on Form 60 and/or Government Printer Receipt",
  "Lack of Petitioner(s) name and or deceased name in the Form 60 Notice",
  "Attach original bankslip and not a photocopy unless paid via ECitizen platform",
  "Same deceased details in two different case numbers within submitted Notices from the Station",
  "Not indicating whether the matter is testate or intestate",
  "Same case number with two different petitioners and or deceased names",
  "Deputy registrar and or District Registrar name not typed",
  "Receipt mismatch/wrong receipt",
  "Bankers’ cheques be addressed to Government Printers and not Kenya Gazette",
  "Altered Form 60 Notice",
  "One deceased per petition (there is more than one deceased in this case)",
  "The District Registrar and or District Registrar Notices should not be signed for",
  "Different Court Stations in one Form 60 notice",
  "Attach the Govt. receipt copy and NOT the customer copy for the E-citizen payments",
  "Form 60 Notice missing the date of Death of the Deceased Persons",
  "Rejected from the Govt. Printers due to being sent directly to their offices",
  "Attach the original Form 60 notice NOT a copy",
  "Form 60 notice without a receipt (attach proof of payment)",
  "Duplicate/Photocopy of Form 60",
  "FORM 60 missing",
  "Error is from Court of origin. Make fresh payments and prepare a corrigenda",
  "Two Deceased in one Form 60",
  "Kindly confirm the deceased name (deceased name and petitioner's name are similar)",
];

const EditRecord = ({ record, onClose }) => {
  const dispatch = useDispatch();
  const { list: courts, loading: courtsLoading } = useSelector((state) => state.courts);
  const { loading, message, error } = useSelector((state) => state.records);

  const [formData, setFormData] = useState({
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

  // Fetch courts if not already loaded
  useEffect(() => {
    if (!courts.length) dispatch(fetchCourts());
  }, [dispatch, courts.length]);

  // Prefill form when record is provided
  useEffect(() => {
    if (record) {
      const isCustom =
        record.form60Compliance === "Rejected" &&
        record.rejectionReason &&
        !rejectionReasons.includes(record.rejectionReason);

      setFormData({
        courtStation: record.courtStation?._id || "",
        causeNo: record.causeNo || "",
        nameOfDeceased: record.nameOfDeceased || "",
        dateReceived: record.dateReceived ? record.dateReceived.substring(0, 10) : "",
        dateOfReceipt: record.dateOfReceipt ? record.dateOfReceipt.substring(0, 10) : "",
        leadTime: record.leadTime || 0,
        dateForwardedToGP: record.dateForwardedToGP
          ? record.dateForwardedToGP.substring(0, 10)
          : "",
        form60Compliance: record.form60Compliance || "Approved",
        rejectionReason: isCustom ? "Other" : record.rejectionReason || "",
        customRejection: isCustom ? record.rejectionReason : "",
      });
    }
  }, [record]);

  const courtOptions = useMemo(
    () => courts.map((c) => ({ value: c._id, label: c.name })),
    [courts]
  );

  // Auto-calc lead time (dateOfReceipt optional)
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

    // Validate required fields (dateOfReceipt optional)
    const { courtStation, causeNo, nameOfDeceased, dateReceived } = formData;
    if (!courtStation || !causeNo || !nameOfDeceased || !dateReceived) {
      toast.error("⚠️ Please fill in all required fields");
      return;
    }

    // Handle rejection reason
    let finalRejectionReason = formData.rejectionReason;
    if (formData.form60Compliance === "Rejected") {
      if (!formData.rejectionReason) {
        toast.error("⚠️ Please select a rejection reason");
        return;
      }
      if (formData.rejectionReason === "Other" && !formData.customRejection.trim()) {
        toast.error("⚠️ Please specify the rejection reason");
        return;
      }
      if (formData.rejectionReason === "Other") {
        finalRejectionReason = formData.customRejection.trim();
      }
    }

    try {
      await dispatch(
        updateRecord({
          id: record._id,
          data: { ...formData, rejectionReason: finalRejectionReason },
        })
      ).unwrap();

      toast.success("✅ Record updated successfully!");
      onClose();
    } catch (err) {
      toast.error(err || "❌ Failed to update record");
    }
  };

  // Handle global messages/errors
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
    <div className="bg-gray-50 p-6 w-full rounded-2xl shadow-lg border border-[#0a2342]/20">
      <ToastContainer position="top-right" autoClose={3000} />
      <h3 className="text-2xl font-bold mb-6 text-center text-[#0a2342]">✏️ Edit Record</h3>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Court Station */}
        <div className="space-y-1">
          <label className="block font-medium text-[#0a2342]">Court Station</label>
          <Select
            options={courtOptions}
            isLoading={courtsLoading}
            isClearable
            placeholder="Search or select a court..."
            value={formData.courtStation ? courtOptions.find((c) => c.value === formData.courtStation) : null}
            onChange={(selected) =>
              setFormData((prev) => ({ ...prev, courtStation: selected ? selected.value : "" }))
            }
          />
        </div>

        {/* Cause No */}
        <div className="space-y-1">
          <label className="block font-medium text-[#0a2342]">Cause No.</label>
          <input
            type="text"
            name="causeNo"
            value={formData.causeNo}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-[#b48222]"
            required
          />
        </div>

        {/* Name of Deceased */}
        <div className="space-y-1">
          <label className="block font-medium text-[#0a2342]">Name of Deceased</label>
          <input
            type="text"
            name="nameOfDeceased"
            value={formData.nameOfDeceased}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-[#b48222]"
            required
          />
        </div>

        {/* Date Received */}
        <div className="space-y-1">
          <label className="block font-medium text-[#0a2342]">Date Received</label>
          <input
            type="date"
            name="dateReceived"
            value={formData.dateReceived}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-[#b48222]"
            required
          />
        </div>

        {/* Date of Receipt (optional) */}
        <div className="space-y-1">
          <label className="block font-medium text-[#0a2342]">Date of Receipt</label>
          <input
            type="date"
            name="dateOfReceipt"
            value={formData.dateOfReceipt}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-[#b48222]"
          />
        </div>

        {/* Lead Time */}
        <div className="space-y-1">
          <label className="block font-medium text-[#0a2342]">Lead Time (days)</label>
          <input
            type="number"
            name="leadTime"
            value={formData.leadTime}
            readOnly
            className="w-full p-2 border rounded-lg shadow-sm bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* Date Forwarded */}
        <div className="space-y-1">
          <label className="block font-medium text-[#0a2342]">Date Forwarded to G.P.</label>
          <input
            type="date"
            name="dateForwardedToGP"
            value={formData.dateForwardedToGP}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-[#b48222]"
          />
        </div>

        {/* Form 60 Compliance */}
        <div className="space-y-1">
          <label className="block font-medium text-[#0a2342]">Form 60 Compliance</label>
          <select
            name="form60Compliance"
            value={formData.form60Compliance}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-[#b48222]"
          >
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Rejection Reason */}
        {formData.form60Compliance === "Rejected" && (
          <div className="col-span-1 md:col-span-2 space-y-1">
            <label className="block font-medium text-red-700">Reason for Rejection</label>
            <select
              name="rejectionReason"
              value={formData.rejectionReason}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-red-500"
              required
            >
              <option value="">-- Select Reason --</option>
              {rejectionReasons.map((reason, idx) => (
                <option key={idx} value={reason}>{reason}</option>
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
                className="w-full p-2 border mt-3 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500"
                required
              />
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="col-span-1 md:col-span-2 flex justify-end gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              loading ? "bg-[#b48222]/50 cursor-not-allowed" : "bg-[#0a2342] text-white hover:bg-[#b48222]"
            }`}
          >
            {loading ? "Updating..." : "Update Record"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-lg font-semibold text-[#0a2342] bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditRecord;
