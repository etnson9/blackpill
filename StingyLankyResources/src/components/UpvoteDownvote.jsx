import { useState, useEffect } from 'react';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { supabase } from '../api/supabase';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';

const UpvoteDownvote = ({ postId, initialUpvotes = 0, initialDownvotes = 0 }) => {
  const { user } = useAuth();
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserVote();
    }
  }, [user, postId]);

  const fetchUserVote = async () => {
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('vote_type')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setUserVote(data.vote_type);
      }
    } catch (error) {
      // User hasn't voted yet, which is fine
    }
  };

  const handleVote = async (voteType) => {
    if (!user) {
      toast.error('Please log in to vote');
      return;
    }

    setLoading(true);

    try {
      // If user is changing their vote or removing their vote
      if (userVote) {
        if (userVote === voteType) {
          // Remove vote
          await supabase
            .from('votes')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', user.id);

          if (voteType === 'up') {
            setUpvotes(prev => prev - 1);
          } else {
            setDownvotes(prev => prev - 1);
          }
          setUserVote(null);
        } else {
          // Change vote
          await supabase
            .from('votes')
            .update({ vote_type: voteType })
            .eq('post_id', postId)
            .eq('user_id', user.id);

          if (voteType === 'up') {
            setUpvotes(prev => prev + 1);
            setDownvotes(prev => prev - 1);
          } else {
            setDownvotes(prev => prev + 1);
            setUpvotes(prev => prev - 1);
          }
          setUserVote(voteType);
        }
      } else {
        // New vote
        await supabase
          .from('votes')
          .insert({
            post_id: postId,
            user_id: user.id,
            vote_type: voteType
          });

        if (voteType === 'up') {
          setUpvotes(prev => prev + 1);
        } else {
          setDownvotes(prev => prev + 1);
        }
        setUserVote(voteType);
      }
    } catch (error) {
      toast.error('Failed to vote');
      console.error('Vote error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-1">
      <button
        onClick={() => handleVote('up')}
        disabled={loading}
        className={`p-2 rounded-md transition-colors ${
          userVote === 'up'
            ? 'text-green-600 bg-green-100 dark:bg-green-900'
            : 'text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <FaChevronUp size={16} />
      </button>
      
      <span className="text-sm font-medium text-gray-700 dark:text-dark-text">
        {upvotes - downvotes}
      </span>
      
      <button
        onClick={() => handleVote('down')}
        disabled={loading}
        className={`p-2 rounded-md transition-colors ${
          userVote === 'down'
            ? 'text-red-600 bg-red-100 dark:bg-red-900'
            : 'text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <FaChevronDown size={16} />
      </button>
    </div>
  );
};

export default UpvoteDownvote;