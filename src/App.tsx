import { useState, useEffect } from 'react';
import Shell from './components/layout/Shell';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import { supabase } from './utils/supabase';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAdmin(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setCurrentPage('dashboard');
  };

  // If on login page, show Login component alone
  if (currentPage === 'login' && !isAdmin) {
    return <Login onLogin={() => {
      setIsAdmin(true);
      setCurrentPage('admin');
    }} />;
  }

  return (
    <Shell
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      isAdmin={isAdmin}
      onLogout={handleLogout}
    >
      {currentPage === 'dashboard' && <Dashboard />}
      {isAdmin && currentPage === 'admin' && <AdminDashboard />}
      {/* Hidden button to login in footer or similar if needed, 
          for now clicking "Admin Panel" while logged out could trigger logic or just keep it hidden */}
    </Shell>
  );
}

export default App;
