import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loadUser } from "./store/slices/authSlice";

import { userRoutes, adminRoutes, authRoutes } from "./routes";
import PrivateRoute from "./auth/PrivateRoute";
import AdminRoute from "./auth/AdminRoute";
import NotFound from "./components/NotFound";

import { ToastContainer } from "react-toastify";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUser()); // ✅ ensures user is loaded from backend cookie
  }, [dispatch]);

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
