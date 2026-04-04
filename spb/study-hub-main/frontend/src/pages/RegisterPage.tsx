import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth, UserRole } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, Shield, Eye, EyeOff, ArrowLeft, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const getPasswordStrength = (pw: string): { score: number; label: string; color: string } => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['bg-destructive', 'bg-amber', 'bg-info', 'bg-success'];
  return { score, label: labels[score - 1] || 'Too short', color: colors[score - 1] || 'bg-border' };
};

const RegisterPage = () => {
  const { role } = useParams<{ role: string }>();
  const isAdmin = role === 'admin';
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) { toast.error('Please fill in all fields'); return; }
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: isAdmin ? 'admin' : 'user' })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('eduvault_token', data.token);
        await register(name, email, password, (isAdmin ? 'admin' : 'user') as UserRole);
        toast.success('Account created successfully!');
        navigate(isAdmin ? '/admin' : '/dashboard');
      } else {
        toast.error(data.error || 'Registration failed');
      }
    } catch (error) {
      // Fallback to mock register if server is not available
      const result = await register(name, email, password, (isAdmin ? 'admin' : 'user') as UserRole);
      if (result.success) {
        toast.success('Account created successfully!');
        navigate(isAdmin ? '/admin' : '/dashboard');
      } else {
        toast.error(result.error || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const requirements = [
    { met: password.length >= 8, text: 'At least 8 characters' },
    { met: /[A-Z]/.test(password), text: 'One uppercase letter' },
    { met: /[0-9]/.test(password), text: 'One number' },
    { met: /[^A-Za-z0-9]/.test(password), text: 'One special character' },
  ];

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
            {isAdmin ? 'Create Admin Account' : 'Join EduVault'}
          </h2>
          <p className="text-primary-foreground/70 mt-4 leading-relaxed">
            {isAdmin
              ? 'Set up your admin account to start managing educational resources and users.'
              : 'Create your account and start exploring thousands of educational resources for free.'}
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
            {isAdmin ? 'Admin Registration' : 'User Registration'}
          </div>

          <h1 className="font-serif text-3xl font-bold text-foreground">Create Account</h1>
          <p className="text-muted-foreground mt-2">
            {isAdmin ? 'Register as an administrator' : 'Start your learning journey today'}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1.5">
                <Input id="password" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= strength.score ? strength.color : 'bg-border'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">{strength.label}</p>
                  <div className="mt-2 space-y-1">
                    {requirements.map(r => (
                      <div key={r.text} className="flex items-center gap-1.5 text-xs">
                        {r.met ? <Check className="w-3 h-3 text-success" /> : <X className="w-3 h-3 text-muted-foreground" />}
                        <span className={r.met ? 'text-foreground' : 'text-muted-foreground'}>{r.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="confirm">Confirm Password</Label>
              <Input id="confirm" type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="mt-1.5" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground mt-6 text-center">
            Already have an account?{' '}
            <Link to={`/login/${role}`} className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
