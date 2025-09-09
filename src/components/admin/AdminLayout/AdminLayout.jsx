import React from "react";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <AdminSidebar className="w-64" />

      {/* Page content */}
      <main className="p-6 bg-gray-100 flex-grow">{children}</main>
    </div>
  );
};

export default AdminLayout;
