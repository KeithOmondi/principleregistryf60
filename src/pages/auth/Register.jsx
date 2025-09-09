import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { register, resetAuthState } from "../../store/slices/authSlice";
import { toast } from "react-toastify";

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, message } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(register(formData));
  };

  useEffect(() => {
    if (error) toast.error(error);
    if (message && !error) {
      toast.success(message);
      // Navigate to OTP page and pass email as state
      navigate("/verify-otp", { state: { email: formData.email } });
    }

    return () => dispatch(resetAuthState());
  }, [message, error, navigate, formData.email, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-100 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-8 space-y-6 border border-gray-200">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Create Your Account
        </h2>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              required
              onChange={handleChange}
              value={formData.name}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              required
              onChange={handleChange}
              value={formData.email}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              required
              onChange={handleChange}
              value={formData.password}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 rounded-md text-white bg-teal-600 hover:bg-teal-700"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-teal-600 font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
