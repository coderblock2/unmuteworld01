
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getUserById, getUserPosts } from '@/services/api';
import { Post, User } from '@/types';
import Spinner from '@/components/ui/Spinner';
import Card from '@/components/ui/Card';
import PostListItem from '@/components/PostListItem';
import { StarIcon } from '@/components/icons';
import NotFoundPage from './NotFoundPage';
import BackButton from '@/components/ui/BackButton';

const PublicProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) {
      setError('User not specified.');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [userData, userPosts] = await Promise.all([
            getUserById(userId),
            getUserPosts(userId, true) // `true` for public view (filters anonymous)
        ]);
        
        if (!userData) {
          setError('User not found.');
          setUser(null);
        } else {
          setUser(userData);
          setPosts(userPosts);
        }
      } catch (err) {
        setError('Failed to fetch user data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (loading) {
    return <Spinner size="lg" />;
  }

  if (error || !user) {
    return <NotFoundPage message={error || 'Could not find the requested user.'} />;
  }

  const joinDate = new Date(user.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

  return (
    <>
      <BackButton className="mb-4" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card className="text-center lg:sticky top-24">
            <img src={user.profilePic} alt={user.name} className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-slate-200" />
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <div className="flex justify-center items-center my-2 text-lg">
              User Rating: <StarIcon className="w-5 h-5 ml-1 text-yellow-500 fill-current" /> {user.avgRating.toFixed(1)}
            </div>
            <p className="text-sm text-slate-600 mt-2">Joined in {joinDate}</p>
            <p className="text-slate-700 mt-4 italic">{user.bio || 'This user has not set a bio yet.'}</p>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-2xl font-bold text-slate-800">Posts by {user.name}</h3>
          </div>
          <div className="bg-white rounded-lg shadow-md">
            {posts.length > 0 ? (
              posts.map(post => <PostListItem key={post.id} post={post} />)
            ) : (
              <p className="p-4 text-slate-500">This user hasn't made any public posts yet.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PublicProfilePage;
