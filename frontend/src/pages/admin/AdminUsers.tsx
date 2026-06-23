import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { fetchAllUsers, updateUserRole } from '../../features/admin/adminSlice';
import { RefreshCw, Search, Shield, ShieldOff } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const AdminUsers: React.FC = () => {
  const dispatch = useAppDispatch();
  const { users, usersLoading } = useAppSelector((state) => state.admin);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const handleToggleAdmin = async (userId: string, currentRoles: string[]) => {
    const isAdmin = currentRoles.includes('ADMIN');
    const newRoles = isAdmin
      ? currentRoles.filter((r) => r !== 'ADMIN')
      : [...currentRoles, 'ADMIN'];

    try {
      await dispatch(updateUserRole({ userId, roles: newRoles })).unwrap();
      toast.success(isAdmin ? 'Admin role removed' : 'Admin role granted');
    } catch (err: any) {
      toast.error(err || 'Failed to update role');
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-black tracking-tight text-slate-900 dark:text-white">
          Manage Users
        </h1>
        <p className="text-xs text-slate-400 font-semibold mt-1">
          View all registered users and manage admin roles
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-accent dark:bg-slate-900 dark:border-slate-800 dark:text-white"
        />
      </div>

      {/* Users Table */}
      {usersLoading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="h-8 w-8 text-slate-300 animate-spin" />
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl dark:bg-slate-900 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Roles</th>
                  <th className="px-5 py-3">Joined</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800 text-xs">
                {filtered.map((user) => {
                  const isAdmin = user.roles.includes('ADMIN');
                  return (
                    <tr key={user._id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10">
                      <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                        {user.name}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400 font-medium">
                        {user.email}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-1.5">
                          {user.roles.map((role) => (
                            <span
                              key={role}
                              className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${
                                role === 'ADMIN'
                                  ? 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400'
                                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                              }`}
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 font-semibold whitespace-nowrap">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => handleToggleAdmin(user._id, user.roles)}
                          className={`flex items-center gap-1 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                            isAdmin
                              ? 'text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/30'
                              : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/30'
                          }`}
                        >
                          {isAdmin ? (
                            <>
                              <ShieldOff className="h-3 w-3" />
                              <span>Remove Admin</span>
                            </>
                          ) : (
                            <>
                              <Shield className="h-3 w-3" />
                              <span>Make Admin</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-400 font-bold">
                      {searchTerm ? 'No matching users found' : 'No users yet'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
