import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminStats } from "../../store/slices/adminSlice";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const {
    totalRecords,
    approved,
    pending,
    loading,
    error,
  } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAdminStats());
  }, [dispatch]);

  // Judiciary theme applied
  const recordCards = [
    { title: "Total Records", value: totalRecords, color: "bg-[#0a3b1f]" },
    { title: "Approved Records", value: approved, color: "bg-[#b48222]" },
    { title: "Rejected Records", value: pending, color: "bg-[#0a3b1f]" },
  ];

  return (
    <div
      className="p-6 min-h-screen bg-cover bg-fixed bg-center"
      style={{
        backgroundImage: "url('/assets/judicial-bg.png')", // 🔑 Add branded background
        backgroundColor: "#f9f9f9", // fallback
      }}
    >
      {/* Header with Judiciary Logo */}
      <div className="flex items-center gap-4 mb-8">
        <img
          src="https://judiciary.go.ke/wp-content/uploads/2023/05/logo1-Copy-2.png"
          alt="Judiciary Logo"
          className="h-16 w-auto"
        />
        <h1 className="text-3xl font-bold text-[#0a3b1f]">
          PR Admin Dashboard
        </h1>
      </div>

      {/* Record Stats */}
      <h2 className="text-xl font-semibold mb-4 text-[#b48222]">
        📊 Records Overview
      </h2>
      {loading ? (
        <p className="text-gray-500">Loading stats...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {recordCards.map((c, idx) => (
            <div
              key={idx}
              className={`${c.color} text-white rounded-lg p-6 shadow-lg`}
            >
              <h2 className="text-lg font-semibold">{c.title}</h2>
              <p className="text-3xl font-bold">{c.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Error handling */}
      {error && <p className="text-red-600 mt-6 font-semibold">⚠️ {error}</p>}
    </div>
  );
};

export default AdminDashboard;
