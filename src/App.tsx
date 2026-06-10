import { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Doctors from './pages/Doctors';
import Medicines from './pages/Medicines';
import AddOrder from './pages/AddOrder';
import DailyEntry from './pages/DailyEntry';
import Reports from './pages/Reports';
import AllOrders from './pages/AllOrders';
import DoctorDetails from './pages/DoctorDetails';
import { supabase } from './lib/supabase';
import type { Page, NavParams } from './lib/types';
import { RefreshCw } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [pageParams, setPageParams] = useState<NavParams>({});

  useEffect(() => {
    console.log('App: Initializing Supabase Auth...');
    supabase.auth.getSession().then(({ data: { session: s }, error }) => {
      console.log('App: Session loaded', s ? 'Yes' : 'No', error || '');
      setSession(s);
      setAuthLoading(false);
    }).catch(err => {
      console.error('App: getSession error', err);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      console.log('App: Auth state change', _event, s ? 'Yes' : 'No');
      setSession(s);
    });

    return () => subscription.unsubscribe();
  }, []);

  function navigate(page: Page, params: NavParams = {}) {
    setCurrentPage(page);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setCurrentPage('dashboard');
    setPageParams({});
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-blue-600 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Login onLogin={() => {}} />;
  }

  const displayName = (session.user?.user_metadata?.display_name as string) ?? session.user?.email ?? 'User';
  const userId = session.user?.id || 'demo-user-id';
  const isDemo = session.user?.id === 'demo-user-id';

  const handleRefreshDemoData = () => {
    import('./lib/supabase').then(({ refreshDemoData }) => {
      refreshDemoData();
      window.location.reload();
    });
  };

  function renderPage() {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={navigate} userId={userId} />;
      case 'doctors':
        return <Doctors onNavigate={navigate} userId={userId} />;
      case 'medicines':
        return <Medicines userId={userId} />;
      case 'add-order':
        return <AddOrder onNavigate={navigate} prefillDoctorId={pageParams.doctorId} userId={userId} />;
      case 'all-orders':
        return <AllOrders onNavigate={navigate} userId={userId} />;
      case 'daily-entry':
        return <DailyEntry onNavigate={navigate} userId={userId} />;
      case 'reports':
        return <Reports onNavigate={navigate} userId={userId} />;
      case 'doctor-details':
        return pageParams.doctorId
          ? <DoctorDetails doctorId={pageParams.doctorId} onNavigate={navigate} userId={userId} />
          : <Doctors onNavigate={navigate} userId={userId} />;
      default:
        return <Dashboard onNavigate={navigate} userId={userId} />;
    }
  }

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {isDemo && (
        <div className="bg-slate-900 text-slate-100 text-xs font-bold px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 relative z-40 shadow-md">
          <div className="flex items-center gap-2">
            <span className="bg-blue-600 text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider animate-pulse">Demo Mode</span>
            <span>🚀 DEMO MODE — All data displayed is automatically generated for demonstration purposes.</span>
          </div>
          <button
            onClick={handleRefreshDemoData}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md active:scale-95"
          >
            <RefreshCw size={14} className="animate-spin-slow" />
            <span>Refresh Demo Data</span>
          </button>
        </div>
      )}
      <Layout
        currentPage={currentPage}
        onNavigate={page => navigate(page)}
        displayName={displayName}
        onLogout={handleLogout}
      >
        {renderPage()}
      </Layout>
    </div>
  );
}
