import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth, UserRole } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, Shield, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const LoginPage = () => {
  const { role } = useParams<{ role: string }>();
  const isAdmin = role === 'admin';
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('eduvault_token', data.token);
        await login(email, password, (isAdmin ? 'admin' : 'user') as UserRole);
        toast.success(`Welcome back!`);
        navigate(isAdmin ? '/admin' : '/dashboard');
      } else {
        toast.error(data.error || 'Login failed');
      }
    } catch (error) {
      // Fallback to mock login if server is not available
      const result = await login(email, password, (isAdmin ? 'admin' : 'user') as UserRole);
      if (result.success) {
        toast.success(`Welcome back!`);
        navigate(isAdmin ? '/admin' : '/dashboard');
      } else {
        toast.error(result.error || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero items-center justify-center p-12 relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-48 h-48 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute bottom-32 right-16 w-64 h-64 rounded-full bg-accent/10 blur-3xl" />
        </div>
        <div className="relative text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-8">
            {isAdmin ? <Shield className="w-10 h-10 text-accent" /> : <BookOpen className="w-10 h-10 text-accent" />}
          </div>
          <h2 className="font-serif text-3xl font-bold text-primary-foreground">
            {isAdmin ? 'Admin Portal' : 'Welcome Back'}
          </h2>
          <p className="text-primary-foreground/70 mt-4 leading-relaxed">
            {isAdmin
              ? 'Manage educational resources, oversee users, and maintain your library with powerful admin tools.'
              : 'Access thousands of educational materials, track your learning, and connect with fellow students.'}
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>

          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4 ${isAdmin ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'}`}>
            {isAdmin ? <Shield className="w-3 h-3" /> : <BookOpen className="w-3 h-3" />}
            {isAdmin ? 'Admin Login' : 'User Login'}
          </div>

          <h1 className="font-serif text-3xl font-bold text-foreground">Sign In</h1>
          <p className="text-muted-foreground mt-2">
            Enter your credentials to access {isAdmin ? 'the admin panel' : 'your dashboard'}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1.5">
                <Input id="password" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground mt-6 text-center">
            Don't have an account?{' '}
            <Link to={`/register/${role}`} className="text-primary font-medium hover:underline">
              Register here
            </Link>
          </p>
          {!isAdmin && (
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Are you an admin? <Link to="/login/admin" className="text-accent font-medium hover:underline">Admin Login</Link>
            </p>
          )}
          {isAdmin && (
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Not an admin? <Link to="/login/user" className="text-primary font-medium hover:underline">User Login</Link>
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
