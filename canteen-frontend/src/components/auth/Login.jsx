import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function CanteenLogo({ size = 56 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 200 200">
      <rect x="10" y="10" width="180" height="180" rx="44" ry="44" fill="#f97316"/>
      <ellipse cx="100" cy="118" rx="60" ry="14" fill="#fff" opacity="0.15"/>
      <path d="M44 103 Q44 158 100 158 Q156 158 156 103 Z" fill="white"/>
      <path d="M76 86 Q79 75 76 64" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.9"/>
      <path d="M100 82 Q103 70 100 58" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.9"/>
      <path d="M124 86 Q127 75 124 64" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.9"/>
      <line x1="78" y1="100" x2="66" y2="148" stroke="#f97316" strokeWidth="5.5" strokeLinecap="round"/>
      <line x1="91" y1="100" x2="74" y2="151" stroke="#f97316" strokeWidth="4" strokeLinecap="round" opacity="0.65"/>
    </svg>
  );
}

export default function Login() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === 'admin') navigate('/dashboard', { replace: true });
      else if (user.role === 'cashier') navigate('/pos', { replace: true });
      else navigate('/menu', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally { setLoading(false); }
  };

  const demoLogin = (role) => {
    const creds = {
      admin:    { email: 'admin@canteen.com',    password: 'cipro123' },
      cashier:  { email: 'cashier1@canteen.com', password: 'madjos123' },
      customer: { email: 'johnvincent@student.edu',   password: 'password' },
    };
    setForm(creds[role]);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{background: '#140800'}}>

      {/* Animated canvas background */}
      <canvas id="bgCanvas" className="absolute inset-0 w-full h-full" style={{opacity: 0.85}}/>

      <style>{`
        @keyframes orb1 {
          0%,100% { transform: translate(-30%,-30%) scale(1); opacity: 0.18; }
          50%      { transform: translate(-20%,-20%) scale(1.3); opacity: 0.28; }
        }
        @keyframes orb2 {
          0%,100% { transform: translate(30%,30%) scale(1); opacity: 0.15; }
          50%      { transform: translate(20%,20%) scale(1.25); opacity: 0.25; }
        }
        @keyframes orb3 {
          0%,100% { transform: translate(-50%,-50%) scale(1); opacity: 0.08; }
          33%      { transform: translate(-40%,-60%) scale(1.4); opacity: 0.14; }
          66%      { transform: translate(-60%,-40%) scale(0.9); opacity: 0.1; }
        }
        @keyframes float1 { 0%,100%{transform:translateY(0) rotate(0deg);} 50%{transform:translateY(-18px) rotate(8deg);} }
        @keyframes float2 { 0%,100%{transform:translateY(0) rotate(0deg);} 50%{transform:translateY(-12px) rotate(-6deg);} }
        @keyframes float3 { 0%,100%{transform:translateY(0) rotate(0deg);} 50%{transform:translateY(-22px) rotate(10deg);} }
        @keyframes float4 { 0%,100%{transform:translateY(0) rotate(0deg);} 50%{transform:translateY(-8px) rotate(-4deg);} }
        @keyframes float5 { 0%,100%{transform:translateY(0) rotate(0deg);} 50%{transform:translateY(-16px) rotate(6deg);} }
        @keyframes float6 { 0%,100%{transform:translateY(0) rotate(0deg);} 50%{transform:translateY(-20px) rotate(-8deg);} }
        @keyframes gridMove {
          0%   { transform: translateY(0); }
          100% { transform: translateY(60px); }
        }
        @keyframes radiance {
          0%,100% { opacity: 0.55; letter-spacing: 0.35em; }
          50%      { opacity: 0.85; letter-spacing: 0.42em; }
        }
        .orb1 { position:absolute; top:0; left:0; width:500px; height:500px; border-radius:50%;
          background: radial-gradient(circle, #f97316 0%, transparent 70%);
          animation: orb1 7s ease-in-out infinite; }
        .orb2 { position:absolute; bottom:0; right:0; width:500px; height:500px; border-radius:50%;
          background: radial-gradient(circle, #ea580c 0%, transparent 70%);
          animation: orb2 9s ease-in-out infinite; }
        .orb3 { position:absolute; top:50%; left:50%; width:350px; height:350px; border-radius:50%;
          background: radial-gradient(circle, #fb923c 0%, transparent 70%);
          animation: orb3 11s ease-in-out infinite; }
        .grid-bg {
          position:absolute; inset:0;
          background-image: linear-gradient(rgba(249,115,22,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(249,115,22,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          animation: gridMove 4s linear infinite;
        }
        .food-float { position:absolute; font-size:1.6rem; opacity:0.07; pointer-events:none; user-select:none; }
        .radiance-text {
          animation: radiance 3s ease-in-out infinite;
        }
      `}</style>

      {/* Animated orbs */}
      <div className="orb1"/>
      <div className="orb2"/>
      <div className="orb3"/>

      {/* Moving grid */}
      <div className="grid-bg"/>

      {/* Floating food items */}
      {[
        {e:'🍱', top:'8%',  left:'6%',  anim:'float1 6s ease-in-out infinite'},
        {e:'🍛', top:'22%', left:'88%', anim:'float2 8s ease-in-out infinite'},
        {e:'🥘', top:'55%', left:'4%',  anim:'float3 7s ease-in-out infinite'},
        {e:'🍜', top:'75%', left:'91%', anim:'float4 9s ease-in-out infinite'},
        {e:'🧆', top:'40%', left:'93%', anim:'float5 5s ease-in-out infinite'},
        {e:'🍲', top:'85%', left:'8%',  anim:'float6 10s ease-in-out infinite'},
        {e:'🥗', top:'12%', left:'78%', anim:'float2 7.5s ease-in-out infinite'},
        {e:'🍤', top:'68%', left:'82%', anim:'float1 8.5s ease-in-out infinite'},
      ].map((f, i) => (
        <div key={i} className="food-float" style={{top:f.top, left:f.left, animation:f.anim}}>{f.e}</div>
      ))}

      <div className="relative w-full max-w-sm mx-4">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4 drop-shadow-2xl">
            <CanteenLogo size={80} />
          </div>
          <p className="radiance-text text-xs font-bold uppercase mb-1"
            style={{color: '#fb923c', letterSpacing: '0.38em'}}>Radiance</p>
          <h1 className="text-4xl font-black text-white tracking-tight">CanteenPOS</h1>
          <p className="text-orange-300 mt-1 text-sm font-medium tracking-widest uppercase">School Canteen System</p>
        </div>

        
        <div className="rounded-3xl p-8 shadow-2xl border border-orange-900"
          style={{background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)'}}>

          {error && (
            <div className="mb-5 p-3 rounded-xl text-sm font-medium text-red-300 border border-red-800"
              style={{background: 'rgba(239,68,68,0.1)'}}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-orange-300 mb-2 uppercase tracking-widest">Email</label>
              <input type="email" required value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                placeholder="you@canteen.edu"
                className="w-full px-4 py-3 rounded-xl text-white placeholder-orange-900 border border-orange-800 focus:outline-none focus:border-orange-500 transition text-sm"
                style={{background: 'rgba(255,255,255,0.07)'}}/>
            </div>
            <div>
              <label className="block text-xs font-bold text-orange-300 mb-2 uppercase tracking-widest">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} required value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-orange-900 border border-orange-800 focus:outline-none focus:border-orange-500 transition text-sm pr-12"
                  style={{background: 'rgba(255,255,255,0.07)'}}/>
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-500 text-xs">
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-bold text-sm tracking-wide transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-lg mt-2"
              style={{background: loading ? '#9a3412' : 'linear-gradient(135deg, #f97316, #ea580c)'}}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                  Signing in...
                </span>
              ) : 'Sign In →'}
            </button>
          </form>

          <div className="mt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-px bg-orange-900"/>
              <span className="text-xs text-orange-700 font-bold uppercase tracking-widest">Quick Demo</span>
              <div className="flex-1 h-px bg-orange-900"/>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                {role:'admin',   label:'Admin',    icon:'👑'},
                {role:'cashier', label:'Cashier',  icon:'💳'},
                {role:'customer',label:'Customer', icon:'🎓'},
              ].map(({role, label, icon}) => (
                <button key={role} onClick={() => demoLogin(role)}
                  className="py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 border border-orange-800 text-orange-300 hover:border-orange-500 hover:text-orange-100"
                  style={{background: 'rgba(255,255,255,0.04)'}}>
                  <span className="block text-lg mb-0.5">{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-orange-900 text-xs mt-6">IT15/L Integrative Programming © 2026</p>
      </div>
    </div>
  );
}
