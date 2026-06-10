import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export default function Modal({ title, onClose, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const widthClass = size === 'sm' ? 'max-w-sm' : size === 'lg' ? 'max-w-2xl' : 'max-w-lg';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500" onClick={onClose} />
      <div className={`relative bg-white w-full ${widthClass} rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] max-h-[90vh] overflow-hidden animate-in zoom-in-95 fade-in duration-500 flex flex-col`}>
        <div className="flex items-center justify-between px-10 py-8 border-b border-slate-50 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">{title}</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition-all flex items-center justify-center">
            <X size={20} />
          </button>
        </div>
        <div className="p-10 overflow-y-auto scrollbar-hide flex-1">{children}</div>
      </div>
    </div>
  );
}
