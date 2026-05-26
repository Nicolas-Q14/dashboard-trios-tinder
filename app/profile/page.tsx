'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ likes: 0, favorites: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [savedMsg, setSavedMsg] = useState(''); // NUEVO

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }

      const { data: p } = await supabase
        .from('profiles').select('*').eq('id', session.user.id).single();

      setProfile(p);
      setFullName(p?.full_name || '');

      const { count: likesCount } = await supabase
        .from('swipes').select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id).eq('liked', true);

      const { count: favCount } = await supabase
        .from('favorites').select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id);

      setStats({ likes: likesCount || 0, favorites: favCount || 0 });
      setLoading(false);
    };
    load();
  }, [router]);

  const handleSave = async () => {
    if (!fullName.trim()) return alert('El nombre no puede estar vacío'); // NUEVO
    setSaving(true);

    await supabase
      .from('profiles')
      .update({ full_name: fullName.trim() })
      .eq('id', profile.id);

    setProfile({ ...profile, full_name: fullName.trim() }); // NUEVO
    setSavedMsg('✅ Cambios guardados'); // NUEVO
    setTimeout(() => setSavedMsg(''), 2500); // NUEVO

    setSaving(false);
  };

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--tinder-dark)' }}>
      <div style={{ width: 48, height: 48, border: '4px solid var(--tinder-red)', borderTop: '4px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--tinder-dark)', maxWidth: 480, margin: '0 auto' }}>
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link href="/dashboard" style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 10, padding: '8px 14px', fontSize: 13, color: 'var(--tinder-muted)' }}>
          ← Volver
        </Link>
        <span style={{ fontWeight: 800, fontSize: 18 }}>Mi Perfil</span>
        <div style={{ width: 70 }} />
      </header>

      <div style={{ padding: '2rem 1.25rem' }}>
        {/* Avatar */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 100, height: 100, borderRadius: '50%', margin: '0 auto 12px',
            background: 'linear-gradient(135deg, var(--tinder-red), var(--tinder-orange))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 40, fontWeight: 900, border: '4px solid var(--tinder-red)',
            boxShadow: '0 0 24px rgba(254,60,114,0.4)'
          }}>
            {(profile?.full_name || profile?.username || 'U')[0].toUpperCase()}
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 800 }}>
            {profile?.full_name || profile?.username}
          </h2>

          {savedMsg && ( // NUEVO
            <div style={{ color: '#4ade80', fontSize: 13, marginTop: 8 }}>
              {savedMsg}
            </div>
          )}

          <span style={{
            background: 'rgba(254,60,114,0.2)', border: '1px solid var(--tinder-red)',
            borderRadius: 20, padding: '3px 14px', fontSize: 12,
            color: 'var(--tinder-red)', fontWeight: 700, marginTop: 6, display: 'inline-block'
          }}>
            {profile?.role === 'admin' ? '👑 Admin' : '💫 Usuario'}
          </span>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '2rem' }}>
          {[
            { label: '💚 Likes dados', value: stats.likes },
            { label: '⭐ Favoritos', value: stats.favorites },
          ].map(s => (
            <div key={s.label} style={{
              background: 'var(--tinder-darker)', borderRadius: 16,
              padding: '1rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)'
            }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--tinder-red)' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--tinder-muted)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Edit */}
        <div style={{ background: 'var(--tinder-darker)', borderRadius: 20, padding: '1.5rem', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 style={{ fontWeight: 800, marginBottom: 16 }}>✏️ Editar perfil</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--tinder-muted)', display: 'block', marginBottom: 6 }}>
                Nombre completo
              </label>

              <input
                value={fullName}
                maxLength={40} // NUEVO
                onChange={e => setFullName(e.target.value)}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12,
                  padding: '12px 14px', color: '#fff', fontSize: 15, outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, color: 'var(--tinder-muted)', display: 'block', marginBottom: 6 }}>
                Username
              </label>

              <input
                value={profile?.username || ''}
                disabled
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12,
                  padding: '12px 14px', color: 'var(--tinder-muted)', fontSize: 15, outline: 'none'
                }}
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                background: 'linear-gradient(135deg, var(--tinder-red), var(--tinder-orange))',
                border: 'none', borderRadius: 14, padding: '14px',
                color: '#fff', fontWeight: 800, fontSize: 15, marginTop: 4,
                opacity: saving ? 0.7 : 1 // NUEVO
              }}
            >
              {saving ? 'Guardando...' : 'Guardar cambios 💾'}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <nav style={{ display: 'flex', justifyContent: 'space-around', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '0.75rem 0', position: 'sticky', bottom: 0, background: 'var(--tinder-dark)' }}>
        <Link href="/dashboard" style={{ textAlign: 'center', color: 'var(--tinder-muted)' }}>
          <div style={{ fontSize: 22 }}>🔥</div><div style={{ fontSize: 10, marginTop: 2 }}>Discover</div>
        </Link>

        <Link href="/favorites" style={{ textAlign: 'center', color: 'var(--tinder-muted)' }}>
          <div style={{ fontSize: 22 }}>⭐</div><div style={{ fontSize: 10, marginTop: 2 }}>Likes</div>
        </Link>

        <Link href="/search" style={{ textAlign: 'center', color: 'var(--tinder-muted)' }}>
          <div style={{ fontSize: 22 }}>🔍</div><div style={{ fontSize: 10, marginTop: 2 }}>Buscar</div>
        </Link>

        <Link href="/profile" style={{ textAlign: 'center', color: 'var(--tinder-red)' }}>
          <div style={{ fontSize: 22 }}>👤</div><div style={{ fontSize: 10, marginTop: 2, fontWeight: 700 }}>Perfil</div>
        </Link>
      </nav>
    </div>
  );
}