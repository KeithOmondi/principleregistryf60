import React from "react";

// ✅ Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AddRecord from "./pages/admin/AddRecord";
import EditRecord from "./pages/admin/EditRecord";

// ✅ Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyOTP from "./pages/auth/VerifyOTP";

// ✅ Public Page
import RecordsPage from "./pages/user/RecordsPage";

// ✅ Layouts
import AdminLayout from "./components/admin/AdminLayout/AdminLayout";
import ManageRecordsPage from "./pages/admin/ManageRecordsPage";
import BulkUpload from "./components/admin/BulkUpload";
import BulkReport from "./pages/admin/BulkReport";
import VerifyRecords from "./components/admin/VerifyRecords";

// =================== USER (PUBLIC) ROUTES ===================
export const userRoutes = [
  {
    path: "/",
    element: <RecordsPage />, // ⬅️ no UserLayout
  },
];

// =================== ADMIN ROUTES ===================
export const adminRoutes = [
  {
    path: "/admin/dashboard",
    element: (
      <AdminLayout>
        <AdminDashboard />
      </AdminLayout>
    ),
  },
  {
    path: "/admin/records",
    element: (
      <AdminLayout>
        <ManageRecordsPage />
      </AdminLayout>
    ),
  },
  {
    path: "/admin/records/add",
    element: (
      <AdminLayout>
        <AddRecord />
      </AdminLayout>
    ),
  },
  {
    path: "/admin/records/bulk-upload",
    element: (
      <AdminLayout>
        <BulkUpload />
      </AdminLayout>
    ),
  },
  {
    path: "/admin/records/edit/:id",
    element: (
      <AdminLayout>
        <EditRecord />
      </AdminLayout>
    ),
  },
  {
    path: "/admin/bulk-report",
    element: (
      <AdminLayout>
        <BulkReport />
      </AdminLayout>
    ),
  },
  {
    path: "/admin/verify",
    element: (
      <AdminLayout>
        <VerifyRecords />
      </AdminLayout>
    ),
  },
];

// =================== AUTH ROUTES ===================
export const authRoutes = [
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> }, // optional
  { path: "/verify-otp", element: <VerifyOTP /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/password/reset/:token", element: <ResetPassword /> },
];
