import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserCircle, LayoutDashboard, Brain, ChevronDown, LogOut } from 'lucide-react';

const Navbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Mock user data
  const user = {
    name: "John Doe",
    email: "student@university.edu"
  };

  return (
    <nav className="bg-surface border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/home" className="flex items-center gap-2">
              <Brain className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl text-foreground">BurnoutGuard</span>
            </Link>
            
            <div className="hidden md:flex ml-10 space-x-8">
              <Link to="/home" className="text-foreground hover:text-primary px-3 py-2 rounded-md font-medium transition-colors">
                Home
              </Link>
              <Link to="/about" className="text-foreground-muted hover:text-primary px-3 py-2 rounded-md font-medium transition-colors">
                About
              </Link>
              <Link to="/contact" className="text-foreground-muted hover:text-primary px-3 py-2 rounded-md font-medium transition-colors">
                Contact Us
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="hidden md:flex bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-md font-medium transition-colors items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>

            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 focus:outline-none"
              >
                <div className="h-10 w-10 rounded-full bg-border flex items-center justify-center overflow-hidden border border-primary/20">
                  <UserCircle className="h-8 w-8 text-foreground-muted" />
                </div>
                <ChevronDown className="h-4 w-4 text-foreground-muted hidden md:block" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-hover bg-surface ring-1 ring-black ring-opacity-5 divide-y divide-border">
                  <div className="px-4 py-3">
                    <p className="text-sm font-medium text-foreground">{user.name}</p>
                    <p className="text-xs text-foreground-muted truncate">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <Link to="/login" className="group flex items-center px-4 py-2 text-sm text-danger hover:bg-danger/10 transition-colors">
                      <LogOut className="mr-3 h-4 w-4" />
                      Sign out
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
