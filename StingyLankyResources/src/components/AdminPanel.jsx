import { useState, useEffect } from 'react';
import { supabase } from '../api/supabase';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { FaUser, FaTrash, FaEdit, FaShieldAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import Badge from './Badge';
import dayjs from 'dayjs';

const AdminPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.profile?.role === 'admin') {
      fetchData();
    }
  }, [user, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'posts') {
        const { data, error } = await supabase
          .from('posts')
          .select(`
            *,
            categories (name),
            profiles (username, badge)
          `)
          .order('created_at', { ascending: false });
        if (!error) setPosts(data || []);
      } else if (activeTab === 'users') {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error) setUsers(data || []);
      } else if (activeTab === 'comments') {
        const { data, error } = await supabase
          .from('comments')
          .select(`
            *,
            posts (title),
            profiles (username)
          `)
          .order('created_at', { ascending: false });
        if (!error) setComments(data || []);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);
      
      if (error) {
        toast.error('Failed to delete post');
      } else {
        toast.success('Post deleted successfully');
        fetchData();
      }
    } catch (error) {
      toast.error('Error deleting post');
    }
  };

  const deleteComment = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);
      
      if (error) {
        toast.error('Failed to delete comment');
      } else {
        toast.success('Comment deleted successfully');
        fetchData();
      }
    } catch (error) {
      toast.error('Error deleting comment');
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (error) {
        toast.error('Failed to update user role');
      } else {
        toast.success('User role updated successfully');
        fetchData();
      }
    } catch (error) {
      toast.error('Error updating user role');
    }
  };

  const updateUserBadge = async (userId, newBadge) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ badge: newBadge })
        .eq('id', userId);
      
      if (error) {
        toast.error('Failed to update user badge');
      } else {
        toast.success('User badge updated successfully');
        fetchData();
      }
    } catch (error) {
      toast.error('Error updating user badge');
    }
  };

  const badgeOptions = ['Initiate', 'Novice', 'Member', 'Veteran', 'Expert', 'Legend'];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-dark-text">
        Admin Panel
      </h1>
      
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6">
        {['posts', 'users', 'comments'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md font-medium capitalize ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-dark-bg-secondary text-gray-700 dark:text-dark-text hover:bg-gray-300 dark:hover:bg-dark-bg'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-dark-text-secondary">Loading...</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-md">
          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-dark-bg-secondary">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                      Flags
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                  {posts.map((post) => (
                    <tr key={post.id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-dark-text truncate max-w-xs">
                          {post.title}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-dark-text">
                          {post.anonymous ? 'Anonymous' : post.profiles?.username || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-dark-text">
                          {post.categories?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 dark:text-dark-text-secondary">
                          {dayjs(post.created_at).format('MMM D, YYYY')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-1">
                          {post.nsfw && (
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                              NSFW
                            </span>
                          )}
                          {post.anonymous && (
                            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                              Anon
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => deletePost(post.id)}
                          className="text-red-600 hover:text-red-900 text-sm"
                        >
                          <FaTrash size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-dark-bg-secondary">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                      Badge
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                  {users.map((userProfile) => (
                    <tr key={userProfile.id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-dark-text">
                          {userProfile.username || 'No username'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={userProfile.role}
                          onChange={(e) => updateUserRole(userProfile.id, e.target.value)}
                          className="text-sm border border-gray-300 dark:border-dark-border rounded px-2 py-1 dark:bg-dark-bg dark:text-dark-text"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={userProfile.badge}
                          onChange={(e) => updateUserBadge(userProfile.id, e.target.value)}
                          className="text-sm border border-gray-300 dark:border-dark-border rounded px-2 py-1 dark:bg-dark-bg dark:text-dark-text"
                        >
                          {badgeOptions.map((badge) => (
                            <option key={badge} value={badge}>
                              {badge}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 dark:text-dark-text-secondary">
                          {dayjs(userProfile.created_at).format('MMM D, YYYY')}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Badge badge={userProfile.badge} size="small" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-dark-bg-secondary">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                      Content
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                      Post
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                  {comments.map((comment) => (
                    <tr key={comment.id}>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-dark-text truncate max-w-xs">
                          {comment.content}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-dark-text">
                          {comment.profiles?.username || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-dark-text truncate max-w-xs">
                          {comment.posts?.title || 'Deleted post'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 dark:text-dark-text-secondary">
                          {dayjs(comment.created_at).format('MMM D, YYYY')}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => deleteComment(comment.id)}
                          className="text-red-600 hover:text-red-900 text-sm"
                        >
                          <FaTrash size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;