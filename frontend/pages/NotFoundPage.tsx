
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';

interface NotFoundPageProps {
  message?: string;
}

const NotFoundPage: React.FC<NotFoundPageProps> = ({ message }) => {
  return (
    <div className="text-center py-20">
      <h1 className="text-6xl font-extrabold text-blue-600">404</h1>
      <h2 className="text-3xl font-bold text-slate-800 mt-4">Page Not Found</h2>
      <p className="text-slate-600 mt-2">
        {message || "Sorry, the page you are looking for does not exist."}
      </p>
      <div className="mt-8">
        <Link to="/">
          <Button>Go Back to Home</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
