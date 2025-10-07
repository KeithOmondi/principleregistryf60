// src/pages/admin/ManageUsers.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllUsers,
  deleteUser,
  resetAuthState,
  selectAllUsers,
  selectAuthLoading,
  selectAuthError,
  selectAuthMessage,
} from "../../store/slices/authSlice";
import { toast } from "react-toastify";

const ManageUsers = () => {
  const dispatch = useDispatch();
  const users = useSelector(selectAllUsers);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const message = useSelector(selectAuthMessage);

  // Fetch users only once on mount
  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  // Toast notifications for success/error
  useEffect(() => {
  if (message && !loading && !error) {
    toast.success(message);
  }
  if (error && !loading) {
    toast.error(error);
  }
  // Do NOT reset auth state here globally
}, [message, error, loading]);
;

  // Delete user
  const handleDeleteUser = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      dispatch(deleteUser(id));
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-semibold text-gray-800">Manage Users</h2>
        <button
          onClick={() => dispatch(fetchAllUsers())}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {loading && <p className="text-gray-600">Loading users...</p>}

      {!loading && error && (
        <p className="text-red-600 bg-red-50 p-2 rounded-md">{error}</p>
      )}

      {!loading && !error && users.length === 0 && (
        <p className="text-gray-500">No users found.</p>
      )}

      {!loading && !error && users.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left border-b">#</th>
                <th className="p-3 text-left border-b">Name</th>
                <th className="p-3 text-left border-b">Email</th>
                <th className="p-3 text-left border-b">Role</th>
                <th className="p-3 text-left border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="p-3 border-b">{i + 1}</td>
                  <td className="p-3 border-b">{user.name}</td>
                  <td className="p-3 border-b">{user.email}</td>
                  <td className="p-3 border-b capitalize">{user.role}</td>
                  <td className="p-3 border-b">
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      disabled={loading}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
