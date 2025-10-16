import React from 'react';
import Navbar from './Navbar';
import ToastContainer from './ui/ToastContainer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <ToastContainer />
      <Navbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="bg-[#708238] text-white py-4 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} Unmute World. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;