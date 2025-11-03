import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { register, resetAuthState } from "../../store/slices/authSlice";
import { toast } from "react-toastify";

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, message, pendingEmail } = useSelector(
    (state) => state.auth
  );

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(register(formData));
  };

  useEffect(() => {
    if (error) toast.error(error);
    if (message && pendingEmail) {
      toast.success(message);
      navigate("/verify-otp");
    }
    return () => {
      dispatch(resetAuthState());
    };
  }, [message, error, pendingEmail, navigate, dispatch]);

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
              Register for an account to securely manage and track legal documents.
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

        {/* RIGHT SECTION — SIGNUP FORM */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <h1 className="text-2xl font-semibold text-gray-800 text-center mb-6">
            Create Your Account
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#b48222]"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#b48222]"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#b48222]"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-[#0a3b1f] text-white font-semibold py-2.5 rounded-lg hover:bg-[#085530] transition flex items-center justify-center gap-2 ${
                loading ? "opacity-75 cursor-not-allowed" : "focus:outline-none focus:ring-2 focus:ring-[#b48222]"
              }`}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          {/* Already have account */}
          <div className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#b48222] hover:underline font-medium"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
