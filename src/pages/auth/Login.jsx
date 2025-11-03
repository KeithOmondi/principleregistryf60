import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { login, resetAuthState } from "../../store/slices/authSlice";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, isAuthenticated, error, user } = useSelector(
    (state) => state.auth
  );

  // ✅ Redirect after login
  useEffect(() => {
    if (isAuthenticated && user) {
      let path = "/dashboard";
      if (user.role === "Admin") path = "/admin/dashboard";
      else if (user.role === "User") path = "/dashboard";

      toast.success("Login successful");
      navigate(path, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // ✅ Error handling
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(resetAuthState());
    }
  }, [error, dispatch]);

  // ✅ Handle input change
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ✅ Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    const { email, password } = formData;
    if (!email.trim() || !password.trim()) {
      toast.warn("Email and password cannot be empty.");
      return;
    }
    dispatch(login({ email, password }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 bg-white shadow-2xl rounded-2xl overflow-hidden">
        {/* LEFT SECTION — IMAGE / BRAND / MESSAGE */}
        <div className="hidden md:flex flex-col items-center justify-center bg-[#0a3b1f] text-white p-10 relative">
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold tracking-wide">
              Welcome to the{" "}
              <span className="text-[#b48222]">Principal Registry</span>
            </h2>
            <p className="text-green-100 text-sm max-w-md mx-auto">
              Access the official registry system to manage and track legal
              documents securely and efficiently.
            </p>
          </div>

          <img
            src="https://judiciary.go.ke/wp-content/uploads/2023/05/logo1-Copy-2.png"
            alt="Judiciary Logo"
            className="w-3/4 mt-8 opacity-90"
          />

          <div className="absolute bottom-6 text-xs text-green-200">
            © {new Date().getFullYear()} Judiciary of Kenya — All rights reserved.
          </div>
        </div>

        {/* RIGHT SECTION — LOGIN FORM */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <h1 className="text-2xl font-semibold text-gray-800 text-center mb-6">
            Sign in to your account
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#b48222]"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#b48222]"
                required
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-[#0a3b1f] border-gray-300 rounded focus:ring-[#b48222] transition duration-150 ease-in-out"
                />
                <span className="ml-2 select-none">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="font-medium text-[#b48222] hover:text-[#0a3b1f] hover:underline transition duration-150 ease-in-out"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-[#0a3b1f] text-white font-semibold py-2.5 rounded-lg hover:bg-[#085530] transition flex items-center justify-center gap-2 ${
                loading
                  ? "opacity-75 cursor-not-allowed"
                  : "focus:outline-none focus:ring-2 focus:ring-[#b48222]"
              }`}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"
                    ></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="text-center text-sm text-gray-500 mt-5">
            <span>Don’t have an account?</span>{" "}
            <Link
              to="/register"
              className="text-[#b48222] hover:underline font-medium"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
