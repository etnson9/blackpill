import { useState, useEffect } from 'react';
import { supabase } from '../api/supabase';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { FaUser, FaCalendarAlt, FaTrash } from 'react-icons/fa';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Badge from './Badge';

dayjs.extend(relativeTime);

const CommentList = ({ postId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
    
    // Subscribe to real-time updates
    const subscription = supabase
      .channel('comments')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            fetchComments(); // Refetch to get profile data
          } else if (payload.eventType === 'DELETE') {
            setComments(prev => prev.filter(comment => comment.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [postId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles (
            username,
            badge
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) {
        toast.error('Failed to load comments');
      } else {
        setComments(data || []);
      }
    } catch (error) {
      toast.error('Error loading comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please log in to comment');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          content: newComment.trim(),
          post_id: postId,
          user_id: user.id
        });

      if (error) {
        toast.error('Failed to post comment');
      } else {
        setNewComment('');
        toast.success('Comment posted!');
      }
    } catch (error) {
      toast.error('Error posting comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) {
        toast.error('Failed to delete comment');
      } else {
        toast.success('Comment deleted');
      }
    } catch (error) {
      toast.error('Error deleting comment');
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-dark-text">
        Comments ({comments.length})
      </h3>
      
      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-dark-bg dark:text-dark-text resize-none"
            rows={3}
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-4 bg-gray-100 dark:bg-dark-bg-secondary rounded-md text-center">
          <p className="text-gray-600 dark:text-dark-text-secondary">
            Please log in to post a comment.
          </p>
        </div>
      )}
      
      {/* Comments List */}
      {loading ? (
        <div className="text-center py-4">
          <p className="text-gray-600 dark:text-dark-text-secondary">Loading comments...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-dark-text-secondary">
            No comments yet. Be the first to comment!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2 mb-2">
                  <FaUser size={12} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-dark-text">
                    {comment.profiles?.username || 'Unknown User'}
                  </span>
                  {comment.profiles?.badge && (
                    <Badge badge={comment.profiles.badge} size="small" />
                  )}
                  <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-dark-text-secondary">
                    <FaCalendarAlt size={10} />
                    <span>{dayjs(comment.created_at).fromNow()}</span>
                  </div>
                </div>
                
                {(user?.id === comment.user_id || user?.profile?.role === 'admin') && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Delete comment"
                  >
                    <FaTrash size={12} />
                  </button>
                )}
              </div>
              
              <div className="text-gray-700 dark:text-dark-text whitespace-pre-wrap">
                {comment.content}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentList;