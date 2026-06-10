import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, IndianRupee, Pill, CheckCircle } from 'lucide-react';
import Modal from '../components/Modal';
import { supabase } from '../lib/supabase';
import type { Medicine } from '../lib/types';

const emptyForm = { name: '', default_price: '' };

interface MedicinesProps {
  userId: string;
}

export default function Medicines({ userId }: MedicinesProps) {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMed, setEditMed] = useState<Medicine | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchMedicines(); }, []);

  async function fetchMedicines() {
    setLoading(true);
    const { data } = await supabase
      .from('medicines')
      .select('*')
      .eq('is_active', true)
      .eq('user_id', userId)
      .order('name');
    if (data) setMedicines(data);
    setLoading(false);
  }

  const filtered = medicines.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setEditMed(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (m: Medicine) => { setEditMed(m); setForm({ name: m.name, default_price: m.default_price.toString() }); setShowModal(true); };

  async function handleSave() {
    setError('');
    if (!form.name || !form.default_price) { setError('All fields are required'); return; }
    setSaving(true);
    
    const payload = { ...form, default_price: Number(form.default_price), user_id: userId };
    const { error: err } = editMed 
      ? await supabase.from('medicines').update(payload).eq('id', editMed.id)
      : await supabase.from('medicines').insert(payload);

    if (err) setError(err.message);
    else { setShowModal(false); fetchMedicines(); }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this medicine?')) return;
    await supabase.from('medicines').update({ is_active: false }).eq('id', id);
    fetchMedicines();
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Medicines</h1>
          <p className="text-slate-500 font-medium mt-1">Inventory and pricing management ({medicines.length} items)</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3.5 rounded-2xl text-sm font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
        >
          <Plus size={18} />
          <span>Add New Product</span>
        </button>
      </div>

      <div className="relative group">
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by product name..."
          className="w-full pl-12 pr-6 py-4 rounded-[1.5rem] border border-slate-100 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.02)] text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-400">Loading catalog...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-16 text-center border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mx-auto mb-6">
            <Pill size={32} />
          </div>
          <p className="text-lg font-bold text-slate-500">{search ? 'No products found' : 'Catalog is empty'}</p>
          <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">
            {search ? 'Try a different search term' : 'Add your first product to start building orders'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="grid grid-cols-12 px-8 py-5 bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
            <span className="col-span-7">Product Details</span>
            <span className="col-span-3 text-right">Default MSRP</span>
            <span className="col-span-2 text-right">Actions</span>
          </div>
          <div className="divide-y divide-slate-50">
            {filtered.map(m => (
              <div key={m.id} className="grid grid-cols-12 px-8 py-6 items-center hover:bg-blue-50/30 transition-all duration-300 group">
                <div className="col-span-7">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-100 transition-colors">
                      <Pill size={18} />
                    </div>
                    <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{m.name}</p>
                  </div>
                </div>
                <div className="col-span-3 text-right">
                  <span className="text-base font-extrabold text-emerald-600 flex items-center justify-end gap-0.5">
                    <IndianRupee size={14} className="stroke-[3]" />
                    {Number(m.default_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <button onClick={() => openEdit(m)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => handleDelete(m.id)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all duration-300">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <Modal title={editMed ? 'Update Medicine' : 'New Medicine Entry'} onClose={() => setShowModal(false)} size="sm">
          <div className="space-y-6 pt-2">
            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-rose-600 rounded-full" />
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Name</label>
              <input
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Paracetamol 500mg"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Default Selling Price (₹)</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.default_price}
                  onChange={e => setForm(p => ({ ...p, default_price: e.target.value }))}
                  placeholder="0.00"
                  className="w-full pl-10 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-slate-50">
              <button onClick={() => setShowModal(false)} className="flex-1 px-6 py-4 rounded-2xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all">Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-6 py-4 rounded-2xl bg-blue-600 text-white text-sm font-black hover:bg-blue-700 disabled:opacity-60 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle size={18} />
                    <span>{editMed ? 'Update Entry' : 'Save Entry'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
