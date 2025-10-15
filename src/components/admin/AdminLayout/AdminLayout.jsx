import React from "react";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = ({ children }) => {
  return (
    <div className="flex bg-gray-100 min-h-screen">
      {/* Sidebar - fixed width */}
      <div className="fixed left-0 top-0 h-full w-64 z-40">
        <AdminSidebar />
      </div>

      {/* Main content - shifted to the right of sidebar */}
      <main className="flex-1 ml-64 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
