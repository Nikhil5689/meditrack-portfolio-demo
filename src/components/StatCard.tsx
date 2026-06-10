import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'red' | 'yellow';
  onClick?: () => void;
}

const colorMap = {
  blue: 'from-blue-600 to-blue-700 shadow-blue-100',
  green: 'from-emerald-500 to-emerald-600 shadow-emerald-100',
  red: 'from-rose-500 to-rose-600 shadow-rose-100',
  yellow: 'from-amber-400 to-amber-500 shadow-amber-100',
};

const lightColorMap = {
  blue: 'bg-blue-50 text-blue-700 border-blue-100',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  red: 'bg-rose-50 text-rose-700 border-rose-100',
  yellow: 'bg-amber-50 text-amber-700 border-amber-100',
};

export default function StatCard({ label, value, icon: Icon, color, onClick }: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-[2rem] border-0 p-6 flex flex-col gap-4 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.04)] transition-all duration-300 ${onClick ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1 active:scale-[0.98]' : ''}`}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${colorMap[color]} shadow-lg`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">{label}</p>
        <p className="text-2xl font-extrabold text-slate-800 mt-1 tracking-tight">{value}</p>
      </div>
      
      {/* Subtle background decoration */}
      <div className={`absolute -right-4 -bottom-4 w-20 h-20 rounded-full opacity-10 bg-gradient-to-br ${colorMap[color]} blur-2xl`} />
    </div>
  );
}

