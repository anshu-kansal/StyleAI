import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axios';
import { RefreshCw, Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Inline form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/categories');
      setCategories(res.data.data || []);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      if (editingId) {
        await axiosInstance.patch(`/categories/${editingId}`, {
          name: formName,
          description: formDescription,
        });
        toast.success('Category updated');
      } else {
        await axiosInstance.post('/categories', {
          name: formName,
          description: formDescription,
        });
        toast.success('Category created');
      }
      resetForm();
      fetchCategories();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat._id);
    setFormName(cat.name);
    setFormDescription(cat.description || '');
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try {
      await axiosInstance.delete(`/categories/${id}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormName('');
    setFormDescription('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-black tracking-tight text-slate-900 dark:text-white">
            Manage Categories
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            {categories.length} categories configured
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-950 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all cursor-pointer dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
        >
          <Plus className="h-4 w-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Inline Create/Edit Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-2xl p-6 dark:bg-slate-900 dark:border-slate-800 shadow-sm space-y-4 max-w-lg"
        >
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            {editingId ? 'Edit Category' : 'New Category'}
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Category name"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-accent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
            <input
              type="text"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Description (optional)"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-accent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-brand-accent text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all cursor-pointer"
            >
              <Check className="h-3.5 w-3.5" />
              <span>{editingId ? 'Update' : 'Create'}</span>
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="flex items-center gap-1.5 px-5 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all cursor-pointer dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <X className="h-3.5 w-3.5" />
              <span>Cancel</span>
            </button>
          </div>
        </form>
      )}

      {/* Categories Table */}
      {loading ? (
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
                  <th className="px-5 py-3">Slug</th>
                  <th className="px-5 py-3">Description</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800 text-xs">
                {categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10">
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                      {cat.name}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-500 text-[11px]">
                      {cat.slug}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 max-w-xs truncate">
                      {cat.description || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 font-semibold whitespace-nowrap">
                      {new Date(cat.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(cat)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all cursor-pointer"
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-400 font-bold">
                      No categories found
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

export default AdminCategories;
