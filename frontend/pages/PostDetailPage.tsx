
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPostById, ratePost, savePost, unsavePost, isPostSaved } from '@/services/api';
import { Post } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import Spinner from '@/components/ui/Spinner';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { StarIcon, BookmarkIcon, ShareIcon, LinkIcon } from '@/components/icons';
import NotFoundPage from './NotFoundPage';
import BackButton from '@/components/ui/BackButton';

const PostDetailPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [isAuthor, setIsAuthor] = useState(false);
  
  const fetchPost = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const postData = await getPostById(postId);
      setPost(postData);
      if (user) {
        if (postData && user.id === postData.authorId) {
          setIsAuthor(true);
        }
        const savedStatus = await isPostSaved(postId);
        setIsSaved(savedStatus);
      }
    } catch (err) {
      setError('Post not found.');
    } finally {
      setLoading(false);
    }
  }, [postId, user]);
  
  const refetchPost = useCallback(async () => {
     if (!postId) return;
     try {
        const postData = await getPostById(postId);
        setPost(postData);
     } catch (err) {
        console.error("Could not refetch post", err);
     }
  }, [postId]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleRate = async (rating: number) => {
    if (!user || !post) {
        addToast("You must be logged in to rate a post.", 'error');
        return;
    }
    if (isAuthor) {
        addToast("You cannot rate your own post.", 'error');
        return;
    }
    
    try {
        await ratePost(post.id, rating);
        setUserRating(rating);
        addToast(`You rated this post ${rating} stars!`, 'success');
        refetchPost(); // Refetch to show updated rating
    } catch (err) {
        addToast((err as Error).message, 'error');
    }
  };

  const handleSaveToggle = async () => {
    if (!user || !post) {
        addToast("You must be logged in to save a post.", 'error');
        return;
    }
    try {
        if (isSaved) {
            await unsavePost(post.id);
            addToast("Post removed from your saved list.", 'success');
        } else {
            await savePost(post.id);
            addToast("Post saved to your profile!", 'success');
        }
        setIsSaved(!isSaved);
    } catch (err) {
        addToast("Failed to update save status.", 'error');
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast('Link copied to clipboard!', 'success');
  };

  const handleShareWhatsApp = () => {
    const text = `Check out this post on Unmute World: "${post?.title}"\n${window.location.href}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }

  if (loading) return <Spinner size="lg" />;
  if (error || !post) return <NotFoundPage message={error} />;

  const date = new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="max-w-4xl mx-auto">
      <BackButton className="mb-4" />
      <Card>
        <div className="flex justify-between items-start">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-800 pr-4">{post.title}</h1>
            <div className="flex items-center text-lg whitespace-nowrap">
                <StarIcon className="w-5 h-5 mr-1 text-yellow-500 fill-current" /> 
                <span className="font-bold">{post.postRating.toFixed(1)}</span>
                <span className="text-sm text-slate-500 ml-1">({post.ratingCount})</span>
            </div>
        </div>
        <div className="mt-4 mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-500">
          <span>By {post.anonymous ? <span className="text-gray-500">Anonymous</span> : <Link to={`/profile/${post.authorId}`} className="font-medium text-blue-600 hover:underline">{post.authorName}</Link>}</span>
          {!post.anonymous && (
              <span className="flex items-center">
                  Writer Rating <StarIcon className="w-4 h-4 ml-1 text-yellow-500 fill-current" /> {post.authorAvgRating.toFixed(1)}
              </span>
          )}
          <span>•</span>
          <span>{date}</span>
        </div>

        <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">Tags:</span>
              {post.tags.length > 0 ? post.tags.map(tag => (
                  <Link key={tag} to={`/search?tag=${tag}`} className="bg-slate-200 text-slate-700 px-3 py-1 rounded-full text-sm hover:bg-slate-300">
                      {tag}
                  </Link>
              )) : <span className="text-sm text-slate-500">No tags</span>}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
              <h3 className="font-semibold text-lg mb-2">Rate this post</h3>
              {isAuthor && <p className="text-xs text-slate-500 mb-2">You cannot rate your own post.</p>}
              <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} onClick={() => handleRate(star)} disabled={isAuthor}>
                          <StarIcon className={`w-8 h-8 transition-colors ${userRating >= star ? 'text-yellow-400 fill-current' : 'text-slate-300'} ${isAuthor ? 'cursor-not-allowed' : 'hover:text-yellow-300 cursor-pointer'}`} />
                      </button>
                  ))}
              </div>
          </div>
          <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={handleSaveToggle}>
                  <BookmarkIcon className={`w-5 h-5 mr-2 ${isSaved ? 'text-[#708238] fill-current' : ''}`} /> {isSaved ? 'Saved' : 'Save Post'}
              </Button>
              <Button variant="secondary" onClick={handleShareWhatsApp}>
                  <ShareIcon className="w-5 h-5 mr-2" /> Share
              </Button>
              <Button variant="secondary" onClick={handleCopyLink}>
                  <LinkIcon className="w-5 h-5 mr-2" /> Copy Link
              </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PostDetailPage;
