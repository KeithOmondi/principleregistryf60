import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addRecord, resetRecordState } from "../../store/slices/recordsSlice";
import { fetchCourts } from "../../store/slices/courtSlice";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";

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
  "Kindly confirm the deceased name (deceased name and petitoner's name are similar)",
];

const AddRecord = () => {
  const dispatch = useDispatch();
  const { loading, error, message } = useSelector((state) => state.records);
  const {
    list: courts,
    loading: courtsLoading,
    error: courtsError,
  } = useSelector((state) => state.courts);

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

  // Fetch courts on mount
  useEffect(() => {
    dispatch(fetchCourts());
  }, [dispatch]);

  // Auto-calc lead time
  // Auto-calc lead time (always positive, even if dates reversed)
  useEffect(() => {
    if (formData.dateReceived && formData.dateOfReceipt) {
      const received = new Date(formData.dateReceived);
      const receipt = new Date(formData.dateOfReceipt);

      if (!isNaN(received) && !isNaN(receipt)) {
        const diffDays = Math.abs(
          Math.ceil((receipt - received) / (1000 * 60 * 60 * 24))
        );
        setFormData((prev) => ({ ...prev, leadTime: diffDays }));
      }
    }
  }, [formData.dateReceived, formData.dateOfReceipt]);

  // Toast + reset
  useEffect(() => {
    if (message) {
      toast.success(message);
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
      dispatch(resetRecordState());
    }
    if (error) {
      toast.error(error);
      dispatch(resetRecordState());
    }
  }, [message, error, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const {
      courtStation,
      causeNo,
      nameOfDeceased,
      dateReceived,
      dateOfReceipt,
      dateForwardedToGP,
      form60Compliance,
      rejectionReason,
      customRejection,
      leadTime,
    } = formData;

    if (
      !courtStation ||
      !causeNo ||
      !nameOfDeceased ||
      !dateReceived ||
      !dateOfReceipt
    ) {
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

    dispatch(
      addRecord({
        courtStation,
        causeNo,
        nameOfDeceased,
        dateReceived,
        dateOfReceipt,
        leadTime,
        dateForwardedToGP,
        form60Compliance,
        rejectionReason: finalRejectionReason,
      })
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#C5A572] to-[#2E2E2E] p-8">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8 space-y-8">
        <ToastContainer position="top-right" autoClose={3000} />
        <h2 className="text-2xl font-bold mb-6 text-[#2E2E2E]">
          ✍️ Add New Court Record
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {/* Court Station Dropdown */}
          <div>
  <label className="block mb-1 font-medium text-[#2E2E2E]">
    Court Station
  </label>
  <Select
    options={courts.map((court) => ({
      value: court._id,
      label: court.name,
    }))}
    isLoading={courtsLoading}
    isClearable
    placeholder="Search or select a court..."
    value={
      formData.courtStation
        ? {
            value: formData.courtStation,
            label:
              courts.find((c) => c._id === formData.courtStation)?.name || "",
          }
        : null
    }
    onChange={(selected) =>
      setFormData((prev) => ({
        ...prev,
        courtStation: selected ? selected.value : "",
      }))
    }
    styles={{
      control: (base) => ({
        ...base,
        borderColor: "#ccc",
        borderRadius: "0.5rem",
        padding: "2px",
      }),
    }}
  />
</div>

          {/* Cause No. */}
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

          {/* Date of Receipt */}
          <div>
            <label className="block mb-1 font-medium text-[#2E2E2E]">
              Date of Receipt
            </label>
            <input
              type="date"
              name="dateOfReceipt"
              value={formData.dateOfReceipt}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
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
              required
            >
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Rejection Reasons */}
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
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-[#2E2E2E] hover:bg-[#C5A572] text-white px-6 py-2 rounded font-semibold transition-colors ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Adding..." : "Add Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRecord;
