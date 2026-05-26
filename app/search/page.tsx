'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [gender, setGender] = useState('all');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login');
    });
  }, [router]);

  const handleSearch = async () => {
    setLoading(true);
    let q = supabase.from('people').select('*').order('created_at', { ascending: false }).limit(30);
    if (query) q = q.or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,city.ilike.%${query}%`);
    if (gender !== 'all') q = q.eq('gender', gender);
    const { data } = await q;
    setResults(data || []);
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--tinder-dark)', maxWidth: 480, margin: '0 auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link href="/dashboard" style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 14px', fontSize: 13, color: 'var(--tinder-muted)' }}>← Volver</Link>
        <span style={{ fontWeight: 800, fontSize: 18 }}>🔍 Buscar</span>
        <div style={{ width: 70 }} />
      </header>

      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="🔍 Nombre, ciudad..."
          style={{
            width: '100%', background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14,
            padding: '14px 16px', color: '#fff', fontSize: 15, outline: 'none'
          }}
        />

        <div style={{ display: 'flex', gap: 8 }}>
          {['all', 'male', 'female'].map(g => (
            <button key={g} onClick={() => setGender(g)} style={{
              flex: 1, padding: '10px', borderRadius: 12, fontWeight: 700, fontSize: 13,
              border: gender === g ? '2px solid var(--tinder-red)' : '1px solid rgba(255,255,255,0.12)',
              background: gender === g ? 'rgba(254,60,114,0.15)' : 'rgba(255,255,255,0.04)',
              color: gender === g ? 'var(--tinder-red)' : 'var(--tinder-muted)'
            }}>
              {g === 'all' ? '👥 Todos' : g === 'male' ? '♂ Hombres' : '♀ Mujeres'}
            </button>
          ))}
        </div>

        <button onClick={handleSearch} style={{
          background: 'linear-gradient(135deg, var(--tinder-red), var(--tinder-orange))',
          border: 'none', borderRadius: 14, padding: '14px',
          color: '#fff', fontWeight: 800, fontSize: 15
        }}>
          {loading ? 'Buscando...' : 'Buscar 🔥'}
        </button>

        {results.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
            {results.map(p => (
              <div key={p.id} style={{
                background: 'var(--tinder-darker)', borderRadius: 16,
                overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)'
              }}>
                <img
                  src={p.avatar_url || `https://randomuser.me/api/portraits/${p.gender === 'male' ? 'men' : 'women'}/50.jpg`}
                  alt={p.first_name}
                  style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }}
                />
                <div style={{ padding: '10px' }}>
                  <p style={{ fontWeight: 800, fontSize: 13 }}>{p.first_name} {p.last_name}</p>
                  <p style={{ fontSize: 11, color: 'var(--tinder-muted)' }}>📍 {p.city}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {results.length === 0 && !loading && query && (
          <div style={{ textAlign: 'center', paddingTop: '2rem', color: 'var(--tinder-muted)' }}>
            <p style={{ fontSize: 36 }}>🔍</p>
            <p style={{ marginTop: 8 }}>Sin resultados. Intenta con otro filtro.</p>
          </div>
        )}
      </div>

      <nav style={{ display: 'flex', justifyContent: 'space-around', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '0.75rem 0', position: 'sticky', bottom: 0, background: 'var(--tinder-dark)' }}>
        <Link href="/dashboard" style={{ textAlign: 'center', color: 'var(--tinder-muted)' }}><div style={{ fontSize: 22 }}>🔥</div><div style={{ fontSize: 10, marginTop: 2 }}>Discover</div></Link>
        <Link href="/favorites" style={{ textAlign: 'center', color: 'var(--tinder-muted)' }}><div style={{ fontSize: 22 }}>⭐</div><div style={{ fontSize: 10, marginTop: 2 }}>Likes</div></Link>
        <Link href="/search" style={{ textAlign: 'center', color: 'var(--tinder-red)' }}><div style={{ fontSize: 22 }}>🔍</div><div style={{ fontSize: 10, marginTop: 2, fontWeight: 700 }}>Buscar</div></Link>
        <Link href="/profile" style={{ textAlign: 'center', color: 'var(--tinder-muted)' }}><div style={{ fontSize: 22 }}>👤</div><div style={{ fontSize: 10, marginTop: 2 }}>Perfil</div></Link>
      </nav>
    </div>
  );
}