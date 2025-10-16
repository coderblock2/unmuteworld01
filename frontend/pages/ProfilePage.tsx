

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getUserPosts, getSavedPosts, updateProfile, changePassword } from '@/services/api';
import { Post } from '@/types';
import Spinner from '@/components/ui/Spinner';
import PostListItem from '@/components/PostListItem';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import { StarIcon, PlusCircleIcon, BookmarkIcon } from '@/components/icons';
import { useNavigate } from 'react-router-dom';
import BackButton from '@/components/ui/BackButton';
import { useToast } from '@/hooks/useToast';

const ProfilePage: React.FC = () => {
  const { user, loading: authLoading, reloadUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'my-posts' | 'saved-posts' | 'edit-profile'>('my-posts');
  
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Edit Profile State
  const [editName, setEditName] = useState(user?.name || '');
  const [editBio, setEditBio] = useState(user?.bio || '');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const avatars = [
    'https://picsum.photos/seed/avatar1/200',
    'https://picsum.photos/seed/avatar2/200',
    'https://picsum.photos/seed/avatar3/200',
    'https://picsum.photos/seed/avatar4/200',
    'https://picsum.photos/seed/avatar5/200',
    'https://picsum.photos/seed/avatar6/200',
  ];

  const fetchMyPosts = useCallback(async () => {
    if (user) {
      setLoadingPosts(true);
      try {
        const posts = await getUserPosts(user.id);
        setMyPosts(posts);
      } catch (error) {
        addToast('Failed to load your posts.', 'error');
        console.error("Failed to fetch user posts:", error);
      } finally {
        setLoadingPosts(false);
      }
    }
  }, [user, addToast]);

  const fetchSavedPosts = useCallback(async () => {
    if (user) {
      setLoadingPosts(true);
      try {
        const posts = await getSavedPosts();
        setSavedPosts(posts);
      } catch (error) {
        addToast('Failed to load saved posts.', 'error');
        console.error("Failed to fetch saved posts:", error);
      } finally {
        setLoadingPosts(false);
      }
    }
  }, [user, addToast]);

  useEffect(() => {
    if (activeTab === 'my-posts') {
      fetchMyPosts();
    } else if (activeTab === 'saved-posts') {
      fetchSavedPosts();
    }
  }, [activeTab, fetchMyPosts, fetchSavedPosts]);

  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditBio(user.bio);
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsUpdating(true);
    try {
        await updateProfile({ name: editName, bio: editBio, profilePic: user.profilePic });
        await reloadUser();
        addToast('Profile updated successfully!', 'success');
    } catch(err) {
        addToast('Failed to update profile.', 'error');
    } finally {
        setIsUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!currentPassword || !newPassword || !confirmNewPassword) {
        setPasswordError('Please fill in all password fields.');
        return;
    }
    if (newPassword.length < 6) {
        setPasswordError('New password must be at least 6 characters long.');
        return;
    }
    if (newPassword !== confirmNewPassword) {
        setPasswordError('New passwords do not match.');
        return;
    }

    setIsChangingPassword(true);
    try {
        await changePassword({ currentPassword, newPassword });
        addToast('Password changed successfully!', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
    } catch (err) {
        setPasswordError((err as Error).message);
    } finally {
        setIsChangingPassword(false);
    }
  };

  const handleAvatarSelect = async (avatarUrl: string) => {
    if (!user) return;
    try {
        await updateProfile({ name: user.name, bio: user.bio, profilePic: avatarUrl });
        await reloadUser();
        addToast('Profile picture updated!', 'success');
    } catch (error) {
        addToast('Failed to update profile picture.', 'error');
    } finally {
        setShowAvatarModal(false);
    }
  }

  if (authLoading || !user) {
    return <Spinner size="lg" />;
  }
  
  const joinDate = new Date(user.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

  return (
    <>
    <BackButton className="mb-4" />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <Card className="text-center lg:sticky top-24">
          <img src={user.profilePic} alt={user.name} className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-green-200" />
          <h2 className="text-2xl font-bold">{user.name}</h2>
          <p className="text-slate-500">{user.email}</p>
          <div className="flex justify-center items-center my-2 text-lg">
            User Rating: <StarIcon className="w-5 h-5 ml-1 text-yellow-500 fill-current" /> {user.avgRating.toFixed(1)}
          </div>
          <p className="text-sm text-slate-600 mt-2">Joined in {joinDate}</p>
          <p className="text-slate-700 mt-4 italic">{user.bio || 'No bio yet.'}</p>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <div className="mb-4 border-b border-slate-200">
          <nav className="flex space-x-1 sm:space-x-4 -mb-px overflow-x-auto">
            <button onClick={() => setActiveTab('my-posts')} className={`py-2 px-3 sm:px-4 text-sm sm:text-base font-medium whitespace-nowrap ${activeTab === 'my-posts' ? 'border-b-2 border-[#708238] text-[#708238]' : 'text-slate-500 hover:text-slate-700'}`}>My Posts ({user.postCount})</button>
            <button onClick={() => setActiveTab('saved-posts')} className={`py-2 px-3 sm:px-4 text-sm sm:text-base font-medium whitespace-nowrap ${activeTab === 'saved-posts' ? 'border-b-2 border-[#708238] text-[#708238]' : 'text-slate-500 hover:text-slate-700'}`}>Saved Posts</button>
            <button onClick={() => setActiveTab('edit-profile')} className={`py-2 px-3 sm:px-4 text-sm sm:text-base font-medium whitespace-nowrap ${activeTab === 'edit-profile' ? 'border-b-2 border-[#708238] text-[#708238]' : 'text-slate-500 hover:text-slate-700'}`}>Edit Profile</button>
          </nav>
        </div>

        {loadingPosts ? <Spinner /> : (
            <div>
              {activeTab === 'my-posts' && (
                <div className="bg-white rounded-lg shadow-md">
                    {myPosts.length > 0 ? (
                        myPosts.map(post => <PostListItem key={post.id} post={post} />) 
                    ) : (
                        <div className="text-center p-8">
                            <PlusCircleIcon className="mx-auto w-12 h-12 text-slate-300"/>
                            <p className="mt-4 text-slate-500">You haven't written any posts yet.</p>
                            <Button onClick={() => navigate('/create-post')} className="mt-6">
                                Write your first post
                            </Button>
                        </div>
                    )}
                </div>
              )}
              {activeTab === 'saved-posts' && (
                 <div className="bg-white rounded-lg shadow-md">
                    {savedPosts.length > 0 ? (
                        savedPosts.map(post => <PostListItem key={post.id} post={post} />)
                    ) : (
                        <div className="text-center p-8">
                            <BookmarkIcon className="mx-auto w-12 h-12 text-slate-300"/>
                            <p className="mt-4 text-slate-500">You haven't saved any posts yet.</p>
                            <Button onClick={() => navigate('/')} className="mt-6">
                                Explore Posts
                            </Button>
                        </div>
                    )}
                 </div>
              )}
            </div>
        )}

        {activeTab === 'edit-profile' && (
            <div className="space-y-6">
              <Card>
                  <h3 className="text-xl font-bold mb-4">Edit Your Profile</h3>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <Input label="Name" id="edit-name" value={editName} onChange={e => setEditName(e.target.value)} />
                      <Textarea label="Bio" id="edit-bio" value={editBio} onChange={e => setEditBio(e.target.value)} rows={4} placeholder="Tell us a little about yourself..."/>
                      <Button type="button" variant="secondary" onClick={() => setShowAvatarModal(true)}>Change Profile Image</Button>
                      <Button type="submit" isLoading={isUpdating}>Save Changes</Button>
                  </form>
              </Card>
              <Card>
                <h3 className="text-xl font-bold mb-4">Change Password</h3>
                {passwordError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4" role="alert">{passwordError}</div>}
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <Input label="Current Password" id="current-password" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
                  <Input label="New Password" id="new-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                  <Input label="Confirm New Password" id="confirm-new-password" type="password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} required />
                  <Button type="submit" isLoading={isChangingPassword}>Change Password</Button>
                </form>
              </Card>
            </div>
        )}
      </div>
    </div>
    
    {showAvatarModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
        <Card className="w-full max-w-md">
          <h3 className="text-xl font-bold mb-4">Choose a New Avatar</h3>
          <div className="grid grid-cols-3 gap-4">
            {avatars.map(avatar => (
              <img 
                key={avatar}
                src={avatar} 
                alt="avatar option" 
                className="w-24 h-24 rounded-full cursor-pointer hover:ring-4 hover:ring-[#708238] transition-all"
                onClick={() => handleAvatarSelect(avatar)}
              />
            ))}
          </div>
          <Button variant="secondary" onClick={() => setShowAvatarModal(false)} className="mt-6 w-full">Cancel</Button>
        </Card>
      </div>
    )}
    </>
  );
};

export default ProfilePage;