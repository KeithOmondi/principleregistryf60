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
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* 🔹 Blurred Judicial Logo Background */}
      <div
  className="absolute inset-0 bg-contain bg-no-repeat bg-center opacity-10 blur-sm"
  style={{
    backgroundImage:
      "url('https://judiciary.go.ke/wp-content/uploads/2023/05/logo1-Copy-2.png')",
  }}
></div>


      {/* 🔹 Login Card */}
      <div className="relative z-10 max-w-md w-full bg-white shadow-2xl rounded-2xl p-8 sm:p-10 space-y-7 border border-[#0a3b1f]/30">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-[#0a3b1f] leading-tight">
            Principal Registry
          </h2>
          <p className="mt-2 text-lg text-gray-600">Sign in to continue</p>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-[#0a3b1f] mb-1"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="mt-1 block w-full px-5 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-[#b48222] focus:border-[#b48222] text-gray-900 placeholder-gray-400 text-base"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-[#0a3b1f] mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="mt-1 block w-full px-5 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-[#b48222] focus:border-[#b48222] text-gray-900 placeholder-gray-400 text-base"
            />
          </div>

          {/* Remember + Forgot */}
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-bold text-white shadow-md transition duration-300 ease-in-out ${
              loading
                ? "bg-[#0a3b1f]/60 cursor-not-allowed flex items-center justify-center"
                : "bg-[#0a3b1f] hover:bg-[#085530] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b48222]"
            }`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Signup Link */}
        <p className="text-sm text-center text-gray-600 mt-6">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-[#b48222] font-semibold hover:underline hover:text-[#0a3b1f] transition duration-150 ease-in-out"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
