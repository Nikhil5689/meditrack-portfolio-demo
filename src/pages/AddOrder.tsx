import { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, MessageCircle, CheckCircle, AlertCircle, ShoppingCart, IndianRupee, PlusCircle, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Doctor, Medicine, Page } from '../lib/types';

interface OrderRow {
  id: string;
  medicine_id: string;
  price: string;
  quantity: string;
  total: number;
}

interface AddOrderProps {
  onNavigate: (page: Page) => void;
  prefillDoctorId?: string;
  userId: string;
}

function genId() {
  return Math.random().toString(36).slice(2);
}

function emptyRow(): OrderRow {
  return { id: genId(), medicine_id: '', price: '', quantity: '1', total: 0 };
}

export default function AddOrder({ onNavigate, prefillDoctorId, userId }: AddOrderProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [doctorId, setDoctorId] = useState(prefillDoctorId ?? '');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [rows, setRows] = useState<OrderRow[]>([emptyRow()]);
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'pending'>('pending');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [whatsappMsg, setWhatsappMsg] = useState('');
  const [showWhatsapp, setShowWhatsapp] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from('doctors').select('*').eq('is_active', true).eq('user_id', userId).order('name'),
      supabase.from('medicines').select('*').eq('is_active', true).eq('user_id', userId).order('name'),
    ]).then(([{ data: docs }, { data: meds }]) => {
      if (docs) setDoctors(docs);
      if (meds) setMedicines(meds);
    });
  }, [userId]);

  const totalAmount = rows.reduce((sum, row) => sum + row.total, 0);

  const addRow = () => setRows([...rows, emptyRow()]);
  
  const removeRow = (id: string) => {
    if (rows.length > 1) setRows(rows.filter(r => r.id !== id));
  };

  const updateRow = (id: string, field: keyof OrderRow, value: string) => {
    setRows(rows.map(r => {
      if (r.id !== id) return r;
      const updated = { ...r, [field]: value };
      if (field === 'medicine_id') {
        const med = medicines.find(m => m.id === value);
        if (med) updated.price = med.default_price.toString();
      }
      updated.total = (Number(updated.price) || 0) * (Number(updated.quantity) || 0);
      return updated;
    }));
  };

  const copyWhatsapp = () => {
    navigator.clipboard.writeText(whatsappMsg);
    const phone = doctors.find(d => d.id === doctorId)?.phone.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(whatsappMsg)}`, '_blank');
  };

  async function handleSave() {
    setError('');
    setSuccessMsg('');
    if (!doctorId) { setError('Please select a doctor'); return; }
    const validRows = rows.filter(r => r.medicine_id && Number(r.quantity) > 0);
    if (validRows.length === 0) { setError('Please add at least one medicine'); return; }

    setSaving(true);
    try {
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          doctor_id: doctorId,
          order_date: orderDate,
          total_amount: totalAmount,
          payment_status: paymentStatus,
          invoice_number: invoiceNumber,
          notes,
          user_id: userId
        })
        .select()
        .single();

      if (orderErr) throw orderErr;

      const { error: itemsErr } = await supabase
        .from('order_items')
        .insert(validRows.map(r => ({
          order_id: order.id,
          medicine_id: r.medicine_id,
          quantity: Number(r.quantity),
          price: Number(r.price),
          total: r.total,
          user_id: userId
        })));

      if (itemsErr) throw itemsErr;

      const doc = doctors.find(d => d.id === doctorId);
      const summary = `*New Order: ${doc?.name}*\nDate: ${new Date(orderDate).toLocaleDateString()}\n\n` + 
        validRows.map(r => `- ${medicines.find(m => m.id === r.medicine_id)?.name}: ${r.quantity} x ₹${r.price}`).join('\n') +
        `\n\n*Total: ₹${totalAmount}*\nStatus: ${paymentStatus.toUpperCase()}`;
      
      setWhatsappMsg(summary);
      setShowWhatsapp(true);
      setSuccessMsg('Order saved successfully!');
      
      // Reset form
      setRows([emptyRow()]);
      setInvoiceNumber('');
      setNotes('');
    } catch (err: any) {
      setError(err.message || 'Failed to save order');
    } finally {
      setSaving(false);
    }
  }

  const [drSearch, setDrSearch] = useState('');
  const [showDrDropdown, setShowDrDropdown] = useState(false);

  const filteredDoctors = doctors.filter(d => 
    d.name.toLowerCase().includes(drSearch.toLowerCase()) || 
    d.clinic.toLowerCase().includes(drSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">New Order</h1>
          <p className="text-slate-500 font-medium mt-1">Create a new medical order entry</p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-600 px-6 py-4 rounded-[1.5rem] text-sm font-bold flex items-center gap-3 animate-shake">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-6 py-4 rounded-[1.5rem] text-sm font-bold flex items-center gap-3">
          <CheckCircle size={20} />
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] p-8">
            <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
              <Plus size={14} className="text-blue-600" />
              Primary Information
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2 relative">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Search & Select Doctor</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={doctorId ? doctors.find(d => d.id === doctorId)?.name : "Search doctor..."}
                    value={drSearch}
                    onChange={e => { setDrSearch(e.target.value); setShowDrDropdown(true); }}
                    onFocus={() => setShowDrDropdown(true)}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm"
                  />
                  <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  
                  {showDrDropdown && (
                    <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                      {filteredDoctors.length === 0 ? (
                        <div className="p-4 text-center text-slate-400 text-xs font-bold">No doctors found</div>
                      ) : (
                        filteredDoctors.map(d => (
                          <button
                            key={d.id}
                            onClick={() => { setDoctorId(d.id); setDrSearch(''); setShowDrDropdown(false); }}
                            className="w-full px-5 py-4 text-left hover:bg-blue-50 transition-colors flex flex-col gap-0.5 border-b border-slate-50 last:border-0"
                          >
                            <span className="text-sm font-bold text-slate-800">{d.name}</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{d.clinic} · {d.area}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                  {showDrDropdown && (
                    <div className="fixed inset-0 z-40" onClick={() => setShowDrDropdown(false)} />
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Order Date</label>
                <input
                  type="date"
                  value={orderDate}
                  onChange={e => setOrderDate(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm"
                />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="px-8 py-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                <ShoppingCart size={14} className="text-blue-600" />
                Order Line Items
              </div>
              <button
                onClick={addRow}
                className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm border border-blue-100/50"
              >
                <Plus size={14} /> Add Medicine
              </button>
            </div>

            <div className="divide-y divide-slate-50">
              {rows.map((row, idx) => (
                <div key={row.id} className="p-8 space-y-4 hover:bg-blue-50/20 transition-colors group">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Entry #{idx + 1}</span>
                    {rows.length > 1 && (
                      <button onClick={() => removeRow(row.id)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-50 text-rose-400 hover:bg-rose-500 hover:text-white transition-all">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <div className="space-y-4">
                    <select
                      value={row.medicine_id}
                      onChange={e => updateRow(row.id, 'medicine_id', e.target.value)}
                      className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Select Medicine</option>
                      {medicines.map(m => (
                        <option key={m.id} value={m.id}>{m.name} (₹{m.default_price})</option>
                      ))}
                    </select>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-tight ml-1">Price</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-xs">₹</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={row.price}
                            onChange={e => updateRow(row.id, 'price', e.target.value)}
                            className="w-full pl-7 pr-3 py-3 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/30"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-tight ml-1">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={row.quantity}
                          onChange={e => updateRow(row.id, 'quantity', e.target.value)}
                          className="w-full px-3 py-3 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 text-center bg-slate-50/30"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-tight ml-1">Total</label>
                        <div className="w-full px-3 py-3 bg-emerald-50 rounded-xl text-sm font-black text-emerald-700 border border-emerald-100 text-center flex items-center justify-center min-h-[46px]">
                          ₹{row.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-8 py-6 bg-blue-600 flex justify-between items-center text-white">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Order Grand Total</p>
                <p className="text-sm font-bold opacity-90 mt-0.5">{rows.filter(r => r.medicine_id).length} items selected</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black">₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] p-8">
            <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
              <IndianRupee size={14} className="text-blue-600" />
              Settlement
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-1.5 rounded-2xl">
                <button
                  onClick={() => setPaymentStatus('pending')}
                  className={`py-3 rounded-[1.25rem] text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                    paymentStatus === 'pending'
                      ? 'bg-white text-rose-600 shadow-sm'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setPaymentStatus('paid')}
                  className={`py-3 rounded-[1.25rem] text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                    paymentStatus === 'paid'
                      ? 'bg-white text-emerald-600 shadow-sm'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Paid
                </button>
              </div>

              {paymentStatus === 'paid' && (
                <div className="space-y-2 animate-in fade-in zoom-in-95 duration-300">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Invoice Number</label>
                  <input
                    value={invoiceNumber}
                    onChange={e => setInvoiceNumber(e.target.value)}
                    placeholder="Enter invoice or auto-gen"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Internal Notes</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Optional notes about the order..."
                  rows={3}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none"
                />
              </div>
            </div>
          </section>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black text-lg hover:bg-blue-700 disabled:opacity-60 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3 group active:scale-[0.98]"
          >
            {saving ? (
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle size={22} className="group-hover:scale-110 transition-transform" />
                <span>Confirm & Save Order</span>
              </>
            )}
          </button>

          {showWhatsapp && (
            <div className="bg-emerald-600 rounded-[2.5rem] p-8 text-white space-y-4 animate-in slide-in-from-top-4 duration-500 shadow-xl shadow-emerald-100 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 text-white/10 group-hover:scale-110 transition-transform">
                <MessageCircle size={120} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]">
                    <MessageCircle size={16} />
                    WhatsApp Summary
                  </div>
                  <button onClick={() => setShowWhatsapp(false)} className="text-white/60 hover:text-white transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-[11px] font-medium leading-relaxed font-mono mb-6 max-h-40 overflow-y-auto">
                  {whatsappMsg}
                </div>
                <button
                  onClick={copyWhatsapp}
                  className="w-full py-4 bg-white text-emerald-600 rounded-2xl text-sm font-black hover:bg-slate-50 transition-all shadow-lg active:scale-[0.98]"
                >
                  Copy & Open WhatsApp
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
