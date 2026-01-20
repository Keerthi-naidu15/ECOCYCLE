
import React, { useState, useEffect, useRef } from 'react';
import { User, PickupRequest, PickupStatus, Location } from '../types';
import { backendApi } from '../services/mockBackend';
import { WASTE_RATES } from '../constants';
import { Truck, Check, Loader2, MapPin, Navigation, Camera, Box, CheckCircle2, Crosshair } from 'lucide-react';
import L from 'leaflet';

interface RiderDashboardProps {
  user: User;
}

const RiderDashboard: React.FC<RiderDashboardProps> = ({ user }) => {
  const [activeTasks, setActiveTasks] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'MAP' | 'TASKS'>('TASKS');
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [riderLocation, setRiderLocation] = useState<Location | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  // Verification State
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verifyWeight, setVerifyWeight] = useState<number>(0);
  const [verifyType, setVerifyType] = useState<string>('');
  const [verifyImage, setVerifyImage] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setRiderLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
    loadTasks();
  }, []);

  // Map Initialization
  useEffect(() => {
    if (currentView === 'MAP' && mapContainerRef.current && !mapInstance.current) {
      mapInstance.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView(riderLocation ? [riderLocation.lat, riderLocation.lng] : [20.5937, 78.9629], 13);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(mapInstance.current);
    }

    if (currentView === 'MAP' && mapInstance.current) {
      // Clear old markers
      mapInstance.current.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
          mapInstance.current?.removeLayer(layer);
        }
      });

      // Rider Marker
      if (riderLocation) {
        L.circleMarker([riderLocation.lat, riderLocation.lng], {
          radius: 10,
          fillColor: '#9EBC8C',
          color: '#fff',
          weight: 3,
          fillOpacity: 1
        }).addTo(mapInstance.current).bindPopup("<b>My Position</b>");
      }

      // Task Markers
      activeTasks.forEach(task => {
        const marker = L.circleMarker([task.location.lat, task.location.lng], {
          radius: 8,
          fillColor: task.status === PickupStatus.ASSIGNED ? '#11444C' : '#9EBC8C',
          color: '#fff',
          weight: 2,
          fillOpacity: 0.8
        }).addTo(mapInstance.current!);
        
        marker.bindPopup(`
          <div class="p-2">
            <p class="font-black text-xs uppercase tracking-tight">${task.userName}</p>
            <p class="text-[9px] text-slate-400 mt-1">${task.address.substring(0, 30)}...</p>
          </div>
        `);
      });
    }

    return () => {
      if (currentView !== 'MAP' && mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [currentView, activeTasks, riderLocation]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await backendApi.getPickups(user.id, 'RIDER');
      setActiveTasks(data);
    } finally {
      setLoading(false);
    }
  };

  const acceptTask = async (id: string) => {
    setProcessingId(id);
    try {
      await backendApi.updatePickupStatus(id, { status: PickupStatus.ASSIGNED, riderId: user.id });
      await loadTasks();
      setNotification({ message: "Task Assigned. Map Updated.", type: 'success' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setProcessingId(null);
    }
  };

  const navigateToTask = (task: PickupRequest) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${task.location.lat},${task.location.lng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const startVerification = (task: PickupRequest) => {
    setVerifyingId(task.id);
    setVerifyType(task.requestedWasteType);
    setVerifyWeight(0);
    setVerifyImage(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setVerifyImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const confirmVerification = async () => {
    if (!verifyWeight || !verifyImage) return alert("Photo and weight are mandatory.");
    setProcessingId(verifyingId);
    try {
      await backendApi.updatePickupStatus(verifyingId!, {
        status: PickupStatus.VERIFIED,
        verifiedWeight: verifyWeight,
        verifiedWasteType: verifyType,
        imageUrl: verifyImage
      });
      setVerifyingId(null);
      await loadTasks();
      setNotification({ message: "Verification Complete!", type: 'success' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setProcessingId(null);
    }
  };

  const currentRate = WASTE_RATES.find(r => r.name === verifyType)?.ratePerKg || 0;
  const estimatedEarnings = Math.round((verifyWeight || 0) * currentRate);

  return (
    <div className="space-y-6 max-w-5xl mx-auto relative">
      {notification && (
        <div className="fixed top-24 right-8 z-[100] px-6 py-4 bg-sage text-white rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300">
          <CheckCircle2 size={20} />
          <p className="font-black text-[10px] uppercase tracking-widest">{notification.message}</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-darkTeal rounded-2xl flex items-center justify-center text-white shadow-lg">
            <Truck size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-darkTeal uppercase tracking-tight">Rider Dashboard</h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">{user.fullName}</p>
          </div>
        </div>
        
        <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl">
          <button 
            onClick={() => setCurrentView('TASKS')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${currentView === 'TASKS' ? 'bg-white text-darkTeal shadow-sm' : 'text-slate-400'}`}
          >
            LIST
          </button>
          <button 
            onClick={() => setCurrentView('MAP')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${currentView === 'MAP' ? 'bg-white text-darkTeal shadow-sm' : 'text-slate-400'}`}
          >
            ROUTE
          </button>
        </div>
      </div>

      {currentView === 'MAP' ? (
        <div className="bg-darkTeal rounded-[2.5rem] aspect-[16/9] lg:aspect-[21/9] min-h-[400px] relative overflow-hidden border-8 border-white shadow-2xl">
          <div ref={mapContainerRef} className="w-full h-full z-10" />
          <div className="absolute bottom-6 left-6 z-20 bg-darkTeal/90 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
             <p className="text-[9px] text-white font-black flex items-center gap-2 uppercase tracking-widest">
               <Crosshair size={12} className="text-sage" /> GPS: Live Tracking
             </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-full py-20 text-center"><Loader2 className="animate-spin mx-auto text-sage" /></div>
          ) : activeTasks.length === 0 ? (
            <div className="col-span-full bg-white rounded-[2.5rem] p-20 text-center border border-slate-100 shadow-sm">
              <Box className="mx-auto text-slate-100 mb-6" size={80} />
              <h3 className="text-lg font-black text-slate-300 uppercase tracking-widest">Queue Clear</h3>
            </div>
          ) : activeTasks.map(task => (
            <div key={task.id} className="bg-white rounded-[2rem] border border-slate-100 p-8 space-y-6 shadow-sm hover:shadow-lg transition-all group relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-darkTeal font-black text-lg border border-slate-100 uppercase">
                    {task.userName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-darkTeal leading-none mb-1">{task.userName}</h3>
                    <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">{task.userPhone}</p>
                  </div>
                </div>
                <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ${
                  task.status === PickupStatus.ASSIGNED ? 'bg-darkTeal text-white' : 'bg-sage/10 text-sage'
                }`}>
                  {task.status}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-4 rounded-2xl text-xs font-medium border border-slate-50">
                  <MapPin size={16} className="text-sage" /> {task.address}
                </div>
                {task.status === PickupStatus.ASSIGNED && (
                   <button 
                     onClick={() => navigateToTask(task)}
                     className="flex items-center justify-center gap-2 w-full py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-darkTeal hover:bg-slate-50 transition-colors uppercase tracking-widest"
                   >
                     <Navigation size={14} className="text-sage" /> Open Google Maps
                   </button>
                )}
              </div>

              <div className="pt-2 flex gap-3">
                {task.status === PickupStatus.PENDING ? (
                  <button 
                    onClick={() => acceptTask(task.id)}
                    disabled={processingId === task.id}
                    className="flex-1 bg-darkTeal text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-darkTeal/10"
                  >
                    {processingId === task.id ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'ACCEPT'}
                  </button>
                ) : (
                  <button 
                    onClick={() => startVerification(task)}
                    className="flex-1 bg-sage text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-sage/10"
                  >
                    VERIFY ASSETS
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {verifyingId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-darkTeal/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl space-y-6 animate-in slide-in-from-bottom-8 duration-300">
            <h3 className="text-xl font-black text-darkTeal uppercase tracking-tight text-center">Collection Verification</h3>

            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visual Evidence</p>
                {verifyImage ? (
                  <div className="relative aspect-video rounded-3xl overflow-hidden ring-4 ring-sage/20">
                    <img src={verifyImage} className="w-full h-full object-cover" />
                    <button onClick={() => setVerifyImage(null)} className="absolute top-4 right-4 bg-white/90 p-2 rounded-full text-red-500 shadow-xl">
                       <Camera size={20} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center aspect-video w-full border-2 border-dashed border-slate-200 rounded-3xl cursor-pointer bg-slate-50 hover:bg-sage/5 hover:border-sage transition-all group">
                    <Camera className="w-10 h-10 text-slate-300 group-hover:text-sage mb-2 transition-colors" />
                    <p className="text-[10px] font-black text-slate-400 group-hover:text-darkTeal uppercase tracking-widest">Capture Proof</p>
                    <input type="file" className="hidden" accept="image/*" capture="environment" onChange={handleImageUpload} />
                  </label>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Weight (KG)</p>
                  <input 
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none font-black text-darkTeal text-xl"
                    value={verifyWeight || ''}
                    onChange={(e) => setVerifyWeight(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</p>
                  <select 
                    value={verifyType}
                    onChange={(e) => setVerifyType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none font-bold text-darkTeal text-xs"
                  >
                    {WASTE_RATES.map(r => <option key={r.name} value={r.name}>{r.name} - ₹{r.ratePerKg}/kg</option>)}
                  </select>
                </div>
              </div>

              <div className="bg-sage/10 p-4 rounded-2xl border border-sage/20 flex justify-between items-center">
                <div>
                  <p className="text-[9px] font-black text-sage uppercase tracking-widest">Current Rate</p>
                  <p className="text-sm font-black text-darkTeal">₹{currentRate}/kg</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-sage uppercase tracking-widest">Estimated Value</p>
                  <p className="text-2xl font-black text-darkTeal">₹{estimatedEarnings}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setVerifyingId(null)}
                className="flex-1 py-4 text-slate-400 font-black uppercase tracking-widest text-[10px]"
              >
                Back
              </button>
              <button 
                onClick={confirmVerification}
                disabled={processingId === verifyingId}
                className="flex-1 bg-darkTeal text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 text-[10px]"
              >
                {processingId === verifyingId ? <Loader2 className="animate-spin" size={16} /> : 'Complete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiderDashboard;
