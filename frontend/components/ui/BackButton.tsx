import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeftIcon } from '../icons';

interface BackButtonProps {
  className?: string;
  to?: string;
  children?: React.ReactNode;
}

const BackButton: React.FC<BackButtonProps> = ({ className, to, children = 'Back' }) => {
  const navigate = useNavigate();
  
  const content = (
    <>
      <ChevronLeftIcon className="w-5 h-5 mr-1" />
      {children}
    </>
  );

  const commonClasses = `inline-flex items-center text-sm font-medium text-[#708238] hover:underline transition-colors ${className || ''}`;

  if (to) {
    return (
      <Link to={to} className={commonClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button
      onClick={() => navigate(-1)}
      className={commonClasses}
    >
      {content}
    </button>
  );
};

export default BackButton;