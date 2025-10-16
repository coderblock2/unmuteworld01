
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getPostsByTag, searchPosts } from '@/services/api';
import { Post } from '@/types';
import Spinner from '@/components/ui/Spinner';
import PostListItem from '@/components/PostListItem';
import { SearchIcon } from '@/components/icons';
import BackButton from '@/components/ui/BackButton';

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const tag = searchParams.get('tag');
  const query = searchParams.get('q');

  useEffect(() => {
    const fetchPosts = async () => {
      // Only fetch if there is a query or tag.
      if (!tag && !query) {
        setPosts([]); // Clear posts if the query is removed
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        let results: Post[] = [];
        if (tag) {
          results = await getPostsByTag(tag);
        } else if (query) {
          results = await searchPosts(query);
        }
        setPosts(results);
      } catch (error) {
        console.error(`Failed to fetch posts:`, error);
        setPosts([]); // Clear posts on error
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [tag, query]);

  const getTitle = () => {
    if (tag) {
      return <>Results for tag: <span className="text-[#708238]">#{tag}</span></>;
    }
    if (query) {
      return <>Results for: <span className="text-[#708238]">"{query}"</span></>;
    }
    return 'Search the Platform';
  };

  const renderContent = () => {
    if (loading) {
      return <Spinner size="lg" />;
    }

    if (posts.length > 0) {
      return posts.map(post => <PostListItem key={post.id} post={post} />);
    }

    // A search was performed, but returned no results
    if (query || tag) {
      return (
        <div className="text-center p-10">
          <SearchIcon className="mx-auto w-16 h-16 text-slate-300" />
          <p className="mt-4 text-xl font-semibold text-slate-700">No posts found</p>
          <p className="mt-2 text-slate-500">
            We couldn't find anything matching your search. Try different keywords.
          </p>
        </div>
      );
    }

    // Initial state, no search has been performed yet
    return (
      <div className="text-center p-10">
        <SearchIcon className="mx-auto w-16 h-16 text-slate-300" />
        <p className="mt-4 text-xl font-semibold text-slate-700">Find Posts, Tags, and Authors</p>
        <p className="mt-2 text-slate-500">
          Use the search bar in the navigation to find content across Unmute World.
        </p>
      </div>
    );
  };

  return (
    <div>
      <BackButton className="mb-4" />
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800">
          {getTitle()}
        </h1>
      </header>

      <div className="bg-white rounded-lg shadow-md">
        {renderContent()}
      </div>
    </div>
  );
};

export default SearchPage;
