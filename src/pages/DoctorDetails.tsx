import { useEffect, useState } from 'react';
import { ArrowLeft, Phone, MapPin, Building2, TrendingUp, Clock, CheckCircle, PlusCircle, ChevronDown, ChevronUp, Pill } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Doctor, Order, OrderItem, Medicine, Page } from '../lib/types';

interface DoctorDetailsProps {
  doctorId: string;
  onNavigate: (page: Page, params?: { doctorId?: string }) => void;
  userId: string;
}

interface OrderWithItems extends Order {
  order_items: (OrderItem & { medicines?: Medicine })[];
}

export default function DoctorDetails({ doctorId, onNavigate, userId }: DoctorDetailsProps) {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (doctorId) fetchData();
  }, [doctorId]);

  async function fetchData() {
    setLoading(true);
    const [{ data: doc }, { data: ords }] = await Promise.all([
      supabase.from('doctors').select('*').eq('id', doctorId).maybeSingle(),
      supabase
        .from('orders')
        .select('*, order_items(*, medicines(*))')
        .eq('doctor_id', doctorId)
        .order('order_date', { ascending: false }),
    ]);
    if (doc) setDoctor(doc);
    if (ords) setOrders(ords as OrderWithItems[]);
    setLoading(false);
  }

  async function markAsPaid(orderId: string) {
    const inv = `INV-${Date.now().toString().slice(-6)}`;
    await supabase.from('orders').update({ payment_status: 'paid', invoice_number: inv }).eq('id', orderId);
    fetchData();
  }

  const fmt = (n: number) => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;
  const totalBusiness = orders.reduce((s, o) => s + Number(o.total_amount), 0);
  const totalPaid = orders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + Number(o.total_amount), 0);
  const totalPending = orders.filter(o => o.payment_status === 'pending').reduce((s, o) => s + Number(o.total_amount), 0);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="text-center py-16 text-gray-400">
        Doctor not found.
        <button onClick={() => onNavigate('doctors')} className="block mx-auto mt-4 text-blue-600 text-sm">Back to Doctors</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-700">
      <div className="flex items-center gap-4">
        <button
          onClick={() => onNavigate('doctors')}
          className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300 shadow-sm group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">{doctor.name}</h1>
          <p className="text-slate-500 font-medium mt-0.5">Doctor Profile & History</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] p-8">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
              <Building2 size={14} className="text-blue-600" />
              Contact Information
            </div>
            
            <div className="space-y-6">
              {doctor.clinic && (
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:bg-white hover:border-blue-100 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-500 shadow-sm group-hover:bg-blue-50">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinic / Hospital</p>
                    <p className="text-sm font-bold text-slate-700 mt-0.5">{doctor.clinic}</p>
                  </div>
                </div>
              )}
              
              {doctor.area && (
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:bg-white hover:border-blue-100 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-rose-500 shadow-sm group-hover:bg-rose-50">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Area</p>
                    <p className="text-sm font-bold text-slate-700 mt-0.5">{doctor.area}</p>
                  </div>
                </div>
              )}

              {doctor.phone && (
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:bg-white hover:border-blue-100 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-500 shadow-sm group-hover:bg-emerald-50">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Number</p>
                    <a href={`tel:${doctor.phone}`} className="text-sm font-black text-blue-600 hover:underline block mt-0.5">{doctor.phone}</a>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => onNavigate('add-order', { doctorId: doctor.id })}
              className="mt-8 w-full flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-2xl text-sm font-black hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <PlusCircle size={18} />
              <span>Create New Order</span>
            </button>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-xl shadow-slate-200">
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">
                <TrendingUp size={14} className="text-blue-500" />
                Performance KPIs
              </div>
              
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-bold text-slate-400">Lifetime Business</p>
                  <p className="text-3xl font-black mt-1">{fmt(totalBusiness)}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Received</p>
                    <p className="text-lg font-black">{fmt(totalPaid)}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Pending</p>
                    <p className="text-lg font-black">{fmt(totalPending)}</p>
                  </div>
                </div>
              </div>
            </div>
            <TrendingUp size={120} className="absolute -right-8 -bottom-8 text-white/5 group-hover:scale-110 transition-transform duration-700" />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transactional History</span>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">LIVE SYNC</span>
          </div>
          
          {orders.length === 0 ? (
            <div className="bg-white rounded-[2.5rem] p-20 text-center border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mx-auto mb-6">
                <Clock size={32} />
              </div>
              <p className="text-lg font-bold text-slate-500">No order history found</p>
              <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">Start by creating the first order for this doctor to see data here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div 
                  key={order.id} 
                  className={`bg-white rounded-[2rem] border transition-all duration-500 overflow-hidden ${
                    expandedOrder === order.id ? 'border-blue-200 shadow-xl shadow-blue-50/50' : 'border-slate-100 hover:border-slate-200 shadow-sm'
                  }`}
                >
                  <div
                    className="flex items-center justify-between p-6 cursor-pointer group"
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                        order.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {order.payment_status === 'paid' ? <CheckCircle size={20} /> : <Clock size={20} />}
                      </div>
                      <div>
                        <p className="text-base font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors">
                          {new Date(order.order_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${
                            order.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            {order.payment_status}
                          </span>
                          {order.invoice_number && (
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{order.invoice_number}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-black text-slate-800">{fmt(Number(order.total_amount))}</p>
                      </div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        expandedOrder === order.id ? 'bg-blue-600 text-white rotate-180' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'
                      }`}>
                        <ChevronDown size={16} />
                      </div>
                    </div>
                  </div>

                  {expandedOrder === order.id && (
                    <div className="animate-in slide-in-from-top-2 duration-300">
                      <div className="px-8 py-4 bg-slate-50/50 border-y border-slate-100">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <Pill size={12} className="text-blue-500" />
                          Medicine Breakdown
                        </div>
                      </div>
                      <div className="divide-y divide-slate-50 px-2">
                        {order.order_items.map(item => (
                          <div key={item.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors rounded-xl mx-2 my-1">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400">
                                <Pill size={14} />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-700">{item.medicines?.name}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase mt-0.5 tracking-tight">
                                  {fmt(item.price)} <span className="mx-1">×</span> {item.quantity} units
                                </p>
                              </div>
                            </div>
                            <span className="text-sm font-black text-slate-800">{fmt(item.total)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="p-8 bg-blue-50/50 border-t border-slate-100 flex flex-col sm:flex-row gap-6 items-center justify-between">
                        <div className="text-center sm:text-left">
                          <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Settlement Value</p>
                          <p className="text-xl font-black text-blue-800 mt-1">{fmt(Number(order.total_amount))}</p>
                        </div>
                        {order.payment_status === 'pending' && (
                          <button
                            onClick={() => markAsPaid(order.id)}
                            className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all active:scale-95"
                          >
                            Mark as Fully Paid
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
