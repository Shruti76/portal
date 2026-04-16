import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, UserCheck, AlertCircle } from 'lucide-react';

export const RoleManagement = () => {
  const { api } = useAuth();
  const [users, setUsers] = useState([]);
  const [organization, setOrganization] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await api.get('/rbac/roles');
      setRoles(response.data);
    } catch (err) {
      setError('Failed to fetch roles');
    }
  };

  const fetchUsers = async () => {
    if (!organization.trim()) {
      setError('Please enter organization name');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/rbac/organization/${organization}`);
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId) => {
    if (!newRole) {
      setError('Please select a role');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await api.put(`/rbac/user/${userId}/role`, { role: newRole });
      setUsers(users.map(u => u.id === userId ? response.data.user : u));
      setSelectedUser(null);
      setNewRole('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Users className="w-6 h-6" />
        Role Management
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex gap-4">
          <input
            type="text"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            placeholder="Organization name"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Loading...' : 'Load Users'}
          </button>
        </div>
      </div>

      {users.length > 0 && (
        <div className="grid gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Users in {organization}</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Current Role</th>
                    <th className="px-4 py-2 text-left">Permissions</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">{user.full_name}</td>
                      <td className="px-4 py-2">{user.email}</td>
                      <td className="px-4 py-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {user.permissions.slice(0, 2).join(', ')}
                        {user.permissions.length > 2 && ` +${user.permissions.length - 2}`}
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => setSelectedUser(user.id)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Change Role
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {selectedUser && (
            <div className="bg-white p-4 rounded-lg shadow">
              <h4 className="font-semibold mb-4">Change Role</h4>
              <div className="flex gap-4">
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select new role</option>
                  {roles.map((role) => (
                    <option key={role.name} value={role.name}>
                      {role.name} - {role.description}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => updateUserRole(selectedUser)}
                  disabled={loading}
                  className="bg-green-600 text-white px-6 py-2 rounded-md font-medium hover:bg-green-700 disabled:bg-gray-400"
                >
                  {loading ? 'Updating...' : 'Update'}
                </button>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md font-medium hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Available Roles & Permissions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map((role) => (
            <div key={role.name} className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                {role.name.toUpperCase()}
              </h4>
              <p className="text-sm text-gray-600 mb-2">{role.description}</p>
              <ul className="text-sm text-gray-700">
                {role.permissions.map((perm, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-green-600">✓</span> {perm}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoleManagement;
