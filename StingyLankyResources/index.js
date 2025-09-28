import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider.jsx'
import { SettingsProvider } from './context/SettingsProvider.jsx'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <AuthProvider>
          <App />
          <Toaster 
            position="bottom-right"
            toastOptions={{
              className: 'dark:bg-dark-card dark:text-dark-text',
            }}
          />
        </AuthProvider>
      </SettingsProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import PostPage from './pages/PostPage';
import NewPostPage from './pages/NewPostPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPanel from './components/AdminPanel';
import useAuth from './hooks/useAuth';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  return user && user.profile.role === 'admin' ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/category/:categoryName" element={<CategoryPage />} />
        <Route path="/post/:postId" element={<PostPage />} />
        <Route path="/new-post" element={<NewPostPage />} />
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          } 
        />
      </Routes>
    </Layout>
  );
}

export default App;

import { createContext, useState, useEffect } from 'react';
import { supabase } from '../api/supabase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setUser({ ...session.user, profile });
      }
      setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          setUser({ ...session.user, profile });
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

import { createContext, useState, useEffect, useContext } from 'react';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNSFW, setShowNSFW] = useState(false);

  useEffect(() => {
    // Theme setup
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    // NSFW setup
    const storedNSFW = localStorage.getItem('showNSFW');
    if (storedNSFW === 'true') {
      setShowNSFW(true);
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newIsDark = !prev;
      localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
      if (newIsDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return newIsDark;
    });
  };

  const toggleNSFW = () => {
    setShowNSFW(prev => {
      const newShowNSFW = !prev;
      localStorage.setItem('showNSFW', newShowNSFW);
      return newShowNSFW;
    });
  };

  return (
    <SettingsContext.Provider value={{ isDarkMode, toggleTheme, showNSFW, toggleNSFW }}>
      {children}
    </SettingsContext.Provider>
  );
};

import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1 container mx-auto px-4 py-6">
        <Sidebar />
        <main className="flex-1 lg:pl-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { supabase } from '../api/supabase';
import toast from 'react-hot-toast';
import { useSettings } from '../context/SettingsProvider';
import { FaSun, FaMoon, FaUser, FaSignOutAlt, FaPlus, FaShieldAlt } from 'react-icons/fa';

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useSettings();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Logged out successfully');
      navigate('/');
    }
  };

  return (
    <nav className="bg-white dark:bg-dark-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl lg:text-2xl font-bold text-gray-800 dark:text-white">
          BLACKPILL FORUM
        </Link>
        <div className="flex items-center space-x-4">
          <Link to="/new-post" className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-3 rounded-lg transition duration-200">
            <FaPlus />
            <span className="hidden sm:inline">New Post</span>
          </Link>
          <button onClick={toggleTheme} className="text-lg p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-bg-secondary">
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </button>
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="font-semibold hidden md:inline">{user.profile?.username}</span>
               {user.profile?.role === 'admin' && (
                <Link to="/admin" className="text-lg p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-bg-secondary text-red-500">
                  <FaShieldAlt title="Admin Panel"/>
                </Link>
              )}
              <button onClick={handleLogout} className="flex items-center space-x-2 text-lg p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-bg-secondary">
                 <FaSignOutAlt />
              </button>
            </div>
          ) : (
            <Link to="/login" className="flex items-center space-x-2 font-semibold text-lg p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-bg-secondary">
              <FaUser />
              <span className="hidden sm:inline">Login</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import { useState, useEffect } from 'react';
import { supabase } from '../api/supabase';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsProvider';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Sidebar = () => {
  const [categories, setCategories] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const { showNSFW, toggleNSFW } = useSettings();

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (!error) setCategories(data);
    };
    fetchCategories();
  }, []);

  return (
    <>
      <button 
        className="lg:hidden fixed bottom-4 right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg z-40"
        onClick={() => setIsOpen(!isOpen)}
      >
        Menu
      </button>

      <aside className={`fixed lg:sticky top-0 lg:top-20 h-full lg:h-auto lg:max-h-[calc(100vh-6rem)] w-64 lg:w-56 bg-white dark:bg-dark-card p-4 transition-transform transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 z-30 lg:z-auto rounded-r-lg lg:rounded-lg shadow-lg lg:shadow-none`}>
        <h3 className="text-lg font-bold mb-4 border-b border-gray-300 dark:border-dark-border pb-2">Categories</h3>
        <ul className="space-y-2">
          {categories.map(cat => (
            <li key={cat.id}>
              <Link 
                to={`/category/${cat.name}`} 
                className="block p-2 rounded-md hover:bg-gray-200 dark:hover:bg-dark-bg-secondary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {cat.name}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-6 border-t border-gray-300 dark:border-dark-border pt-4">
            <h3 className="text-lg font-bold mb-2">Settings</h3>
            <button onClick={toggleNSFW} className="w-full flex items-center justify-between p-2 rounded-md hover:bg-gray-200 dark:hover:bg-dark-bg-secondary transition-colors">
                <span>{showNSFW ? 'Hide' : 'Show'} NSFW</span>
                {showNSFW ? <FaEyeSlash /> : <FaEye />}
            </button>
        </div>
      </aside>
      
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" onClick={() => setIsOpen(false)}></div>}
    </>
  );
};

export default Sidebar;

import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import UpvoteDownvote from './UpvoteDownvote';
import Badge from './Badge';
import NSFWFilter from './NSFWFilter';
import { FaCommentAlt } from 'react-icons/fa';

dayjs.extend(relativeTime);

const PostCard = ({ post, commentCount }) => {
  const username = post.anonymous ? 'Anonymous' : post.profiles?.username || 'User';

  return (
    <NSFWFilter isNsfw={post.nsfw}>
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-md hover:shadow-lg dark:hover:bg-dark-card-hover transition-all duration-200 p-4 flex">
        <UpvoteDownvote post={post} />
        <div className="ml-4 flex-1">
          <div className="flex items-center text-sm text-gray-500 dark:text-dark-text-secondary mb-2">
            <Link to={`/category/${post.categories.name}`} className="font-bold text-blue-500 hover:underline">{post.categories.name}</Link>
            <span className="mx-2">•</span>
            <span>Posted by {username}</span>
            {!post.anonymous && post.profiles?.badge && <Badge badgeName={post.profiles.badge} />}
            <span className="mx-2">•</span>
            <span>{dayjs(post.created_at).fromNow()}</span>
          </div>
          <Link to={`/post/${post.id}`} className="block">
            <h2 className="text-xl font-bold text-gray-800 dark:text-dark-text mb-2 break-words">
              {post.nsfw && <span className="text-xs font-bold text-red-500 bg-red-100 dark:bg-red-900 px-2 py-1 rounded-full mr-2">NSFW</span>}
              {post.title}
            </h2>
          </Link>
          <div className="flex items-center text-gray-600 dark:text-dark-text-secondary mt-3">
             <FaCommentAlt className="mr-2" /> {commentCount || 0} Comments
          </div>
        </div>
      </div>
    </NSFWFilter>
  );
};

export default PostCard;

import { useState, useEffect } from 'react';
import { supabase } from '../api/supabase';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

const UpvoteDownvote = ({ post }) => {
  const { user } = useAuth();
  const [voteCount, setVoteCount] = useState(0);
  const [userVote, setUserVote] = useState(null); // 'up', 'down', or null

  useEffect(() => {
    const fetchVotes = async () => {
      // Calculate total votes
      const { data: votes, error } = await supabase
        .from('votes')
        .select('vote_type')
        .eq('post_id', post.id);

      if (error) return;

      const total = votes.reduce((acc, vote) => {
        return acc + (vote.vote_type === 'up' ? 1 : -1);
      }, 0);
      setVoteCount(total);

      // Check for user's vote
      if (user) {
        const userVoteData = votes.find(v => v.user_id === user.id);
        const existingVote = votes.find(vote => vote.user_id === user.id);
        if (existingVote) {
          setUserVote(existingVote.vote_type);
        }
      }
    };
    fetchVotes();
  }, [post.id, user]);

  const handleVote = async (voteType) => {
    if (!user) {
      toast.error('You must be logged in to vote.');
      return;
    }

    // If user clicks the same vote button again, remove the vote
    if (userVote === voteType) {
      setUserVote(null);
      setVoteCount(prev => prev - (voteType === 'up' ? 1 : -1));
      
      await supabase
        .from('votes')
        .delete()
        .match({ post_id: post.id, user_id: user.id });
      return;
    }

    // Optimistic UI update
    let newVoteCount = voteCount;
    if (userVote) { // User is changing their vote
        newVoteCount += (voteType === 'up' ? 2 : -2);
    } else { // New vote
        newVoteCount += (voteType === 'up' ? 1 : -1);
    }
    setVoteCount(newVoteCount);
    setUserVote(voteType);

    // Upsert vote in Supabase
    const { error } = await supabase
      .from('votes')
      .upsert({ post_id: post.id, user_id: user.id, vote_type: voteType }, { onConflict: 'post_id, user_id' });

    if (error) {
      toast.error('Failed to cast vote.');
      // Revert UI on error
      // (For simplicity, this example doesn't revert, but in a real app you would)
    }
  };

  return (
    <div className="flex flex-col items-center justify-start space-y-1 mr-4 text-center">
      <button 
        onClick={() => handleVote('up')}
        className={`p-2 rounded-full transition-colors ${userVote === 'up' ? 'text-green-500 bg-green-100 dark:bg-green-900' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-bg-secondary'}`}
      >
        <FaArrowUp />
      </button>
      <span className="font-bold text-lg">{voteCount}</span>
      <button 
        onClick={() => handleVote('down')}
        className={`p-2 rounded-full transition-colors ${userVote === 'down' ? 'text-red-500 bg-red-100 dark:bg-red-900' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-bg-secondary'}`}
      >
        <FaArrowDown />
      </button>
    </div>
  );
};

export default UpvoteDownvote;

import { useState, useEffect } from 'react';
import { supabase } from '../api/supabase';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Badge from './Badge';

dayjs.extend(relativeTime);

const CommentCard = ({ comment }) => (
  <div className="p-4 border-t border-gray-200 dark:border-dark-border">
    <div className="flex items-center text-sm text-gray-500 dark:text-dark-text-secondary mb-2">
      <span className="font-bold">{comment.profiles.username}</span>
      <Badge badgeName={comment.profiles.badge} />
      <span className="mx-2">•</span>
      <span>{dayjs(comment.created_at).fromNow()}</span>
    </div>
    <p className="text-gray-800 dark:text-dark-text break-words">{comment.content}</p>
  </div>
);

const CommentList = ({ postId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*, profiles(username, badge)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      
      if (!error) setComments(data);
    };

    fetchComments();

    const channel = supabase.channel(`comments:${postId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}` }, async (payload) => {
          const { data: profile } = await supabase.from('profiles').select('username, badge').eq('id', payload.new.user_id).single();
          setComments(currentComments => [...currentComments, {...payload.new, profiles: profile}]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, [postId]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    setLoading(true);

    const { error } = await supabase.from('comments').insert({
      content: newComment,
      post_id: postId,
      user_id: user.id
    });
    
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setNewComment('');
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold mb-4">Comments</h3>
      {user && (
        <form onSubmit={handlePostComment} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="What are your thoughts?"
            className="w-full p-3 border border-gray-300 dark:border-dark-border rounded-lg bg-gray-50 dark:bg-dark-bg-secondary focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            required
          />
          <button 
            type="submit" 
            disabled={loading}
            className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg disabled:bg-blue-300"
          >
            {loading ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      )}
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-md">
        {comments.length > 0 ? (
          comments.map(comment => <CommentCard key={comment.id} comment={comment} />)
        ) : (
          <p className="p-4 text-gray-500 dark:text-dark-text-secondary">No comments yet. Be the first!</p>
        )}
      </div>
    </div>
  );
};

export default CommentList;

import { useSettings } from '../context/SettingsProvider';
import { FaEye } from 'react-icons/fa';

const NSFWFilter = ({ isNsfw, children }) => {
  const { showNSFW, toggleNSFW } = useSettings();

  if (!isNsfw || showNSFW) {
    return children;
  }

  return (
    <div className="relative bg-gray-200 dark:bg-dark-bg-secondary rounded-lg p-8 text-center overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-md flex flex-col items-center justify-center">
        <p className="text-lg font-bold text-white mb-2">NSFW Content</p>
        <p className="text-sm text-gray-300 mb-4">This content is marked as Not Safe For Work.</p>
        <button 
          onClick={toggleNSFW} 
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center"
        >
          <FaEye className="mr-2" /> Show NSFW Content
        </button>
      </div>
       {/* This renders a blurred version of the content underneath */}
      <div className="blur-md pointer-events-none opacity-50">
        {children}
      </div>
    </div>
  );
};

export default NSFWFilter;

const Badge = ({ badgeName }) => {
  const badgeStyles = {
    'Initiate': 'bg-gray-500 text-white',
    'Contributor': 'bg-blue-500 text-white',
    'Veteran': 'bg-purple-600 text-white',
    'Ascended': 'bg-yellow-500 text-black',
  };

  return (
    <span className={`text-xs font-semibold ml-2 px-2 py-1 rounded-full ${badgeStyles[badgeName] || 'bg-gray-400'}`}>
      {badgeName}
    </span>
  );
};

export default Badge;

import { useState, useEffect } from 'react';
import { supabase } from '../api/supabase';
import toast from 'react-hot-toast';

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('posts');
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const { data: fetchedData, error } = await supabase.from(activeTab).select('*');
            if (error) {
                toast.error(`Error fetching ${activeTab}: ${error.message}`);
            } else {
                setData(fetchedData);
            }
        };
        fetchData();
    }, [activeTab]);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;

        const { error } = await supabase.from(activeTab).delete().eq('id', id);
        if (error) {
            toast.error(`Error deleting item: ${error.message}`);
        } else {
            toast.success('Item deleted successfully.');
            setData(data.filter(item => item.id !== id));
        }
    };

    const renderTable = () => {
        if (!data || data.length === 0) return <p>No data found for {activeTab}.</p>;
        
        const headers = Object.keys(data[0]);

        return (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            {headers.map(header => <th key={header} className="px-6 py-3">{header}</th>)}
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(item => (
                            <tr key={item.id} className="bg-white border-b dark:bg-dark-card dark:border-gray-700">
                                {headers.map(header => <td key={header} className="px-6 py-4 truncate max-w-xs">{String(item[header])}</td>)}
                                <td className="px-6 py-4">
                                    <button onClick={() => handleDelete(item.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
            <div className="flex space-x-4 border-b border-gray-200 dark:border-dark-border mb-6">
                <button onClick={() => setActiveTab('posts')} className={`py-2 px-4 font-semibold ${activeTab === 'posts' ? 'border-b-2 border-blue-500 text-blue-500' : ''}`}>Posts</button>
                <button onClick={() => setActiveTab('comments')} className={`py-2 px-4 font-semibold ${activeTab === 'comments' ? 'border-b-2 border-blue-500 text-blue-500' : ''}`}>Comments</button>
                <button onClick={() => setActiveTab('profiles')} className={`py-2 px-4 font-semibold ${activeTab === 'profiles' ? 'border-b-2 border-blue-500 text-blue-500' : ''}`}>Users</button>
            </div>
            <div>
                {renderTable()}
            </div>
        </div>
    );
};

export default AdminPanel;

import { useState, useEffect } from 'react';
import { supabase } from '../api/supabase';
import PostCard from '../components/PostCard';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select('*, categories(name), profiles(username, badge), comments(count)')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error(error);
      } else {
        setPosts(data);
      }
      setLoading(false);
    };

    fetchPosts();

     const channel = supabase.channel('posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        fetchPosts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, []);

  if (loading) return <div className="text-center p-8">Loading posts...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Latest Posts</h1>
      <div className="space-y-4">
        {posts.length > 0 ? (
          posts.map(post => <PostCard key={post.id} post={post} commentCount={post.comments[0]?.count || 0} />)
        ) : (
          <p>No posts yet. Why not create one?</p>
        )}
      </div>
    </div>
  );
};

export default HomePage;

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../api/supabase';
import PostCard from '../components/PostCard';

const CategoryPage = () => {
  const { categoryName } = useParams();
  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPostsByCategory = async () => {
      setLoading(true);
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('name', categoryName)
        .single();

      if (catError || !catData) {
        setLoading(false);
        return;
      }
      setCategory(catData);

      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select('*, categories(name), profiles(username, badge), comments(count)')
        .eq('category_id', catData.id)
        .order('created_at', { ascending: false });

      if (postError) {
        console.error(postError);
      } else {
        setPosts(postData);
      }
      setLoading(false);
    };

    fetchPostsByCategory();
  }, [categoryName]);

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (!category) return <div className="text-center p-8">Category not found.</div>;

  return (
    <div>
      <div className="mb-6 p-4 bg-white dark:bg-dark-card rounded-lg shadow">
        <h1 className="text-3xl font-bold">{category.name}</h1>
        <p className="text-gray-600 dark:text-dark-text-secondary mt-1">{category.description}</p>
      </div>
      <div className="space-y-4">
        {posts.length > 0 ? (
          posts.map(post => <PostCard key={post.id} post={post} commentCount={post.comments[0]?.count || 0} />)
        ) : (
          <p>No posts in this category yet.</p>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../api/supabase';
import UpvoteDownvote from '../components/UpvoteDownvote';
import CommentList from '../components/CommentList';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Badge from '../components/Badge';
import NSFWFilter from '../components/NSFWFilter';

dayjs.extend(relativeTime);

const PostPage = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select('*, categories(name), profiles(username, badge)')
        .eq('id', postId)
        .single();

      if (error) {
        console.error('Error fetching post:', error);
      } else {
        setPost(data);
      }
      setLoading(false);
    };

    fetchPost();
  }, [postId]);

  if (loading) return <div className="text-center p-8">Loading post...</div>;
  if (!post) return <div className="text-center p-8">Post not found.</div>;
  
  const username = post.anonymous ? 'Anonymous' : post.profiles?.username || 'User';

  return (
    <NSFWFilter isNsfw={post.nsfw}>
        <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-lg">
            <div className="flex">
                <UpvoteDownvote post={post} />
                <div className="flex-1 ml-4">
                    <div className="flex items-center text-sm text-gray-500 dark:text-dark-text-secondary mb-2">
                        Posted by {username}
                        {!post.anonymous && post.profiles?.badge && <Badge badgeName={post.profiles.badge} />}
                        <span className="mx-2">•</span>
                        <span>{dayjs(post.created_at).fromNow()} in <span className="font-bold">{post.categories.name}</span></span>
                    </div>
                    <h1 className="text-3xl font-bold break-words">
                        {post.nsfw && <span className="text-xs font-bold text-red-500 bg-red-100 dark:bg-red-900 px-2 py-1 rounded-full mr-2">NSFW</span>}
                        {post.title}
                    </h1>
                    <p className="mt-4 text-gray-700 dark:text-dark-text whitespace-pre-wrap break-words">{post.content}</p>
                </div>
            </div>
            <CommentList postId={post.id} />
        </div>
    </NSFWFilter>
  );
};

export default PostPage;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabase';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';

const NewPostPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [isNsfw, setIsNsfw] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Redirect if not logged in
    if (!authLoading && !user) {
      toast.error('You must be logged in to create a post.');
      navigate('/login');
    }
    // Fetch categories for the dropdown
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*');
      setCategories(data || []);
      if (data && data.length > 0) {
        setCategoryId(data[0].id);
      }
    };
    fetchCategories();
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !categoryId) {
      toast.error('Title, content, and category are required.');
      return;
    }
    setLoading(true);

    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        title,
        content,
        category_id: categoryId,
        user_id: user.id,
        nsfw: isNsfw,
        anonymous: isAnonymous,
      })
      .select()
      .single();

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Post created successfully!');
      navigate(`/post/${post.id}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-dark-card rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6">Create a New Post</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Category</label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-dark-border focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-dark-bg-secondary"
          >
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-dark-bg-secondary"
            required
          />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Content</label>
          <textarea
            id="content"
            rows="10"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-dark-bg-secondary"
            required
          />
        </div>
        <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-2">
                <div className="flex items-center">
                    <input id="nsfw" type="checkbox" checked={isNsfw} onChange={(e) => setIsNsfw(e.target.checked)} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                    <label htmlFor="nsfw" className="ml-2 block text-sm text-gray-900 dark:text-dark-text">Mark as NSFW</label>
                </div>
                <div className="flex items-center">
                    <input id="anonymous" type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                    <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-900 dark:text-dark-text">Post Anonymously</label>
                </div>
            </div>
            <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
                {loading ? 'Submitting...' : 'Submit Post'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default NewPostPage;

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabase';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Logged in successfully!');
      navigate('/');
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md space-y-8 p-10 bg-white dark:bg-dark-card rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <input
                type="email"
                autoComplete="email"
                required
                className="relative block w-full appearance-none rounded-md border border-gray-300 dark:border-dark-border px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm bg-gray-50 dark:bg-dark-bg-secondary"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full appearance-none rounded-md border border-gray-300 dark:border-dark-border px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm bg-gray-50 dark:bg-dark-bg-secondary"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                Register here
            </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabase';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        }
      }
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else if (data.user) {
      toast.success('Registration successful! Please check your email to verify your account.');
      navigate('/login');
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md space-y-8 p-10 bg-white dark:bg-dark-card rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Create an account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
            <div className="space-y-4 rounded-md shadow-sm">
                <div>
                    <input
                        type="text"
                        required
                        className="relative block w-full appearance-none rounded-md border border-gray-300 dark:border-dark-border px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm bg-gray-50 dark:bg-dark-bg-secondary"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div>
                    <input
                        type="email"
                        autoComplete="email"
                        required
                        className="relative block w-full appearance-none rounded-md border border-gray-300 dark:border-dark-border px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm bg-gray-50 dark:bg-dark-bg-secondary"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <input
                        type="password"
                        autoComplete="new-password"
                        required
                        className="relative block w-full appearance-none rounded-md border border-gray-300 dark:border-dark-border px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm bg-gray-50 dark:bg-dark-bg-secondary"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
            </div>

            <div>
                <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
                >
                {loading ? 'Registering...' : 'Register'}
                </button>
            </div>
        </form>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in
            </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;