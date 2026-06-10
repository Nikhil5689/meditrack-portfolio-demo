import { ReactNode } from 'react';
import { LayoutDashboard, Users, Pill, PlusCircle, CalendarDays, BarChart2, Activity, LogOut, CircleUser as UserCircle, ShoppingBag } from 'lucide-react';
import type { Page } from '../lib/types';

interface LayoutProps {
  children: ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  displayName: string;
  onLogout: () => void;
}

const navItems = [
  { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'doctors' as Page, label: 'Doctors', icon: Users },
  { id: 'medicines' as Page, label: 'Medicines', icon: Pill },
  { id: 'add-order' as Page, label: 'New Order', icon: PlusCircle },
  { id: 'all-orders' as Page, label: 'All Orders', icon: ShoppingBag },
  { id: 'daily-entry' as Page, label: 'Daily', icon: CalendarDays },
  { id: 'reports' as Page, label: 'Reports', icon: BarChart2 },
];

export default function Layout({ children, currentPage, onNavigate, displayName, onLogout }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-['Inter']">
      <header className="bg-white text-slate-800 px-6 py-4 flex items-center justify-between border-b border-slate-200 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 premium-gradient rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
            <Activity size={22} className="text-white" />
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight block leading-none">MediTrack</span>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">MR Portal</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-right text-right">
            <span className="text-sm font-bold text-slate-700 leading-none">{displayName}</span>
            <span className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-wider">Representative</span>
          </div>
          <div className="h-10 w-[1px] bg-slate-100 hidden md:block mx-1"></div>
          <button
            onClick={onLogout}
            className="flex items-center justify-center w-10 h-10 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all duration-300 group"
            title="Sign out"
          >
            <LogOut size={20} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 pt-6 px-4 sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto">
          <div className="space-y-1 mb-8">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] px-3 mb-4">Main Menu</p>
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 ${
                  currentPage === id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
                }`}
              >
                <Icon size={19} className={currentPage === id ? 'text-white' : 'text-slate-400'} />
                {label}
              </button>
            ))}
          </div>

          <div className="mt-auto pb-8 pt-6 border-t border-slate-50">
            <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 font-bold border border-slate-100 shadow-sm">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-700 truncate">{displayName}</p>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">Pro Account</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-6 md:p-8 pb-24 md:pb-10 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>

      <nav className="md:hidden fixed bottom-6 left-6 right-6 h-16 bg-white/90 backdrop-blur-xl border border-white/50 rounded-[2rem] z-30 shadow-[0_15px_40px_rgba(0,0,0,0.12)]">
        <div className="grid grid-cols-7 h-full px-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex flex-col items-center justify-center transition-all duration-300 relative ${
                currentPage === id ? 'text-blue-600' : 'text-slate-400'
              }`}
            >
              {currentPage === id && (
                <div className="absolute -top-1 w-8 h-1 bg-blue-600 rounded-full" />
              )}
              <Icon size={20} className={currentPage === id ? 'scale-110' : 'scale-100'} />
              <span className="text-[8px] font-black mt-1 uppercase tracking-tighter truncate w-full text-center px-0.5">
                {label.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>

  );
}
