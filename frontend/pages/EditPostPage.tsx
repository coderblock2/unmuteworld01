
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPostById, updatePostAdmin, getCategories } from '@/services/api';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Dropdown from '@/components/ui/Dropdown';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import NotFoundPage from './NotFoundPage';
import { POST_BASIS_OPTIONS } from '@/constants';
import { Post, PostBasis, Category } from '@/types';
import { useToast } from '@/hooks/useToast';

const EditPostPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [basis, setBasis] = useState<PostBasis | ''>('');
  const [tags, setTags] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchPostAndCategories = async () => {
      if (!postId) {
        setError("Post ID is missing.");
        setLoading(false);
        return;
      }
      try {
        const [postData, categoriesData] = await Promise.all([
          getPostById(postId),
          getCategories()
        ]);
        
        setPost(postData);
        setCategories(categoriesData);
        
        setTitle(postData.title);
        setContent(postData.content);
        setCategory(postData.category);
        setBasis(postData.basis);
        setTags(postData.tags.join(', '));
        setIsAnonymous(postData.anonymous);
      } catch (err) {
        setError("Post not found or failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    fetchPostAndCategories();
  }, [postId]);

  const categoryOptions = categories.map(c => ({ value: c.name, label: c.name }));
  const basisOptions = POST_BASIS_OPTIONS.map(b => ({ value: b, label: b }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !category || !basis || !postId) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    setIsUpdating(true);

    try {
      await updatePostAdmin(postId, {
        title,
        content,
        category,
        basis: basis as PostBasis,
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        anonymous: isAnonymous,
      });
      addToast('Post updated successfully!', 'success');
      navigate('/admin');
    } catch (err) {
      addToast('Failed to update post. Please try again.', 'error');
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <Spinner size="lg" />;
  if (error && !post) return <NotFoundPage message={error} />;

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Edit Post</h1>
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4" role="alert">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input id="title" label="Post Title" value={title} onChange={e => setTitle(e.target.value)} required />
          <Textarea id="content" label="Post Content" value={content} onChange={e => setContent(e.target.value)} rows={15} required />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Dropdown id="category" label="Category" value={category} onChange={e => setCategory(e.target.value)} options={categoryOptions} required />
            <Dropdown id="basis" label="This post is based on:" value={basis} onChange={e => setBasis(e.target.value as PostBasis)} options={basisOptions} required />
          </div>

          <Input id="tags" label="Tags (comma-separated)" value={tags} onChange={e => setTags(e.target.value)} />
          
          <div className="flex items-center">
            <input id="anonymous" type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} className="h-4 w-4 bg-white text-black border-slate-300 rounded focus:ring-blue-500" />
            <label htmlFor="anonymous" className="ml-2 block text-sm text-slate-900">Post as Anonymous</label>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="secondary" onClick={() => navigate('/admin')} disabled={isUpdating}>Cancel</Button>
            <Button type="submit" isLoading={isUpdating}>Save Changes</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditPostPage;
