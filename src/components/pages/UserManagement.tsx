import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, Shield, Clock } from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@rajuprasad.com',
      role: 'Super Admin',
      status: 'Active',
      lastLogin: '2026-02-07 09:30 AM',
      created: '2024-01-15'
    },
    {
      id: 2,
      name: 'Rajesh Kumar',
      email: 'rajesh@rajuprasad.com',
      role: 'Content Manager',
      status: 'Active',
      lastLogin: '2026-02-06 02:15 PM',
      created: '2024-03-20'
    },
    {
      id: 3,
      name: 'Priya Sharma',
      email: 'priya@rajuprasad.com',
      role: 'Editor',
      status: 'Active',
      lastLogin: '2026-02-05 04:45 PM',
      created: '2024-06-10'
    },
    {
      id: 4,
      name: 'Amit Patel',
      email: 'amit@rajuprasad.com',
      role: 'Editor',
      status: 'Inactive',
      lastLogin: '2026-01-28 11:20 AM',
      created: '2025-02-01'
    }
  ]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [toast, setToast] = useState('');

  const roles = ['Super Admin', 'Content Manager', 'Editor'];

  const handleSave = () => {
    setToast('User settings saved successfully!');
    setEditingId(null);
    setShowAddUser(false);
    setTimeout(() => setToast(''), 3000);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== id));
      setToast('User deleted successfully!');
      setTimeout(() => setToast(''), 3000);
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-[#0F1115] via-[#0F1115] to-[#16181D] min-h-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
          <p className="text-[#888888]">Manage admin users and their permissions</p>
        </div>
        <button
          onClick={() => setShowAddUser(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#022683] text-white rounded-lg hover:bg-[#033aa0]"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-xl p-6 w-full max-w-md border border-[rgba(136,136,136,0.25)]">
            <h2 className="text-xl font-bold text-white mb-6">Add New User</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-transparent outline-none bg-white dark:bg-[#1A1D24] text-gray-900 dark:text-white"
                  placeholder="Enter name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-transparent outline-none bg-white dark:bg-[#1A1D24] text-gray-900 dark:text-white"
                  placeholder="user@rajuprasad.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-transparent outline-none bg-white dark:bg-[#1A1D24] text-gray-900 dark:text-white">
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-transparent outline-none bg-white dark:bg-[#1A1D24] text-gray-900 dark:text-white"
                  placeholder="Enter password"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-[#022683] text-white rounded-lg hover:bg-[#033aa0]"
              >
                Add User
              </button>
              <button
                onClick={() => setShowAddUser(false)}
                className="px-4 py-2 bg-[rgba(136,136,136,0.1)] text-[#E6E6E6] rounded-lg hover:bg-[rgba(136,136,136,0.2)]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users List */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg border border-[rgba(136,136,136,0.25)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#1A1D24] border-b border-[rgba(136,136,136,0.25)]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-300">User</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Last Login</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(136,136,136,0.25)]">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-[rgba(136,136,136,0.05)] transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                          <div className="text-sm text-[#888888]">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {editingId === user.id ? (
                          <select
                            value={user.role}
                            className="px-3 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-[#022683] outline-none text-sm"
                          >
                            {roles.map(role => (
                              <option key={role} value={role}>{role}</option>
                            ))}
                          </select>
                        ) : (
                          <span className={`px-3 py-1 text-xs rounded-full ${user.role === 'Super Admin' ? 'bg-purple-100 text-purple-700' :
                            user.role === 'Content Manager' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                            {user.role}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs rounded-full ${user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {user.lastLogin}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingId(editingId === user.id ? null : user.id)}
                            className="p-1.5 text-[#022683] hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {user.id !== 1 && (
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Stats & Info Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Stats */}
          <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)]">
            <h3 className="font-bold text-white mb-4">User Statistics</h3>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-[#022683]">{users.length}</div>
                <div className="text-sm text-gray-700 dark:text-gray-300">Total Users</div>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {users.filter(u => u.status === 'Active').length}
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">Active Users</div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">By Role</h4>
                <div className="space-y-2">
                  {roles.map(role => (
                    <div key={role} className="flex justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-300">{role}</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {users.filter(u => u.role === role).length}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Role Permissions */}
          <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)]">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Role Permissions
            </h3>

            <div className="space-y-4">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="font-medium text-purple-900 dark:text-purple-100 text-sm mb-2">Super Admin</div>
                <ul className="text-xs text-purple-700 dark:text-purple-300 space-y-1">
                  <li>• Full system access</li>
                  <li>• User management</li>
                  <li>• All content editing</li>
                </ul>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="font-medium text-blue-900 dark:text-blue-100 text-sm mb-2">Content Manager</div>
                <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Edit all pages</li>
                  <li>• Manage media</li>
                  <li>• View analytics</li>
                </ul>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="font-medium text-gray-900 dark:text-white text-sm mb-2">Editor</div>
                <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Edit assigned pages</li>
                  <li>• Upload media</li>
                  <li>• View content</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Login History */}
          <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)]">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Logins
            </h3>

            <div className="space-y-3">
              {users.slice(0, 3).map(user => (
                <div key={user.id} className="text-sm">
                  <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                  <div className="text-xs text-[#888888]">{user.lastLogin}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-[#022683] text-white rounded-lg hover:bg-[#033aa0]"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      {toast && (
        <div className="fixed bottom-8 right-8 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
