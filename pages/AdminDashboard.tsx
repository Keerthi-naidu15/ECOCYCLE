
import React, { useState, useEffect } from 'react';
import { User, PickupRequest, PickupStatus } from '../types';
import { backendApi } from '../services/mockBackend';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, TrendingUp, DollarSign, Loader2, CheckCircle2, Search, Mail, CreditCard, Bike, Check, ShieldCheck, ArrowRight, X, Lock, ExternalLink } from 'lucide-react';
import { WASTE_RATES } from '../constants';

const AdminDashboard: React.FC = () => {
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [userStats, setUserStats] = useState({ recyclers: 0, riders: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'PAYMENTS' | 'ANALYTICS'>('PAYMENTS');
  const [searchQuery, setSearchQuery] = useState('');
  
  // High-Fidelity Cashfree Payout Flow
  const [checkoutData, setCheckoutData] = useState<PickupRequest | null>(null);
  const [paymentFlow, setPaymentFlow] = useState<'IDLE' | 'REDIRECTING' | 'CHECKOUT' | 'PROCESSING' | 'SUCCESS'>('IDLE');
  const [mockTxId, setMockTxId] = useState('');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const data = await backendApi.getPickups(undefined, 'ADMIN');
      setPickups(data);
      setUserStats(backendApi.getUserStats());
    } finally {
      setLoading(false);
    }
  };

  const startCashfreeRedirect = (p: PickupRequest) => {
    setCheckoutData(p);
    setPaymentFlow('REDIRECTING');
    setTimeout(() => setPaymentFlow('CHECKOUT'), 1500);
  };

  const processPayout = async () => {
    if (!checkoutData) return;
    setPaymentFlow('PROCESSING');
    await new Promise(resolve => setTimeout(resolve, 2500));
    const txId = `CF_PY_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    setMockTxId(txId);
    await backendApi.updatePickupStatus(checkoutData.id, { status: PickupStatus.PAID });
    setPaymentFlow('SUCCESS');
    loadAllData();
  };

  const paymentRequests = pickups.filter(p => p.status === PickupStatus.PAYMENT_REQUESTED)
    .filter(p => p.userPhone.includes(searchQuery) || p.userName.toLowerCase().includes(searchQuery.toLowerCase()));
  
  const chartData = WASTE_RATES.map(rate => ({
    name: rate.name,
    volume: pickups.filter(p => (p.verifiedWasteType || p.requestedWasteType) === rate.name)
      .reduce((acc, curr) => acc + (curr.verifiedWeight || 0), 0)
  }));

  const stats = [
    { label: 'Network Reach', value: userStats.recyclers.toString(), icon: Users, color: 'text-darkTeal', bg: 'bg-darkTeal/10' },
    { label: 'Active Riders', value: userStats.riders.toString(), icon: Bike, color: 'text-sage', bg: 'bg-sage/10' },
    { label: 'Total Settled', value: `₹${pickups.filter(p => p.status === 'PAID').reduce((acc, p) => acc + (p.totalAmount || 0), 0)}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Unpaid Sync', value: paymentRequests.length.toString(), icon: ShieldCheck, color: 'text-sky-600', bg: 'bg-sky-50' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative">
      {/* FULL-PAGE CASHFREE REDIRECT SIMULATION */}
      {paymentFlow !== 'IDLE' && checkoutData && (
        <div className="fixed inset-0 z-[1000] bg-white flex flex-col animate-in fade-in duration-500">
          {paymentFlow === 'REDIRECTING' && (
            <div className="flex-1 flex flex-col items-center justify-center space-y-6">
              <div className="w-16 h-16 border-4 border-slate-100 border-t-sky-500 rounded-full animate-spin"></div>
              <div className="text-center">
                <h2 className="text-xl font-black text-darkTeal uppercase italic tracking-tighter">Redirecting to Cashfree Payouts</h2>
                <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest">Securing merchant gateway connection...</p>
              </div>
            </div>
          )}

          {paymentFlow === 'CHECKOUT' && (
            <div className="flex-1 flex flex-col">
              <div className="bg-[#1e293b] p-6 flex justify-between items-center shadow-lg">
                <div className="flex items-center gap-3">
                   <ShieldCheck className="text-sky-400" />
                   <span className="text-white font-black uppercase tracking-tight text-sm">Cashfree <span className="text-sky-400">Payouts</span></span>
                </div>
                <button onClick={() => setPaymentFlow('IDLE')} className="text-slate-400 hover:text-white"><X size={20} /></button>
              </div>

              <div className="flex-1 bg-slate-50 flex items-center justify-center p-4">
                <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200">
                   <div className="bg-amber-50 py-3 px-6 flex items-center justify-center gap-2 border-b border-amber-100">
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                      <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Sandbox Environment Active</span>
                   </div>

                   <div className="p-12 space-y-10">
                      <div className="flex justify-between items-start border-b border-slate-50 pb-8">
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Settling To</p>
                           <h3 className="text-xl font-black text-darkTeal">{checkoutData.userName}</h3>
                           <p className="text-[10px] font-bold text-slate-500 uppercase">{checkoutData.userPhone}@upi</p>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Batch ID</p>
                           <p className="text-[10px] font-bold text-darkTeal uppercase">{checkoutData.id}</p>
                        </div>
                      </div>

                      <div className="text-center py-8 bg-slate-50 rounded-[2rem]">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Transaction Amount</p>
                         <h1 className="text-6xl font-black text-darkTeal tracking-tighter italic">₹{checkoutData.totalAmount}.00</h1>
                      </div>

                      <div className="space-y-4">
                         <div className="flex items-center gap-3 p-5 border border-sky-100 bg-sky-50 rounded-2xl">
                            <Lock size={18} className="text-sky-600" />
                            <p className="text-[10px] font-bold text-sky-800 uppercase leading-tight">Payout initiated via IMPS channel for immediate settlement.</p>
                         </div>

                         <button 
                           onClick={processPayout}
                           className="w-full bg-sky-600 hover:bg-sky-700 text-white py-6 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-sky-600/20 flex items-center justify-center gap-3 transition-all active:scale-95"
                         >
                           Approve Payout <ArrowRight size={18} />
                         </button>
                      </div>
                      <div className="flex justify-center gap-6 opacity-40">
                         <p className="text-[9px] font-black uppercase tracking-widest">PCI-DSS Compliant</p>
                         <p className="text-[9px] font-black uppercase tracking-widest">256-bit Encryption</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          )}

          {paymentFlow === 'PROCESSING' && (
            <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-in zoom-in-95 duration-300">
               <div className="relative">
                 <div className="w-24 h-24 border-8 border-slate-100 border-t-sky-500 rounded-full animate-spin"></div>
                 <div className="absolute inset-0 flex items-center justify-center">
                    <ShieldCheck size={32} className="text-sky-500" />
                 </div>
               </div>
               <div className="text-center">
                  <h2 className="text-2xl font-black text-darkTeal uppercase italic tracking-tighter">Verifying Bank Gateway</h2>
                  <p className="text-[10px] text-slate-400 font-black mt-2 uppercase tracking-widest">Handshaking with Cashfree Settlement API...</p>
               </div>
            </div>
          )}

          {paymentFlow === 'SUCCESS' && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-10 animate-in zoom-in-90 duration-500">
               <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/30">
                  <Check size={48} strokeWidth={4} />
               </div>
               <div className="text-center space-y-4">
                  <h1 className="text-4xl font-black text-darkTeal uppercase italic tracking-tighter">Settlement Successful</h1>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Payout reference generated and funds released</p>
               </div>

               <div className="w-full max-w-sm bg-slate-50 border border-slate-100 p-8 rounded-[2.5rem] space-y-4">
                  <div className="flex justify-between border-b border-slate-200 pb-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reference ID</span>
                    <span className="text-[10px] font-black text-darkTeal uppercase">{mockTxId}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Beneficiary</span>
                    <span className="text-[10px] font-black text-darkTeal uppercase">{checkoutData.userName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Payable</span>
                    <span className="text-lg font-black text-emerald-600 tracking-tighter">₹{checkoutData.totalAmount}.00</span>
                  </div>
               </div>

               <button 
                 onClick={() => setPaymentFlow('IDLE')}
                 className="px-12 py-5 bg-darkTeal text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-sage transition-all shadow-xl shadow-darkTeal/20"
               >
                 Continue to Dashboard
               </button>
            </div>
          )}
        </div>
      )}

      {/* Main Admin UI Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-darkTeal tracking-tighter uppercase italic text-shadow-sm">Operations Hub</h1>
          <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.3em] mt-1">Infrastructure Monitoring & Gateway Sync</p>
        </div>
        <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl">
          {(['PAYMENTS', 'ANALYTICS'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-10 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${
                activeTab === tab 
                ? 'bg-darkTeal text-white shadow-xl' 
                : 'text-slate-400 hover:text-darkTeal'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 transition-all hover:translate-y-[-4px]">
            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6`}>
              <stat.icon size={28} />
            </div>
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">{stat.label}</p>
            <p className="text-3xl font-black text-darkTeal mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {activeTab === 'PAYMENTS' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text" 
                placeholder="Search beneficiary number..." 
                className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-2xl outline-none border border-transparent focus:border-sage transition-all font-bold text-[11px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Recycler</th>
                    <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Material Audit</th>
                    <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Payout</th>
                    <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan={4} className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-sage" /></td></tr>
                  ) : paymentRequests.length === 0 ? (
                    <tr><td colSpan={4} className="p-32 text-center text-slate-300 font-black uppercase text-xs tracking-[0.2em]">Queue Synchronized</td></tr>
                  ) : paymentRequests.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-10 py-8">
                        <div>
                           <p className="font-black text-darkTeal text-sm">{p.userName}</p>
                           <p className="text-[10px] text-slate-400 font-bold uppercase">{p.userPhone}</p>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-3">
                           {p.imageUrl && <img src={p.imageUrl} className="w-10 h-10 rounded-lg object-cover ring-2 ring-slate-100" />}
                           <p className="text-[10px] font-black text-darkTeal uppercase">{p.verifiedWasteType} &bull; {p.verifiedWeight}kg</p>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <p className="text-2xl font-black text-darkTeal tracking-tighter italic">₹{p.totalAmount}</p>
                      </td>
                      <td className="px-10 py-8">
                        <button 
                          onClick={() => startCashfreeRedirect(p)}
                          className="px-8 py-3 bg-sky-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-sky-700 transition-all flex items-center gap-2 shadow-lg shadow-sky-600/10"
                        >
                          <CreditCard size={14} /> Settle with Cashfree
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ANALYTICS' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black text-darkTeal uppercase tracking-tighter mb-12 flex items-center gap-3 italic">
               <TrendingUp className="text-sage" /> System Flow Analytics
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#11444C', fontSize: 10, fontWeight: 'bold'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#11444C', fontSize: 10, fontWeight: 'bold'}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}} 
                    contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px -10px rgb(0 0 0 / 0.1)', fontFamily: 'Inter'}} 
                  />
                  <Bar dataKey="volume" radius={[12, 12, 0, 0]} barSize={40}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#11444C' : '#9EBC8C'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black text-darkTeal uppercase tracking-tighter mb-12 flex items-center gap-3 italic">
               <Mail className="text-sage" /> Global Logs
            </h3>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-4">
               {pickups.filter(p => p.status !== PickupStatus.PENDING).reverse().slice(0, 10).map(p => (
                 <div key={p.id} className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 flex justify-between items-center group hover:border-sage transition-all">
                    <div className="flex gap-4 items-center">
                       <div className={`w-2 h-2 rounded-full ${p.status === 'PAID' ? 'bg-sage animate-pulse' : 'bg-amber-400'}`}></div>
                       <div>
                         <p className="text-xs font-black text-darkTeal">{p.userName} &bull; {p.verifiedWeight}kg</p>
                         <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold mt-0.5">{p.status.replace('_', ' ')}</p>
                       </div>
                    </div>
                    <span className="text-[9px] text-slate-300 font-black uppercase">{new Date(p.requestedAt).toLocaleTimeString()}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
