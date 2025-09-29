// pages/auth/Signup.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { register, resetAuthState } from "../../store/slices/authSlice";
import { toast } from "react-toastify";

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, message, pendingEmail } = useSelector((state) => state.auth);

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
    <div className="relative min-h-screen flex items-center justify-center px-4">
      {/* Blurred Judiciary Logo Background */}
      <div
        className="absolute inset-0 bg-contain bg-no-repeat bg-center opacity-10 blur-sm"
        style={{
          backgroundImage:
            "url('https://judiciary.go.ke/wp-content/uploads/2023/05/logo1-Copy-2.png')",
        }}
      ></div>

      {/* Signup Card */}
      <div className="relative z-10 max-w-md w-full bg-white shadow-2xl rounded-2xl p-8 sm:p-10 space-y-7 border border-[#0a3b1f]/30">
        <h2 className="text-center text-3xl font-extrabold text-[#0a3b1f]">
          Create Your Account
        </h2>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Full Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[#0a3b1f] mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              required
              onChange={handleChange}
              value={formData.name}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#b48222] focus:border-[#b48222]"
              placeholder="John Doe"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#0a3b1f] mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              required
              onChange={handleChange}
              value={formData.email}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#b48222] focus:border-[#b48222]"
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#0a3b1f] mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              required
              onChange={handleChange}
              value={formData.password}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#b48222] focus:border-[#b48222]"
              placeholder="••••••••"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-bold text-white shadow-md transition duration-300 ease-in-out ${
              loading
                ? "bg-[#0a3b1f]/60 cursor-not-allowed"
                : "bg-[#0a3b1f] hover:bg-[#085530] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b48222]"
            }`}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        {/* Already have account */}
        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#b48222] font-semibold hover:underline hover:text-[#0a3b1f] transition duration-150 ease-in-out"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
