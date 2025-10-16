
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getPostsByCategory, getCategories } from '@/services/api';
import { Post, Category } from '@/types';
import Spinner from '@/components/ui/Spinner';
import PostListItem from '@/components/PostListItem';
import Button from '@/components/ui/Button';
import NotFoundPage from './NotFoundPage';
import BackButton from '@/components/ui/BackButton';

const POSTS_PER_PAGE = 10;

const CategoryPage: React.FC = () => {
  const { categoryName } = useParams<{ categoryName: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const category = useMemo(() => allCategories.find(c => c.name.toLowerCase() === categoryName), [categoryName, allCategories]);
  
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);

  useEffect(() => {
    const fetchCategoriesAndPosts = async () => {
      setLoading(true);
      try {
        // First fetch all categories to find the correct one
        const fetchedCategories = await getCategories();
        setAllCategories(fetchedCategories);
        const currentCategory = fetchedCategories.find(c => c.name.toLowerCase() === categoryName);
        
        if (currentCategory) {
            // In a real app, pagination would be handled by the backend.
            // Here we fetch all posts and paginate on the client.
            const allPosts = await getPostsByCategory(currentCategory.name);
            setPosts(allPosts);
        }
      } catch (error) {
        console.error(`Failed to fetch data for ${categoryName}:`, error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategoriesAndPosts();
  }, [categoryName]);

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString() }, { replace: true });
    window.scrollTo(0, 0); // Scroll to top on page change
  };
  
  if (loading) {
    return <Spinner size="lg" />;
  }

  if (!category) {
    return <NotFoundPage />;
  }
  
  const paginatedPosts = posts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);

  return (
    <div>
      <BackButton to="/" className="mb-4">Back to Explore</BackButton>
      <header 
        className="p-8 sm:p-12 mb-8 rounded-lg text-white"
        style={{ backgroundColor: category.color }}
      >
        <h1 className="text-3xl sm:text-4xl font-extrabold">{category.name}</h1>
        <p className="mt-2 text-base sm:text-lg text-gray-200">{category.description}</p>
      </header>

      <div className="bg-white rounded-lg shadow-md">
        {paginatedPosts.length > 0 ? (
          paginatedPosts.map(post => <PostListItem key={post.id} post={post} />)
        ) : (
          <p className="text-center p-8 text-slate-500">No posts in this category yet.</p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center space-x-2">
          <Button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
            Previous
          </Button>
          <span className="text-slate-700 font-medium px-2">Page {currentPage} of {totalPages}</span>
          <Button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
