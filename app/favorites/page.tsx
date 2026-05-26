'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }

      const { data } = await supabase
        .from('favorites')
        .select('*, people(*)')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      setFavorites(data || []);
      setLoading(false);
    };
    load();
  }, [router]);

  const removeFavorite = async (id: number) => {
    await supabase.from('favorites').delete().eq('id', id);
    setFavorites(f => f.filter(fav => fav.id !== id));
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--tinder-dark)', maxWidth: 480, margin: '0 auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link href="/dashboard" style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 14px', fontSize: 13, color: 'var(--tinder-muted)' }}>← Volver</Link>
        <span style={{ fontWeight: 800, fontSize: 18 }}>⭐ Mis Likes</span>
        <div style={{ width: 70 }} />
      </header>

      <div style={{ padding: '1.25rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', paddingTop: '3rem' }}>
            <div style={{ width: 40, height: 40, border: '3px solid var(--tinder-red)', borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : favorites.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: '4rem' }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>💔</div>
            <p style={{ color: 'var(--tinder-muted)', fontSize: 16 }}>Aún no tienes likes</p>
            <Link href="/dashboard" style={{
              display: 'inline-block', marginTop: 16,
              background: 'linear-gradient(135deg, var(--tinder-red), var(--tinder-orange))',
              borderRadius: 14, padding: '12px 24px', color: '#fff', fontWeight: 800
            }}>Ir a hacer swipe 🔥</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {favorites.map(fav => {
              const p = fav.people;
              if (!p) return null;
              return (
                <div key={fav.id} style={{
                  background: 'var(--tinder-darker)', borderRadius: 18,
                  overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)',
                  position: 'relative'
                }}>
                  <img
                    src={p.avatar_url || `https://randomuser.me/api/portraits/${p.gender === 'male' ? 'men' : 'women'}/42.jpg`}
                    alt={p.first_name}
                    style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)',
                    padding: '1rem 0.75rem 0.75rem'
                  }}>
                    <p style={{ fontWeight: 800, fontSize: 14 }}>{p.first_name} {p.last_name}</p>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{p.city}</p>
                  </div>
                  <button
                    onClick={() => removeFavorite(fav.id)}
                    style={{
                      position: 'absolute', top: 8, right: 8,
                      background: 'rgba(254,60,114,0.8)', border: 'none',
                      borderRadius: '50%', width: 28, height: 28,
                      color: '#fff', fontSize: 14, display: 'flex',
                      alignItems: 'center', justifyContent: 'center'
                    }}
                  >✕</button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <nav style={{ display: 'flex', justifyContent: 'space-around', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '0.75rem 0', position: 'sticky', bottom: 0, background: 'var(--tinder-dark)' }}>
        <Link href="/dashboard" style={{ textAlign: 'center', color: 'var(--tinder-muted)' }}><div style={{ fontSize: 22 }}>🔥</div><div style={{ fontSize: 10, marginTop: 2 }}>Discover</div></Link>
        <Link href="/favorites" style={{ textAlign: 'center', color: 'var(--tinder-red)' }}><div style={{ fontSize: 22 }}>⭐</div><div style={{ fontSize: 10, marginTop: 2, fontWeight: 700 }}>Likes</div></Link>
        <Link href="/search" style={{ textAlign: 'center', color: 'var(--tinder-muted)' }}><div style={{ fontSize: 22 }}>🔍</div><div style={{ fontSize: 10, marginTop: 2 }}>Buscar</div></Link>
        <Link href="/profile" style={{ textAlign: 'center', color: 'var(--tinder-muted)' }}><div style={{ fontSize: 22 }}>👤</div><div style={{ fontSize: 10, marginTop: 2 }}>Perfil</div></Link>
      </nav>
    </div>
  );
}