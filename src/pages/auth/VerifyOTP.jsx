// pages/auth/VerifyOtp.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { otpVerification, resetAuthState } from "../../store/slices/authSlice";
import { toast } from "react-toastify";

export default function VerifyOtp() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [otp, setOtp] = useState("");
  const email = location.state?.email;

  const { isAuthenticated, loading, error, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (error) toast.error(error);
    if (message) toast.success(message);
  }, [error, message]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
    return () => {
      dispatch(resetAuthState());
    };
  }, [isAuthenticated, dispatch, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!otp || !email) {
      toast.error("Email and OTP are required.");
      return;
    }
    dispatch(otpVerification({ email, otp }));
  };

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
          Verify Your OTP
        </h2>
        <p className="text-sm text-gray-600 text-center">
          Enter the 6-digit code sent to <span className="font-medium">{email}</span>.
        </p>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="otp"
              className="block text-sm font-medium text-gray-700"
            >
              One-Time Password
            </label>
            <input
              type="text"
              id="otp"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#b48222] text-center tracking-widest text-lg"
              placeholder="••••••"
              maxLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md text-white bg-[#0a3b1f] hover:bg-[#14532d] transition ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Didn’t receive the code?{" "}
          <button
            onClick={() => toast.info("Resend OTP feature coming soon!")}
            className="text-[#b48222] font-medium hover:underline"
            type="button"
          >
            Resend
          </button>
        </p>
      </div>
    </div>
  );
}
