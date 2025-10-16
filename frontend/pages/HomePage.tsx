
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getRecentPosts, getCategories } from '@/services/api';
import { Post, Category } from '@/types';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import PostListItem from '@/components/PostListItem';

const HomePage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const [recentPosts, fetchedCategories] = await Promise.all([
          getRecentPosts(5),
          getCategories()
        ]);
        setPosts(recentPosts);
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Failed to fetch page data:", error);
        setError('Could not load page content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleGetStarted = () => {
      if (user) {
          navigate('/create-post');
      } else {
          navigate('/signup');
      }
  }

  return (
    <div className="space-y-12">
      <section className="text-center py-16 px-4 rounded-lg shadow-lg bg-gradient-to-br from-[#708238] to-[#A3C585]">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">Welcome to Unmute World</h1>
        <p className="mt-4 text-lg sm:text-xl text-gray-200 max-w-2xl mx-auto">
          Your platform for sharing opinions, stories, and poetry. Anonymously or publicly.
        </p>
        <div className="mt-8">
          <Button onClick={handleGetStarted} size="lg" variant='primary-outline'>
            {user ? 'Write a Post' : 'Sign Up to Post'}
          </Button>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold text-slate-800 mb-6 text-center">Explore Categories</h2>
        {loading ? <Spinner /> : error ? <p className="text-center text-red-500">{error}</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {categories.map(category => (
                  <Link
                      key={category.id}
                      to={`/category/${category.name.toLowerCase()}`}
                      className="p-8 rounded-xl text-white shadow-lg hover:shadow-2xl hover:scale-[1.03] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-center"
                      style={{ backgroundColor: category.color }}
                  >
                      <h3 className="text-2xl font-bold">{category.name}</h3>
                      <p className="mt-1 text-sm text-gray-200">{category.description}</p>
                  </Link>
              ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Recent Posts</h2>
        <div className="bg-white rounded-lg shadow-md">
          {loading || authLoading ? (
            <Spinner />
          ) : posts.length > 0 ? (
            <div>
              {posts.map(post => <PostListItem key={post.id} post={post} />)}
            </div>
          ) : (
            <p className="text-center p-8 text-slate-500">No posts have been made yet. Be the first!</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
