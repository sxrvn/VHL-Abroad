import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [signupComplete, setSignupComplete] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          setError(error.message);
        } else {
          // Wait a bit for profile to be fetched
          setTimeout(async () => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('role')
              .eq('email', formData.email)
              .single();

            if (profileData?.role === 'admin') {
              navigate('/admin');
            } else {
              navigate('/dashboard');
            }
          }, 500);
        }
      } else {
        const { error } = await signUp(formData.email, formData.password, formData.fullName, formData.phone);
        if (error) {
          setError(error.message);
        } else {
          setSignupComplete(true);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-br from-bg-light to-primary/5 dark:from-bg-dark dark:to-primary/5">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side - Branding */}
        <div className="hidden lg:flex flex-col gap-8">
          <div className="flex items-center gap-3">
            <div className="size-12 transition-transform overflow-hidden">
              <img src="/assets/red-logo.png" alt="VHL Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-3xl font-black tracking-tight">VHL <span className="text-primary">ABROAD</span></h1>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-5xl font-black leading-tight tracking-tighter">
              Start Your Journey to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">Germany</span>
            </h2>
            <p className="text-lg opacity-70 leading-relaxed">
              Join over 2,500+ students who have successfully started their German education journey with VHL Abroad Career.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: 'verified_user', text: '99% Visa Success Rate' },
              { icon: 'account_balance', text: 'Access to 50+ Partner Universities' },
              { icon: 'support_agent', text: '24/7 Expert Support' },
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined">{feature.icon}</span>
                </div>
                <p className="font-semibold">{feature.text}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 pt-6">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="size-10 rounded-full border-2 border-white dark:border-bg-dark bg-gray-500 overflow-hidden">
                  <img src={`https://picsum.photos/seed/${i*15}/40/40`} alt="student" />
                </div>
              ))}
            </div>
            <div>
              <p className="font-bold text-sm">Join our community</p>
              <p className="text-xs opacity-60">2,500+ students worldwide</p>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="w-full">
          <div className="glass rounded-3xl p-8 md:p-10 shadow-2xl border border-charcoal/5">
            
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="size-10 overflow-hidden">
                <img src="/assets/red-logo.png" alt="VHL Logo" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-2xl font-black tracking-tight">VHL <span className="text-primary">ABROAD</span></h1>
            </div>

            {/* Success Card for Signup Complete */}
            {signupComplete ? (
              <div className="text-center space-y-6 py-8">
                <div className="mx-auto size-24 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-green-500 text-6xl">check_circle</span>
                </div>
                <div className="space-y-3">
                  <h3 className="text-3xl font-black">Account Created!</h3>
                  <p className="text-lg opacity-80">Please check your email to verify your account.</p>
                </div>
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 space-y-3 text-left">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary mt-0.5">mail</span>
                    <div>
                      <p className="font-bold text-sm">Verification Email Sent</p>
                      <p className="text-sm opacity-70">We've sent a verification link to <span className="font-semibold">{formData.email}</span></p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary mt-0.5">info</span>
                    <div>
                      <p className="text-sm opacity-70">Click the link in the email to activate your account and start your journey to Germany.</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <button
                    onClick={() => setIsLogin(true)}
                    className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-all shadow-lg"
                  >
                    Go to Sign In
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="w-full py-4 border-2 border-charcoal/10 dark:border-white/10 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                  >
                    Back to Home
                  </button>
                </div>
                <p className="text-xs opacity-60 pt-4">
                  Didn't receive the email? Check your spam folder or{' '}
                  <button className="text-primary font-bold hover:underline">
                    resend verification
                  </button>
                </p>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h3 className="text-3xl font-black mb-2">
                    {isLogin ? 'Welcome Back' : 'Get Started'}
                  </h3>
                  <p className="opacity-60">
                    {isLogin ? 'Sign in to continue your journey' : 'Create your account to begin'}
                  </p>
                </div>
            

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                <span className="material-symbols-outlined text-red-600 text-xl">error</span>
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-start gap-3">
                <span className="material-symbols-outlined text-green-600 text-xl">check_circle</span>
                <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
              </div>
            )}

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-5">{!isLogin && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Full Name</label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-charcoal/10 dark:border-white/10 bg-white dark:bg-white/5 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      placeholder="John Doe"
                      required={!isLogin}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-charcoal/10 dark:border-white/10 bg-white dark:bg-white/5 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      placeholder="+91 00000 00000"
                      required={!isLogin}
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label className="text-sm font-bold">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-charcoal/10 dark:border-white/10 bg-white dark:bg-white/5 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-charcoal/10 dark:border-white/10 bg-white dark:bg-white/5 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                {!isLogin && (
                  <p className="text-xs opacity-60">Must be at least 6 characters</p>
                )}
              </div>

              {isLogin && (
                <div className="flex justify-end">
                  <button type="button" className="text-sm font-semibold text-primary hover:underline">
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    Processing...
                  </>
                ) : (
                  <>{isLogin ? 'Sign In' : 'Create Account'}</>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm opacity-70">
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError(null);
                    setSuccess(null);
                    setSignupComplete(false);
                  }}
                  className="font-bold text-primary hover:underline"
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-charcoal/10 dark:border-white/10">
              <p className="text-xs text-center opacity-60">
                By continuing, you agree to our{' '}
                <a href="#" className="text-primary hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-primary hover:underline">Privacy Policy</a>
              </p>
            </div>
            </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
