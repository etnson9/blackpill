import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabase';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';

const categories = [
  'CONFIDENCE',
  'FITNESS',
  'STYLE',
  'MINDFULNESS',
  'TECH',
  'HOBBIES',
  'NEWS',
  'OFF-TOPIC',
  'PEPTIDES & SARMS',
  'BONE STRUCTURE / FACE SHAPE',
  'SELF-OPTIMIZATION',
  'ANON DISCUSSIONS'
];

const NewPostPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [isNSFW, setIsNSFW] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categoriesData, setCategoriesData] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCategories();
  }, [user, navigate]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
      } else {
        setCategoriesData(data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!category) {
      toast.error('Please select a category');
      return;
    }

    setLoading(true);
    try {
      const selectedCategory = categoriesData.find(cat => cat.name === category);
      
      const { data, error } = await supabase
        .from('posts')
        .insert({
          title: title.trim(),
          content: content.trim(),
          category_id: selectedCategory?.id,
          user_id: user.id,
          nsfw: isNSFW,
          anonymous: isAnonymous
        })
        .select()
        .single();

      if (error) {
        toast.error('Failed to create post');
        console.error('Post creation error:', error);
      } else {
        toast.success('Post created successfully!');
        navigate(`/post/${data.id}`);
      }
    } catch (error) {
      toast.error('Error creating post');
      console.error('Error creating post:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-dark-text">
        Create New Post
      </h1>
      
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-dark-bg dark:text-dark-text"
              placeholder="Enter your post title"
              maxLength={200}
            />
            <p className="text-xs text-gray-500 dark:text-dark-text-secondary mt-1">
              {title.length}/200 characters
            </p>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
              Category *
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-dark-bg dark:text-dark-text"
            >
              <option value="">Select a category</option>
              {categoriesData.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-dark-bg dark:text-dark-text resize-none"
              placeholder="Write your post content here..."
              rows={8}
              maxLength={5000}
            />
            <p className="text-xs text-gray-500 dark:text-dark-text-secondary mt-1">
              {content.length}/5000 characters
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="nsfw"
                checked={isNSFW}
                onChange={(e) => setIsNSFW(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="nsfw" className="ml-2 block text-sm text-gray-700 dark:text-dark-text">
                Mark as NSFW (Not Safe For Work)
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="anonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-700 dark:text-dark-text">
                Post anonymously
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 dark:border-dark-border rounded-md text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-bg-secondary focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPostPage;