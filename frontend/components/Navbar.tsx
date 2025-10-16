import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from './ui/Button';
import { UserIcon, LogOutIcon, PlusCircleIcon, MenuIcon, XIcon, SearchIcon } from './icons';
import Input from './ui/Input';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Close mobile menu on route change
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const NavLink: React.FC<{ to: string, children: React.ReactNode, isMobile?: boolean }> = ({ to, children, isMobile = false }) => {
    const isActive = location.pathname === to;
    const mobileClasses = "block rounded-md px-3 py-2 text-base font-medium";
    const desktopClasses = "px-3 py-2 rounded-md text-sm font-medium";
    const activeClass = 'bg-slate-100 text-[#708238]';
    const inactiveClass = 'text-slate-600 hover:bg-slate-50 hover:text-[#708238]';

    return (
      <Link to={to} className={`${isMobile ? mobileClasses : desktopClasses} ${isActive ? activeClass : inactiveClass} transition-colors`}>
        {children}
      </Link>
    );
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-[#708238]">Unmute World</Link>
            <div className="hidden md:ml-6 md:flex md:items-baseline md:space-x-4">
               <NavLink to="/">Home</NavLink>
               <NavLink to="/about">About Us</NavLink>
            </div>
          </div>
          <div className="hidden md:flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <Input 
                    type="search" 
                    placeholder="Search posts, tags..."
                    className="pr-10"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-800">
                    <SearchIcon className="w-5 h-5"/>
                  </button>
                </form>
                <Button onClick={() => navigate('/create-post')} variant="primary" size="md" className="whitespace-nowrap">
                  <PlusCircleIcon className="w-5 h-5 mr-2" />
                  Write a Post
                </Button>
                <div className="relative" ref={dropdownRef}>
                  <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-100">
                    <img className="h-9 w-9 rounded-full object-cover" src={user.profilePic} alt={user.name} />
                  </button>
                  {dropdownOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5">
                      <div className="px-4 py-3 border-b">
                        <p className="text-sm font-medium text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>
                      <Link to="/profile" className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100" onClick={() => setDropdownOpen(false)}>
                        <UserIcon className="mr-3 h-5 w-5" /> Profile
                      </Link>
                      {user.isAdmin && (
                        <Link to="/admin" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100" onClick={() => setDropdownOpen(false)}>
                          Admin Dashboard
                        </Link>
                      )}
                      <button onClick={handleLogout} className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                         <LogOutIcon className="mr-3 h-5 w-5" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-x-2">
                <Button onClick={() => navigate('/login')} variant="secondary" size="md">Login</Button>
                <Button onClick={() => navigate('/signup')} size="md">Signup</Button>
              </div>
            )}
          </div>
          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100">
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <NavLink to="/" isMobile>Home</NavLink>
            <NavLink to="/about" isMobile>About Us</NavLink>
          </div>
          <div className="pt-4 pb-3 border-t border-slate-200">
            {user ? (
              <div className="px-5 space-y-3">
                <div className="flex items-center">
                  <img className="h-10 w-10 rounded-full object-cover" src={user.profilePic} alt={user.name} />
                  <div className="ml-3">
                    <p className="text-base font-medium text-slate-800">{user.name}</p>
                  </div>
                </div>
                <form onSubmit={handleSearchSubmit} className="relative mt-2">
                  <Input 
                    type="search" 
                    placeholder="Search..."
                    className="pr-10"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">
                    <SearchIcon className="w-5 h-5"/>
                  </button>
                </form>
                <Button onClick={() => navigate('/create-post')} variant="primary" className="w-full justify-center">
                  <PlusCircleIcon className="w-5 h-5 mr-2" />
                  Write a Post
                </Button>
                <NavLink to="/profile" isMobile>Profile</NavLink>
                {user.isAdmin && <NavLink to="/admin" isMobile>Admin Dashboard</NavLink>}
                <button onClick={handleLogout} className="w-full text-left block rounded-md px-3 py-2 text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-[#708238]">Logout</button>
              </div>
            ) : (
              <div className="px-5 space-y-3">
                <Button onClick={() => navigate('/login')} variant="secondary" className="w-full justify-center">Login</Button>
                <Button onClick={() => navigate('/signup')} className="w-full justify-center">Signup</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
