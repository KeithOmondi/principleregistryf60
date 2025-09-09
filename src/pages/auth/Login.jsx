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

  // ✅ Redirect based on user role
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("User Role:", user.role);

      let path = "/dashboard"; // fallback

      if (user.role === "Admin") {
        path = "/admin/dashboard";
      } else if (user.role === "User") {
        path = "/dashboard";
      }

      toast.success("Login successful");
      navigate(path, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // ✅ Show error and reset auth state
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

  // ✅ Handle form submit
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full bg-white shadow-2xl rounded-2xl p-8 sm:p-10 space-y-7 border border-gray-100 transition-transform duration-300 hover:scale-[1.01]">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 leading-tight">
            Welcome Back! 👋
          </h2>
          <p className="mt-2 text-lg text-gray-600">Sign in to your account</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-1">
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
              className="mt-1 block w-full px-5 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400 text-base"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-1">
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
              className="mt-1 block w-full px-5 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400 text-base"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 transition duration-150 ease-in-out"
              />
              <span className="ml-2 select-none">Remember me</span>
            </label>
            <Link
              to="/forgot-password"
              className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline transition duration-150 ease-in-out"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-bold text-white shadow-md transition duration-300 ease-in-out ${
              loading
                ? "bg-indigo-400 cursor-not-allowed flex items-center justify-center"
                : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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

        <p className="text-sm text-center text-gray-600 mt-6">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-indigo-600 font-semibold hover:underline hover:text-indigo-700 transition duration-150 ease-in-out"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
