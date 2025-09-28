import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../api/supabase';
import PostCard from '../components/PostCard';
import toast from 'react-hot-toast';

const CategoryPage = () => {
  const { categoryName } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(null);

  useEffect(() => {
    fetchCategoryAndPosts();
  }, [categoryName]);

  const fetchCategoryAndPosts = async () => {
    setLoading(true);
    try {
      const decodedCategoryName = decodeURIComponent(categoryName);
      
      // First, get the category
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .eq('name', decodedCategoryName)
        .single();

      if (categoryError) {
        toast.error('Category not found');
        setLoading(false);
        return;
      }

      setCategory(categoryData);

      // Then, get posts for this category
      const { data: postsData, error: postsError } = await supabase
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
        .eq('category_id', categoryData.id)
        .order('created_at', { ascending: false });

      if (postsError) {
        toast.error('Failed to load posts');
      } else {
        setPosts(postsData || []);
      }
    } catch (error) {
      toast.error('Error loading category');
      console.error('Category page error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text mb-2">
          {category?.name || decodeURIComponent(categoryName)}
        </h1>
        {category?.description && (
          <p className="text-gray-600 dark:text-dark-text-secondary">
            {category.description}
          </p>
        )}
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-dark-text-secondary">Loading posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600 dark:text-dark-text-secondary mb-4">
            No posts in this category yet.
          </p>
          <p className="text-gray-500 dark:text-dark-text-secondary text-sm">
            Be the first to start a discussion!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;