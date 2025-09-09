import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRecords, updateRecord } from "../../store/slices/recordsSlice";

const EditRecord = ({ id, onClose }) => {
  const dispatch = useDispatch();
  const { records, loading, error } = useSelector((state) => state.records);

  const [formData, setFormData] = useState({
    courtStation: "",
    causeNo: "",
    nameOfDeceased: "",
    statusAtGP: "Pending",
    volumeNo: "",
    datePublished: "",
    dateForwardedToGP: "", // NEW FIELD
  });

  useEffect(() => {
    if (records.length === 0) {
      dispatch(fetchRecords());
    }
  }, [dispatch, records.length]);

  useEffect(() => {
    const record = records.find((r) => r._id === id);
    if (record) {
      setFormData({
        courtStation: record.courtStation,
        causeNo: record.causeNo,
        nameOfDeceased: record.nameOfDeceased,
        statusAtGP: record.statusAtGP,
        volumeNo: record.volumeNo,
        datePublished: record.datePublished
          ? record.datePublished.substring(0, 10)
          : "",
        dateForwardedToGP: record.dateForwardedToGP
          ? record.dateForwardedToGP.substring(0, 10)
          : "", // NEW FIELD
      });
    }
  }, [records, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(updateRecord({ id, recordData: formData }));
    if (!result.error) {
      onClose(); // close modal on success
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Edit Record</h2>
      {loading && <p className="text-blue-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="courtStation"
          placeholder="Court Station"
          value={formData.courtStation}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="causeNo"
          placeholder="Cause No."
          value={formData.causeNo}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="nameOfDeceased"
          placeholder="Name of Deceased"
          value={formData.nameOfDeceased}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <select
          name="statusAtGP"
          value={formData.statusAtGP}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        >
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
        </select>
        <input
          type="text"
          name="volumeNo"
          placeholder="Volume No."
          value={formData.volumeNo}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="date"
          name="datePublished"
          value={formData.datePublished}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="date"
          name="dateForwardedToGP" // NEW FIELD
          value={formData.dateForwardedToGP}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Update Record
        </button>
      </form>
    </div>
  );
};

export default EditRecord;
