'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [swipesCount, setSwipesCount] = useState(0);
  const [peopleCount, setPeopleCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
      if (profile?.role !== 'admin') { router.push('/dashboard'); return; }

      const { data: u } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      setUsers(u || []);

      const { count: sc } = await supabase.from('swipes').select('*', { count: 'exact', head: true });
      const { count: pc } = await supabase.from('people').select('*', { count: 'exact', head: true });

      setSwipesCount(sc || 0);
      setPeopleCount(pc || 0);
      setLoading(false);
    };
    load();
  }, [router]);

  const promoteUser = async (id: string, current: string) => {
    const newRole = current === 'admin' ? 'user' : 'admin';
    await supabase.from('profiles').update({ role: newRole }).eq('id', id);
    setUsers(u => u.map(user => user.id === id ? { ...user, role: newRole } : user));
  };

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--tinder-dark)' }}>
      <div style={{ width: 48, height: 48, border: '4px solid var(--tinder-red)', borderTop: '4px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--tinder-dark)', maxWidth: 720, margin: '0 auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link href="/dashboard" style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 14px', fontSize: 13, color: 'var(--tinder-muted)' }}>← App</Link>
        <span style={{ fontWeight: 800, fontSize: 18 }}>👑 Panel Admin</span>
        <div style={{ width: 70 }} />
      </header>

      <div style={{ padding: '1.5rem' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: '1.5rem' }}>
          {[
            { label: '👥 Usuarios', value: users.length },
            { label: '💚 Swipes', value: swipesCount },
            { label: '👤 Perfiles API', value: peopleCount },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--tinder-darker)', borderRadius: 16, padding: '1rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--tinder-red)' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--tinder-muted)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Users list */}
        <h3 style={{ fontWeight: 800, marginBottom: 12, fontSize: 16 }}>Usuarios registrados</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {users.map(u => (
            <div key={u.id} style={{
              background: 'var(--tinder-darker)', borderRadius: 16, padding: '1rem 1.25rem',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              border: '1px solid rgba(255,255,255,0.06)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--tinder-red), var(--tinder-orange))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 900
                }}>
                  {(u.full_name || u.username || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14 }}>{u.full_name || u.username}</p>
                  <p style={{ fontSize: 11, color: 'var(--tinder-muted)' }}>@{u.username}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  background: u.role === 'admin' ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.06)',
                  border: u.role === 'admin' ? '1px solid gold' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 20, padding: '3px 10px', fontSize: 11,
                  color: u.role === 'admin' ? 'gold' : 'var(--tinder-muted)', fontWeight: 700
                }}>
                  {u.role === 'admin' ? '👑 Admin' : '👤 User'}
                </span>
                <button onClick={() => promoteUser(u.id, u.role)} style={{
                  background: 'rgba(255,255,255,0.08)', border: 'none',
                  borderRadius: 8, padding: '6px 10px', color: 'var(--tinder-muted)',
                  fontSize: 12
                }}>
                  {u.role === 'admin' ? 'Quitar' : 'Promover'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}