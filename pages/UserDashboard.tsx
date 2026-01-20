
import React, { useState, useEffect, useRef } from 'react';
import { User, PickupRequest, PickupStatus, Location } from '../types';
import { backendApi } from '../services/mockBackend';
import { WASTE_RATES } from '../constants';
import { Truck, Wallet, MapPin, Loader2, History, Plus, Box, CheckCircle2, Navigation, Package, User as UserIcon, Crosshair, ArrowRight, Check } from 'lucide-react';
import L from 'leaflet';

interface UserDashboardProps {
  user: User;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user }) => {
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState<string>(WASTE_RATES[0].name);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<Location | null>(null);

  const modalMapRef = useRef<HTMLDivElement>(null);
  const trackMapRef = useRef<HTMLDivElement>(null);
  const modalMapInstance = useRef<L.Map | null>(null);
  const trackMapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    loadPickups();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setCurrentCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
    const interval = setInterval(loadPickups, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadPickups = async () => {
    try {
      const data = await backendApi.getPickups(user.id, 'USER');
      setPickups(data.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()));
    } finally {
      setLoading(false);
    }
  };

  const assignedPickup = pickups.find(p => p.status === PickupStatus.ASSIGNED);

  // Resilient Map Initialization for Modal
  useEffect(() => {
    if (showRequestModal && modalMapRef.current && !modalMapInstance.current) {
      const timer = setTimeout(() => {
        if (!modalMapRef.current) return;
        const center = currentCoords || { lat: 20.5937, lng: 78.9629 };
        modalMapInstance.current = L.map(modalMapRef.current, { zoomControl: false, attributionControl: false }).setView([center.lat, center.lng], 15);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(modalMapInstance.current);
        L.circleMarker([center.lat, center.lng], { radius: 8, fillColor: '#11444C', color: '#fff', weight: 2, fillOpacity: 1 }).addTo(modalMapInstance.current);
      }, 200);
      return () => clearTimeout(timer);
    }
    return () => {
      if (!showRequestModal && modalMapInstance.current) {
        modalMapInstance.current.remove();
        modalMapInstance.current = null;
      }
    };
  }, [showRequestModal, currentCoords]);

  // Resilient Live Tracker Map Initialization
  useEffect(() => {
    if (assignedPickup && trackMapRef.current && !trackMapInstance.current) {
      const timer = setTimeout(() => {
        if (!trackMapRef.current) return;
        trackMapInstance.current = L.map(trackMapRef.current, { zoomControl: false, attributionControl: false }).setView([assignedPickup.location.lat, assignedPickup.location.lng], 16);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(trackMapInstance.current);

        const homeIcon = L.divIcon({
          html: `<div class="bg-darkTeal p-2 rounded-full border-2 border-white shadow-lg"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg></div>`,
          className: '', iconSize: [32, 32], iconAnchor: [16, 16]
        });
        L.marker([assignedPickup.location.lat, assignedPickup.location.lng], { icon: homeIcon }).addTo(trackMapInstance.current);

        const truckIcon = L.divIcon({
          html: `<div class="bg-sage p-2 rounded-full border-2 border-white shadow-xl animate-bounce"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg></div>`,
          className: '', iconSize: [32, 32], iconAnchor: [16, 16]
        });
        L.marker([assignedPickup.location.lat + 0.003, assignedPickup.location.lng + 0.003], { icon: truckIcon }).addTo(trackMapInstance.current);
      }, 200);
      return () => clearTimeout(timer);
    }
    return () => {
      if (!assignedPickup && trackMapInstance.current) {
        trackMapInstance.current.remove();
        trackMapInstance.current = null;
      }
    };
  }, [assignedPickup]);

  const submitPickup = async () => {
    setIsSubmitting(true);
    try {
      await backendApi.createPickup({
        userId: user.id, userName: user.fullName, userPhone: user.phoneNumber, requestedWasteType: selectedType, address: user.address, location: currentCoords || { lat: 0, lng: 0 }
      });
      setShowRequestModal(false);
      loadPickups();
    } finally { setIsSubmitting(false); }
  };

  const selectedWasteData = WASTE_RATES.find(r => r.name === selectedType);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {assignedPickup && (
        <div className="bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="relative h-[450px]">
            <div ref={trackMapRef} className="w-full h-full grayscale-[0.1]" />
            <div className="absolute top-6 left-6 right-6 lg:left-auto lg:w-96 z-[400]">
              <div className="glass-effect rounded-[2.5rem] p-8 shadow-2xl border border-white/50 space-y-5">
                <div className="flex justify-between items-start">
                   <div>
                     <h2 className="text-xl font-black text-darkTeal uppercase tracking-tighter italic">Live Logistics</h2>
                     <p className="text-[10px] font-black text-sage uppercase mt-1 tracking-widest">Agent Approaching</p>
                   </div>
                   <div className="bg-darkTeal p-2.5 rounded-2xl text-white"><Truck size={20} /></div>
                </div>
                <div className="bg-white/40 p-5 rounded-2xl border border-white/10 flex items-center gap-4">
                   <div className="w-12 h-12 bg-sage rounded-2xl flex items-center justify-center text-white shadow-inner"><UserIcon size={24} /></div>
                   <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Assigned Driver</p>
                      <p className="text-sm font-black text-darkTeal tracking-tight italic">Eco-Agent #04</p>
                   </div>
                </div>
                <div className="space-y-2">
                   <div className="flex justify-between items-end">
                      <p className="text-[10px] font-black text-darkTeal uppercase tracking-widest">Enroute</p>
                      <p className="text-[10px] font-black text-sage uppercase tracking-widest">Est. 3 mins</p>
                   </div>
                   <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-sage animate-pulse" style={{ width: '75%' }}></div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-black text-darkTeal tracking-tight">Eco Dashboard</h1>
            <p className="text-slate-500 font-medium text-sm mt-1 flex items-center gap-2 italic">Welcome, {user.fullName}. <MapPin size={14} className="text-sage" /> {user.address}</p>
          </div>
          <button 
            onClick={() => setShowRequestModal(true)}
            className="mt-10 bg-sage text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:translate-y-[-2px] active:scale-95 transition-all shadow-2xl shadow-sage/30 flex items-center justify-center gap-3"
          >
            <Plus size={20} /> New Collection
          </button>
        </div>
        <div className="teal-gradient p-10 rounded-[3rem] shadow-xl text-white flex flex-col justify-between relative overflow-hidden group">
           <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Impact Wallet</p>
              <h2 className="text-5xl font-black tracking-tighter italic mt-12 group-hover:scale-105 transition-transform">₹{user.totalEarnings}</h2>
           </div>
           <div className="absolute top-[-20%] right-[-20%] w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        </div>
      </div>

      <section className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 bg-slate-50/30 flex justify-between items-center border-b border-slate-50">
           <h2 className="text-lg font-black text-darkTeal flex items-center gap-3 uppercase tracking-tighter italic"><History size={20} className="text-sage" /> Network Contributions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Material</th>
                <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Weight</th>
                <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Earnings</th>
                <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-sage" /></td></tr>
              ) : pickups.length === 0 ? (
                <tr><td colSpan={5} className="py-20 text-center text-slate-300 font-black uppercase tracking-widest">No activity</td></tr>
              ) : pickups.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-10 py-6 font-bold text-darkTeal text-xs">{new Date(p.requestedAt).toLocaleDateString()}</td>
                  <td className="px-10 py-6">
                    <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase text-white ${WASTE_RATES.find(r => r.name === (p.verifiedWasteType || p.requestedWasteType))?.color}`}>
                      {p.verifiedWasteType || p.requestedWasteType}
                    </span>
                  </td>
                  <td className="px-10 py-6 font-black text-darkTeal text-xs">{p.verifiedWeight ? `${p.verifiedWeight} kg` : '--'}</td>
                  <td className="px-10 py-6 font-black text-sage text-xs">{p.totalAmount ? `₹${p.totalAmount}` : '--'}</td>
                  <td className="px-10 py-6">
                    <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${p.status === PickupStatus.PAID ? 'bg-sage/10 text-sage border border-sage/10' : 'bg-slate-100 text-slate-400'}`}>
                       {p.status === PickupStatus.PAID ? 'Settled' : p.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {showRequestModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-darkTeal/50 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg rounded-[3.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100">
            <div className="h-40 bg-slate-100 relative"><div ref={modalMapRef} className="w-full h-full" /></div>
            <div className="p-10 space-y-8">
              <div className="flex justify-between items-end">
                <h3 className="text-2xl font-black text-darkTeal uppercase tracking-tighter italic">Order Selection</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Verified GPS Location</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {WASTE_RATES.map(rate => (
                  <button
                    key={rate.id}
                    onClick={() => setSelectedType(rate.name)}
                    className={`p-4 rounded-[2rem] border-2 transition-all flex items-center gap-3 ${
                      selectedType === rate.name ? 'border-sage bg-sage/5 text-darkTeal shadow-sm' : 'border-slate-50 text-slate-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedType === rate.name ? 'bg-sage text-white' : 'bg-slate-100'}`}>
                      <Box size={14} />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest">{rate.name}</span>
                  </button>
                ))}
              </div>

              <div className="bg-slate-50/80 rounded-[2.5rem] p-8 border border-slate-100 space-y-4">
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Material Type</span>
                    <span className="text-[11px] font-black text-darkTeal uppercase tracking-widest">{selectedType}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Settlement Rate</span>
                    <span className="text-xl font-black text-sage tracking-tighter italic">₹{selectedWasteData?.ratePerKg}/kg</span>
                 </div>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={submitPickup}
                  disabled={isSubmitting}
                  className="w-full bg-darkTeal text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-darkTeal/10 flex items-center justify-center gap-3 hover:translate-y-[-2px] active:scale-95 transition-all"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <>Confirm Collection Order <ArrowRight size={18} /></>}
                </button>
                <button 
                  onClick={() => setShowRequestModal(false)} 
                  className="w-full py-2 text-slate-400 font-black uppercase tracking-widest text-[9px] hover:text-darkTeal transition-colors tracking-[0.2em]"
                >
                  Discard Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
