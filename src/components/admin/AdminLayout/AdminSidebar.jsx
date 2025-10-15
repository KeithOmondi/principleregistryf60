import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  MdDashboard,
  MdLibraryBooks,
  MdAddBox,
  MdPeople,
  MdLogout,
  MdMenu,
  MdClose,
  MdScanner,
} from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { logout, resetAuthState } from "../../../store/slices/authSlice";

const AdminSidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navLinks = [
    { to: "/admin/dashboard", label: "Dashboard", icon: <MdDashboard size={22} /> },
    { to: "/admin/records", label: "Manage Records", icon: <MdLibraryBooks size={22} /> },
    { to: "/admin/records/add", label: "Add Record", icon: <MdAddBox size={22} /> },
    { to: "/admin/scan", label: "Scan", icon: <MdScanner size={22} /> },
    { to: "/admin/users", label: "Manage Users", icon: <MdPeople size={22} /> },
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

  /* ----------------------------- MOBILE SIDEBAR ----------------------------- */
  const MobileSidebar = (
    <AnimatePresence>
      {isMobileOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setIsMobileOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 z-50 h-screen w-64 bg-white shadow-lg flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h1 className="text-lg font-bold text-[#0a3b1f]">Judiciary Admin</h1>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="text-gray-700 hover:text-[#0a3b1f]"
              >
                <MdClose size={26} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
              {navLinks.map(({ to, label, icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setIsMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 rounded-md font-medium transition ${
                      isActive
                        ? "bg-[#0a3b1f] text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`
                  }
                >
                  {icon}
                  {label}
                </NavLink>
              ))}
            </nav>

            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-2 text-red-700 bg-red-100 hover:bg-red-200 rounded-md font-medium transition"
              >
                <MdLogout size={20} />
                Logout
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );

  /* ----------------------------- DESKTOP SIDEBAR ----------------------------- */
  const DesktopSidebar = (
    <aside
      className={`hidden md:flex flex-col bg-white shadow-lg border-r border-gray-200 transition-all duration-300 fixed top-0 left-0 h-screen z-40
      ${isCollapsed ? "w-20" : "w-64"}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <h1 className="text-lg font-bold text-[#0a3b1f]">Judiciary Admin</h1>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-700 hover:text-[#0a3b1f] transition"
        >
          <MdMenu size={24} />
        </button>
      </div>

      {/* Links */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navLinks.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-md text-[15px] font-medium transition-colors duration-200 relative group
              ${isActive ? "bg-[#0a3b1f] text-white" : "text-gray-700 hover:bg-gray-100"}
              ${isCollapsed ? "justify-center" : ""}`
            }
            end
          >
            {icon}
            {!isCollapsed && <span>{label}</span>}
            {isCollapsed && (
              <span className="absolute left-16 bg-gray-800 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                {label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-4 py-2 text-red-700 bg-red-100 hover:bg-red-200 rounded-md font-medium transition-colors
          ${isCollapsed ? "justify-center" : ""}`}
        >
          <MdLogout size={20} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Mobile Topbar */}
      <div className="sticky top-0 left-0 z-50 flex items-center justify-between bg-[#0a3b1f] text-white px-4 py-3 md:hidden">
        <h1 className="text-lg font-bold">Judiciary Admin</h1>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="text-white focus:outline-none"
        >
          {isMobileOpen ? <MdClose size={28} /> : <MdMenu size={28} />}
        </button>
      </div>

      {/* Sticky Sidebars */}
      {DesktopSidebar}
      {MobileSidebar}
    </>
  );
};

export default AdminSidebar;
