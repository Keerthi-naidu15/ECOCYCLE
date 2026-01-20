
import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types';
import { backendApi } from './services/mockBackend';
import { USER_DATA_KEY } from './constants';
import Layout from './components/Layout';
import UserDashboard from './pages/UserDashboard';
import RiderDashboard from './pages/RiderDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { Recycle, Smartphone, ArrowRight, Loader2, ShieldCheck, Heart, User as UserIcon, MapPin, AlertCircle, Leaf } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Auth Flow States
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('USER');
  const [address, setAddress] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem(USER_DATA_KEY);
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
    }
    setLoading(false);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (phone.length < 10) {
      setAuthError("Please enter a valid 10-digit phone number.");
      return;
    }
    
    if (fullName.length < 2) {
      setAuthError("Please enter your full name.");
      return;
    }

    if (isSignUp && role === 'USER' && address.length < 5) {
      setAuthError("Please provide a valid pickup address.");
      return;
    }
    
    setIsProcessing(true);
    try {
      const { user } = await backendApi.login(phone, fullName, role, address, isSignUp);
      setUser(user);
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
    } catch (err: any) {
      setAuthError(err.message || "Authentication failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(USER_DATA_KEY);
    setFullName('');
    setPhone('');
    setRole('USER');
    setAddress('');
    setAuthError(null);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <Loader2 className="animate-spin text-sage mx-auto mb-4" size={40} />
        <p className="text-darkTeal font-bold uppercase tracking-widest text-[10px]">Synchronizing EcoCycle...</p>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
        {/* Branding Section */}
        <div className="bg-darkTeal hidden lg:flex flex-col justify-between p-12 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-16">
              <div className="bg-sage p-2 rounded-xl text-darkTeal shadow-lg">
                <Leaf size={28} />
              </div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">EcoCycle</h1>
            </div>
            
            <h2 className="text-5xl font-black leading-tight mb-10 tracking-tighter">
              A Cleaner Future <br />
              <span className="text-sage">Through Precision.</span>
            </h2>
            
            <div className="space-y-8 max-w-sm">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0 border border-white/10">
                  <ShieldCheck className="text-sage" size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm uppercase tracking-tight">Geo-Spatial Precision</h4>
                  <p className="text-white/50 text-[11px] mt-1 leading-relaxed">Dijkstra routing ensures zero-waste logistics and shortest-path collections.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0 border border-white/10">
                  <Heart className="text-sage" size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm uppercase tracking-tight">Direct Rewards</h4>
                  <p className="text-white/50 text-[11px] mt-1 leading-relaxed">Join a verified network of 2,000+ recyclers earning daily via instant UPI.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-sage/10 rounded-full blur-[120px]"></div>
        </div>

        {/* Auth Section */}
        <div className="flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-sm space-y-10">
            <div className="text-left">
              <h2 className="text-3xl font-black text-darkTeal tracking-tighter uppercase">{isSignUp ? 'Join Network' : 'Identify'}</h2>
              <p className="text-slate-400 text-xs mt-2 font-medium">{isSignUp ? 'Register for smart waste collection.' : 'Access your dashboard via secure login.'}</p>
            </div>

            {authError && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-100 p-4 rounded-2xl text-red-600 text-xs animate-in fade-in zoom-in duration-300">
                <AlertCircle className="shrink-0" size={16} />
                <p className="font-bold">{authError}</p>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-sage transition-colors" size={16} />
                  <input
                    type="text"
                    required
                    placeholder="Rahul Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-sage/5 focus:border-sage transition-all text-sm font-bold text-darkTeal"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Contact</label>
                <div className="relative group">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-sage transition-colors" size={16} />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-sage/5 focus:border-sage transition-all text-sm font-bold text-darkTeal"
                  />
                </div>
              </div>

              {isSignUp && (
                <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="p-1 bg-slate-100 rounded-xl flex gap-1">
                    {(['USER', 'RIDER', 'ADMIN'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`flex-1 py-2 rounded-lg text-[9px] font-black tracking-widest transition-all ${
                          role === r 
                          ? 'bg-white text-sage shadow-sm' 
                          : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>

                  {role === 'USER' && (
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Default Address</label>
                      <div className="relative group">
                        <MapPin className="absolute left-4 top-4 text-slate-300 group-focus-within:text-sage transition-colors" size={16} />
                        <textarea
                          required
                          rows={2}
                          placeholder="Floor, Building, Locality..."
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-sage/5 focus:border-sage transition-all text-sm font-bold text-darkTeal resize-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all bg-darkTeal text-white hover:opacity-90 shadow-2xl shadow-darkTeal/20 disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={16} /> : (
                  <>{isSignUp ? 'Initialize Profile' : 'Access System'} <ArrowRight size={16} /></>
                )}
              </button>
            </form>

            <div className="text-center">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                {isSignUp ? "Joined already?" : "New to EcoCycle?"}{' '}
                <button 
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setAuthError(null);
                  }}
                  className="text-sage font-black hover:underline ml-2"
                >
                  {isSignUp ? 'ACCESS PORTAL' : 'JOIN NETWORK'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout user={user} onLogout={handleLogout}>
      {user.role === 'USER' && <UserDashboard user={user} />}
      {user.role === 'RIDER' && <RiderDashboard user={user} />}
      {user.role === 'ADMIN' && <AdminDashboard />}
    </Layout>
  );
};

export default App;
