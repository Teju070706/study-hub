import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { BookOpen, LogOut, User, Shield, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-card flex items-center justify-center shadow-soft border" />
          <span className="font-serif text-xl font-bold text-foreground">EduVault</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Home</Link>
          {isAuthenticated && user?.role === 'user' && (
            <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
          )}
          {isAuthenticated && user?.role === 'admin' && (
            <Link to="/admin" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Admin Panel</Link>
          )}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary">
                {user?.role === 'admin' ? <Shield className="w-3.5 h-3.5 text-accent" /> : <User className="w-3.5 h-3.5 text-primary" />}
                <span className="text-sm font-medium text-foreground">{user?.name}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-1.5" /> Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/login/user')}>User Login</Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/login/admin')}>
                <Shield className="w-3.5 h-3.5 mr-1.5" /> Admin Login
              </Button>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden glass border-b border-border/50"
          >
            <div className="p-4 flex flex-col gap-3">
              <Link to="/" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-2">Home</Link>
              {isAuthenticated && user?.role === 'user' && (
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-2">Dashboard</Link>
              )}
              {isAuthenticated && user?.role === 'admin' && (
                <Link to="/admin" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-2">Admin Panel</Link>
              )}
              {isAuthenticated ? (
                <Button variant="ghost" size="sm" onClick={() => { handleLogout(); setMobileOpen(false); }}>
                  <LogOut className="w-4 h-4 mr-1.5" /> Logout
                </Button>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={() => { navigate('/login/user'); setMobileOpen(false); }}>User Login</Button>
                  <Button variant="outline" size="sm" onClick={() => { navigate('/login/admin'); setMobileOpen(false); }}>Admin Login</Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
