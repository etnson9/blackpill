import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../api/supabase';
import { FaUser, FaCalendarAlt, FaTag, FaArrowLeft } from 'react-icons/fa';
import { useSettings } from '../context/SettingsProvider';
import UpvoteDownvote from '../components/UpvoteDownvote';
import CommentList from '../components/CommentList';
import Badge from '../components/Badge';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const PostPage = () => {
  const { postId } = useParams();
  const { showNSFW } = useSettings();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [votes, setVotes] = useState({ upvotes: 0, downvotes: 0 });

  useEffect(() => {
    fetchPost();
    fetchVoteCounts();
  }, [postId]);

  const fetchPost = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          categories (
            id,
            name,
            description
          ),
          profiles (
            username,
            badge
          )
        `)
        .eq('id', postId)
        .single();

      if (error) {
        toast.error('Post not found');
      } else {
        setPost(data);
      }
    } catch (error) {
      toast.error('Error loading post');
      console.error('Post fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVoteCounts = async () => {
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('vote_type')
        .eq('post_id', postId);

      if (!error && data) {
        const upvotes = data.filter(vote => vote.vote_type === 'up').length;
        const downvotes = data.filter(vote => vote.vote_type === 'down').length;
        setVotes({ upvotes, downvotes });
      }
    } catch (error) {
      console.error('Error fetching vote counts:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-dark-text-secondary">Loading post...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-dark-text-secondary">Post not found</p>
        <Link to="/" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
          ← Back to Home
        </Link>
      </div>
    );
  }

  // Hide NSFW content if user hasn't opted in
  if (post.nsfw && !showNSFW) {
    return (
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
          <FaArrowLeft className="mr-2" size={14} />
          Back
        </Link>
        
        <div className="bg-gray-100 dark:bg-dark-bg-secondary rounded-lg p-8 border border-gray-200 dark:border-dark-border text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-dark-text">
            NSFW Content Hidden
          </h1>
          <p className="text-gray-600 dark:text-dark-text-secondary">
            This post has been marked as NSFW (Not Safe For Work).
          </p>
          <p className="text-gray-600 dark:text-dark-text-secondary mt-2">
            Enable NSFW content in the sidebar settings to view this post.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
        <FaArrowLeft className="mr-2" size={14} />
        Back
      </Link>
      
      <div className="flex gap-6">
        {/* Voting Column */}
        <div className="flex-shrink-0">
          <UpvoteDownvote 
            postId={post.id} 
            initialUpvotes={votes.upvotes}
            initialDownvotes={votes.downvotes}
          />
        </div>
        
        {/* Post Content */}
        <div className="flex-1">
          <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6">
            {/* Post Header */}
            <div className="flex items-start justify-between mb-4">
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
                <Link 
                  to={`/category/${encodeURIComponent(post.categories?.name || '')}`}
                  className="hover:text-blue-600"
                >
                  {post.categories?.name || 'Uncategorized'}
                </Link>
              </div>
            </div>
            
            {/* Post Title */}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text mb-4">
              {post.title}
            </h1>
            
            {/* Post Meta */}
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-dark-text-secondary mb-6">
              <div className="flex items-center space-x-1">
                <FaUser size={12} />
                <span>
                  {post.anonymous ? 'Anonymous' : post.profiles?.username || 'Unknown User'}
                </span>
                {!post.anonymous && post.profiles?.badge && (
                  <Badge badge={post.profiles.badge} size="small" />
                )}
              </div>
              
              <div className="flex items-center space-x-1">
                <FaCalendarAlt size={12} />
                <span>{dayjs(post.created_at).fromNow()}</span>
              </div>
            </div>
            
            {/* Post Content */}
            {post.content && (
              <div className="prose max-w-none text-gray-700 dark:text-dark-text whitespace-pre-wrap">
                {post.content}
              </div>
            )}
          </div>
          
          {/* Comments Section */}
          <CommentList postId={post.id} />
        </div>
      </div>
    </div>
  );
};

export default PostPage;