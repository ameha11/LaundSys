import React from 'react';
import {
    LayoutDashboard, Settings, WashingMachine, LogOut, Lock, User
} from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
    currentPage: string;
    onNavigate: (page: string) => void;
    isAdmin: boolean;
    onLogout: () => void;
}

const Shell: React.FC<LayoutProps> = ({ children, currentPage, onNavigate, isAdmin, onLogout }) => {
    const menu = [
        { id: 'dashboard', label: 'Tracking', icon: <LayoutDashboard size={20} /> },
        ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: <Settings size={20} /> }] : [])
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <aside style={{ width: '240px', background: 'transparent', padding: '40px 20px', display: 'flex', flexDirection: 'column', gap: '50px', position: 'sticky', top: 0, height: '100vh' }}>
                <div className="flex-center" style={{ gap: '12px', cursor: 'pointer', justifyContent: 'flex-start', padding: '0 15px' }} onClick={() => !isAdmin && onNavigate('login')}>
                    <WashingMachine size={24} color="var(--primary)" />
                    <span style={{ fontWeight: 800, fontSize: '20px', letterSpacing: '-0.5px' }}>LaundSys</span>
                </div>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {menu.map(m => (
                        <button key={m.id} onClick={() => onNavigate(m.id)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 15px', background: 'transparent', color: currentPage === m.id ? 'var(--primary)' : '#94a3b8', fontWeight: currentPage === m.id ? 700 : 500, fontSize: '15px', border: 'none' }}>
                            {m.icon} {m.label}
                        </button>
                    ))}
                </nav>

                {isAdmin ? (
                    <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444', fontWeight: 600, padding: '15px', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <LogOut size={18} /> Logout
                    </button>
                ) : (
                    <div style={{ padding: '15px', fontSize: '13px', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Lock size={14} /> Private
                    </div>
                )}
            </aside>

            {/* Main */}
            <main style={{ flex: 1, padding: '30px 40px', display: 'flex', flexDirection: 'column' }}>
                <header className="flex-between" style={{ marginBottom: '30px', justifyContent: 'flex-end' }}>
                    {isAdmin && (
                        <div className="flex-center" style={{ gap: '12px' }}>
                            <div style={{ textAlign: 'right' }}><p style={{ fontSize: '14px', fontWeight: 600 }}>Staff</p><p style={{ fontSize: '11px', color: '#94a3b8' }}>Admin</p></div>
                            <User size={24} color="var(--primary)" />
                        </div>
                    )}
                </header>
                <div style={{ flex: 1 }}>{children}</div>
            </main>
        </div>
    );
};

export default Shell;
