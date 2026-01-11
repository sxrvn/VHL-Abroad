
import React from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from './constants';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Journey from './pages/Journey';
import Universities from './pages/Universities';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import QuestionManagement from './components/admin/QuestionManagement';
import ExamAttemptPage from './pages/ExamAttempt.tsx';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-solid border-charcoal/10 bg-white/80 dark:bg-bg-dark/80 backdrop-blur-md px-6 md:px-20 py-4">
      <div className="max-w-[1280px] mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="size-8 transition-transform group-hover:scale-110 overflow-hidden">
            <img src="/assets/red-logo.png" alt="VHL Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-xl font-black tracking-tight">VHL <span className="text-primary">ABROAD</span></h1>
        </Link>
        <div className="hidden md:flex items-center gap-10">
          {NAV_ITEMS.map((item) => (
            <Link 
              key={item.label} 
              to={item.path.replace('#', '')} 
              className={`text-sm font-semibold hover:text-primary transition-colors ${location.pathname === item.path.replace('#', '') ? 'text-primary' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
              >
                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-sm">person</span>
                </div>
                <span className="text-sm font-semibold hidden sm:inline">{profile?.full_name || 'User'}</span>
                <span className="material-symbols-outlined text-sm">{dropdownOpen ? 'expand_less' : 'expand_more'}</span>
              </button>
              
              {dropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-bg-dark rounded-xl shadow-xl border border-charcoal/10 dark:border-white/10 py-2 z-20">
                    <div className="px-4 py-3 border-b border-charcoal/10 dark:border-white/10">
                      <p className="font-bold text-sm">{profile?.full_name}</p>
                      <p className="text-xs opacity-60">{user.email}</p>
                    </div>
                    <Link
                      to={profile?.role === 'admin' ? '/admin' : '/dashboard'}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <span className="material-symbols-outlined text-sm">dashboard</span>
                      <span className="text-sm font-semibold">Go to Dashboard</span>
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left"
                    >
                      <span className="material-symbols-outlined text-sm">logout</span>
                      <span className="text-sm font-semibold">Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link to="/contact" className="hidden md:inline-block bg-primary text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-primary-hover transition-all shadow-lg shadow-primary/20">
                Free Consultation
              </Link>
              {/* Mobile Hamburger Menu */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden flex items-center justify-center p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-all"
                aria-label="Toggle menu"
              >
                <span className="material-symbols-outlined text-2xl">
                  {mobileMenuOpen ? 'close' : 'menu'}
                </span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-transparent z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Dropdown Panel */}
          <div className="absolute top-full left-0 right-0 mt-0 bg-white dark:bg-bg-dark shadow-xl border-t border-charcoal/10 dark:border-white/10 z-50 md:hidden animate-slideDown">
            <div className="max-w-[1280px] mx-auto px-6 py-4">
              {/* Navigation Items */}
              <div className="flex flex-col space-y-1">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.label}
                    to={item.path.replace('#', '')}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-all ${
                      location.pathname === item.path.replace('#', '') 
                        ? 'bg-primary/10 text-primary font-bold' 
                        : 'font-semibold'
                    }`}
                  >
                    <span className="text-sm">{item.label}</span>
                  </Link>
                ))}
                
                {/* Free Consultation in mobile menu */}
                <Link
                  to="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-white font-bold hover:bg-primary-hover transition-all mt-3 shadow-lg shadow-primary/20"
                >
                  <span className="material-symbols-outlined text-sm">contact_support</span>
                  <span className="text-sm">Free Consultation</span>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

const Footer: React.FC = () => {
  const handleFooterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formElement = e.target as HTMLFormElement;
    const formData = new FormData(formElement);
    
    try {
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData as any).toString(),
      });
      
      alert('Thank you! We will contact you soon.');
      formElement.reset();
    } catch (error) {
      alert('There was an error submitting the form. Please try again.');
    }
  };

  return (
  <footer className="bg-bg-dark text-white py-20 px-6 md:px-20">
    <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
      <div className="space-y-8">
        <h3 className="text-4xl md:text-5xl font-black">Ready to start your German chapter?</h3>
        <p className="text-lg opacity-70">Don't navigate the complex German system alone. Let experts guide you to your dream future.</p>
        <div className="flex items-center gap-6">
          <div className="flex -space-x-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="size-10 rounded-full border-2 border-bg-dark bg-gray-500 overflow-hidden">
                <img src={`https://picsum.photos/seed/${i*20}/40/40`} alt="user" />
              </div>
            ))}
            <div className="size-10 rounded-full border-2 border-bg-dark bg-primary flex items-center justify-center text-[10px] font-bold">+1k</div>
          </div>
          <p className="text-sm font-medium opacity-80">Join our community of students in Germany</p>
        </div>
      </div>
      <div className="glass p-8 rounded-3xl text-charcoal dark:text-white">
        <form name="footer-contact" method="POST" data-netlify="true" netlify-honeypot="bot-field" onSubmit={handleFooterSubmit} className="space-y-4">
          <input type="hidden" name="form-name" value="footer-contact" />
          <p className="hidden">
            <label>Don't fill this out if you're human: <input name="bot-field" /></label>
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-60">Full Name</label>
              <input name="fullName" className="w-full bg-bg-light dark:bg-white/10 border-0 rounded-xl focus:ring-2 focus:ring-primary p-3" placeholder="Enter Name" type="text" required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-60">Phone</label>
              <input name="phone" className="w-full bg-bg-light dark:bg-white/10 border-0 rounded-xl focus:ring-2 focus:ring-primary p-3" placeholder="Enter Phone Number" type="tel" required />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest opacity-60">Preferred Program</label>
            <select name="program" className="w-full bg-bg-light dark:bg-white/10 border-0 rounded-xl focus:ring-2 focus:ring-primary p-3" required>
              <option>Bachelors Degree</option>
              <option>Masters Degree</option>
              <option>Nursing Program</option>
              <option>Vocational Training (Ausbildung)</option>
            </select>
          </div>
          <button type="submit" className="w-full py-4 bg-primary text-white font-black rounded-xl hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 flex items-center justify-center">Get My Free Roadmap</button>
          <p className="text-[10px] text-center opacity-50 uppercase tracking-tighter">By clicking, you agree to our privacy policy and terms.</p>
        </form>
      </div>
    </div>
    <div className="max-w-[1280px] mx-auto mt-20 pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-xs opacity-60">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-black tracking-tight uppercase">VHL Abroad Career</h2>
      </div>
      <div className="flex gap-8">
        <Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
        <Link to="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link>
        <Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link>
      </div>
      <p>© 2026 VHL Abroad Career. All rights reserved.</p>
    </div>
  </footer>
  );
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const hideFooter = location.pathname === '/login' || location.pathname === '/dashboard' || location.pathname === '/admin';
  const hideNavbar = location.pathname === '/dashboard' || location.pathname === '/admin';

  return (
    <div className="min-h-screen flex flex-col">
      {!hideNavbar && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/journey" element={<Journey />} />
          <Route path="/universities" element={<Universities />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute requiredRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/questions/:examId" 
            element={
              <ProtectedRoute requiredRole="admin">
                <QuestionManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/exam/:examId" 
            element={
              <ProtectedRoute requiredRole="student">
                <ExamAttemptPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
