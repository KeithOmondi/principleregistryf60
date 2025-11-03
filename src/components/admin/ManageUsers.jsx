import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllUsers,
  deleteUser,
  selectAllUsers,
  selectUsersLoading,
  selectAuthError,
  selectAuthMessage,
} from "../../store/slices/authSlice";
import { toast } from "react-toastify";

// Confirm Delete Modal
const ConfirmDeleteModal = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
    <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full transform transition-all scale-100 opacity-100">
      <h3 className="text-xl font-bold mb-4 text-red-600">Confirm Deletion</h3>
      <p className="mb-6 text-gray-700">
        Are you sure you want to delete this user? This action cannot be undone.
      </p>
      <div className="flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

const ManageUsers = () => {
  const dispatch = useDispatch();
  const users = useSelector(selectAllUsers);
  const loading = useSelector(selectUsersLoading);
  const error = useSelector(selectAuthError);
  const message = useSelector(selectAuthMessage);

  const [showModal, setShowModal] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState(null);

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  useEffect(() => {
    if (message && !loading) toast.success(message);
    if (error && !loading) toast.error(error);
  }, [message, error, loading]);

  const handleDeleteUser = (id) => {
    setUserIdToDelete(id);
    setShowModal(true);
  };

  const handleConfirmDelete = useCallback(() => {
    if (userIdToDelete) {
      dispatch(deleteUser(userIdToDelete));
      setUserIdToDelete(null);
      setShowModal(false);
    }
  }, [dispatch, userIdToDelete]);

  const handleCancelDelete = useCallback(() => {
    setUserIdToDelete(null);
    setShowModal(false);
  }, []);

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-3xl font-extrabold text-gray-900">Manage Users</h2>
        <button
          onClick={() => dispatch(fetchAllUsers())}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Refreshing..." : "Refresh Users"}
        </button>
      </div>

      {loading && <p className="text-blue-600 italic">Loading users...</p>}
      {!loading && error && (
        <p className="text-red-600 bg-red-50 p-3 rounded-lg mb-4">{error}</p>
      )}
      {!loading && !error && users.length === 0 && (
        <p className="text-gray-500 italic">No users found.</p>
      )}

      {!loading && users.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                {["#", "Name", "Email", "Role", "Actions"].map((h, i) => (
                  <th
                    key={i}
                    className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user, i) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="p-4 whitespace-nowrap text-sm text-gray-500">
                    {i + 1}
                  </td>
                  <td className="p-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.name}
                  </td>
                  <td className="p-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="p-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                        user.role === "admin"
                          ? "bg-indigo-100 text-indigo-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      disabled={loading}
                      className="text-red-600 hover:text-red-800"
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

      {showModal && (
        <ConfirmDeleteModal
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
};

export default ManageUsers;
