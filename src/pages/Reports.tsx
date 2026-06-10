import { useEffect, useState } from 'react';
import { Download, Filter, TrendingUp, Clock, CheckCircle, ShoppingBag, ChevronRight, IndianRupee } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { exportOrdersReport } from '../lib/excel';
import type { Doctor, Order, Page } from '../lib/types';

interface ReportOrder extends Order {
  doctors?: Doctor;
}

interface ReportsProps {
  onNavigate: (page: Page, params?: { doctorId?: string }) => void;
  userId: string;
}

export default function Reports({ onNavigate, userId }: ReportsProps) {
  const [orders, setOrders] = useState<ReportOrder[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');

  const [dateFrom, setDateFrom] = useState(`${y}-${m}-01`);
  const [dateTo, setDateTo] = useState(now.toISOString().split('T')[0]);
  const [filterDoctor, setFilterDoctor] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    supabase.from('doctors').select('*').eq('is_active', true).eq('user_id', userId).order('name').then(({ data }: any) => {
      if (data) setDoctors(data);
    });
  }, [userId]);

  useEffect(() => { fetchOrders(); }, [dateFrom, dateTo, filterDoctor, filterStatus, userId]);

  async function fetchOrders() {
    setLoading(true);
    let query = supabase
      .from('orders')
      .select('*, doctors(*)')
      .eq('user_id', userId)
      .gte('order_date', dateFrom)
      .lte('order_date', dateTo)
      .order('order_date', { ascending: false });

    if (filterDoctor) query = query.eq('doctor_id', filterDoctor);
    if (filterStatus) query = query.eq('payment_status', filterStatus);

    const { data } = await query;
    if (data) setOrders(data as ReportOrder[]);
    setLoading(false);
  }

  const totalSales = orders.reduce((s, o) => s + Number(o.total_amount), 0);
  const paidAmt = orders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + Number(o.total_amount), 0);
  const pendingAmt = orders.filter(o => o.payment_status === 'pending').reduce((s, o) => s + Number(o.total_amount), 0);
  const fmt = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;

  function handleExport() {
    exportOrdersReport(
      orders.map(o => ({
        date: o.order_date,
        doctor: o.doctors?.name ?? '',
        clinic: o.doctors?.clinic ?? '',
        area: o.doctors?.area ?? '',
        total: Number(o.total_amount),
        status: o.payment_status,
        invoice: o.invoice_number,
      })),
      `MediTrack-Report-${dateFrom}-to-${dateTo}`
    );
  }

  function setMonthFilter(monthOffset: number) {
    const d = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    const y2 = d.getFullYear();
    const m2 = String(d.getMonth() + 1).padStart(2, '0');
    const lastDay = new Date(y2, d.getMonth() + 1, 0).getDate();
    setDateFrom(`${y2}-${m2}-01`);
    setDateTo(`${y2}-${m2}-${String(lastDay).padStart(2, '0')}`);
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Reports</h1>
          <p className="text-slate-500 font-medium mt-1">Analytics and order history ({orders.length} total)</p>
        </div>
        <button
          onClick={handleExport}
          disabled={orders.length === 0}
          className="flex items-center gap-2.5 bg-emerald-600 text-white px-6 py-3.5 rounded-2xl text-sm font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
        >
          <Download size={18} />
          <span>Export Excel</span>
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] p-8">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-6 uppercase tracking-wider">
          <Filter size={16} className="text-blue-600" />
          Quick Filters
        </div>
        
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { label: 'This Month', offset: 0 },
            { label: 'Last Month', offset: -1 },
            { label: '2 Months Ago', offset: -2 },
          ].map(({ label, offset }) => (
            <button
              key={offset}
              onClick={() => setMonthFilter(offset)}
              className="px-5 py-2.5 rounded-xl bg-slate-50 text-slate-600 text-xs font-bold hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 border border-slate-100 hover:border-blue-100"
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-xs text-slate-400 font-bold uppercase tracking-widest ml-1">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-slate-400 font-bold uppercase tracking-widest ml-1">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-slate-400 font-bold uppercase tracking-widest ml-1">Doctor</label>
            <select
              value={filterDoctor}
              onChange={e => setFilterDoctor(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
            >
              <option value="">All Doctors</option>
              {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-slate-400 font-bold uppercase tracking-widest ml-1">Status</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="paid">Paid Only</option>
              <option value="pending">Pending Only</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-600 rounded-[2rem] p-6 shadow-lg shadow-blue-100 text-white relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-blue-100 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
              <TrendingUp size={12} /> Total Sales
            </div>
            <p className="text-2xl font-black">{fmt(totalSales)}</p>
          </div>
          <TrendingUp size={80} className="absolute -right-4 -bottom-4 text-white/10 group-hover:scale-110 transition-transform duration-500" />
        </div>

        <div className="bg-slate-800 rounded-[2rem] p-6 shadow-lg shadow-slate-100 text-white relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
              <ShoppingBag size={12} /> Order Count
            </div>
            <p className="text-2xl font-black">{orders.length}</p>
          </div>
          <ShoppingBag size={80} className="absolute -right-4 -bottom-4 text-white/5 group-hover:scale-110 transition-transform duration-500" />
        </div>

        <div className="bg-emerald-500 rounded-[2rem] p-6 shadow-lg shadow-emerald-100 text-white relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-emerald-100 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
              <CheckCircle size={12} /> Received
            </div>
            <p className="text-2xl font-black">{fmt(paidAmt)}</p>
          </div>
          <CheckCircle size={80} className="absolute -right-4 -bottom-4 text-white/10 group-hover:scale-110 transition-transform duration-500" />
        </div>

        <div className="bg-rose-500 rounded-[2rem] p-6 shadow-lg shadow-rose-100 text-white relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-rose-100 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
              <Clock size={12} /> Outstanding
            </div>
            <p className="text-2xl font-black">{fmt(pendingAmt)}</p>
          </div>
          <Clock size={80} className="absolute -right-4 -bottom-4 text-white/10 group-hover:scale-110 transition-transform duration-500" />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Detailed Order History</span>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">LIVE DATA</span>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-bold text-slate-400 animate-pulse">Fetching analytics...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mx-auto mb-6">
              <Filter size={32} />
            </div>
            <p className="text-lg font-bold text-slate-400">No matching orders found</p>
            <p className="text-sm text-slate-300 mt-1">Try adjusting your filters or date range</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Doctor & Clinic</th>
                  <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Date & Area</th>
                  <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Amount</th>
                  <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                  <th className="px-8 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.map(o => (
                  <tr
                    key={o.id}
                    onClick={() => onNavigate('doctor-details', { doctorId: o.doctor_id })}
                    className="hover:bg-blue-50/30 cursor-pointer transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{o.doctors?.name}</p>
                      <p className="text-xs text-slate-400 font-medium mt-1">{o.doctors?.clinic}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-slate-700">{new Date(o.order_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                      <p className="text-xs text-slate-400 font-medium mt-1">{o.doctors?.area}</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <p className="text-sm font-black text-slate-800">{fmt(Number(o.total_amount))}</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">{o.invoice_number || 'NO INVOICE'}</p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                        o.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${o.payment_status === 'paid' ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                        {o.payment_status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
