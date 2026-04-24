import { useEffect, useState } from 'react';
import { UserCog, Shield, User } from 'lucide-react';
import api from '../lib/api';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggleActive = async (user) => {
    try {
      await api.put(`/users/${user.id}`, { ...user, isActive: !user.isActive });
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`);
      fetchUsers();
    } catch {
      toast.error('Failed to update user');
    }
  };

  if (isLoading) return <LoadingSpinner className="h-64" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{users.length} team members</p>
      </div>

      <div className="card divide-y divide-gray-100 dark:divide-gray-800">
        {users.map((user) => (
          <div key={user.id} className="flex items-center gap-4 p-4">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                <Badge value={user.role} />
                {!user.isActive && (
                  <span className="badge bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">Inactive</span>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {user._count?.assignedLeads || 0} leads · {user._count?.tasks || 0} tasks
              </p>
            </div>
            <button
              onClick={() => handleToggleActive(user)}
              className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${
                user.isActive
                  ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                  : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
              }`}
            >
              {user.isActive ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
