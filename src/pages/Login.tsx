import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, Loader2, WashingMachine } from 'lucide-react';
import { supabase } from '../utils/supabase';

interface LoginProps {
    onLogin: () => void;
}

const Login = ({ onLogin }: LoginProps) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (isSignUp) {
            const { error: signUpError } = await supabase.auth.signUp({ email, password });
            if (signUpError) { setError(signUpError.message); setLoading(false); }
            else { alert('Admin account created!'); setIsSignUp(false); setLoading(false); }
        } else {
            const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
            if (signInError) { setError('Invalid credentials.'); setLoading(false); }
            else { onLogin(); }
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ width: '100%', maxWidth: '360px', padding: '40px', textAlign: 'center' }}>
                <div style={{ marginBottom: '40px' }}>
                    <WashingMachine size={48} color="var(--primary)" style={{ marginBottom: '20px' }} />
                    <h1 style={{ fontSize: '24px', fontWeight: '800' }}>{isSignUp ? 'New Admin' : 'Admin Portal'}</h1>
                </div>

                {error && <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '20px' }}>{error}</p>}

                <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    <div style={{ borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '15px', padding: '10px 0' }}>
                        <Mail size={18} color="#94a3b8" />
                        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address"
                            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '15px' }} />
                    </div>

                    <div style={{ borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '15px', padding: '10px 0' }}>
                        <Lock size={18} color="#94a3b8" />
                        <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"
                            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '15px' }} />
                    </div>

                    <button disabled={loading} type="submit" className="btn-primary" style={{ height: '50px', justifyContent: 'center', marginTop: '10px' }}>
                        {loading ? <Loader2 className="animate-spin" /> : (isSignUp ? 'Create Admin' : 'Sign In')}
                    </button>

                    <button type="button" onClick={() => setIsSignUp(!isSignUp)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                        {isSignUp ? 'Already have an account? Log In' : "Register new shop owner"}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default Login;
