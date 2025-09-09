import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { resetPassword } from "../../store/slices/authSlice";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const { token } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, message, isAuthenticated } = useSelector((state) => state.auth);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password.length < 8 || password.length > 16) {
      toast.error("Password must be 8-16 characters long");
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 w-full max-w-md"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-700">
          Reset Password
        </h2>

        <div className="mb-4">
          <label className="block text-gray-600 mb-1">New Password</label>
          <input
            type="password"
            value={password}
            className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-600 mb-1">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring"
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-200 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
