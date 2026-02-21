import { useEffect, useState } from 'react';
import {
    CheckCircle2, Clock, Search, Filter, Package, X, Eye, TrendingUp, Phone, Send, Plus, Trash2, Calendar, MapPin, Edit3
} from 'lucide-react';
import { supabase } from '../utils/supabase';

const AdminDashboard = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [editingOrder, setEditingOrder] = useState<any>(null);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    // Initial date for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const defaultDate = tomorrow.toISOString().split('T')[0];

    // Order Form State
    const [formItems, setFormItems] = useState([{ type: 'Jeans', qty: 1, price: 0 }]);
    const [customerInfo, setCustomerInfo] = useState({
        name: '',
        phone: '',
        pickupDate: defaultDate,
        pickupAddress: 'Shop Pickup'
    });

    const totalOrderPrice = formItems.reduce((acc, item) => acc + (Number(item.price) || 0), 0);

    useEffect(() => {
        fetchOrders();
        const sub = supabase.channel('orders')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders())
            .subscribe();
        return () => { supabase.removeChannel(sub); };
    }, []);

    async function fetchOrders() {
        const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (error) console.error("Fetch error:", error);
        setOrders(data || []);
        setLoading(false);
    }

    const updateStatus = async (id: string, status: string) => {
        await supabase.from('orders').update({ status }).eq('id', id);
        fetchOrders();
    };

    const deleteOrder = async (id: string) => {
        if (!id) return alert('Error: No Order ID found');

        if (window.confirm('Are you sure you want to delete this order?')) {
            // Optimistic update
            setOrders(prev => prev.filter(o => o.id !== id));

            const { error } = await supabase.from('orders').delete().eq('id', id);

            if (error) {
                alert('Error deleting from database: ' + error.message);
                fetchOrders(); // Revert if failed
            }
        }
    };

    const handleAddItem = () => setFormItems([...formItems, { type: 'Jeans', qty: 1, price: 0 }]);
    const handleRemoveItem = (index: number) => {
        if (formItems.length > 1) setFormItems(formItems.filter((_, i) => i !== index));
    };

    const handleEditClick = (order: any) => {
        setEditingOrder(order);
        setCustomerInfo({
            name: order.customer_name,
            phone: order.customer_phone,
            pickupDate: order.pickup_date,
            pickupAddress: order.pickup_address
        });

        // Try to parse summary back to items if possible, otherwise reset
        // Simple logic: if it contains commas, it might be a bundle summary
        setFormItems([{ type: 'Custom Bundle', qty: order.quantity, price: order.total_price }]);
        setShowModal(true);
    };

    const handleFormSubmit = async (e: any) => {
        e.preventDefault();
        const summary = formItems.map(i => `${i.qty}x ${i.type}`).join(', ');
        const totalQty = formItems.reduce((acc, item) => acc + item.qty, 0);

        const payload = {
            customer_name: customerInfo.name,
            customer_phone: customerInfo.phone,
            service_type: summary,
            quantity: totalQty,
            total_price: totalOrderPrice,
            pickup_date: customerInfo.pickupDate,
            pickup_time: '00:00', // Time is removed/not important, sending default to satisfy DB
            pickup_address: customerInfo.pickupAddress,
            status: editingOrder ? editingOrder.status : 'Approved'
        };

        let error;
        if (editingOrder) {
            const { error: err } = await supabase.from('orders').update(payload).eq('id', editingOrder.id);
            error = err;
        } else {
            const { error: err } = await supabase.from('orders').insert([payload]);
            error = err;
        }

        if (error) {
            alert('Error saving order: ' + error.message);
        } else {
            closeModal();
            fetchOrders();
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingOrder(null);
        setFormItems([{ type: 'Jeans', qty: 1, price: 0 }]);
        setCustomerInfo({ name: '', phone: '', pickupDate: defaultDate, pickupAddress: 'Shop Pickup' });
    };

    const stats = [
        { label: 'Revenue', value: `${orders.reduce((s, o) => s + (o.total_price || 0), 0)} ETB`, icon: <TrendingUp />, color: 'var(--primary)' },
        { label: 'Today', value: orders.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString()).length, icon: <Package />, color: 'var(--success)' },
        { label: 'Active', value: orders.filter(o => ['Approved', 'Washing', 'Ready'].includes(o.status)).length, icon: <Clock />, color: 'var(--accent)' },
        { label: 'Done', value: orders.filter(o => o.status === 'Completed').length, icon: <CheckCircle2 />, color: 'var(--primary)' }
    ];

    const filtered = orders.filter(o => (filter === 'All' || o.status === filter) && (o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) || o.customer_phone?.includes(searchTerm)));

    return (
        <div style={{ width: '100%' }}>
            <div className="flex-between" style={{ marginBottom: '30px' }}>
                <div><h1>Admin Panel</h1><p style={{ color: 'var(--text-muted)' }}>Manage your laundry flow.</p></div>
                <button onClick={() => setShowModal(true)} className="btn-primary"><Plus size={18} /> New Order</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
                {stats.map((s, i) => (
                    <div key={i} className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ background: `${s.color}15`, color: s.color, padding: '12px', borderRadius: '12px' }}>{s.icon}</div>
                        <div><p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.label}</p><h3 style={{ fontSize: '18px' }}>{s.value}</h3></div>
                    </div>
                ))}
            </div>

            <div className="flex-between" style={{ gap: '20px', marginBottom: '20px' }}>
                <div className="glass-panel" style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 15px' }}>
                    <Search size={18} color="var(--text-muted)" /><input placeholder="Search customer..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ flex: 1, padding: '12px', border: 'none', outline: 'none', background: 'transparent' }} />
                </div>
                <div className="glass-panel" style={{ padding: '0 15px', display: 'flex', alignItems: 'center' }}>
                    <Filter size={18} color="var(--text-muted)" /><select value={filter} onChange={e => setFilter(e.target.value)} style={{ padding: '12px', border: 'none', outline: 'none', background: 'transparent' }}>
                        <option value="All">All Status</option><option value="Approved">In Queue</option><option value="Washing">Washing</option><option value="Ready">Ready</option><option value="Completed">Completed</option>
                    </select>
                </div>
            </div>

            <div className="glass-panel" style={{ overflow: 'hidden' }}>
                {loading ? <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '1px solid #eee' }}>
                            <tr><th style={{ padding: '15px', textAlign: 'left' }}>Customer</th><th style={{ padding: '15px' }}>Details</th><th style={{ padding: '15px' }}>Total Price</th><th style={{ padding: '15px' }}>Status</th><th style={{ padding: '15px' }}>Actions</th></tr>
                        </thead>
                        <tbody>
                            {filtered.map(o => (
                                <tr key={o.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '15px' }}>
                                        <div style={{ fontWeight: 600 }}>{o.customer_name}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <span>{o.customer_phone}</span>
                                            <a href={`tel:${o.customer_phone}`} style={{ color: 'var(--primary)' }} title="Call Customer"><Phone size={12} /></a>
                                        </div>
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        <div style={{ fontSize: '13px' }}>{o.service_type}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={10} /> Pickup: {new Date(o.pickup_date).toLocaleDateString()}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)' }}><MapPin size={10} /> {o.pickup_address}</div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '15px', textAlign: 'center', fontWeight: '700' }}>{o.total_price} ETB</td>
                                    <td style={{ padding: '15px', textAlign: 'center' }}>
                                        <span className={`status-badge badge-${o.status.toLowerCase()}`}>{o.status}</span>
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        <div className="flex-center" style={{ gap: '8px' }}>
                                            <button onClick={() => { setSelectedOrder(o); }} style={{ background: '#f1f5f9', color: '#64748b', padding: '6px 8px', borderRadius: '6px' }} title="View Receipt"><Eye size={14} /></button>
                                            <button onClick={() => handleEditClick(o)} style={{ background: '#eff6ff', color: '#3b82f6', padding: '6px 8px', borderRadius: '6px' }} title="Edit Order"><Edit3 size={14} /></button>
                                            <button onClick={() => deleteOrder(o.id)} style={{ background: '#fef2f2', color: '#ef4444', padding: '10px', borderRadius: '8px', cursor: 'pointer' }} title="Delete Order">
                                                <Trash2 size={16} />
                                            </button>
                                            <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)} style={{ padding: '6px', borderRadius: '6px', border: '1px solid #eee', fontSize: '12px', background: 'white' }}>
                                                <option value="Approved">Approved</option>
                                                <option value="Washing">Washing</option><option value="Ready">Ready</option><option value="Completed">Completed</option>
                                            </select>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {selectedOrder && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }} className="flex-center">
                    <div className="glass-panel" style={{ background: 'white', padding: '30px', width: '380px', textAlign: 'center' }}>
                        <div className="flex-between"><h3>Receipt</h3><X onClick={() => setSelectedOrder(null)} style={{ cursor: 'pointer' }} /></div>
                        <div style={{ margin: '20px 0', padding: '20px 0', borderBlock: '1px dashed #eee', textAlign: 'left' }}>
                            <p>Customer: <b>{selectedOrder.customer_name}</b></p>
                            <p>Bundle: <b>{selectedOrder.service_type}</b></p>
                            <p>Pickup: <b>{new Date(selectedOrder.pickup_date).toLocaleDateString()}</b></p>
                            <p>Address: <b>{selectedOrder.pickup_address}</b></p>
                            <p style={{ marginTop: '10px', fontSize: '18px' }}>Total: <b>{selectedOrder.total_price} ETB</b></p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <button onClick={() => window.print()} className="btn-primary" style={{ justifyContent: 'center' }}>Print Receipt</button>
                            <a href={`https://t.me/share/url?url=${encodeURIComponent(`Order Receipt - LaundSys Ethiopia\n\nCustomer: ${selectedOrder.customer_name}\nBundle: ${selectedOrder.service_type}\nPickup: ${new Date(selectedOrder.pickup_date).toLocaleDateString()}\nAddress: ${selectedOrder.pickup_address}\nTotal: ${selectedOrder.total_price} ETB\nStatus: ${selectedOrder.status}\n\nThank you for choosing us!`)}`}
                                target="_blank" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#0088cc', color: 'white', padding: '10px', borderRadius: '10px', textDecoration: 'none', fontWeight: 'bold' }}>
                                <Send size={16} /> Share to Telegram
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }} className="flex-center">
                    <div className="glass-panel" style={{ background: 'white', padding: '30px', width: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="flex-between"><h3>{editingOrder ? 'Edit Order' : 'New Bundle Order'}</h3><X onClick={closeModal} style={{ cursor: 'pointer' }} /></div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
                            <input placeholder="Customer Name" value={customerInfo.name} onChange={e => setCustomerInfo({ ...customerInfo, name: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #eee', background: 'white' }} />
                            <input placeholder="Phone" value={customerInfo.phone} onChange={e => setCustomerInfo({ ...customerInfo, phone: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #eee', background: 'white' }} />
                        </div>

                        <div style={{ marginTop: '15px' }}>
                            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Pickup Address</label>
                            <input placeholder="Shop Pickup or Address" value={customerInfo.pickupAddress} onChange={e => setCustomerInfo({ ...customerInfo, pickupAddress: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #eee', background: 'white' }} />
                        </div>

                        <div style={{ marginTop: '15px' }}>
                            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Pickup Date</label>
                            <input type="date" value={customerInfo.pickupDate} onChange={e => setCustomerInfo({ ...customerInfo, pickupDate: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #eee', background: 'white' }} />
                        </div>

                        <div style={{ marginTop: '25px' }}>
                            <div className="flex-between" style={{ marginBottom: '10px' }}>
                                <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-muted)' }}>Items List</span>
                                <button onClick={handleAddItem} style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '13px', border: 'none', background: 'none' }}>+ Add Item</button>
                            </div>

                            {formItems.map((item, idx) => (
                                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 40px', gap: '10px', marginBottom: '10px' }}>
                                    <select value={item.type} onChange={e => {
                                        const newItems = [...formItems];
                                        newItems[idx].type = e.target.value;
                                        setFormItems(newItems);
                                    }} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #eee', background: 'white' }}>
                                        <option>Jeans</option><option>T-Shirt</option><option>Blanket</option><option>Bed Sheets</option><option>Suit</option><option>Jacket</option><option>Mixed</option><option>Custom Bundle</option>
                                    </select>
                                    <input type="number" placeholder="Qty" value={item.qty} onChange={e => {
                                        const newItems = [...formItems];
                                        newItems[idx].qty = Number(e.target.value);
                                        setFormItems(newItems);
                                    }} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #eee', background: 'white' }} />
                                    <input type="number" placeholder="Price" value={item.price} onChange={e => {
                                        const newItems = [...formItems];
                                        newItems[idx].price = Number(e.target.value);
                                        setFormItems(newItems);
                                    }} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #eee', background: 'white' }} />
                                    <button onClick={() => handleRemoveItem(idx)} style={{ color: '#ef4444', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={18} /></button>
                                </div>
                            ))}
                        </div>

                        <div className="flex-between" style={{ marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #f8fafc' }}>
                            <h3 style={{ color: 'var(--primary)' }}>Total: {totalOrderPrice} ETB</h3>
                            <button onClick={handleFormSubmit} className="btn-primary" style={{ height: '45px', padding: '0 40px' }}>{editingOrder ? 'Update Order' : 'Save Order'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
