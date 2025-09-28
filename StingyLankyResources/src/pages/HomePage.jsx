import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../api/supabase';
import PostCard from '../components/PostCard';
import toast from 'react-hot-toast';

const categories = [
  { name: 'CONFIDENCE', description: 'Build mental fortitude and social dominance' },
  { name: 'FITNESS', description: 'Workouts, nutrition, and physique optimization' },
  { name: 'STYLE', description: 'Fashion, grooming, and appearance improvement' },
  { name: 'MINDFULNESS', description: 'Mental clarity, meditation, and focus' },
  { name: 'TECH', description: 'Gadgets, software, and tech trends' },
  { name: 'HOBBIES', description: 'Skills, interests, and leisure activities' },
  { name: 'NEWS', description: 'Current events and analysis' },
  { name: 'OFF-TOPIC', description: 'Random discussions' },
  { name: 'PEPTIDES & SARMS', description: 'Body optimization, hormones, supplements' },
  { name: 'BONE STRUCTURE / FACE SHAPE', description: 'Facial aesthetics, jawline, symmetry' },
  { name: 'SELF-OPTIMIZATION', description: 'Maximizing potential in all areas' },
  { name: 'ANON DISCUSSIONS', description: 'Completely anonymous posts' }
];

const HomePage = () => {
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentPosts();
  }, []);

  const fetchRecentPosts = async () => {
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
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching posts:', error);
      } else {
        setRecentPosts(data || []);
      }
    } catch (error) {
      console.error('Error fetching recent posts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-dark-text">
          Welcome to BLACKPILL FORUM
        </h1>
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6 mb-6">
          <p className="text-gray-700 dark:text-dark-text mb-3">
            A forum dedicated to self-improvement, aesthetics, personal development, 
            body optimization, and blackpill philosophy.
          </p>
          <p className="text-gray-600 dark:text-dark-text-secondary">
            Select a category from the sidebar to view posts or create a new post to get started.
          </p>
        </div>
        
        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {categories.slice(0, 6).map((category) => (
            <Link
              key={category.name}
              to={`/category/${encodeURIComponent(category.name)}`}
              className="bg-white dark:bg-dark-card rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200 border border-gray-200 dark:border-dark-border"
            >
              <h3 className="font-semibold text-gray-900 dark:text-dark-text mb-2">
                {category.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                {category.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Posts Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text">
            Recent Posts
          </h2>
          <Link
            to="/new-post"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Create Post
          </Link>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-dark-text-secondary">Loading recent posts...</p>
          </div>
        ) : recentPosts.length === 0 ? (
          <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 dark:text-dark-text-secondary mb-4">
              No posts yet. Be the first to start a discussion!
            </p>
            <Link
              to="/new-post"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Create First Post
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;