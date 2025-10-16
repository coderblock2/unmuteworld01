
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { createPost, getCategories } from '@/services/api';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Dropdown from '@/components/ui/Dropdown';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { POST_BASIS_OPTIONS } from '@/constants';
import { PostBasis, Category } from '@/types';

const CreatePostPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [basis, setBasis] = useState<PostBasis | ''>('');
  const [tags, setTags] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const fetchedCategories = await getCategories();
        setCategories(fetchedCategories);
      } catch (err) {
        setError('Could not load categories. Please try again later.');
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const categoryOptions = categories.map(c => ({ value: c.name, label: c.name }));
  const basisOptions = POST_BASIS_OPTIONS.map(b => ({ value: b, label: b }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !category || !basis || !user) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const newPost = await createPost({
        title,
        content,
        category,
        basis: basis as PostBasis,
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        anonymous: isAnonymous,
      });
      navigate(`/post/${newPost.id}`);
    } catch (err) {
      setError('Failed to create post. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Write a New Post</h1>
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4" role="alert">{error}</div>}
        
        {loadingCategories ? <Spinner /> : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input id="title" label="Post Title" value={title} onChange={e => setTitle(e.target.value)} placeholder="A Catchy Title" required />
            <Textarea id="content" label="Post Content" value={content} onChange={e => setContent(e.target.value)} rows={15} placeholder="Share your thoughts..." required />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Dropdown id="category" label="Category" value={category} onChange={e => setCategory(e.target.value)} options={categoryOptions} required />
              <Dropdown id="basis" label="This post is based on:" value={basis} onChange={e => setBasis(e.target.value as PostBasis)} options={basisOptions} required />
            </div>

            <Input id="tags" label="Tags (optional, comma-separated)" value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g., startup, finance, elon musk" />
            
            <div className="flex items-center">
              <input id="anonymous" type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} className="h-4 w-4 bg-white text-black border-slate-300 rounded focus:ring-blue-500" />
              <label htmlFor="anonymous" className="ml-2 block text-sm text-slate-900">Post as Anonymous</label>
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="secondary" onClick={() => navigate(-1)} disabled={isLoading}>Cancel</Button>
              <Button type="submit" isLoading={isLoading}>Publish Post</Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

export default CreatePostPage;
