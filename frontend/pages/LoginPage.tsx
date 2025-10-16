
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { addToast } = useToast();

  const from = location.state?.from;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields.');
      setIsLoading(false);
      return;
    }

    try {
      const userData = await login(email, password);
      addToast(`Welcome back, ${userData.name}!`, 'success');
      navigate(from || '/', { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-12">
      <Card className="w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">Login to Your Account</h2>
        <p className="text-center text-slate-500 mb-6">Welcome back! Please enter your details.</p>
        
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4" role="alert">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            id="email"
            label="Email" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required 
          />
          <Input 
            id="password"
            label="Password" 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required 
          />
          <div className="flex items-center justify-between">
            <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
              Forgot Password?
            </Link>
          </div>
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Login
          </Button>
          <Button type="button" variant="secondary" className="w-full" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </form>
        <p className="text-center text-sm text-slate-600 mt-6">
          Don't have an account? <Link to="/signup" state={{ from: from }} className="font-medium text-blue-600 hover:underline">Sign up</Link>
        </p>
      </Card>
    </div>
  );
};

export default LoginPage;
