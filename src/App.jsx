import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loadUser, selectAuthLoading } from "./store/slices/authSlice";

import { userRoutes, adminRoutes, authRoutes } from "./routes";
import PrivateRoute from "./auth/PrivateRoute";
import AdminRoute from "./auth/AdminRoute";
import NotFound from "./components/NotFound";

import { ToastContainer } from "react-toastify";

function App() {
  const dispatch = useDispatch();
  const authLoading = useSelector(selectAuthLoading); // new selector

  useEffect(() => {
    dispatch(loadUser()); // Load user session on app start
  }, [dispatch]);

  if (authLoading) {
    // Optional: show a full-page loader while restoring session
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl font-semibold text-gray-700">Loading...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        {userRoutes.map(({ path, element }, i) => (
          <Route key={i} path={path} element={element} />
        ))}
        {authRoutes.map(({ path, element }, i) => (
          <Route key={i} path={path} element={element} />
        ))}

        {/* Admin Protected Routes */}
        {adminRoutes.map(({ path, element }, i) => (
          <Route
            key={i}
            path={path}
            element={<AdminRoute>{element}</AdminRoute>}
          />
        ))}

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </BrowserRouter>
  );
}

export default App;
