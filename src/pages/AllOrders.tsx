import { useEffect, useState } from 'react';
import { Search, Filter, Trash2, Calendar, ChevronRight, CheckCircle, Clock, ShoppingBag, IndianRupee, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Order, Doctor, Medicine, Page } from '../lib/types';

interface OrderItemWithMedicine {
  id: string;
  medicine_id: string;
  quantity: number;
  price: number;
  total: number;
  medicines?: Medicine;
}

interface OrderWithDetails extends Order {
  doctors?: Doctor;
  order_items: OrderItemWithMedicine[];
}

interface AllOrdersProps {
  onNavigate: (page: Page, params?: { doctorId?: string }) => void;
  userId: string;
}

export default function AllOrders({ onNavigate, userId }: AllOrdersProps) {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [medSearch, setMedSearch] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [userId]);

  async function fetchOrders() {
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*, doctors(*), order_items(*, medicines(*))')
      .eq('user_id', userId)
      .order('order_date', { ascending: false });

    if (data) setOrders(data as OrderWithDetails[]);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to permanently delete this order?')) return;
    await supabase.from('order_items').delete().eq('order_id', id);
    await supabase.from('orders').delete().eq('id', id);
    fetchOrders();
  }

  const handleWhatsapp = (order: OrderWithDetails) => {
    const summary = `*Order Details: ${order.doctors?.name}*\nDate: ${new Date(order.order_date).toLocaleDateString()}\n\n` + 
      order.order_items.map(i => `- ${i.medicines?.name}: ${i.quantity} x ₹${i.price}`).join('\n') +
      `\n\n*Total: ₹${order.total_amount}*\nStatus: ${order.payment_status.toUpperCase()}`;
    const phone = order.doctors?.phone?.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(summary)}`, '_blank');
  };

  const filtered = orders.filter(o => {
    const matchesDr = o.doctors?.name.toLowerCase().includes(search.toLowerCase()) || 
                      o.doctors?.clinic.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.payment_status === statusFilter;
    const matchesDate = !dateFilter || o.order_date === dateFilter;
    const matchesMed = !medSearch || o.order_items.some(oi => 
      oi.medicines?.name.toLowerCase().includes(medSearch.toLowerCase())
    );
    return matchesDr && matchesStatus && matchesDate && matchesMed;
  });

  const fmt = (n: number) => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Orders History</h1>
          <p className="text-slate-500 font-medium mt-1">Manage and track all medical orders ({filtered.length})</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-[0_10px_40px_rgba(0,0,0,0.02)] space-y-6">
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
          <Filter size={14} className="text-blue-600" />
          Refine Search
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search Doctor..."
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all shadow-sm"
            />
          </div>

          <div className="relative group">
            <ShoppingBag size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              value={medSearch}
              onChange={e => setMedSearch(e.target.value)}
              placeholder="Search Medicine..."
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all shadow-sm"
            />
          </div>

          <div className="relative group">
            <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all shadow-sm"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 bg-slate-50 p-1 rounded-2xl border border-slate-200">
            {['all', 'paid', 'pending'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s as any)}
                className={`py-2 px-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  statusFilter === s ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-400">Fetching order vault...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-20 text-center border border-slate-100">
          <p className="text-lg font-bold text-slate-500">No matching orders found</p>
          <button onClick={() => { setSearch(''); setMedSearch(''); setDateFilter(''); setStatusFilter('all'); }} className="mt-4 text-blue-600 text-sm font-black underline">Clear Filters</button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => (
            <div 
              key={order.id} 
              className="bg-white rounded-[2rem] border border-slate-100 hover:border-blue-200 shadow-sm hover:shadow-xl hover:shadow-blue-50/20 transition-all duration-500 group overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 sm:p-8 gap-6">
                <div className="flex items-center gap-5 flex-1 min-w-0">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-3 ${
                    order.payment_status === 'paid' ? 'bg-emerald-500 text-white shadow-emerald-100' : 'bg-amber-500 text-white shadow-amber-100'
                  }`}>
                    {order.payment_status === 'paid' ? <CheckCircle size={24} /> : <Clock size={24} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-extrabold text-slate-800 text-lg truncate group-hover:text-blue-600 transition-colors">{order.doctors?.name}</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                        <Calendar size={14} className="text-blue-500/70" />
                        {new Date(order.order_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {order.doctors?.clinic}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-50">
                  <div className="text-left sm:text-right min-w-[100px]">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
                    <p className="text-xl font-black text-slate-800">{fmt(order.total_amount)}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleWhatsapp(order)}
                      className="w-11 h-11 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-100"
                      title="Share to WhatsApp"
                    >
                      <MessageCircle size={18} />
                    </button>
                    <button
                      onClick={() => onNavigate('doctor-details', { doctorId: order.doctor_id })}
                      className="w-11 h-11 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100"
                    >
                      <ChevronRight size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(order.id)}
                      className="w-11 h-11 flex items-center justify-center rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm border border-rose-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50/80 px-8 py-3 flex gap-4 overflow-x-auto scrollbar-hide border-t border-slate-100">
                {order.order_items.map(item => (
                  <div key={item.id} className="flex items-center gap-2 whitespace-nowrap">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    <span className="text-[10px] font-bold text-slate-600">{item.medicines?.name}</span>
                    <span className="text-[10px] font-black text-blue-500">×{item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
