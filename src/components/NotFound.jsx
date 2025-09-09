import React from "react";
import { Link } from "react-router-dom";

const UnauthorizedPage = () => (
  <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-4">
    <h1 className="text-3xl font-bold text-red-600 mb-4">Unauthorized Access</h1>
    <p className="mb-6">You do not have permission to view this page.</p>
    <Link
      to="/"
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
    >
      Go to Home
    </Link>
  </div>
);

export default UnauthorizedPage;
