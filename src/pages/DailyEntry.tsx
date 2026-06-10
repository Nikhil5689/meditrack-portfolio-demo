import { useEffect, useState } from 'react';
import { ChevronRight, PlusCircle, Calendar, CheckCircle, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Doctor, Order, Page } from '../lib/types';

interface DailyEntryProps {
  onNavigate: (page: Page, params?: { doctorId?: string }) => void;
  userId: string;
}

interface DoctorWithStatus extends Doctor {
  todayOrder?: Order;
}

export default function DailyEntry({ onNavigate, userId }: DailyEntryProps) {
  const [doctors, setDoctors] = useState<DoctorWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [today] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => { fetchData(); }, [today]);

  async function fetchData() {
    setLoading(true);
    const [{ data: docs }, { data: todayOrders }] = await Promise.all([
      supabase.from('doctors').select('*').eq('is_active', true).eq('user_id', userId).order('name'),
      supabase.from('orders').select('*').eq('order_date', today).eq('user_id', userId),
    ]);

    if (docs) {
      const enriched = docs.map((d: any) => ({
        ...d,
        todayOrder: todayOrders?.find((o: any) => o.doctor_id === d.id),
      }));
      setDoctors(enriched);
    }
    setLoading(false);
  }

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;
  const done = doctors.filter(d => d.todayOrder).length;
  const total = doctors.length;

  return (
    <div className="space-y-8 animate-in slide-in-from-left-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Daily Entry</h1>
          <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
            <Calendar size={16} className="text-blue-500" />
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => onNavigate('add-order')}
          className="flex items-center gap-2.5 bg-blue-600 text-white px-6 py-3.5 rounded-2xl text-sm font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
        >
          <PlusCircle size={18} />
          <span>New Custom Order</span>
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-blue-100/50 transition-colors duration-700" />
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-10">
          <div className="w-40 h-40 relative flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 filter drop-shadow-sm" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="10" />
              <circle
                cx="50" cy="50" r="42"
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="10"
                strokeDasharray={`${total > 0 ? (done / total) * 264 : 0} 264`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-black text-slate-800">
                {total > 0 ? Math.round((done / total) * 100) : 0}<span className="text-sm text-slate-400">%</span>
              </span>
            </div>
          </div>
          
          <div className="flex-1 text-center sm:text-left">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-2">Visitation Tracker</p>
            <h2 className="text-2xl font-black text-slate-800 mb-2">{done} Out of {total} Doctors</h2>
            <p className="text-slate-400 font-medium max-w-sm">
              Keep pushing! You've logged orders for {Math.round((done/total)*100)}% of your active directory today.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-400 animate-pulse">Syncing daily logs...</p>
        </div>
      ) : doctors.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-16 text-center border border-slate-100">
          <p className="text-slate-400 font-bold">No doctors found in your directory</p>
          <button onClick={() => onNavigate('doctors')} className="mt-4 text-blue-600 text-sm font-black underline">Add Doctors Now</button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Visitation List</span>
            <span className="text-[10px] font-bold text-slate-300">A-Z ORDER</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctors.map(d => (
              <div
                key={d.id}
                className={`bg-white rounded-[2rem] border transition-all duration-500 overflow-hidden group ${
                  d.todayOrder ? 'border-emerald-100 shadow-lg shadow-emerald-50/50' : 'border-slate-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-50/20 shadow-sm shadow-slate-100/50'
                }`}
              >
                <div className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black transition-all duration-500 ${
                      d.todayOrder 
                        ? 'bg-emerald-500 text-white rotate-6' 
                        : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 group-hover:-rotate-3'
                    }`}>
                      {d.todayOrder ? <CheckCircle size={24} /> : d.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-extrabold text-slate-800 text-base group-hover:text-blue-600 transition-colors truncate">{d.name}</p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-tight truncate mt-0.5">{d.clinic}{d.area ? ` · ${d.area}` : ''}</p>
                      {d.todayOrder && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                            {fmt(d.todayOrder.total_amount)}
                          </span>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                            d.todayOrder.payment_status === 'paid' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'
                          }`}>
                            {d.todayOrder.payment_status}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate('add-order', { doctorId: d.id })}
                    className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 shadow-sm ${
                      d.todayOrder
                        ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-100'
                        : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-110 active:scale-95 shadow-blue-200'
                    }`}
                  >
                    <PlusCircle size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
