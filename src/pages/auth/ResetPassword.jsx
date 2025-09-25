import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { resetPassword } from "../../store/slices/authSlice";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const { token } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, message } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { password, confirmPassword } = formData;

    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password.length < 8 || password.length > 16) {
      toast.error("Password must be 8–16 characters long");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    dispatch(resetPassword({ token, data: { password, confirmPassword } }));
  };

  useEffect(() => {
    if (message) {
      toast.success(message);
      navigate("/login");
    }
    if (error) {
      toast.error(error);
    }
  }, [message, error, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-[#fefaf6] px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-8 space-y-6 border border-gray-200">
        {/* Judiciary Logo */}
        <div className="flex justify-center mb-4">
          <img
            src="https://judiciary.go.ke/wp-content/uploads/2023/05/logo1-Copy-2.png"
            alt="Judiciary Logo"
            className="h-14 w-auto"
          />
        </div>

        <h2 className="text-2xl font-bold text-center text-[#0a3b1f]">
          Reset Your Password
        </h2>
        <p className="text-sm text-gray-600 text-center">
          Enter your new password below to regain access.
        </p>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              New Password
            </label>
            <input
              type="password"
              id="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#b48222]"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#b48222]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md text-white bg-[#0a3b1f] hover:bg-[#14532d] transition ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
