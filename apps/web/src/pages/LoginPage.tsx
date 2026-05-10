import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { useSupabaseAuth } from '@/hooks/useSupabase';
import BrandMark from '@/components/ui/BrandMark';
import { BRAND } from '@/lib/brand';
import toast from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAppStore();
  const user = useAppStore((s) => s.user);
  const { signIn, signUp } = useSupabaseAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/ops" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const authResponse = isRegister
        ? await signUp(email, password, { companyName })
        : await signIn(email, password);

      const authUser = authResponse.user;
      const authSession = authResponse.session;

      if (!authUser) {
        toast.error("Email or password didn't match. Try again or reset your password.");
        return;
      }

      if (!authSession) {
        toast.success('Account created. Check your email to verify your account before signing in.');
        navigate('/login');
        return;
      }

      const carrierId = authUser.user_metadata?.carrierId;
      if (!carrierId) {
        toast.error(`Your account isn't linked to a carrier yet. Email ${BRAND.supportEmail} so the setup can be completed.`);
        return;
      }

      localStorage.setItem('infamous_token', authSession.access_token);
      setUser({
        id: authUser.id,
        email: authUser.email ?? email,
        name: authUser.user_metadata?.full_name ?? authUser.email?.split('@')[0] ?? 'User',
        role: authUser.user_metadata?.role ?? 'driver',
        carrierId,
      });

      toast.success(isRegister ? 'Account created!' : 'Welcome back!');
      navigate('/');
    } catch (error) {
      const message = error instanceof Error ? error.message : "We couldn't sign you in. Check your connection and try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-infamous-dark flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <BrandMark className="justify-center mb-4 scale-125" />
          <h1 className="text-2xl font-extrabold">{BRAND.name}</h1>
          <p className="text-[#B88989]/70 text-sm mt-1">{BRAND.tagline}</p>
        </div>

        {/* Card */}
        <div className="bg-infamous-card border border-infamous-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-1">{isRegister ? 'Create Account' : 'Sign In'}</h2>
          <p className="text-sm text-[#B88989]/70 mb-6">
            {isRegister ? 'Start your 14-day free trial' : 'Welcome back — sign in to dispatch'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-sm text-[#B88989] mb-1">Email</label>
              <input
                id="login-email"
                type="email"
                className="input-field"
                placeholder="dispatch@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                required
              />
            </div>

            {isRegister && (
              <div>
                <label htmlFor="login-company" className="block text-sm text-[#B88989] mb-1">Company Name</label>
                <input
                  id="login-company"
                  type="text"
                  className="input-field"
                  placeholder="Iron Route Logistics LLC"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>
            )}

            <div>
              <label htmlFor="login-password" className="block text-sm text-[#B88989] mb-1">Password</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B88989]/60 hover:text-[#F5E8E8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-infamous-red rounded"
                >
                  {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3"
            >
              {loading ? (isRegister ? 'Creating account...' : 'Signing in...') : isRegister ? 'Create Account & Start Trial' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-sm text-[#B88989]/70 hover:text-infamous-red-light transition-colors"
            >
              {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Get started"}
            </button>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-4 mt-6 text-[10px] text-[#B88989]/60">
          <span>🔒 Bank-level encryption</span>
          <span>•</span>
          <span>14-day free trial</span>
          <span>•</span>
          <span>No credit card required</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
