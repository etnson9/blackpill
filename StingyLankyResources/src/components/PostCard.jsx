import { Link } from 'react-router-dom';
import { FaUser, FaCalendarAlt, FaEye, FaTag } from 'react-icons/fa';
import { useSettings } from '../context/SettingsProvider';
import Badge from './Badge';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const PostCard = ({ post }) => {
  const { showNSFW } = useSettings();

  // Hide NSFW content if user hasn't opted in
  if (post.nsfw && !showNSFW) {
    return (
      <div className="bg-gray-100 dark:bg-dark-bg-secondary rounded-lg p-4 border border-gray-200 dark:border-dark-border">
        <div className="text-center text-gray-500 dark:text-dark-text-secondary">
          <p className="font-medium">NSFW Content Hidden</p>
          <p className="text-sm">Enable NSFW content in settings to view</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-card rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4 border border-gray-200 dark:border-dark-border">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          {post.nsfw && (
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
              NSFW
            </span>
          )}
          {post.anonymous && (
            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full font-medium">
              Anonymous
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-dark-text-secondary">
          <FaTag size={10} />
          <span>{post.category?.name || 'Uncategorized'}</span>
        </div>
      </div>
      
      <Link to={`/post/${post.id}`} className="block hover:no-underline">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          {post.title}
        </h3>
        
        {post.content && (
          <p className="text-gray-600 dark:text-dark-text-secondary text-sm mb-3 line-clamp-3">
            {post.content.length > 150 ? `${post.content.substring(0, 150)}...` : post.content}
          </p>
        )}
      </Link>
      
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-dark-text-secondary">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <FaUser size={10} />
            <span>
              {post.anonymous ? 'Anonymous' : post.profiles?.username || 'Unknown User'}
            </span>
            {!post.anonymous && post.profiles?.badge && (
              <Badge badge={post.profiles.badge} size="small" />
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            <FaCalendarAlt size={10} />
            <span>{dayjs(post.created_at).fromNow()}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-green-600">↑ {post.upvotes || 0}</span>
          <span className="text-red-600">↓ {post.downvotes || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default PostCard;