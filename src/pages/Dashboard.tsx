import { useEffect, useState } from 'react';
import { TrendingUp, ShoppingCart, CheckCircle, Clock, AlertCircle, ChevronRight, Calendar, RefreshCw, BarChart2 } from 'lucide-react';
import StatCard from '../components/StatCard';
import { supabase } from '../lib/supabase';
import type { Order, Page } from '../lib/types';

interface DashboardProps {
  onNavigate: (page: Page, params?: { doctorId?: string }) => void;
  userId: string;
}

interface PendingOrder extends Omit<Order, 'doctors'> {
  doctors?: { name: string; clinic: string; area: string } | null;
}

export default function Dashboard({ onNavigate, userId }: DashboardProps) {
  const [loading, setLoading] = useState(true);
  const [totalSales, setTotalSales] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [recentOrders, setRecentOrders] = useState<PendingOrder[]>([]);

  useEffect(() => {
    fetchData();
  }, [userId]);

  async function fetchData() {
    setLoading(true);
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const monthStart = new Date(y, m, 1).toISOString().split('T')[0];
    const monthEnd = new Date(y, m + 1, 0).toISOString().split('T')[0];

    const [{ data: monthOrders }, { data: allPending }, { data: recent }] = await Promise.all([
      supabase
        .from('orders')
        .select('total_amount, payment_status')
        .eq('user_id', userId)
        .gte('order_date', monthStart)
        .lte('order_date', monthEnd),
      supabase
        .from('orders')
        .select('*, doctors(name, clinic, area)')
        .eq('user_id', userId)
        .eq('payment_status', 'pending')
        .order('order_date', { ascending: false }),
      supabase
        .from('orders')
        .select('*, doctors(name, clinic, area)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    if (monthOrders) {
      const sales = monthOrders.reduce((s: number, o: any) => s + Number(o.total_amount), 0);
      const paid = monthOrders.filter((o: any) => o.payment_status === 'paid').reduce((s: number, o: any) => s + Number(o.total_amount), 0);
      const pending = monthOrders.filter((o: any) => o.payment_status === 'pending').reduce((s: number, o: any) => s + Number(o.total_amount), 0);
      setTotalSales(sales);
      setTotalOrders(monthOrders.length);
      setPaidAmount(paid);
      setPendingAmount(pending);
    }

    if (allPending) setPendingOrders(allPending as PendingOrder[]);
    if (recent) setRecentOrders(recent as PendingOrder[]);
    setLoading(false);
  }

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 font-medium mt-1">
            Overview for {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all duration-300 shadow-sm"
            title="Refresh"
          >
            <RefreshCw size={20} />
          </button>
          <button
            onClick={() => onNavigate('add-order')}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3.5 rounded-2xl text-sm font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
          >
            <ShoppingCart size={18} />
            <span>New Order</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Sales" value={fmt(totalSales)} icon={TrendingUp} color="blue" />
        <StatCard label="Orders" value={totalOrders} icon={ShoppingCart} color="yellow" />
        <StatCard label="Received" value={fmt(paidAmount)} icon={CheckCircle} color="green" />
        <StatCard label="Pending" value={fmt(pendingAmount)} icon={Clock} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {pendingOrders.length > 0 && (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-rose-50/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Pending Payments</h3>
                  <p className="text-xs text-slate-500 font-medium">{pendingOrders.length} orders require attention</p>
                </div>
              </div>
            </div>
            <div className="divide-y divide-slate-50">
              {pendingOrders.slice(0, 5).map(order => (
                <div
                  key={order.id}
                  onClick={() => onNavigate('doctor-details', { doctorId: order.doctor_id })}
                  className="flex items-center justify-between px-8 py-5 hover:bg-slate-50 cursor-pointer transition-all duration-300 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-rose-100 group-hover:text-rose-600 transition-colors">
                      {order.doctors?.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{order.doctors?.name}</p>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                        {order.doctors?.area} · {new Date(order.order_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-extrabold text-rose-600">{fmt(order.total_amount)}</span>
                    <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
            {pendingOrders.length > 5 && (
              <button 
                onClick={() => onNavigate('reports')} 
                className="mx-8 my-5 py-3 rounded-2xl border border-slate-100 text-xs font-bold text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-all text-center"
              >
                View all {pendingOrders.length} pending payments
              </button>
            )}
          </div>
        )}

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Recent Orders</h3>
                <p className="text-xs text-slate-500 font-medium">Your latest activity</p>
              </div>
            </div>
            <button onClick={() => onNavigate('reports')} className="text-xs font-bold text-blue-600 hover:underline">View All</button>
          </div>
          
          <div className="flex-1">
            {recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                  <ShoppingCart size={30} />
                </div>
                <p className="text-sm text-slate-400 font-medium">No orders yet. Start by adding one!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {recentOrders.map(order => (
                  <div
                    key={order.id}
                    onClick={() => onNavigate('doctor-details', { doctorId: order.doctor_id })}
                    className="flex items-center justify-between px-8 py-5 hover:bg-slate-50 cursor-pointer transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                        {order.doctors?.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{order.doctors?.name}</p>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                          {order.doctors?.clinic} · {new Date(order.order_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1.5">
                      <p className="text-sm font-extrabold text-slate-800">{fmt(order.total_amount)}</p>
                      <span className={`text-[9px] font-black uppercase tracking-[0.1em] px-2.5 py-1 rounded-full ${
                        order.payment_status === 'paid'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-rose-50 text-rose-600'
                      }`}>
                        {order.payment_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <button
          onClick={() => onNavigate('daily-entry')}
          className="group relative overflow-hidden bg-white border border-slate-200 rounded-[2rem] p-8 text-left transition-all duration-300 hover:border-blue-300 hover:shadow-xl hover:-translate-y-1"
        >
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Calendar size={22} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Quick Daily Entry</h3>
            <p className="text-sm text-slate-500 font-medium mt-1">Log multiple orders quickly for the day</p>
          </div>
          <div className="absolute top-0 right-0 p-8 text-slate-100 group-hover:text-blue-50 transition-colors">
            <ChevronRight size={40} />
          </div>
        </button>

        <button
          onClick={() => onNavigate('reports')}
          className="group relative overflow-hidden bg-slate-900 rounded-[2rem] p-8 text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
        >
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white mb-4 group-hover:bg-white group-hover:text-slate-900 transition-colors">
              <BarChart2 size={22} />
            </div>
            <h3 className="text-lg font-bold text-white">Advanced Reports</h3>
            <p className="text-sm text-slate-400 font-medium mt-1">Analyze sales performance and analytics</p>
          </div>
          <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:text-white/10 transition-colors">
            <ChevronRight size={40} />
          </div>
        </button>
      </div>
    </div>
  );
}
