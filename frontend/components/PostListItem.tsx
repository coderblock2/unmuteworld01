
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Post } from '../types';
import { StarIcon } from './icons';

interface PostListItemProps {
  post: Post;
}

const PostListItem: React.FC<PostListItemProps> = ({ post }) => {
  const navigate = useNavigate();
  const date = new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div 
      onClick={() => navigate(`/post/${post.id}`)}
      className="block p-4 border-b border-slate-200 hover:bg-slate-100 cursor-pointer transition-colors duration-200 group"
    >
      <h3 className="text-xl font-semibold text-slate-800 group-hover:text-blue-600 group-hover:underline">{post.title}</h3>
      <div className="text-sm text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span>by {post.anonymous ? 'Anonymous' : post.authorName}</span>
        {/* {!post.anonymous && (
          <span className="flex items-center">
            Writer Rating <StarIcon className="w-4 h-4 ml-1 text-yellow-500 fill-current" /> {post.authorAvgRating.toFixed(1)} ({post.authorPostCount} posts)
          </span>
        )} */}
        <span className="flex items-center">
          Post Rating <StarIcon className="w-4 h-4 ml-1 text-yellow-500 fill-current" /> {post.postRating.toFixed(1)} ({post.ratingCount} users)
        </span>
        <span>•</span>
        <span>{date}</span>
      </div>
    </div>
  );
};

export default PostListItem;
