import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  MdDashboard,
  MdLibraryBooks,
  MdAddBox,
  MdUploadFile,
  MdPeople,
  MdLock,
  MdLogout,
  MdAssessment,
  MdMenu,
  MdClose,
} from "react-icons/md";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { logout, resetAuthState } from "../../../store/slices/authSlice";

const AdminSidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { to: "/admin/dashboard", label: "Dashboard", icon: <MdDashboard size={20} /> },
    { to: "/admin/records", label: "Manage Records", icon: <MdLibraryBooks size={20} /> },
    { to: "/admin/records/add", label: "Add Record", icon: <MdAddBox size={20} /> },
    { to: "/admin/records/bulk-upload", label: "Bulk Upload", icon: <MdUploadFile size={20} /> },
    { to: "/admin/bulk-report", label: "Bulk Report", icon: <MdAssessment size={20} /> },
    { to: "/admin/users", label: "Manage Users", icon: <MdPeople size={20} /> },
    { to: "/admin/verify", label: "Verify Records", icon: <MdPeople size={20} /> },
    { to: "/change-password", label: "Change Password", icon: <MdLock size={20} /> },
  ];

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      dispatch(resetAuthState());
      toast.success("Logged out successfully.");
      navigate("/login");
    } catch (err) {
      toast.error(err || "Logout failed.");
    }
  };

  return (
    <>
      {/* 🔹 Top Bar with Hamburger (visible only on mobile) */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0a3b1f] text-white shadow">
        <h1 className="text-lg font-bold">Judiciary Admin</h1>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white focus:outline-none"
        >
          {isOpen ? <MdClose size={28} /> : <MdMenu size={28} />}
        </button>
      </div>

      {/* 🔹 Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-white shadow-md transform transition-transform duration-300 z-50
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Header */}
        <div className="hidden md:block p-6 border-b border-gray-200 text-xl font-bold text-[#0a3b1f]">
          Judiciary Admin
        </div>

        {/* Navigation */}
        <nav className="flex flex-col p-4 space-y-2 flex-grow">
          {navLinks.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-md font-medium transition ${
                  isActive
                    ? "bg-[#0a3b1f] text-white" // Active link = green
                    : "text-gray-700 hover:bg-[#f3f3f3] hover:text-[#b48222]" // Hover = gold
                }`
              }
              end
            >
              {icon}
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2 text-red-700 bg-red-100 hover:bg-red-200 rounded-md font-medium transition-colors"
          >
            <MdLogout size={20} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
