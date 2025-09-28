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
    try {
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  return (
    <nav className="bg-white dark:bg-dark-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-gray-900 dark:text-dark-text">
          BLACKPILL FORUM
        </Link>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-dark-bg-secondary"
          >
            {isDarkMode ? <FaSun className="text-yellow-500" /> : <FaMoon className="text-gray-600" />}
          </button>
          
          {user ? (
            <>
              <Link
                to="/new-post"
                className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700"
              >
                <FaPlus size={14} />
                <span>New Post</span>
              </Link>
              
              {user.profile?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="flex items-center space-x-1 bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700"
                >
                  <FaShieldAlt size={14} />
                  <span>Admin</span>
                </Link>
              )}
              
              <span className="text-gray-700 dark:text-dark-text">
                <FaUser size={14} className="inline mr-1" />
                {user.profile?.username || 'User'}
              </span>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-red-600 hover:text-red-700"
              >
                <FaSignOutAlt size={14} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;