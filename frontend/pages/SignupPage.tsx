
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';

const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { signup } = useAuth();
  const { addToast } = useToast();

  const from = location.state?.from;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name || !email || !password) {
      setError('Please fill out all fields.');
      return;
    }

    if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
    }

    setIsSigningUp(true);
    try {
      const userData = await signup(name, email, password);
      addToast(`Welcome to Unmute World, ${userData.name}!`, 'success');
      navigate(from || '/', { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSigningUp(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-12">
      <Card className="w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">Create an Account</h2>
        <p className="text-center text-slate-500 mb-6">Join Unmute World today!</p>
        
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="name" label="Name" type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your Name" />
          <Input id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
          <Input id="password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
          
          <Button type="submit" className="w-full" isLoading={isSigningUp}>
            Sign Up
          </Button>
          <Button type="button" variant="secondary" className="w-full" onClick={() => navigate(-1)}>
            Back
          </Button>
        </form>
        <p className="text-center text-sm text-slate-600 mt-6">
          Already have an account? <Link to="/login" className="font-medium text-blue-600 hover:underline">Log in</Link>
        </p>
      </Card>
    </div>
  );
};

export default SignupPage;
