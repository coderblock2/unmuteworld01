
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
    getAdminStats, 
    getAllPostsAdmin, 
    deletePostAdmin, 
    getAllUsersAdmin, 
    deleteUserAdmin, 
    toggleUserBlockStatusAdmin,
    getCategories,
    createCategory,
    deleteCategoryAdmin
} from '@/services/api';
import { Post, User, Category } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import Spinner from '@/components/ui/Spinner';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { TrashIcon, EditIcon, BanIcon } from '@/components/icons';

interface AdminStats {
  totalUsers: number;
  totalPosts: number;
  anonymousPosts: number;
  avgPlatformRating: number;
  categoryPopularity: { name: string; count: number }[];
}

const AdminDashboardPage: React.FC = () => {
  const { user: adminUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  // State for new category form
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#808080');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);


  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, postsData, usersData, categoriesData] = await Promise.all([
        getAdminStats(),
        getAllPostsAdmin(),
        getAllUsersAdmin(),
        getCategories(),
      ]);
      setStats(statsData);
      setPosts(postsData);
      setUsers(usersData);
      setCategories(categoriesData);
    } catch (error) {
      addToast("Failed to fetch admin data.", 'error');
      console.error("Failed to fetch admin data:", error);
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const handleDeletePost = async (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post permanently?')) {
        setActiveActionId(postId);
        try {
            await deletePostAdmin(postId);
            setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
            addToast('Post deleted successfully.', 'success');
        } catch (error) {
            addToast('Failed to delete post.', 'error');
        } finally {
            setActiveActionId(null);
        }
    }
  };

  const handleEditPost = (postId: string) => {
    navigate(`/admin/edit-post/${postId}`);
  };

  const handleToggleBlock = async (userId: string) => {
    setActiveActionId(userId);
    const userToUpdate = users.find(u => u.id === userId);
    if (!userToUpdate) return;

    try {
      await toggleUserBlockStatusAdmin(userId);
      setUsers(prevUsers => prevUsers.map(u => 
        u.id === userId ? { ...u, isBlocked: !u.isBlocked } : u
      ));
      addToast(`User ${userToUpdate.name} has been ${userToUpdate.isBlocked ? 'unblocked' : 'blocked'}.`, 'success');
    } catch (err) {
      addToast('Failed to update user status.', 'error');
    } finally {
      setActiveActionId(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This will also delete all of their posts permanently.')) {
      setActiveActionId(userId);
      try {
        await deleteUserAdmin(userId);
        fetchData(); // Refetch all data as posts will be deleted too
        addToast('User and their posts have been deleted.', 'success');
      } catch (err) {
        addToast((err as Error).message || 'Failed to delete user.', 'error');
      } finally {
        setActiveActionId(null);
      }
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName || !newCategoryDesc || !newCategoryColor) {
        addToast('Please fill all category fields.', 'error');
        return;
    }
    setIsCreatingCategory(true);
    try {
        await createCategory({ name: newCategoryName, description: newCategoryDesc, color: newCategoryColor });
        addToast('Category created successfully!', 'success');
        setNewCategoryName('');
        setNewCategoryDesc('');
        setNewCategoryColor('#808080');
        fetchData(); // Refetch data to show new category
    } catch (error) {
        addToast((error as Error).message, 'error');
    } finally {
        setIsCreatingCategory(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
     if (window.confirm('Are you sure you want to delete this category? This could affect existing posts.')) {
        setActiveActionId(categoryId);
        try {
            await deleteCategoryAdmin(categoryId);
            addToast('Category deleted.', 'success');
            fetchData();
        } catch (error) {
            addToast((error as Error).message, 'error');
        } finally {
            setActiveActionId(null);
        }
    }
  };


  if (loading || !stats) {
    return <Spinner size="lg" />;
  }

  const StatCard: React.FC<{ title: string; value: string | number; }> = ({ title, value }) => (
    <Card className="text-center">
      <p className="text-slate-500">{title}</p>
      <p className="text-4xl font-bold text-[#708238]">{value}</p>
    </Card>
  );

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-slate-800">Admin Dashboard</h1>

      <section>
        <h2 className="text-2xl font-bold text-slate-700 mb-4">Platform Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Users" value={stats.totalUsers} />
          <StatCard title="Total Posts" value={stats.totalPosts} />
          <StatCard title="Anonymous Posts" value={stats.anonymousPosts} />
          <StatCard title="Average Rating" value={stats.avgPlatformRating.toFixed(2)} />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-700 mb-4">Category Popularity</h2>
        <Card>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.categoryPopularity} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#708238" name="Number of Posts" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-700 mb-4">Manage Categories</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
                <h3 className="text-xl font-semibold mb-4">Add New Category</h3>
                <form onSubmit={handleAddCategory} className="space-y-4">
                    <Input id="new-cat-name" label="Name" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} required />
                    <Textarea id="new-cat-desc" label="Description" value={newCategoryDesc} onChange={e => setNewCategoryDesc(e.target.value)} rows={2} required />
                    <Input type="color" id="new-cat-color" label="Color" value={newCategoryColor} onChange={e => setNewCategoryColor(e.target.value)} className="p-1 h-10 w-full" />
                    <Button type="submit" isLoading={isCreatingCategory} className="w-full">Add Category</Button>
                </form>
            </Card>
            <Card>
                 <h3 className="text-xl font-semibold mb-4">Existing Categories</h3>
                 <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    {categories.map(cat => (
                        <div key={cat.id} className="flex items-center justify-between p-2 rounded-md bg-slate-50">
                            <div className="flex items-center">
                                <div className="w-5 h-5 rounded-sm mr-3" style={{ backgroundColor: cat.color }}></div>
                                <span className="font-medium text-slate-800">{cat.name}</span>
                            </div>
                            <Button 
                                variant='danger' 
                                size="sm" 
                                onClick={() => handleDeleteCategory(cat.id)}
                                isLoading={activeActionId === cat.id}
                                disabled={activeActionId !== null}
                            >
                                <TrashIcon className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                 </div>
            </Card>
        </div>
      </section>
      
      <section>
        <h2 className="text-2xl font-bold text-slate-700 mb-4">Manage Users</h2>
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3">User</th>
                <th scope="col" className="px-6 py-3">Email</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Joined On</th>
                <th scope="col" className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="bg-white border-b hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{user.name} {user.isAdmin && <span className="text-xs text-blue-600 font-bold ml-1">(Admin)</span>}</td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {user.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4">{new Date(user.joinDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                        <Button 
                            variant={user.isBlocked ? 'primary' : 'secondary'} 
                            size="sm" 
                            onClick={() => handleToggleBlock(user.id)}
                            isLoading={activeActionId === user.id}
                            disabled={activeActionId !== null || user.id === adminUser?.id}
                        >
                            <BanIcon className="w-4 h-4 mr-1" />
                            {user.isBlocked ? 'Unblock' : 'Block'}
                        </Button>
                        <Button 
                            variant="danger" 
                            size="sm" 
                            onClick={() => handleDeleteUser(user.id)}
                            isLoading={activeActionId === user.id}
                            disabled={activeActionId !== null || user.id === adminUser?.id}
                        >
                           {activeActionId !== user.id && <TrashIcon className="w-4 h-4 mr-1" />}
                           Delete
                        </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-700 mb-4">Manage Posts</h2>
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3">Title</th>
                <th scope="col" className="px-6 py-3">Author (Real)</th>
                <th scope="col" className="px-6 py-3">Category</th>
                <th scope="col" className="px-6 py-3">Is Anonymous</th>
                <th scope="col" className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
                <tr key={post.id} className="bg-white border-b hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900 truncate max-w-xs">{post.title}</td>
                  <td className="px-6 py-4">{post.authorName}</td>
                  <td className="px-6 py-4">{post.category}</td>
                  <td className="px-6 py-4">{post.anonymous ? 'Yes' : 'No'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                        <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => handleEditPost(post.id)}
                            disabled={activeActionId !== null}
                        >
                            <EditIcon className="w-4 h-4 mr-1" />
                            Edit
                        </Button>
                        <Button 
                            variant="danger" 
                            size="sm" 
                            onClick={() => handleDeletePost(post.id)}
                            isLoading={activeActionId === post.id}
                            disabled={activeActionId !== null}
                        >
                           {activeActionId !== post.id && <TrashIcon className="w-4 h-4 mr-1" />}
                           Delete
                        </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboardPage;
