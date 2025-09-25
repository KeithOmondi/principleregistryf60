import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword } from "../../store/slices/authSlice";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const { loading, message, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    dispatch(forgotPassword(email));
  };

  useEffect(() => {
    if (message) toast.success(message);
    if (error) toast.error(error);
  }, [message, error]);

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-green-50 to-[#fefaf6]">
      {/* 🔹 Blurred Judicial Logo Background */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10 blur-sm"
        style={{
          backgroundImage:
            "url('https://judiciary.go.ke/wp-content/uploads/2023/05/logo1-Copy-2.png')",
        }}
      ></div>

      {/* 🔹 Forgot Password Card */}
      <div className="relative z-10 max-w-md w-full bg-white shadow-2xl rounded-2xl p-8 sm:p-10 space-y-6 border border-[#0a3b1f]/30">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-[#0a3b1f] leading-tight">
            Forgot Password
          </h2>
          <p className="mt-2 text-gray-600 text-sm">
            Enter your registered email to reset your password
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#b48222] focus:border-[#b48222] text-gray-900 placeholder-gray-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-lg font-bold text-white shadow-md transition duration-300 ease-in-out ${
              loading
                ? "bg-[#0a3b1f]/60 cursor-not-allowed"
                : "bg-[#0a3b1f] hover:bg-[#14532d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b48222]"
            }`}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
