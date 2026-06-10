import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Phone, MapPin, Building2, ChevronRight, Users, CheckCircle } from 'lucide-react';
import Modal from '../components/Modal';
import { supabase } from '../lib/supabase';
import type { Doctor, Page } from '../lib/types';

interface DoctorsProps {
  onNavigate: (page: Page, params?: { doctorId?: string }) => void;
  userId: string;
}

const emptyForm = { name: '', clinic: '', phone: '', area: '' };

export default function Doctors({ onNavigate, userId }: DoctorsProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editDoctor, setEditDoctor] = useState<Doctor | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchDoctors(); }, []);

  async function fetchDoctors() {
    setLoading(true);
    const { data } = await supabase
      .from('doctors')
      .select('*')
      .eq('is_active', true)
      .eq('user_id', userId)
      .order('name');
    if (data) setDoctors(data);
    setLoading(false);
  }

  const filtered = doctors.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.clinic.toLowerCase().includes(search.toLowerCase()) ||
    d.area.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditDoctor(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (d: Doctor) => { setEditDoctor(d); setForm({ name: d.name, clinic: d.clinic, phone: d.phone, area: d.area }); setShowModal(true); };

  async function handleSave() {
    setError('');
    if (!form.name || !form.clinic) { setError('Name and Clinic are required'); return; }
    setSaving(true);
    
    const payload = { ...form, user_id: userId };
    const { error: err } = editDoctor 
      ? await supabase.from('doctors').update(payload).eq('id', editDoctor.id)
      : await supabase.from('doctors').insert(payload);

    if (err) setError(err.message);
    else { setShowModal(false); fetchDoctors(); }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this doctor?')) return;
    await supabase.from('doctors').update({ is_active: false }).eq('id', id);
    fetchDoctors();
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Doctors</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your medical contacts ({doctors.length} active)</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3.5 rounded-2xl text-sm font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
        >
          <Plus size={18} />
          <span>Add New Doctor</span>
        </button>
      </div>

      <div className="relative group">
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, clinic, or area..."
          className="w-full pl-12 pr-6 py-4 rounded-[1.5rem] border border-slate-100 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.02)] text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-400">Loading directory...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-16 text-center border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mx-auto mb-6">
            <Users size={32} />
          </div>
          <p className="text-lg font-bold text-slate-500">{search ? 'No matches found' : 'Your directory is empty'}</p>
          <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">
            {search ? 'Try adjusting your search terms' : 'Start by adding your first doctor to manage orders'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(d => (
            <div
              key={d.id}
              className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_5px_15px_rgba(0,0,0,0.02)] overflow-hidden hover:shadow-xl hover:border-blue-100 transition-all duration-500 group"
            >
              <div className="flex items-center justify-between p-6">
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => onNavigate('doctor-details', { doctorId: d.id })}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-800 text-base group-hover:text-blue-600 transition-colors">{d.name}</span>
                    <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-all" />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-y-2 gap-x-4">
                    {d.clinic && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <Building2 size={13} className="text-blue-500/60" /> {d.clinic}
                      </div>
                    )}
                    {d.area && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <MapPin size={13} className="text-rose-500/60" /> {d.area}
                      </div>
                    )}
                    {d.phone && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <Phone size={13} className="text-emerald-500/60" /> {d.phone}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button onClick={() => openEdit(d)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm border border-blue-100/50">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(d.id)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all duration-300 shadow-sm border border-rose-100/50">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={editDoctor ? 'Update Profile' : 'Add New Doctor'} onClose={() => setShowModal(false)}>
          <div className="space-y-6 pt-2">
            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-rose-600 rounded-full" />
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
              <input
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Dr. Alexander Pierce"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Clinic / Hospital Name</label>
              <input
                value={form.clinic}
                onChange={e => setForm(p => ({ ...p, clinic: e.target.value }))}
                placeholder="e.g. Hope Medical Center"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                <input
                  value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location / Area</label>
                <input
                  value={form.area}
                  onChange={e => setForm(p => ({ ...p, area: e.target.value }))}
                  placeholder="e.g. Downtown Manhattan"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-50">
              <button 
                onClick={() => setShowModal(false)} 
                className="px-6 py-4 rounded-2xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-4 rounded-2xl bg-blue-600 text-white text-sm font-black hover:bg-blue-700 disabled:opacity-60 transition-all shadow-lg shadow-blue-100 flex-1 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle size={18} />
                    <span>{editDoctor ? 'Update Profile' : 'Save Profile'}</span>
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
