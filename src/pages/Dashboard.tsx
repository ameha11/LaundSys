import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    WashingMachine,
    Clock,
    CheckCircle2,
    AlertCircle,
    Truck,
    ArrowRight,
    Phone
} from 'lucide-react';
import { supabase } from '../utils/supabase';

interface Order {
    id: string;
    customer_name: string;
    service_type: string;
    status: string;
    total_price: number;
}

const Dashboard = () => {
    const [phone, setPhone] = useState('');
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSearched(true);

        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('customer_phone', phone)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error tracking:', error);
            alert('Error fetching order status');
        } else {
            setOrders(data || []);
        }
        setLoading(false);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Washing': return <WashingMachine size={24} className="animate-pulse" />;
            case 'Ready': return <CheckCircle2 size={24} color="var(--success)" />;
            case 'Approved': return <Clock size={24} color="var(--primary)" />;
            case 'Completed': return <Truck size={24} color="var(--secondary)" />;
            default: return <AlertCircle size={24} />;
        }
    };

    const getProgress = (status: string) => {
        switch (status) {
            case 'Approved': return 25;
            case 'Washing': return 50;
            case 'Ready': return 90;
            case 'Completed': return 100;
            default: return 0;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}
        >
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                <h1 style={{ fontSize: '36px', marginBottom: '15px' }}>Track Your Laundry ✨</h1>
                <p style={{ color: 'var(--text-muted)' }}>Enter your phone number to check your status instantly.</p>
            </div>

            <section className="glass-panel" style={{ padding: '30px', marginBottom: '40px' }}>
                <form onSubmit={handleTrack} style={{ display: 'flex', gap: '15px' }}>
                    <div className="glass-panel" style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '5px 20px', gap: '15px', background: 'var(--background)' }}>
                        <Phone size={20} style={{ color: 'var(--text-muted)' }} />
                        <input
                            required
                            type="text"
                            placeholder="Enter your phone number (e.g. 0911...)"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text-main)', padding: '15px 0', outline: 'none', fontSize: '16px' }}
                        />
                    </div>
                    <button type="submit" className="btn-primary" style={{ padding: '0 30px' }} disabled={loading}>
                        {loading ? 'Tracking...' : 'Track Status'}
                    </button>
                </form>
            </section>

            <AnimatePresence>
                {searched && orders.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>Found {orders.length} orders for this number:</h2>
                        {orders.map((order) => (
                            <div key={order.id} className="glass-panel" style={{ padding: '30px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px' }}>
                                    <div>
                                        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '5px' }}>#{order.id.slice(0, 8).toUpperCase()}</p>
                                        <h3 style={{ fontSize: '22px', fontWeight: '800' }}>{order.service_type}</h3>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', marginBottom: '5px' }}>
                                            {getStatusIcon(order.status)}
                                            <span style={{ fontSize: '18px', fontWeight: '700' }}>{order.status}</span>
                                        </div>
                                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Est. Total: {order.total_price} ETB</p>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '10px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                                        <span>Order Progress</span>
                                        <span>{getProgress(order.status)}%</span>
                                    </div>
                                    <div style={{ width: '100%', height: '8px', background: 'var(--surface-border)', borderRadius: '10px', overflow: 'hidden' }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${getProgress(order.status)}%` }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            style={{
                                                height: '100%',
                                                background: 'linear-gradient(to right, var(--primary), var(--secondary))',
                                                boxShadow: '0 0 10px var(--primary-glow)'
                                            }}
                                        />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingTop: '15px', borderTop: '1px solid var(--surface-border)' }}>
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                        {order.status === 'Ready' ? '🎉 Your laundry is ready for pickup!' : '🕙 We are currently working on your order.'}
                                    </p>
                                    <button style={{ background: 'none', border: 'none', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                                        Need Help? <ArrowRight size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}

                {searched && orders.length === 0 && !loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '50px' }}>
                        <AlertCircle size={48} color="#999" style={{ marginBottom: '20px' }} />
                        <h3 style={{ fontSize: '20px', color: 'var(--text-muted)' }}>No orders found for this phone number.</h3>
                        <p style={{ fontSize: '14px', color: '#666' }}>Please double check the number or contact the shop.</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Dashboard;
